import java.util.Scanner;

public class Game {
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
      return true;
    }
  }

  private boolean winner(Player player) {
    for (int i = 0; i < size; i++) {
      boolean rowWin = true;
      for (int j = 0; j < size; j++) {
        if (board[i][j] != player.getSymbol()) {
          rowWin = false;
          break;
        }
      }
      if (rowWin)
        return true;
    }

    for (int i = 0; i < size; i++) {
      boolean colWin = true;
      for (int j = 0; j < size; j++) {
        if (board[j][i] != player.getSymbol()) {
          colWin = false;
          break;
        }
      }
      if (colWin)
        return true;
    }

    boolean digWin = true;
    for (int i = 0; i < size; i++) {
      if (board[i][i] != player.getSymbol()) {
        digWin = false;
        break;
      }

    }
    if (digWin)
      return true;

    boolean anDigWin = true;
    for (int i = 0; i < size; i++) {
      if (board[i][size - 1 - i] != player.getSymbol()) {
        anDigWin = false;
        break;
      }
    }
    if (anDigWin)
      return true;

    return false;

  }

  public void start() {
    Scanner sc = new Scanner(System.in);
    for (int i = 0; i < size * size; i++) {
      System.out.print(players[currentPlayerIndex].getName() + "'s" + " turn");
      int moveRow = sc.nextInt();
      int moveCol = sc.nextInt();
      boolean success = makeMove(moveRow, moveCol);
      if (success == false) {
        System.out.println("invalid move please try again");
        i--;
      }
      displayBoard();
      if (winner(players[1 - currentPlayerIndex])) {
        System.out.println(players[1 - currentPlayerIndex].getName() + " wins!");
        break;
      }
    }
  }
}
