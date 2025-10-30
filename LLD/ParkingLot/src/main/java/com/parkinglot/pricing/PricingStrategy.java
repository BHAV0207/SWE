package com.parkinglot.pricing;

import com.parkinglot.enums.SpotType;
import com.parkinglot.enums.VehicleType;

public interface PricingStrategy {
	double calculatePrice(VehicleType vehicleType, SpotType spotType, long durationMinutes, boolean usedChargingPoint);
}
