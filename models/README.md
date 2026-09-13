# Project Aahavaan — Railway Digital Twin
## Engineer 1: AI/ML & Optimization

> **Domain:** AI/ML, Delay Prediction, Station Optimization & Safety Validation  
> **Phase:** Phase 2  
> **Engineer:** Engineer 1  
> **Primary Stack:** Python, LightGBM, Google OR-Tools CP-SAT, NumPy, Pandas, Scikit-learn

---

## 1. Overview

Project Aahavaan is a Railway Digital Twin and Decision Support System designed to model railway operations, predict train delays, and optimize train movement through a station environment.

Engineer 1 is responsible for the complete **AI/ML and Optimization domain**:

1. Synthetic and processed railway movement datasets
2. Train delay prediction
3. Station platform and outer-holding optimization
4. Railway resource and headway constraints
5. Independent safety validation
6. Performance benchmarking
7. Long-duration synthetic safety stress testing

The Engineer 1 implementation is contained entirely inside:

```text
Railway/
└── models/
```

---

# 2. Directory Structure

```text
Railway/
└── models/
    │
    ├── datasets/
    │   ├── raw/
    │   │   └── # Historical IR timetables / delay data
    │   │
    │   ├── processed/
    │   │   ├── data_dictionary.csv
    │   │   └── phase2_train_delay_dataset.csv
    │   │
    │   └── synthetic_generator.py
    │
    ├── delay_predictor/
    │   ├── train.py
    │   ├── evaluate.py
    │   └── model_weights/
    │       ├── lightgbm_delay_point.joblib
    │       ├── lightgbm_delay_p10.joblib
    │       ├── lightgbm_delay_p90.joblib
    │       ├── feature_importance.csv
    │       ├── test_predictions.csv
    │       └── metadata.json
    │
    ├── station_optimizer/
    │   ├── solver.py
    │   ├── constraints.py
    │   ├── benchmarks.py
    │   ├── stress_test.py
    │   ├── README.md
    │   └── MODELING_NOTES.md
    │
    └── README.md
```

---

# 3. Engineer 1 Responsibilities

Engineer 1 owns the following pipeline:

```text
Railway Movement Data
        │
        ▼
Synthetic / Processed Dataset
        │
        ▼
Delay Prediction Model
        │
        ▼
Predicted Future Delay / ETA
        │
        ▼
Station Optimization
        │
        ▼
Platform / Holding Assignment
        │
        ▼
Safety Validation
        │
        ▼
Benchmark + Stress Testing
```

---

# 4. Dataset Generation

## 4.1 Purpose

The dataset subsystem generates synthetic railway movement and delay data for development, training, benchmarking, and stress testing.

The synthetic generator is particularly important because complete real-world operational railway datasets are not assumed to be directly available for development.

The generator models:

- Train types
- Scheduled movement
- Current delay
- Future delay
- Station/platform state
- Outer holding state
- Queue depth
- Headway state
- Weather effects
- Operational disturbances
- High-density traffic conditions

---

## 4.2 State-Transition Dataset

The current delay prediction model uses a **15-minute state-transition simulator**.

The dataset contains:

```text
Rows: 240,000
Target: Future_Delay_15Min
Scenario split: 70 / 15 / 15
```

The simulator represents successive operational states instead of treating every row as an independent random observation.

This allows the model to learn how operational state can propagate into future delay.

---

## 4.3 Important Features

The feature matrix includes railway operational variables such as:

```text
Train_Type
Priority_Weight
Section_Distance_KM
Max_Permissible_Speed
Scheduled_Dwell_Min
Current_Delay_Min
Outer_Signal_Queue_Depth
Platform_Occupancy_State
```

Additional state-transition features are used by the current implementation to represent operational conditions such as:

- Queue state
- Headway state
- Platform availability
- Weather
- Operational disturbance
- Traffic density

---

# 5. Synthetic Delay Distributions

The synthetic data generation framework uses probability distributions to model different operational delay behaviours.

The Phase 2 generator includes:

- Weibull-based delay behaviour
- Gamma-based delay behaviour
- Train-type-dependent delay patterns
- Operational disturbances
- Weather-related effects
- Dense traffic conditions

