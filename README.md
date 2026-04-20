# Indian Railways "Digital Twin" Decision Support Simulation

A Python-based simulation environment designed to optimize train routing and minimize cumulative delays using AI-driven logic.

## 🚂 Project Mission
The goal of this project is to prove that AI-optimized dispatching can significantly reduce train delays compared to manual human dispatching or standard FIFO (First In, First Out) rules.

## 🌟 Key Features
- **Tick-Based Simulation**: High-fidelity, minute-by-minute tracking of train positions.
- **Dynamic Network**: Supports stations with main lines and loop lines (for overtakes).
- **Conflict Detection**: Automated look-ahead logic to identify bottlenecks before they happen.
- **Decision Support (Optimization)**: predictive resolution that moves freight trains to loops to allow high-priority Express trains to pass.
- **Comparative Analysis**: Side-by-side terminal reporting of Standard vs. Optimized scenarios.

## 📂 Project Structure
```text
Railway/
├── data/               # Generated simulation data (Route, Timetable)
├── src/                # Core logic
│   ├── data_generator.py      # Dummy data creation
│   ├── simulation_engine.py   # State and tick management
│   ├── optimization_engine.py # AI/Logic for conflict resolution
│   └── utils.py               # Helpers
├── main.py             # Entry point for comparative simulation
├── master_blueprint.md # Technical specification
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites
- Python 3.x

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/harshjsh01/Digital-Twin.git
   cd Digital-Twin
   ```

2. No external dependencies are currently required (uses standard Python libraries).

### Running the Simulation
To generate the data and run the comparison results, execute:
```powershell
python src/data_generator.py; python main.py
```

## 🛠 Multi-Phase Development
- **Phase 1**: Project Scaffolding & Master Blueprinting.
- **Phase 2**: Data Generation (JSON Data) & Simulation Environment.
- **Phase 3**: Optimization Engine (Conflict Detection & Resolution Algorithm).
- **Phase 4**: Output, Side-by-Side Comparison & Artifact Generation.

## 📄 License
This project is for demonstration purposes as part of an AI Architect implementation.
