package com.parkinglot.model.vehicles;

import com.parkinglot.enums.VehicleType;
import com.parkinglot.model.Vehicle;

public class ElectricBike extends Vehicle {
	public ElectricBike(String licensePlate) {
		super(licensePlate, VehicleType.ELECTRIC_BIKE);
	}
}
