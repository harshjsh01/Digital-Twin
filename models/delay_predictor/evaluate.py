"""
Project Aahavaan – Phase 2
Model evaluation and prediction inspection.
"""

from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

ROOT = Path(__file__).resolve().parents[2]
WEIGHTS = ROOT / "models" / "delay_predictor" / "model_weights"


def main():
    predictions = pd.read_csv(WEIGHTS / "test_predictions.csv")
    y = predictions["Future_Delay_15Min"]
    p = predictions["Predicted_Delay_15Min"]

    mae = mean_absolute_error(y, p)
    rmse = np.sqrt(mean_squared_error(y, p))
    r2 = r2_score(y, p)

    coverage = np.mean(
        (y >= predictions["P10_Delay_15Min"])
        & (y <= predictions["P90_Delay_15Min"])
    )

    print("=== MODEL EVALUATION ===")
    print(f"MAE: {mae:.3f} min")
    print(f"RMSE: {rmse:.3f} min")
    print(f"R²: {r2:.4f}")
    print(f"P10-P90 coverage: {coverage:.3%}")

    if (WEIGHTS / "metadata.json").exists():
        metadata = json.loads(
            (WEIGHTS / "metadata.json").read_text()
        )
        print("\nSaved training metadata:")
        print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
