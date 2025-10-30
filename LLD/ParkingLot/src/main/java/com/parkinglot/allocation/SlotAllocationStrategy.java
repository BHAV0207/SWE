package com.parkinglot.allocation;

import com.parkinglot.model.ParkingSpot;
import com.parkinglot.model.Vehicle;
import com.parkinglot.core.ParkingLot;

public interface SlotAllocationStrategy {
	ParkingSpot findSpot(ParkingLot lot, Vehicle vehicle, String entryGateId);
}
