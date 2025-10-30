package com.parkinglot;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.parkinglot.allocation.NearestSlotAllocationStrategy;
import com.parkinglot.core.ParkingLot;
import com.parkinglot.enums.GateType;
import com.parkinglot.enums.SpotType;
import com.parkinglot.enums.VehicleType;
import com.parkinglot.model.EntryExitGate;
import com.parkinglot.model.ParkingSpot;
import com.parkinglot.model.Ticket;
import com.parkinglot.model.vehicles.Bike;
import com.parkinglot.model.vehicles.Car;
import com.parkinglot.model.vehicles.ElectricBike;
import com.parkinglot.model.vehicles.Truck;
import com.parkinglot.pricing.DefaultPricingStrategy;

public class Main {
	public static void main(String[] args) throws InterruptedException {
		List<EntryExitGate> gates = new ArrayList<>();
		gates.add(new EntryExitGate("G1", 0, GateType.ENTRY));
		gates.add(new EntryExitGate("G2", 0, GateType.ENTRY));
		gates.add(new EntryExitGate("X1", 0, GateType.EXIT));

		List<ParkingSpot> spots = new ArrayList<>();
		// Build some spots across two floors
		for (int i = 1; i <= 5; i++) {
			spots.add(buildSpot("S1-" + i, 1, SpotType.STANDARD, 10 + i, 20 + i));
		}
		for (int i = 1; i <= 3; i++) {
			spots.add(buildChargingSpot("C1-" + i, 1, 15 + i, 25 + i));
		}
		for (int i = 1; i <= 5; i++) {
			spots.add(buildSpot("S2-" + i, 2, SpotType.STANDARD, 30 + i, 40 + i));
		}

		ParkingLot lot = new ParkingLot(
				gates,
				spots,
				new DefaultPricingStrategy(),
				new NearestSlotAllocationStrategy()
		);

		// Demo flow
		Car car = new Car("MH-01-AB-1234");
		Truck truck = new Truck("MH-05-ZZ-9999");
		Bike bike = new Bike("MH-02-CC-2323");
		ElectricBike eBike = new ElectricBike("MH-03-EE-7777");

		Ticket t1 = lot.park(car, "G1");
		System.out.println("Car parked, ticket: " + (t1 != null ? t1.getId() : "NO SPOT"));
		Ticket t2 = lot.park(truck, "G1");
		System.out.println("Truck parked, ticket: " + (t2 != null ? t2.getId() : "NO SPOT"));
		Ticket t3 = lot.park(bike, "G2");
		System.out.println("Bike parked, ticket: " + (t3 != null ? t3.getId() : "NO SPOT"));
		Ticket t4 = lot.park(eBike, "G2");
		System.out.println("E-Bike parked, ticket: " + (t4 != null ? t4.getId() : "NO SPOT"));

		Thread.sleep(1200); // simulate time

		double price4 = lot.unpark(t4.getId(), true); // used charging
		System.out.println("E-Bike price (charging): Rs." + price4);

		Thread.sleep(800);
		double price1 = lot.unpark(t1.getId(), false);
		System.out.println("Car price: Rs." + price1);
	}

	private static ParkingSpot buildSpot(String id, int floor, SpotType type, int dG1, int dG2) {
		Set<VehicleType> vts = new HashSet<>();
		vts.add(VehicleType.CAR);
		vts.add(VehicleType.BIKE);
		vts.add(VehicleType.ELECTRIC_BIKE);
		// trucks allowed only on some standard spots
		if (type == SpotType.STANDARD) vts.add(VehicleType.TRUCK);
		Map<String, Integer> d = new HashMap<>();
		d.put("G1", dG1);
		d.put("G2", dG2);
		return new ParkingSpot(id, floor, type, vts, d);
	}

	private static ParkingSpot buildChargingSpot(String id, int floor, int dG1, int dG2) {
		Set<VehicleType> vts = new HashSet<>();
		vts.add(VehicleType.ELECTRIC_BIKE);
		vts.add(VehicleType.CAR); // allow cars to park here too
		Map<String, Integer> d = new HashMap<>();
		d.put("G1", dG1);
		d.put("G2", dG2);
		return new ParkingSpot(id, floor, SpotType.CHARGING, vts, d);
	}
}
