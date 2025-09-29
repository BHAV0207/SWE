package com.parkinglot.model.vehicles;

import com.parkinglot.enums.VehicleType;
import com.parkinglot.model.Vehicle;

public class Car extends Vehicle {
	public Car(String licensePlate) {
		super(licensePlate, VehicleType.CAR);
	}
}
