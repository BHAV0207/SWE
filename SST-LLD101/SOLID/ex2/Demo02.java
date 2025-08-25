public class Demo02 {
  public static void main(String[] args) {
    Decoder decoder = new Decoder();
    Ui ui = new Ui();
    Cache cache = new Cache();

    Player player = new Player(decoder, cache, ui);
    player.play(new byte[] { 1, 2, 3, 4 });
  }
}