package com.parkinglot.core;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.parkinglot.allocation.SlotAllocationStrategy;
import com.parkinglot.enums.SpotType;
import com.parkinglot.model.EntryExitGate;
import com.parkinglot.model.ParkingSpot;
import com.parkinglot.model.Ticket;
import com.parkinglot.model.Vehicle;
import com.parkinglot.pricing.PricingStrategy;

public class ParkingLot {
	private final Map<String, EntryExitGate> gatesById;
	private final Map<String, ParkingSpot> spotsById;
	private final Map<String, Ticket> ticketsById;

	private final PricingStrategy pricingStrategy;
	private final SlotAllocationStrategy allocationStrategy;

	public ParkingLot(
			List<EntryExitGate> gates,
			List<ParkingSpot> spots,
			PricingStrategy pricingStrategy,
			SlotAllocationStrategy allocationStrategy
	) {
		this.gatesById = new HashMap<>();
		for (EntryExitGate g : gates) {
			gatesById.put(g.getId(), g);
		}
		this.spotsById = new HashMap<>();
		for (ParkingSpot s : spots) {
			spotsById.put(s.getId(), s);
		}
		this.ticketsById = new HashMap<>();
		this.pricingStrategy = pricingStrategy;
		this.allocationStrategy = allocationStrategy;
	}

	public List<ParkingSpot> getAllSpots() {
		return new ArrayList<>(spotsById.values());
	}

	public List<EntryExitGate> getAllGates() {
		return new ArrayList<>(gatesById.values());
	}

	public ParkingSpot findNearestAvailableSpot(Vehicle vehicle, String entryGateId) {
		return allocationStrategy.findSpot(this, vehicle, entryGateId);
	}

	public Ticket park(Vehicle vehicle, String entryGateId) {
		ParkingSpot spot = findNearestAvailableSpot(vehicle, entryGateId);
		if (spot == null) {
			return null;
		}
		String ticketId = UUID.randomUUID().toString();
		Ticket ticket = new Ticket(
				ticketId,
				spot.getId(),
				entryGateId,
				vehicle.getVehicleType(),
				spot.getSpotType(),
				spot.getSpotType() == SpotType.CHARGING
		);
		ticketsById.put(ticketId, ticket);
		spot.occupy(ticketId);
		return ticket;
	}

	public double unpark(String ticketId, boolean usedChargingPoint) {
		Ticket ticket = ticketsById.get(ticketId);
		if (ticket == null) {
			throw new IllegalArgumentException("Invalid ticket id");
		}
		ParkingSpot spot = spotsById.get(ticket.getSpotId());
		double price = ticket.closeAndPrice(pricingStrategy, usedChargingPoint);
		spot.release();
		return price;
	}

	public Ticket getTicket(String ticketId) { return ticketsById.get(ticketId); }
	public ParkingSpot getSpot(String spotId) { return spotsById.get(spotId); }
	public EntryExitGate getGate(String gateId) { return gatesById.get(gateId); }

	public Map<String, Ticket> getTicketsView() { return Collections.unmodifiableMap(ticketsById); }
}
