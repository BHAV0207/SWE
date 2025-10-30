package com.parkinglot.pricing;

import java.util.EnumMap;
import java.util.Map;

import com.parkinglot.enums.SpotType;
import com.parkinglot.enums.VehicleType;

public class DefaultPricingStrategy implements PricingStrategy {
	private final Map<VehicleType, Double> hourlyBaseRates; // per hour on STANDARD
	private final Map<SpotType, Double> spotTypeMultipliers; // multiplier by spot type
	private final double chargingSurchargePerHour; // extra when using charging

	public DefaultPricingStrategy() {
		hourlyBaseRates = new EnumMap<>(VehicleType.class);
		hourlyBaseRates.put(VehicleType.CAR, 40.0);
		hourlyBaseRates.put(VehicleType.BIKE, 15.0);
		hourlyBaseRates.put(VehicleType.ELECTRIC_BIKE, 20.0);
		hourlyBaseRates.put(VehicleType.TRUCK, 80.0);

		spotTypeMultipliers = new EnumMap<>(SpotType.class);
		spotTypeMultipliers.put(SpotType.STANDARD, 1.0);
		spotTypeMultipliers.put(SpotType.CHARGING, 1.2);

		chargingSurchargePerHour = 10.0;
	}

	@Override
	public double calculatePrice(VehicleType vehicleType, SpotType spotType, long durationMinutes, boolean usedChargingPoint) {
		double hours = Math.ceil(durationMinutes / 60.0);
		double base = hourlyBaseRates.getOrDefault(vehicleType, 50.0);
		double multiplier = spotTypeMultipliers.getOrDefault(spotType, 1.0);
		double price = base * hours * multiplier;
		if (usedChargingPoint) {
			price += chargingSurchargePerHour * hours;
		}
		return price;
	}
}
