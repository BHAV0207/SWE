package com.snakeandladder.model;

import com.snakeandladder.interfaces.Rollable;
import java.util.Random;

/**
 * Represents a dice in the game
 * Follows Single Responsibility Principle - only handles dice rolling
 * Implements Rollable interface following Interface Segregation Principle
 */
public class Dice implements Rollable {
    private final Random random;
    private final int maxValue;
    
    public Dice() {
        this(6); // Default 6-sided dice
    }
    
    public Dice(int maxValue) {
        this.random = new Random();
        this.maxValue = maxValue;
    }
    
    @Override
    public int roll() {
        return random.nextInt(maxValue) + 1; // Returns 1 to maxValue
    }
    
    public int getMaxValue() {
        return maxValue;
    }
    
    @Override
    public String toString() {
        return String.format("Dice[max=%d]", maxValue);
    }
}
