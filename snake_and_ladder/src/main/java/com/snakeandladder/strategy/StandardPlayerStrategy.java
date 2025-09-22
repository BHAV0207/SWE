package com.snakeandladder.strategy;

import com.snakeandladder.interfaces.PlayerStrategy;
import com.snakeandladder.model.Player;

/**
 * Standard player strategy - player gets another turn only if they roll a 6
 * Follows Strategy Pattern and Single Responsibility Principle
 */
public class StandardPlayerStrategy implements PlayerStrategy {
    
    @Override
    public boolean shouldTakeAnotherTurn(Player player, int diceValue) {
        return diceValue == 6;
    }
    
    @Override
    public String getStrategyName() {
        return "Standard Strategy";
    }
}
