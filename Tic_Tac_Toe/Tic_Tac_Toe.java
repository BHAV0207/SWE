public class Tic_Tac_Toe {
  public static void main(String[] args) {
    Game game = new Game(3, "bhav", "siddham");
    game.displayBoard();
    game.start();
  }
}
