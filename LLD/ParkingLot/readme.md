# Multi-Floor Parking Lot System (Java)

This project implements a modular, extensible multi-floor parking lot with multiple entry/exit gates, typed vehicles and spots, nearest-slot allocation, a ticketing system, and a pluggable pricing strategy (time-based with charging surcharges).

## Objectives (mapped to requirements)
- Support different vehicle types: Car, Bike, Electric Bike, Truck (`VehicleType`).
- Slot types: Standard, Charging (`SpotType`). Larger vehicles (e.g., Truck) can use compatible larger Standard spots.
- Multiple entry/exit gates: `EntryExitGate` with `GateType` (ENTRY/EXIT), distances modeled per spot.
- Charging points: `SpotType.CHARGING` with additional charges when used.
- Slot allocation: Nearest compatible available spot from a specific entry gate (`NearestSlotAllocationStrategy`).
- Pricing strategy: Pluggable (`PricingStrategy`), default uses hourly base by `VehicleType`, spot-type multiplier, and charging surcharge when used.
- Nearest available spot: `ParkingLot.findNearestAvailableSpot(vehicle, entryGateId)`.
- Occupied/available status: `ParkingSpot.occupy()`/`release()` updated via `ParkingLot.park()`/`unpark()`.
- Ticketing: `Ticket` records entry/exit times and calculates price on close.
- Extensibility: new vehicle/spot types, pricing rules, and allocation strategies without breaking API.

## Package Structure
- `com.parkinglot.enums`: `VehicleType`, `SpotType`, `GateType`
- `com.parkinglot.model`: `Vehicle` (abstract), concrete vehicles, `ParkingSpot`, `EntryExitGate`, `Ticket`
- `com.parkinglot.pricing`: `PricingStrategy` (interface), `DefaultPricingStrategy`
- `com.parkinglot.allocation`: `SlotAllocationStrategy` (interface), `NearestSlotAllocationStrategy`
- `com.parkinglot.core`: `ParkingLot` orchestrator
- `com.parkinglot.Main`: runnable demo

## Detailed UML

Class diagram (attributes/methods simplified to public API):

```text
+------------------------------------+
|            ParkingLot              |
+------------------------------------+
| - gatesById: Map<String,Gate>      |
| - spotsById: Map<String,Spot>      |
| - ticketsById: Map<String,Ticket>  |
| - pricingStrategy: PricingStrategy |
| - allocationStrategy: SlotAllocStr |
+------------------------------------+
| +getAllSpots(): List<Spot>         |
| +getAllGates(): List<Gate>         |
| +findNearestAvailableSpot(v,g):Spot|
| +park(v:Vehicle, entryGateId):Ticket|
| +unpark(ticketId, usedChg): double |
| +getTicket(id): Ticket             |
| +getSpot(id): Spot                 |
| +getGate(id): Gate                 |
+------------------------------------+
            ^  composition
            |
+------------------------------+      +----------------------------+
|         ParkingSpot          |      |       EntryExitGate        |
+------------------------------+      +----------------------------+
| - id: String                 |      | - id: String               |
| - floor: int                 |      | - floor: int               |
| - spotType: SpotType         |      | - gateType: GateType       |
| - compatibleVTs: Set<VType>  |      +----------------------------+
| - gateDistances: Map<id,int> |      | +getId(): String           |
| - occupied: boolean          |      | +getFloor(): int           |
| - currentTicketId: String    |      | +getGateType(): GateType   |
+------------------------------+      | +isEntry(): boolean        |
| +isCompatible(vt): boolean   |      | +isExit(): boolean         |
| +isAvailable(): boolean      |      +----------------------------+
| +distanceToGate(id): int     |
| +occupy(ticketId): void      |
| +release(): void             |
+------------------------------+

+--------------------------+           +---------------------------+
|         Ticket           |<----------|         Vehicle           |
+--------------------------+  uses     +---------------------------+
| - id: String             |           | - licensePlate: String    |
| - spotId: String         |           | - vehicleType: VehicleType|
| - entryGateId: String    |           +---------------------------+
| - vehicleType: VType     |           | +getLicensePlate(): String|
| - spotType: SpotType     |           | +getVehicleType(): VType  |
| - chargingCapable: bool  |           +---------------------------+
| - entryTime: Instant     |                    ^
| - exitTime: Instant      |        +-----------+-----------+----------+
| - finalPrice: Double     |        |           |           |          |
+--------------------------+        Car        Bike  ElectricBike    Truck
| +isClosed(): boolean     |
| +closeAndPrice(ps,used): |
|   double                 |
+--------------------------+

Interfaces:
- PricingStrategy
  + calculatePrice(vehicleType, spotType, durationMinutes, usedChargingPoint): double

- SlotAllocationStrategy
  + findSpot(lot, vehicle, entryGateId): ParkingSpot

Enums:
- VehicleType { CAR, BIKE, ELECTRIC_BIKE, TRUCK }
- SpotType { STANDARD, CHARGING }
- GateType { ENTRY, EXIT }
```

