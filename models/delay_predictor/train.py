"""
Project Aahavaan – Phase 2
Tuned LightGBM delay predictor with scenario split, feature engineering,
point prediction and P10/P90 uncertainty models.
"""
from pathlib import Path
import json, joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from lightgbm import LGBMRegressor, early_stopping, log_evaluation

ROOT=Path(__file__).resolve().parents[2]
DATA_PATH=ROOT/"models/datasets/processed/phase2_train_delay_dataset.csv"
WEIGHTS=ROOT/"models/delay_predictor/model_weights"
TARGET="Future_Delay_15Min"
FEATURES=['Train_Type', 'Priority_Weight', 'Train_Length_M', 'Section_Distance_KM', 'Max_Permissible_Speed', 'Scheduled_Dwell_Min', 'Current_Delay_Min', 'Preceding_Headway_Min', 'Sectional_Gradient_Pct', 'Weather', 'Outer_Signal_Queue_Depth', 'Platform_Occupancy_State', 'Freight_Surge', 'Infrastructure_Failure', 'Current_Time_Min', 'Scheduled_Departure_Min', 'Time_Sin', 'Time_Cos', 'Departure_Sin', 'Departure_Cos', 'Headway_Deficit', 'Congestion_Index', 'Delay_Propagation_Index', 'Section_Run_Time_Min', 'Gradient_Stress', 'Length_Speed_Ratio', 'Weather_Severity']

def engineer(d):
    x=d.copy()
    x["Time_Sin"]=np.sin(2*np.pi*x["Current_Time_Min"]/1440)
    x["Time_Cos"]=np.cos(2*np.pi*x["Current_Time_Min"]/1440)
    x["Departure_Sin"]=np.sin(2*np.pi*x["Scheduled_Departure_Min"]/1440)
    x["Departure_Cos"]=np.cos(2*np.pi*x["Scheduled_Departure_Min"]/1440)
    x["Headway_Deficit"]=np.maximum(0,10-x["Preceding_Headway_Min"])
    x["Congestion_Index"]=.55*x["Outer_Signal_Queue_Depth"]+.45*np.maximum(0,x["Platform_Occupancy_State"]-2)+.35*x["Headway_Deficit"]
    x["Delay_Propagation_Index"]=.20*x["Current_Delay_Min"]+.65*x["Outer_Signal_Queue_Depth"]+.42*np.maximum(0,x["Platform_Occupancy_State"]-2)
    x["Section_Run_Time_Min"]=60*x["Section_Distance_KM"]/np.maximum(x["Max_Permissible_Speed"],1)
    x["Gradient_Stress"]=np.abs(x["Sectional_Gradient_Pct"])*(x["Section_Distance_KM"]/10)
    x["Length_Speed_Ratio"]=x["Train_Length_M"]/np.maximum(x["Max_Permissible_Speed"],1)
    x["Weather_Severity"]=x["Weather"].map({"Clear":0,"Cloudy":1,"Rain":2,"Fog":3}).fillna(0)
    return x

def prep(frame,categories):
    X=frame[FEATURES].copy()
    for c in ["Train_Type","Weather"]:
        X[c]=pd.Categorical(X[c],categories=categories[c])
    return X,frame[TARGET]

def make_model(objective="regression",alpha=None):
    p=dict(objective=objective,n_estimators=3500,learning_rate=.02,
           num_leaves=31,min_child_samples=20,subsample=.90,
           colsample_bytree=.90,reg_alpha=.05,reg_lambda=.25,
           random_state=42,n_jobs=-1,verbosity=-1)
    if alpha is not None:p["alpha"]=alpha
    return LGBMRegressor(**p)

def fit(m,Xtr,ytr,Xv,yv):
    return m.fit(Xtr,ytr,eval_set=[(Xv,yv)],eval_metric="mae",
        categorical_feature=["Train_Type","Weather"],
        callbacks=[early_stopping(150,verbose=False),log_evaluation(0)])

def main():
    df=pd.read_csv(DATA_PATH)
    ids=np.sort(df["Scenario_ID"].unique())
    rng=np.random.default_rng(42);rng.shuffle(ids)
    n=len(ids)
    tr=df[df.Scenario_ID.isin(ids[:int(.70*n)])]
    va=df[df.Scenario_ID.isin(ids[int(.70*n):int(.85*n)])]
    te=df[df.Scenario_ID.isin(ids[int(.85*n):])]
    tr,va,te=engineer(tr),engineer(va),engineer(te)
    categories={c:sorted(df[c].dropna().unique()) for c in ["Train_Type","Weather"]}
    Xtr,ytr=prep(tr,categories);Xv,yv=prep(va,categories);Xte,yte=prep(te,categories)
    point=fit(make_model(),Xtr,ytr,Xv,yv)
    low=fit(make_model("quantile",.10),Xtr,ytr,Xv,yv)
    high=fit(make_model("quantile",.90),Xtr,ytr,Xv,yv)
    pred=np.maximum(0,point.predict(Xte));p10=np.maximum(0,low.predict(Xte));p90=np.maximum(p10,high.predict(Xte))
    result={"MAE_min":float(mean_absolute_error(yte,pred)),
             "RMSE_min":float(np.sqrt(mean_squared_error(yte,pred))),
             "R2":float(r2_score(yte,pred)),
             "P10_P90_coverage":float(np.mean((yte.to_numpy()>=p10)&(yte.to_numpy()<=p90)))}
    WEIGHTS.mkdir(parents=True,exist_ok=True)
    joblib.dump(point,WEIGHTS/"lightgbm_delay_point.joblib")
    joblib.dump(low,WEIGHTS/"lightgbm_delay_p10.joblib")
    joblib.dump(high,WEIGHTS/"lightgbm_delay_p90.joblib")
    pd.DataFrame({"feature":FEATURES,"importance":point.feature_importances_}).sort_values("importance",ascending=False).to_csv(WEIGHTS/"feature_importance.csv",index=False)
    out=te[["Scenario_ID","Train_ID","Train_Type",TARGET]].copy()
    out["Predicted_Delay_15Min"]=pred;out["P10_Delay_15Min"]=p10;out["P90_Delay_15Min"]=p90;out["Interval_Width_Min"]=p90-p10
    out.to_csv(WEIGHTS/"test_predictions.csv",index=False)
    meta={"target":TARGET,"features":FEATURES,"scenario_split":"70/15/15",**result,"best_iteration":int(point.best_iteration_)}
    (WEIGHTS/"metadata.json").write_text(json.dumps(meta,indent=2))
    print("=== AAHAVAAN TUNED LIGHTGBM ===")
    for k,v in result.items(): print(f"{k}: {v:.4f}" if isinstance(v,float) else f"{k}: {v}")
    print(f"Best iteration: {point.best_iteration_}")
    print("\nTop features:")
    print(pd.DataFrame({"feature":FEATURES,"importance":point.feature_importances_}).sort_values("importance",ascending=False).head(12).to_string(index=False))
if __name__=="__main__": main()
