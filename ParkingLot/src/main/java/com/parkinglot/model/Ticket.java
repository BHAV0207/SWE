package com.parkinglot.model;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;

import com.parkinglot.enums.SpotType;
import com.parkinglot.enums.VehicleType;
import com.parkinglot.pricing.PricingStrategy;

public class Ticket {
	private final String id;
	private final String spotId;
	private final String entryGateId;
	private final VehicleType vehicleType;
	private final SpotType spotType;
	private final boolean chargingCapable;

	private final Instant entryTime;
	private Instant exitTime;
	private Double finalPrice;

	public Ticket(String id, String spotId, String entryGateId, VehicleType vehicleType, SpotType spotType, boolean chargingCapable) {
		this.id = id;
		this.spotId = spotId;
		this.entryGateId = entryGateId;
		this.vehicleType = vehicleType;
		this.spotType = spotType;
		this.chargingCapable = chargingCapable;
		this.entryTime = Instant.now();
	}

	public String getId() { return id; }
	public String getSpotId() { return spotId; }
	public String getEntryGateId() { return entryGateId; }
	public VehicleType getVehicleType() { return vehicleType; }
	public SpotType getSpotType() { return spotType; }
	public boolean isChargingCapable() { return chargingCapable; }
	public Instant getEntryTime() { return entryTime; }
	public Instant getExitTime() { return exitTime; }
	public Double getFinalPrice() { return finalPrice; }

	public boolean isClosed() { return exitTime != null; }

	public double closeAndPrice(PricingStrategy pricingStrategy, boolean usedChargingPoint) {
		if (isClosed()) {
			return Objects.requireNonNull(finalPrice);
		}
		this.exitTime = Instant.now();
		long minutes = Math.max(1, Duration.between(entryTime, exitTime).toMinutes());
		this.finalPrice = pricingStrategy.calculatePrice(vehicleType, spotType, minutes, usedChargingPoint);
		return finalPrice;
	}
}