Sequence (happy path):

```text
Client -> ParkingLot.park(vehicle, entryGateId)
  ParkingLot -> SlotAllocationStrategy.findSpot(...)
  SlotAllocationStrategy -> ParkingLot.getAllSpots()
  SlotAllocationStrategy -> returns best compatible available spot
  ParkingLot -> Ticket(new ...)
  ParkingLot -> ParkingSpot.occupy(ticketId)
  ParkingLot -> returns Ticket

Client -> ParkingLot.unpark(ticketId, usedChargingPoint)
  ParkingLot -> Ticket.closeAndPrice(pricingStrategy, usedChargingPoint)
    Ticket -> PricingStrategy.calculatePrice(...)
  ParkingLot -> ParkingSpot.release()
  ParkingLot -> returns price
```

## Design Rationale
- Separation of Concerns: models (`Vehicle`, `ParkingSpot`, `EntryExitGate`, `Ticket`), orchestrator (`ParkingLot`), and strategies (pricing, allocation) are independent and replaceable.
- Extensibility: Add new vehicle/spot types by updating enums and spot compatibility; create new pricing/allocation via interfaces.
- Multi-gate support: Each spot stores distances to all gates; allocation uses the chosen entry gate’s distance.
- Multi-floor: `floor` is tracked on both gates and spots; allocation can evolve to include floor penalties if desired.

## Pricing Details (DefaultPricingStrategy)
- Duration: rounded up to next full hour: `hours = ceil(minutes / 60)`. Minimum 1 minute becomes 1 hour billed.
- Base hourly rates by vehicle type (example defaults):
  - Car: 40, Bike: 15, ElectricBike: 20, Truck: 80
- Spot type multipliers:
  - Standard: 1.0, Charging: 1.2
- Charging surcharge per hour (only if actually used): 10
- Formula: `price = baseRate(vehicleType) * hours * multiplier(spotType) + (usedCharging ? surchargePerHour * hours : 0)`

Example:
- Electric Bike parked 65 minutes on Charging spot and used charging:
  - hours = ceil(65/60) = 2
  - base = 20, multiplier = 1.2, surcharge = 10 -> price = 20*2*1.2 + 10*2 = 48 + 20 = 68

## Slot Allocation Details (NearestSlotAllocationStrategy)
- Filters all spots by: `isAvailable()` and `isCompatible(vehicle.getVehicleType())`.
- Chooses the minimum `distanceToGate(entryGateId)` among candidates.
- If no candidate exists, returns `null` and `ParkingLot.park` returns `null` (no spot); caller can retry or choose a different gate.

## Public APIs Summary
- `ParkingLot.park(Vehicle, entryGateId) -> Ticket | null`
- `ParkingLot.unpark(ticketId, usedChargingPoint) -> double`
- `ParkingLot.findNearestAvailableSpot(Vehicle, entryGateId) -> ParkingSpot | null`
- `ParkingLot.getTicket(id) -> Ticket`
- `ParkingLot.getSpot(id) -> ParkingSpot`
- `ParkingLot.getGate(id) -> EntryExitGate`

## Assumptions & Notes
- Distances to gates are precomputed/static per spot (could be Euclidean, Manhattan, or graph distance from a pathfinding layer).
- A charging spot is “charging-capable”; billing adds surcharge only if `usedChargingPoint = true` at unpark time.
- Trucks can use only Standard spots in the demo, but compatibility rules are per-spot, so you can fine-tune which vehicles fit where.
- Concurrency, reservations, and partial payments are out-of-scope for this simple demo but the design allows adding them.

## Build & Run (demo)
This project is plain Java (no external dependencies). Compile and run:

```bash
javac -d out $(find src/main/java -name "*.java") && java -cp out com.parkinglot.Main
```

You should see a short simulation: multiple vehicles parked, then unparked with printed prices.

## Extending the System
- Add vehicle/spot types: extend `VehicleType`/`SpotType`, update spot compatibility where needed.
- Custom pricing: implement `PricingStrategy` and pass it to `ParkingLot` constructor.
- Custom allocation: implement `SlotAllocationStrategy` (e.g., cheapest-first, floor-priority, load-balancing) and inject it.
- More metadata: extend `ParkingSpot` (e.g., `width`, `length`) and adjust `isCompatible` checks to better fit large vehicles.