The purpose is not to reproduce exact historical railway behaviour, but to create a controlled environment for model development and algorithm validation.

---

# 6. Delay Prediction Model

## 6.1 Model

The current baseline delay prediction system uses:

**LightGBM**

The model predicts:

```text
Future_Delay_15Min
```

The system also maintains lower and upper prediction models for uncertainty estimation:

```text
P10 prediction
P50 / point prediction
P90 prediction
```

This allows the system to represent an estimated delay range rather than only a single point estimate.

---

# 7. Delay Prediction Training

Training is performed using:

```text
models/delay_predictor/train.py
```

Run:

```bash
python models/delay_predictor/train.py
```

The evaluation pipeline is:

```text
models/delay_predictor/evaluate.py
```

Run:

```bash
python models/delay_predictor/evaluate.py
```

---

# 8. Delay Prediction Results

The current 15-minute state-transition LightGBM model produced the following test results:

```text
MAE:              0.825 min
RMSE:             1.092 min
R²:               0.9978
P10-P90 coverage: 78.819%
Best iteration:   705
```

Dataset:

```text
Rows:              240,000
Scenario split:    70 / 15 / 15
Target:            Future_Delay_15Min
```

---

## 8.1 Phase 2 Target Comparison

Target:

```text
ETA prediction MAE < 1.2 minutes
```

Observed:

```text
MAE = 0.825 minutes
```

Therefore:

```text
Target: PASS
```

The observed MAE is below the Phase 2 target.

---

## 8.2 Important ML Limitation

The current delay dataset is synthetic.

The high:

```text
R² = 0.9978
```

should therefore **not** be interpreted as real-world railway prediction accuracy.

The state-transition simulator naturally contains temporal delay propagation, which can make prediction substantially easier than prediction on independently collected real-world railway operations.

Future validation should use appropriate real operational data when available.

---

# 9. Station Optimizer

## 9.1 Purpose

The station optimizer determines how trains should be assigned to station resources while respecting operational and safety constraints.

The optimizer uses:

**Google OR-Tools CP-SAT**

The current implementation supports:

```text
6 platforms
4 outer holding tracks
```

---

# 10. V5 Multi-Stage Station Model

The current optimizer uses a multi-stage representation:

```text
APPROACH
    │
    ▼
ENTRY
    │
    ▼
THROAT / ROUTE LOCK
    │
    ├───────────────┐
    ▼               ▼
PLATFORM         HOLDING
    │               │
    └───────┬───────┘
            ▼
        DEPARTURE
```

This is more representative of railway station operations than treating the complete station service as a single resource occupancy interval.

---

# 11. Station Resources

## Platforms

The station contains:

```text
Platform 1
Platform 2
Platform 3
Platform 4
Platform 5
Platform 6
```

## Outer Holdings

The station contains:

```text
Holding 1
Holding 2
Holding 3
Holding 4
```

Trains can be assigned to an appropriate platform or outer holding depending on the optimization result and compatibility constraints.

---

# 12. Optimization Constraints

The CP-SAT model incorporates operational constraints including:

### 12.1 Platform Capacity

A platform cannot simultaneously serve conflicting trains.

```text
Train A occupies Platform 1
        ↓
Train B cannot overlap the same platform
```

---

### 12.2 Holding Capacity

Outer holding resources cannot be simultaneously occupied by conflicting trains.

---

### 12.3 Route Locking

The route/throat interval is explicitly represented.

A conflicting route cannot be simultaneously locked by another movement.

---

### 12.4 Headway

Approach-specific headway constraints prevent incompatible movements from entering the station too closely together.

---

### 12.5 Conflict Groups

Shared railway infrastructure is represented using conflict groups.

Examples include:

```text
THROAT_A
THROAT_B
THROAT_C
THROAT_D
```

Movements sharing a conflict group must be appropriately separated.

---

### 12.6 Platform Compatibility

Trains are restricted to compatible platforms according to the model's platform assignment rules.

---

### 12.7 Holding Compatibility

Similarly, trains can only be assigned to permitted outer holding resources.

---

### 12.8 Stage Ordering

The model maintains the correct operational ordering:

```text
entry
  <
route lock
  <
platform / holding
  <
departure
```

