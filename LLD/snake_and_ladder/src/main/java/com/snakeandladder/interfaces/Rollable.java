package com.snakeandladder.interfaces;

/**
 * Interface for objects that can be rolled (like dice)
 * Follows Interface Segregation Principle - only contains roll-related functionality
 */
public interface Rollable {
    /**
     * Rolls the object and returns a random value
     * @return random integer value
     */
    int roll();
}
