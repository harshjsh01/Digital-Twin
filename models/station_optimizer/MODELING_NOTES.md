# V5 Modeling Notes

## Why V5

V4 made route awareness better but still used the station resource's full
service interval as the interval for shared route conflicts. In a dense
scenario this can over-constrain the model.

V5 gives each movement three distinct timing concepts:

1. Entry block — protects approach headway.
2. Route lock / throat — protects shared physical route conflicts.
3. Station service — occupies exactly one platform or outer holding.

A route lock ends before station service begins.

## Topology

APPROACH
  |
ENTRY BLOCK
  |
THROAT / ROUTE LOCK
  +----> PLATFORM 1..6
  +----> HOLDING 1..4
  |
DEPART

## Benchmark philosophy

Capacity pressure is a feature of the test, not a bug. The correct result for
an impossible traffic load is a fast, explicit infeasibility/overload result,
not a fabricated schedule.

For future Phase 2 integration, feed V5 with real route topology:
approach blocks, turnout/route-lock groups, platform compatibility, holding
compatibility, sectional headway, and operational priority weights.
