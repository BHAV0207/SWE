import java.util.Scanner;

class Tic_Tac_Toe {
  public static void main(String[] args) {
    Game game = new Game(3, "bhav", "siddham");
    game.displayBoard();
    game.start();

    // game.makeMove(0, 0); // Bhav plays
    // game.displayBoard();

    // game.makeMove(1, 1); // Siddham plays
    // game.displayBoard();
  }
}

class Game {
  private int size;
  private char board[][];
  private Player[] players;
  private int currentPlayerIndex = 0;

  Game(int size, String player1Name, String player2Name) {
    this.size = size;
    board = new char[size][size];
    players = new Player[2];
    players[0] = new Player(player1Name, 'X');
    players[1] = new Player(player2Name, 'O');
    initialiseBoard();
  }

  private void initialiseBoard() {
    for (int i = 0; i < size; i++) {
      for (int j = 0; j < size; j++) {
        board[i][j] = '-';
      }
    }
  }

  public void displayBoard() {
    for (int row = 0; row < size; row++) {
      for (int col = 0; col < size; col++) {
        System.out.print(board[row][col] + " ");
      }
      System.out.println();
    }
  }

  public boolean makeMove(int r, int c) {
    Player currentPlayer = players[currentPlayerIndex];
    if (r < 0 || r >= size || c < 0 || c >= size) {
      return false;
    } else if (board[r][c] != '-') {
      return false;
    } else {
      board[r][c] = currentPlayer.getSymbol();
      currentPlayerIndex = 1 - currentPlayerIndex;
    }

    return true;
  }

  public void start() {
    Scanner sc = new Scanner(System.in);
    for (int i = 0; i < size * size; i++) {
      int moveRow = sc.nextInt();
      int moveCol = sc.nextInt();
      makeMove(moveRow, moveCol);
      displayBoard();
    }
  }
}

class Player {
  private String name;
  private char symbol;

  Player(String name, char symbol) {
    this.name = name;
    this.symbol = symbol;
  }

  public String getName() {
    return name;
  }

  public char getSymbol() {
    return symbol;
  }
}