---

# 13. Optimization Objective

The optimizer attempts to minimize operational delay while considering holding penalties.

The primary decision goal is:

```text
Minimize priority-weighted train delay
+
holding penalty
```

Higher-priority trains therefore receive greater consideration during optimization.

---

# 14. Solver Demonstration

The current solver was tested successfully on the demonstration scenario.

Observed result:

```text
Solver status: OPTIMAL
Objective:     106.0
Solve time:    0.0157 seconds
Safety check:  PASS
```

Example assignments:

```text
VB_101   -> Platform 1
RJD_201  -> Platform 2
SF_301   -> Platform 3
ME_401   -> Platform 6
FR_501   -> Platform 5
VB_102   -> Platform 4
SF_302   -> Platform 1
FR_502   -> Platform 2
```

Example optimized timeline:

```text
VB_101
entry:      6
route:      8 -> 10
platform:  10 -> 18
delay:      2 min
```

---

# 15. Running the Station Optimizer

From the Railway root directory:

```bash
python models/station_optimizer/solver.py
```

Expected output includes:

```text
PROJECT AAHAVAAN — CP-SAT V5
MULTI-STAGE / ROUTE LOCK / 6 PLATFORMS / 4 OUTER HOLDINGS

Solver status: OPTIMAL
```

The solver also writes the latest recommendation to:

```text
models/station_optimizer/last_recommendation.json
```

---

# 16. Benchmarking

The benchmark system is implemented in:

```text
models/station_optimizer/benchmarks.py
```

Run:

```bash
python models/station_optimizer/benchmarks.py
```

The benchmark tests different traffic densities.

Current V5 benchmark results:

| Trains | Schedulable | Safe | Mean Time | P95 | Maximum |
|---:|---:|---:|---:|---:|---:|
| 20 | 84/100 | 84/100 | 135.67 ms | 283.94 ms | 302.31 ms |
| 30 | 72/100 | 72/100 | 231.47 ms | 307.86 ms | 314.05 ms |
| 40 | 64/100 | 64/100 | 185.46 ms | 267.01 ms | 271.53 ms |
| 60 | 0/100 | 0/100 | 127.53 ms | 275.77 ms | 278.14 ms |

---

# 17. Benchmark Interpretation

A scenario being unschedulable does not automatically mean the optimizer produced an unsafe result.

For example:

```text
INFEASIBLE
```

means no schedule satisfying all modeled constraints was found within the tested scenario.

It does not mean:

```text
COLLISION
```

or:

```text
UNSAFE MOVEMENT
```

Dense traffic can exceed the available station capacity.

Therefore the benchmark distinguishes between:

```text
Schedulable
Overloaded / Infeasible
Unsafe
```

This distinction is important when interpreting high-density railway scenarios.

---

# 18. Baseline Benchmark

An earlier baseline optimizer benchmark was also tested with 100 scenarios at different train counts.

Baseline results:

| Trains | Feasible | Safety Valid | Mean |
|---:|---:|---:|---:|
| 20 | 100/100 | 100/100 | 63.58 ms |
| 30 | 100/100 | 100/100 | 291.74 ms |
| 40 | 100/100 | 100/100 | 301.78 ms |
| 60 | 100/100 | 100/100 | 289.34 ms |

This baseline is retained as a historical/demo benchmark.

It should not be interpreted as proof that every arbitrary 60-train scenario is operationally schedulable.

---

# 19. Safety Validation

The optimizer contains an independent safety validation layer.

The validator checks the generated schedule for violations such as:

```text
Platform collision
Holding collision
Route conflict
Headway violation
Invalid stage ordering
Deadlock / stuck movement
```

The objective is to ensure that optimization does not simply minimize delay at the expense of operational constraints.

---

# 20. 100,000-Minute Safety Stress Test

The long-duration safety validation is implemented in:

```text
models/station_optimizer/stress_test.py
```

Run:

```bash
python models/station_optimizer/stress_test.py
```

Or explicitly:

```bash
python models/station_optimizer/stress_test.py --minutes 100000 --seed 20260913
```

---

# 21. Stress-Test Configuration

Current validation configuration:

```text
Simulation duration: 100,000 minutes
Random seed:         20260913
```

