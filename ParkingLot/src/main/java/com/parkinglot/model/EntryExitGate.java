package com.parkinglot.model;

import com.parkinglot.enums.GateType;

public class EntryExitGate {
	private final String id;
	private final int floor;
	private final GateType gateType;

	public EntryExitGate(String id, int floor, GateType gateType) {
		this.id = id;
		this.floor = floor;
		this.gateType = gateType;
	}

	public String getId() {
		return id;
	}

	public int getFloor() {
		return floor;
	}

	public GateType getGateType() {
		return gateType;
	}

	public boolean isEntry() {
		return gateType == GateType.ENTRY;
	}

	public boolean isExit() {
		return gateType == GateType.EXIT;
	}
}
