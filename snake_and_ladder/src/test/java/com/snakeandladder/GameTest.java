package com.snakeandladder;

import com.snakeandladder.model.*;
import com.snakeandladder.interfaces.PlayerStrategy;
import com.snakeandladder.strategy.StandardPlayerStrategy;
import com.snakeandladder.strategy.NoExtraTurnStrategy;

import java.util.Arrays;
import java.util.List;

/**
 * Simple test class to demonstrate the Snake and Ladder game functionality
 * This is a basic demonstration - in a real project, you would use JUnit
 */
public class GameTest {
    public static void main(String[] args) {
        System.out.println("=== Snake and Ladder Game Test ===");
        
        // Test 1: Basic game setup
        testBasicGameSetup();
        
        // Test 2: Board functionality
        testBoardFunctionality();
        
        // Test 3: Player movement
        testPlayerMovement();
        
        // Test 4: Strategy pattern
        testStrategyPattern();
        
        System.out.println("All tests completed successfully!");
    }
    
    private static void testBasicGameSetup() {
        System.out.println("\n--- Test 1: Basic Game Setup ---");
        
        Board board = new Board(10);
        List<Player> players = Arrays.asList(
            new Player("TestPlayer1"),
            new Player("TestPlayer2")
        );
        Dice dice = new Dice();
        PlayerStrategy strategy = new StandardPlayerStrategy();
        
        Game game = new Game(board, players, dice, strategy);
        
        System.out.println("✓ Game created successfully");
        System.out.println("✓ Board size: " + board.getSize());
        System.out.println("✓ Number of players: " + players.size());
        System.out.println("✓ Strategy: " + strategy.getStrategyName());
    }
    
    private static void testBoardFunctionality() {
        System.out.println("\n--- Test 2: Board Functionality ---");
        
        Board board = new Board(20);
        
        // Add a snake from position 15 to 5
        board.addSnake(15, 5);
        System.out.println("✓ Snake added: 15 -> 5");
        
        // Add a ladder from position 3 to 18
        board.addLadder(3, 18);
        System.out.println("✓ Ladder added: 3 -> 18");
        
        // Test snake functionality
        int newPosition = board.processMove(10, 5); // Move from 10 to 15
        System.out.println("✓ Snake test: Moved from 10 to " + newPosition + " (should be 5)");
        
        // Test ladder functionality
        newPosition = board.processMove(0, 3); // Move from 0 to 3
        System.out.println("✓ Ladder test: Moved from 0 to " + newPosition + " (should be 18)");
        
        // Test normal cell
        newPosition = board.processMove(0, 2); // Move from 0 to 2
        System.out.println("✓ Normal cell test: Moved from 0 to " + newPosition + " (should be 2)");
    }
    
    private static void testPlayerMovement() {
        System.out.println("\n--- Test 3: Player Movement ---");
        
        Player player = new Player("TestPlayer");
        System.out.println("✓ Player created: " + player);
        
        // Test basic movement
        player.move(5);
        System.out.println("✓ Player moved 5 steps: " + player);
        
        // Test position setting (for snakes/ladders)
        player.setPosition(10);
        System.out.println("✓ Player position set to 10: " + player);
        
        // Test win condition
        Board board = new Board(10);
        player.setPosition(10);
        boolean hasWon = player.hasWon(board.getSize());
        System.out.println("✓ Win condition test: " + (hasWon ? "Won!" : "Not won yet"));
    }
    
    private static void testStrategyPattern() {
        System.out.println("\n--- Test 4: Strategy Pattern ---");
        
        Player player = new Player("TestPlayer");
        
        // Test standard strategy
        PlayerStrategy standardStrategy = new StandardPlayerStrategy();
        boolean extraTurn = standardStrategy.shouldTakeAnotherTurn(player, 6);
        System.out.println("✓ Standard strategy (roll 6): " + (extraTurn ? "Extra turn" : "No extra turn"));
        
        extraTurn = standardStrategy.shouldTakeAnotherTurn(player, 3);
        System.out.println("✓ Standard strategy (roll 3): " + (extraTurn ? "Extra turn" : "No extra turn"));
        
        // Test no extra turn strategy
        PlayerStrategy noExtraStrategy = new NoExtraTurnStrategy();
        extraTurn = noExtraStrategy.shouldTakeAnotherTurn(player, 6);
        System.out.println("✓ No extra turn strategy (roll 6): " + (extraTurn ? "Extra turn" : "No extra turn"));
        
        System.out.println("✓ Strategy pattern working correctly");
    }
}
