from src.simulation_engine import SimulationEngine
from src.optimization_engine import OptimizationEngine

def run_scenario_a():
    print("\n" + "="*50)
    print("RUNNING SCENARIO A: Standard FIFO Rules")
    print("="*50)
    sim = SimulationEngine("data/route.json", "data/timetable.json")
    # Optimizer is disabled by default
    delay = sim.run_simulation()
    print(f"\nScenario A Total Cumulative Delay: {delay} minutes")
    return delay

def run_scenario_b():
    print("\n" + "="*50)
    print("RUNNING SCENARIO B: Optimization Engine Enabled")
    print("="*50)
    sim = SimulationEngine("data/route.json", "data/timetable.json")
    optimizer = OptimizationEngine(sim)
    optimizer.set_enabled(True)
    delay = sim.run_simulation(optimizer=optimizer)
    print(f"\nScenario B Total Cumulative Delay: {delay} minutes")
    return delay

def main():
    print("="*60)
    print("INDIAN RAILWAYS DIGITAL TWIN: DECISION SUPPORT SIMULATION")
    print("="*60)
    
    delay_a = run_scenario_a()
    delay_b = run_scenario_b()
    
    print("\n" + "#"*50)
    print("FINAL SUMMARY COMPARISON")
    print("#"*50)
    print(f"Scenario A (Unoptimized): {delay_a} minutes total delay")
    print(f"Scenario B (Optimized):   {delay_b} minutes total delay")
    print("-" * 50)
    print(f"TOTAL DELAY MINUTES SAVED: {max(0, delay_a - delay_b)} minutes")
    print("#"*50)

if __name__ == "__main__":
    main()
