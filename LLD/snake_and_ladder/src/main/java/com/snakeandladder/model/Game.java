package com.snakeandladder.model;

import com.snakeandladder.interfaces.PlayerStrategy;
import com.snakeandladder.interfaces.Rollable;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

/**
 * Main game class that orchestrates the Snake and Ladder game
 * Follows Single Responsibility Principle - only manages game flow
 * Follows Dependency Inversion Principle - depends on abstractions (interfaces)
 */
public class Game {
    private final Board board;
    private final List<Player> players;
    private final Rollable dice;
    private final PlayerStrategy playerStrategy;
    private Player currentPlayer;
    private int currentPlayerIndex;
    private boolean gameOver;
    private final Scanner scanner;
    
    public Game(Board board, List<Player> players, Rollable dice, PlayerStrategy playerStrategy) {
        this.board = board;
        this.players = new ArrayList<>(players);
        this.dice = dice;
        this.playerStrategy = playerStrategy;
        this.currentPlayerIndex = 0;
        this.currentPlayer = players.get(0);
        this.gameOver = false;
        this.scanner = new Scanner(System.in);
    }
    
    /**
     * Starts the game
     */
    public void startGame() {
        System.out.println("=== Snake and Ladder Game Started ===");
        System.out.println("Board: " + board);
        System.out.println("Strategy: " + playerStrategy.getStrategyName());
        System.out.println("Players: " + players.size());
        System.out.println();
        
        while (!gameOver) {
            playTurn();
        }
        
        scanner.close();
    }
    
    /**
     * Plays a single turn for the current player
     */
    private void playTurn() {
        System.out.println("Current player: " + currentPlayer.getName());
        System.out.println("Current position: " + currentPlayer.getPosition());
        
        System.out.print("Press Enter to roll the dice...");
        scanner.nextLine();
        
        int diceValue = dice.roll();
        System.out.println("Dice rolled: " + diceValue);
        
        int oldPosition = currentPlayer.getPosition();
        int newPosition = board.processMove(oldPosition, diceValue);
        
        currentPlayer.setPosition(newPosition);
        
        System.out.println("Moved from position " + oldPosition + " to " + newPosition);
        
        // Check for special cells
        Cell cell = board.getCell(newPosition);
        if (cell.isSpecialCell()) {
            System.out.println("Landed on: " + cell.getType().getDescription());
            if (cell.getType().name().contains("SNAKE")) {
                System.out.println("Snake bite! Moved to position " + cell.getDestination());
            } else if (cell.getType().name().contains("LADDER")) {
                System.out.println("Climbed ladder! Moved to position " + cell.getDestination());
            }
        }
        
        // Check for win condition
        if (currentPlayer.hasWon(board.getSize())) {
            System.out.println("🎉 " + currentPlayer.getName() + " wins! 🎉");
            System.out.println("Total moves: " + currentPlayer.getTotalMoves());
            gameOver = true;
            return;
        }
        
        // Check if player gets another turn
        if (playerStrategy.shouldTakeAnotherTurn(currentPlayer, diceValue)) {
            System.out.println("You rolled a " + diceValue + "! Take another turn!");
        } else {
            nextPlayer();
        }
        
        System.out.println();
    }
    
    /**
     * Moves to the next player
     */
    private void nextPlayer() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.size();
        currentPlayer = players.get(currentPlayerIndex);
    }
    
    /**
     * Gets the current game state
     * @return string representation of current state
     */
    public String getGameState() {
        StringBuilder state = new StringBuilder();
        state.append("=== Game State ===\n");
        state.append("Current Player: ").append(currentPlayer.getName()).append("\n");
        state.append("Player Positions:\n");
        for (Player player : players) {
            state.append("  ").append(player).append("\n");
        }
        return state.toString();
    }
    
    public boolean isGameOver() {
        return gameOver;
    }
    
    public Player getWinner() {
        return gameOver ? currentPlayer : null;
    }
}
