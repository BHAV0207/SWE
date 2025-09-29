package com.parkinglot.model.vehicles;

import com.parkinglot.enums.VehicleType;
import com.parkinglot.model.Vehicle;

public class Bike extends Vehicle {
	public Bike(String licensePlate) {
		super(licensePlate, VehicleType.BIKE);
	}
}