The simulation generates train movements over the full horizon and evaluates the implemented safety invariants continuously.

---

# 22. 100,000-Minute Stress-Test Results

Actual executed result:

```text
Simulation minutes:          100,000
Random seed:                  20260913

Generated movements:          17,410
Admitted movements:           17,410
Pending at horizon end:            0
Maximum queue depth:                0

Average service wait:          2.16 min
Deadlocks / stuck trains:          0
Safety invariant violations:       0

Recent resource utilization:    18.6%

Safety compliance:            100.000%
Result:                        PASS
```

---

# 23. Safety Result

The synthetic stress workload produced:

```text
Collision violations:       0
Route conflicts:            0
Headway violations:         0
Deadlocks:                  0
```

Therefore:

```text
Safety compliance = 100.000%
```

for the executed synthetic workload.

---

# 24. Safety Qualification

The 100,000-minute stress test is an **engineering validation of the implemented simulation and safety invariants**.

It is not:

- Railway signalling certification
- Formal safety certification
- Proof of safety for every possible railway traffic pattern
- Replacement for real railway interlocking validation
- Replacement for field testing

The result should therefore be reported as:

> **The implemented safety invariants achieved 100% compliance with zero simulated collisions, route conflicts, headway violations, and deadlocks over a 100,000-minute synthetic stress workload.**

---

# 25. Phase 2 Target Tracking

Current Engineer 1 status:

| Requirement | Target | Current Result | Status |
|---|---:|---:|---|
| Delay prediction MAE | < 1.2 min | 0.825 min | PASS |
| Station resources | 6 platforms | 6 | PASS |
| Outer holdings | 4 | 4 | PASS |
| CP-SAT optimization | Required | Implemented | PASS |
| Safety validation | Required | Implemented | PASS |
| 100,000-minute stress workload | 100,000 min | 100,000 min | PASS |
| Simulated safety violations | 0 | 0 | PASS |
| Simulated deadlocks | 0 | 0 | PASS |
| Inference/solve target | < 45 ms | Scenario-dependent | NEEDS FURTHER BENCHMARKING |
| Passenger-weighted delay reduction | >22% | Not yet established | PENDING |

---

# 26. Performance Qualification

The Phase 2 target specifies:

```text
Inference + solving < 45 ms
```

The demonstration solver currently produced:

```text
0.0157 seconds
=
15.7 ms
```

for the small demonstration scenario.

However, the larger benchmark scenarios have higher mean and P95 runtimes.

Therefore the 45 ms requirement should **not** be claimed as universally achieved.

A future performance benchmark should measure:

```text
ML inference time
+
optimizer solve time
+
decision preparation
```

under a standardized workload.

---

# 27. Passenger-Weighted Delay Reduction

Another Phase 2 target is:

```text
>22% reduction in passenger-weighted delay
```

compared with manual FIFO scheduling.

This metric has not yet been established using a controlled A/B simulation.

The required future experiment is:

```text
Scenario
   │
   ├── Manual FIFO
   │       ↓
   │   Passenger-weighted delay
   │
   └── CP-SAT
           ↓
       Passenger-weighted delay
```

Then calculate the percentage improvement across a sufficiently large test set.

Until that experiment is completed, the >22% target should remain marked:

```text
PENDING
```

---

# 28. Reproducibility

The synthetic stress test uses a fixed seed:

```text
20260913
```

This allows the same workload to be regenerated for comparison.

Example:

```bash
python models/station_optimizer/stress_test.py \
    --minutes 100000 \
    --seed 20260913
```

Changing the seed produces a different synthetic workload.

---

# 29. Installation

From the Railway root:

```bash
pip install -r requirements.txt
```

Core dependencies include:

```text
Python
NumPy
Pandas
Scikit-learn
LightGBM
Joblib
Google OR-Tools
```

---

# 30. Running the Complete Engineer 1 Validation

### Step 1 — Evaluate delay prediction

```bash
python models/delay_predictor/evaluate.py
```

### Step 2 — Run optimizer

```bash
python models/station_optimizer/solver.py
```

### Step 3 — Run optimizer benchmarks

```bash
python models/station_optimizer/benchmarks.py
```

