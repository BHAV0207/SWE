package com.snakeandladder.model;

import com.snakeandladder.enums.CellType;

/**
 * Represents a cell on the game board
 * Follows Single Responsibility Principle - only manages cell properties
 */
public class Cell {
    private final int position;
    private final CellType type;
    private final int destination; // For snakes and ladders
    
    public Cell(int position, CellType type) {
        this(position, type, position);
    }
    
    public Cell(int position, CellType type, int destination) {
        this.position = position;
        this.type = type;
        this.destination = destination;
    }
    
    public int getPosition() {
        return position;
    }
    
    public CellType getType() {
        return type;
    }
    
    public int getDestination() {
        return destination;
    }
    
    public boolean isSpecialCell() {
        return type != CellType.NORMAL;
    }
    
    @Override
    public String toString() {
        return String.format("Cell[%d, %s, dest=%d]", position, type, destination);
    }
}
