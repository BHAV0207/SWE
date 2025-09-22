package com.snakeandladder.model;

import com.snakeandladder.enums.CellType;
import com.snakeandladder.factory.CellFactory;
import java.util.HashMap;
import java.util.Map;

/**
 * Represents the game board
 * Follows Single Responsibility Principle - only manages board state and logic
 */
public class Board {
    private final int size;
    private final Map<Integer, Cell> cells;
    private final Map<Integer, Integer> snakes;
    private final Map<Integer, Integer> ladders;
    
    public Board(int size) {
        this.size = size;
        this.cells = new HashMap<>();
        this.snakes = new HashMap<>();
        this.ladders = new HashMap<>();
        initializeBoard();
    }
    
    private void initializeBoard() {
        // Initialize all cells as normal cells
        for (int i = 1; i <= size; i++) {
            cells.put(i, CellFactory.createNormalCell(i));
        }
    }
    
    /**
     * Adds a snake to the board
     * @param headPosition position of snake head
     * @param tailPosition position of snake tail
     */
    public void addSnake(int headPosition, int tailPosition) {
        if (headPosition > tailPosition && headPosition <= size && tailPosition >= 1) {
            snakes.put(headPosition, tailPosition);
            cells.put(headPosition, CellFactory.createSnakeHead(headPosition, tailPosition));
            cells.put(tailPosition, CellFactory.createSnakeTail(tailPosition));
        }
    }
    
    /**
     * Adds a ladder to the board
     * @param bottomPosition position of ladder bottom
     * @param topPosition position of ladder top
     */
    public void addLadder(int bottomPosition, int topPosition) {
        if (bottomPosition < topPosition && bottomPosition >= 1 && topPosition <= size) {
            ladders.put(bottomPosition, topPosition);
            cells.put(bottomPosition, CellFactory.createLadderBottom(bottomPosition, topPosition));
            cells.put(topPosition, CellFactory.createLadderTop(topPosition));
        }
    }
    
    /**
     * Gets the cell at the specified position
     * @param position the position to get
     * @return the cell at that position
     */
    public Cell getCell(int position) {
        return cells.getOrDefault(position, CellFactory.createNormalCell(position));
    }
    
    /**
     * Processes a player's move and returns the final position
     * @param currentPosition the player's current position
     * @param steps the number of steps to move
     * @return the final position after processing snakes and ladders
     */
    public int processMove(int currentPosition, int steps) {
        int newPosition = currentPosition + steps;
        
        // Don't move beyond the board
        if (newPosition > size) {
            return currentPosition;
        }
        
        Cell cell = getCell(newPosition);
        
        // Handle snakes and ladders
        if (cell.getType() == CellType.SNAKE_HEAD) {
            return cell.getDestination();
        } else if (cell.getType() == CellType.LADDER_BOTTOM) {
            return cell.getDestination();
        }
        
        return newPosition;
    }
    
    public int getSize() {
        return size;
    }
    
    public Map<Integer, Integer> getSnakes() {
        return new HashMap<>(snakes);
    }
    
    public Map<Integer, Integer> getLadders() {
        return new HashMap<>(ladders);
    }
    
    @Override
    public String toString() {
        return String.format("Board[size=%d, snakes=%d, ladders=%d]", size, snakes.size(), ladders.size());
    }
}
