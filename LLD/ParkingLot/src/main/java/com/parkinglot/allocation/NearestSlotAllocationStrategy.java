package com.parkinglot.allocation;

import java.util.Comparator;
import java.util.Optional;

import com.parkinglot.core.ParkingLot;
import com.parkinglot.model.ParkingSpot;
import com.parkinglot.model.Vehicle;

public class NearestSlotAllocationStrategy implements SlotAllocationStrategy {
	@Override
	public ParkingSpot findSpot(ParkingLot lot, Vehicle vehicle, String entryGateId) {
		Optional<ParkingSpot> best = lot.getAllSpots().stream()
				.filter(s -> s.isAvailable() && s.isCompatible(vehicle.getVehicleType()))
				.min(Comparator.comparingInt(s -> s.distanceToGate(entryGateId)));
		return best.orElse(null);
	}
}
