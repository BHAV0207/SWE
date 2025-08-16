class Tic_Tac_Toe {
  public static void main(String[] args) {
    Game game = new Game(5);
    game.start();
  }
}

class Game {
  private int size;

  Game(int size) {
    this.size = size;
  }

  void start() {
    System.out.println("Game created with size" + " " + size);
  }
}
