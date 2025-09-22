package com.snakeandladder.strategy;

import com.snakeandladder.interfaces.PlayerStrategy;
import com.snakeandladder.model.Player;

/**
 * Strategy where players never get extra turns regardless of dice value
 * Follows Strategy Pattern and Single Responsibility Principle
 */
public class NoExtraTurnStrategy implements PlayerStrategy {
    
    @Override
    public boolean shouldTakeAnotherTurn(Player player, int diceValue) {
        return false; // Never get extra turns
    }
    
    @Override
    public String getStrategyName() {
        return "No Extra Turn Strategy";
    }
}
