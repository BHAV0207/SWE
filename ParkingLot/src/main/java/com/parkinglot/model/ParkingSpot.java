package com.parkinglot.model;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import com.parkinglot.enums.SpotType;
import com.parkinglot.enums.VehicleType;

public class ParkingSpot {
	private final String id;
	private final int floor;
	private final SpotType spotType;
	private final Set<VehicleType> compatibleVehicleTypes;
	private final Map<String, Integer> gateDistances;

	private boolean occupied;
	private String currentTicketId;

	public ParkingSpot(
			String id,
			int floor,
			SpotType spotType,
			Set<VehicleType> compatibleVehicleTypes,
			Map<String, Integer> gateDistances
	) {
		this.id = id;
		this.floor = floor;
		this.spotType = spotType;
		this.compatibleVehicleTypes = new HashSet<>(compatibleVehicleTypes);
		this.gateDistances = new HashMap<>(gateDistances);
		this.occupied = false;
	}

	public String getId() {
		return id;
	}

	public int getFloor() {
		return floor;
	}

	public SpotType getSpotType() {
		return spotType;
	}

	public boolean isCompatible(VehicleType vehicleType) {
		return compatibleVehicleTypes.contains(vehicleType);
	}

	public boolean isOccupied() {
		return occupied;
	}

	public boolean isAvailable() {
		return !occupied;
	}

	public Map<String, Integer> getGateDistances() {
		return Collections.unmodifiableMap(gateDistances);
	}

	public int distanceToGate(String gateId) {
		return gateDistances.getOrDefault(gateId, Integer.MAX_VALUE);
	}

	public void occupy(String ticketId) {
		this.occupied = true;
		this.currentTicketId = ticketId;
	}

	public void release() {
		this.occupied = false;
		this.currentTicketId = null;
	}

	public String getCurrentTicketId() {
		return currentTicketId;
	}
}
