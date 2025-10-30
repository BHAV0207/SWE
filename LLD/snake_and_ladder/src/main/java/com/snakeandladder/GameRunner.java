package com.snakeandladder;

import com.snakeandladder.model.*;
import com.snakeandladder.interfaces.PlayerStrategy;
import com.snakeandladder.strategy.StandardPlayerStrategy;
import com.snakeandladder.strategy.NoExtraTurnStrategy;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

/**
 * Main class to run the Snake and Ladder game
 * Demonstrates the usage of all components
 */
public class GameRunner {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("=== Snake and Ladder Game Setup ===");
        
        // Create board
        Board board = new Board(100);
        setupDefaultSnakesAndLadders(board);
        
        // Get player names
        List<Player> players = getPlayers(scanner);
        
        // Choose strategy
        PlayerStrategy strategy = chooseStrategy(scanner);
        
        // Create dice
        Dice dice = new Dice();
        
        // Create and start game
        Game game = new Game(board, players, dice, strategy);
        game.startGame();
        
        scanner.close();
    }
    
    private static void setupDefaultSnakesAndLadders(Board board) {
        // Add some snakes
        board.addSnake(16, 6);
        board.addSnake(47, 26);
        board.addSnake(49, 11);
        board.addSnake(56, 53);
        board.addSnake(62, 19);
        board.addSnake(64, 60);
        board.addSnake(87, 24);
        board.addSnake(93, 73);
        board.addSnake(95, 75);
        board.addSnake(98, 78);
        
        // Add some ladders
        board.addLadder(1, 38);
        board.addLadder(4, 14);
        board.addLadder(9, 21);
        board.addLadder(21, 42);
        board.addLadder(28, 84);
        board.addLadder(36, 44);
        board.addLadder(51, 67);
        board.addLadder(71, 91);
        board.addLadder(80, 100);
    }
    
    private static List<Player> getPlayers(Scanner scanner) {
        List<Player> players = new ArrayList<>();
        
        System.out.print("Enter number of players (2-4): ");
        int numPlayers = scanner.nextInt();
        scanner.nextLine(); // Consume newline
        
        for (int i = 1; i <= numPlayers; i++) {
            System.out.print("Enter name for Player " + i + ": ");
            String name = scanner.nextLine();
            players.add(new Player(name));
        }
        
        return players;
    }
    
    private static PlayerStrategy chooseStrategy(Scanner scanner) {
        System.out.println("Choose game strategy:");
        System.out.println("1. Standard (extra turn on rolling 6)");
        System.out.println("2. No extra turns");
        System.out.print("Enter choice (1-2): ");
        
        int choice = scanner.nextInt();
        scanner.nextLine(); // Consume newline
        
        return choice == 1 ? new StandardPlayerStrategy() : new NoExtraTurnStrategy();
    }
}