### Step 4 — Run 100,000-minute safety stress test

```bash
python models/station_optimizer/stress_test.py
```

---

# 31. Expected Validation Flow

```text
┌───────────────────────────────┐
│      DATASET VALIDATION       │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│    DELAY MODEL EVALUATION     │
│    MAE = 0.825 min            │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│     CP-SAT OPTIMIZATION       │
│     STATUS = OPTIMAL          │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│      SAFETY VALIDATION        │
│      PASS                     │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ 100,000-MINUTE STRESS TEST    │
│ VIOLATIONS = 0                │
│ DEADLOCKS = 0                 │
└───────────────┬───────────────┘
                ↓
             PASS
```

---

# 32. Engineering Design Principles

Engineer 1 follows these principles:

### Safety before optimization

A lower-delay solution is not acceptable if it violates modeled railway safety constraints.

### Feasibility before performance claims

A solver speed measurement is meaningful only when the corresponding scenario is valid and the resulting schedule passes safety validation.

### Synthetic data must be labelled

Synthetic ML accuracy is used for development and benchmarking and must not be represented as real-world railway accuracy.

### Independent validation

Safety checks are separated from the optimization objective wherever possible.

### Reproducibility

Benchmarks and stress tests use controlled random seeds.

### Versioned experimentation

Major optimizer formulations are maintained as engineering iterations rather than silently replacing previous benchmark results.

---

# 33. Known Limitations

The current Engineer 1 implementation has several limitations.

## Synthetic Data

The current ML benchmark uses synthetic state-transition data.

Real-world validation is still required.

## Synthetic Railway Topology

The station model represents an abstract station topology rather than a complete real railway interlocking installation.

## Performance

Large dense optimization scenarios can exceed the desired latency target.

## Passenger Weighting

The >22% passenger-weighted delay reduction target has not yet been established through a controlled comparison against FIFO.

## Formal Safety

The stress test validates implemented software invariants but is not formal railway signalling certification.

---

# 34. Recommended Future Improvements

Future work can include:

1. Real Indian Railways operational data integration
2. Real weather and disruption data
3. Temporal Fusion Transformer comparison
4. More realistic station topology
5. Track-circuit/block-section modeling
6. More detailed signalling logic
7. Improved CP-SAT performance
8. Passenger-weighted FIFO comparison
9. 100,000+ minute multi-seed stress testing
10. Hardware/CPU standardized performance testing
11. Real-time ETA uncertainty calibration
12. Digital Twin integration with live operational state

---

# 35. Engineer 1 Completion Criteria

Engineer 1's current implementation milestone is considered substantially complete when the following are available:

```text
[✓] Dataset generator
[✓] Processed dataset
[✓] Delay prediction training
[✓] Delay prediction evaluation
[✓] Saved model weights
[✓] Feature importance
[✓] CP-SAT station optimizer
[✓] 6 platform model
[✓] 4 holding model
[✓] Route lock model
[✓] Headway constraints
[✓] Safety validator
[✓] Optimizer benchmark
[✓] 100,000-minute stress test
[✓] Zero simulated safety violations
[✓] Zero simulated deadlocks
[✓] Engineering documentation
```

---

# 36. Final Engineer 1 Result

The current Engineer 1 implementation successfully provides an integrated **AI/ML and railway station optimization foundation** for Project Aahavaan.

The delay prediction model achieved:

```text
MAE = 0.825 min
```

on the current synthetic 15-minute state-transition test dataset.

The station optimizer successfully produced:

```text
OPTIMAL
```

solutions for the demonstration scenario using:

```text
6 platforms
4 outer holdings
route locks
approach-specific headway
platform/holding constraints
```

The long-duration safety workload produced:

```text
100,000 simulated minutes
17,410 train movements
0 safety invariant violations
0 deadlocks
100.000% simulated safety compliance
```

These results establish a strong engineering foundation for the AI/ML and optimization layer of Project Aahavaan.

---

## 37. Disclaimer

> **Project Aahavaan is an engineering/research Digital Twin and decision-support project. The models, simulations, optimization results, and safety stress tests documented here are not railway signalling certification and must not be used as a substitute for certified railway safety systems, interlocking systems, operational procedures, or field validation.**