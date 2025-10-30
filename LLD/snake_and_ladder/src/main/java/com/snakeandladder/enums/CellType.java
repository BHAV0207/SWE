package com.snakeandladder.enums;

/**
 * Enum representing different types of cells on the board
 * Follows Single Responsibility Principle - only manages cell types
 */
public enum CellType {
    NORMAL("Normal Cell"),
    SNAKE_HEAD("Snake Head"),
    SNAKE_TAIL("Snake Tail"),
    LADDER_BOTTOM("Ladder Bottom"),
    LADDER_TOP("Ladder Top");
    
    private final String description;
    
    CellType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
