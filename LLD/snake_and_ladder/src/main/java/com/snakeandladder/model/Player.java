package com.snakeandladder.model;

/**
 * Represents a player in the game
 * Follows Single Responsibility Principle - only manages player state
 */
public class Player {
    private final String name;
    private int position;
    private int totalMoves;
    
    public Player(String name) {
        this.name = name;
        this.position = 0; // Start at position 0 (before the board)
        this.totalMoves = 0;
    }
    
    public String getName() {
        return name;
    }
    
    public int getPosition() {
        return position;
    }
    
    public int getTotalMoves() {
        return totalMoves;
    }
    
    /**
     * Moves the player by the specified number of steps
     * @param steps number of steps to move
     */
    public void move(int steps) {
        this.position += steps;
        this.totalMoves++;
    }
    
    /**
     * Sets the player's position (used for snakes and ladders)
     * @param newPosition the new position
     */
    public void setPosition(int newPosition) {
        this.position = newPosition;
    }
    
    /**
     * Checks if the player has won (reached the end)
     * @param boardSize the size of the board
     * @return true if player has won
     */
    public boolean hasWon(int boardSize) {
        return position >= boardSize;
    }
    
    @Override
    public String toString() {
        return String.format("Player[%s, pos=%d, moves=%d]", name, position, totalMoves);
    }
}
