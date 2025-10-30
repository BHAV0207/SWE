package com.snakeandladder.factory;

import com.snakeandladder.enums.CellType;
import com.snakeandladder.model.Cell;
import java.util.Map;

/**
 * Factory class for creating Cell objects
 * Follows Factory Pattern and Single Responsibility Principle
 */
public class CellFactory {
    
    /**
     * Creates a normal cell
     * @param position the position of the cell
     * @return a normal cell
     */
    public static Cell createNormalCell(int position) {
        return new Cell(position, CellType.NORMAL);
    }
    
    /**
     * Creates a snake head cell
     * @param position the position of the snake head
     * @param tailPosition the position where the snake tail is
     * @return a snake head cell
     */
    public static Cell createSnakeHead(int position, int tailPosition) {
        return new Cell(position, CellType.SNAKE_HEAD, tailPosition);
    }
    
    /**
     * Creates a snake tail cell
     * @param position the position of the snake tail
     * @return a snake tail cell
     */
    public static Cell createSnakeTail(int position) {
        return new Cell(position, CellType.SNAKE_TAIL);
    }
    
    /**
     * Creates a ladder bottom cell
     * @param position the position of the ladder bottom
     * @param topPosition the position where the ladder top is
     * @return a ladder bottom cell
     */
    public static Cell createLadderBottom(int position, int topPosition) {
        return new Cell(position, CellType.LADDER_BOTTOM, topPosition);
    }
    
    /**
     * Creates a ladder top cell
     * @param position the position of the ladder top
     * @return a ladder top cell
     */
    public static Cell createLadderTop(int position) {
        return new Cell(position, CellType.LADDER_TOP);
    }
    
    /**
     * Creates a cell based on the position and special cell mappings
     * @param position the position of the cell
     * @param snakes map of snake heads to tails
     * @param ladders map of ladder bottoms to tops
     * @return the appropriate cell type
     */
    public static Cell createCell(int position, Map<Integer, Integer> snakes, Map<Integer, Integer> ladders) {
        if (snakes.containsKey(position)) {
            return createSnakeHead(position, snakes.get(position));
        } else if (ladders.containsKey(position)) {
            return createLadderBottom(position, ladders.get(position));
        } else if (snakes.containsValue(position)) {
            return createSnakeTail(position);
        } else if (ladders.containsValue(position)) {
            return createLadderTop(position);
        } else {
            return createNormalCell(position);
        }
    }
}
