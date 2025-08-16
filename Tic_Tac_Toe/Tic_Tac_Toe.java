class Tic_Tac_Toe {
  public static void main(String[] args) {
    Game game = new Game(3);
    game.displayBoard();
  }
}

class Game {
  private int size;
  private char board[][];

  Game(int size) {
    this.size = size;
    board = new char[size][size];
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

}
