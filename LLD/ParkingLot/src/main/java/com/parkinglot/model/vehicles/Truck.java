package com.parkinglot.model.vehicles;

import com.parkinglot.enums.VehicleType;
import com.parkinglot.model.Vehicle;

public class Truck extends Vehicle {
	public Truck(String licensePlate) {
		super(licensePlate, VehicleType.TRUCK);
	}
}
