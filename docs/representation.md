# Visual Representations, Topologies & State Machines (`docs/representation.md`)

This document provides visual diagrams, track topologies, state machines, and switch interlocking schematics for **Project Aahavaan - Rail**.

---

## 🛤️ 1. 6-Platform Junction with Outer Waiting Tracks Topology

```text
========================================================================================================================
                                     AAHAVAAN CENTRAL JUNCTION PHYSICAL TOPOLOGY
========================================================================================================================

   UP APPROACH                                 STATION THROAT                                   STATION EXIT
 (From Up Trunk)                                 (Switches)                                    (To Down Trunk)

                     +---------------------------------------+
                     | Outer Waiting Track 1 (Up Main Loop)  |
                     +---------------------------------------+
                    /                                         \
--- Up Main Track -+--[SW_01A]---------------------------------[SW_01B]--+
                    \                                                   /
                     +-------------------------------------------------+
                     | Outer Waiting Track 2 (Up Freight Siding)       |
                     +-------------------------------------------------+
                                       \
                                        \ (Crossover Ladder to Platforms)
                                         +==================== [ PLATFORM 1: 650m ] ====================+
                                         |                                                               |
                                         +==================== [ PLATFORM 2: 650m ] ====================+
                                         |                                                               |
                                         +==================== [ PLATFORM 3: 650m ] ====================+
                                         |                                                               |
                                         +==================== [ PLATFORM 4: 600m ] ====================+
                                         |                                                               |
                                         +==================== [ PLATFORM 5: 600m ] ====================+
                                         |                                                               |
                                         +==================== [ PLATFORM 6: 550m ] ====================+
                                         /
                     +-------------------------------------------------+
                     | Outer Waiting Track 3 (Down Freight Siding)     |
                     +-------------------------------------------------+
                    /                                                   \
--- Down Main ----+--[SW_02A]---------------------------------[SW_02B]--+
                    \                                         /
                     +---------------------------------------+
                     | Outer Waiting Track 4 (Down Main Loop)|
                     +---------------------------------------+

========================================================================================================================
 OPERATIONAL ZONES:
 1. Outer Waiting Siding 1 & 2: Buffers lower-priority trains before the Home Signal when station platforms are saturated.
 2. Station Platforms 1 - 6: Direct passenger embarkation/disembarkation with individual track circuits and starter signals.
 3. Station Throat Crossover: Interlocked ladder turnouts permitting any approach track to access any platform safely.
========================================================================================================================
```

---

## 🚦 2. Signal Aspect & Track Circuit State Machine

```mermaid
stateDiagram-v2
    [*] --> RED : Block Occupied by Train
    RED --> YELLOW : Train Clears Block 1 (Moves into Block 2)
    YELLOW --> DOUBLE_YELLOW : Train Clears Block 2 (Moves into Block 3)
    DOUBLE_YELLOW --> GREEN : Train Clears Block 3 (Moves into Block 4)
    GREEN --> RED : Next Train Trips Track Circuit Sensor
```

| Signal Aspect | Visual Display | Indication to Driver / Simulator | Speed Permitted |
| :--- | :--- | :--- | :--- |
| **RED** | Single Red Lamp | **Danger / Stop**. Do not pass signal. | $0\text{ km/h}$ |
| **YELLOW** | Single Amber Lamp | **Caution**. Expect next signal to be at Danger. | $30\text{ km/h}$ |
| **DOUBLE YELLOW** | Two Amber Lamps | **Attention**. Expect next signal at Caution. | $60\text{ km/h}$ |
| **GREEN** | Single Green Lamp | **Clear**. Line is clear for at least three blocks. | Max Permissible Speed ($110-160\text{ km/h}$) |

---

## 🔀 3. Switch Turnout & Route Interlocking FSM

```mermaid
stateDiagram-v2
    [*] --> IDLE : Switch Point Free

    state IDLE {
        [*] --> Normal : Points Aligned for Straight Run
        [*] --> Reverse : Points Aligned for Diverging Route
    }

    IDLE --> ROUTE_REQUESTED : Station Master / AI Approves Route
    
    state ROUTE_REQUESTED {
        [*] --> CheckFoulingPoints
        CheckFoulingPoints --> CheckConflictingLocks : No Obstruction
        CheckConflictingLocks --> InterlockConflict : Route Conflict Detected
        CheckConflictingLocks --> ThrowSwitches : Interlocking Verified Safe
    }

    InterlockConflict --> IDLE : Command Rejected / Red Signal Held
    ThrowSwitches --> LOCKED : Switch Detectors Confirm Locked In Position
    
    state LOCKED {
        [*] --> SignalGreenAspect
        SignalGreenAspect --> TrainTraversing : Train Enters Section
        TrainTraversing --> ReleaseLock : Train Axle Clears Track Circuit
    }

    ReleaseLock --> IDLE : Route Released
```

---

## 💬 4. Passenger "Why is My Train Stopped?" Explainability FSM

```mermaid
stateDiagram-v2
    [*] --> RUNNING : Train Speed > 0 km/h
    
    RUNNING --> HALTED : Speed drops to 0 km/h (Sensor Trigger)
    
    state HALTED {
        [*] --> DetectHaltLocation
        DetectHaltLocation --> CheckSignalHold : Stopped at Outer Signal / Holding Track
        DetectHaltLocation --> CheckPlatformDwell : Stopped at Platform Track
        
        CheckSignalHold --> QueryInterlocking : Find Conflicting Active Route Lock
        QueryInterlocking --> GenerateSemanticLog : Identify Higher-Priority Precedence Train
        GenerateSemanticLog --> PublishWaitReason : Format Plain-English Explanation
    }
    
    PublishWaitReason --> RUNNING : Signal Turns Green, Speed > 0 km/h
```
