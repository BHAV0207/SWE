package com.snakeandladder.interfaces;

import com.snakeandladder.model.Player;

/**
 * Strategy interface for different player behaviors
 * Follows Strategy Pattern and Interface Segregation Principle
 */
public interface PlayerStrategy {
    /**
     * Determines if the player should take another turn
     * @param player the player making the decision
     * @param diceValue the value rolled on dice
     * @return true if player should take another turn
     */
    boolean shouldTakeAnotherTurn(Player player, int diceValue);
    
    /**
     * Gets the strategy name
     * @return strategy name
     */
    String getStrategyName();
}
