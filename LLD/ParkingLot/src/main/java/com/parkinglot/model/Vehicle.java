package com.parkinglot.model;

import com.parkinglot.enums.VehicleType;

public abstract class Vehicle {
	private final String licensePlate;
	private final VehicleType vehicleType;

	protected Vehicle(String licensePlate, VehicleType vehicleType) {
		this.licensePlate = licensePlate;
		this.vehicleType = vehicleType;
	}

	public String getLicensePlate() {
		return licensePlate;
	}

	public VehicleType getVehicleType() {
		return vehicleType;
	}
}
