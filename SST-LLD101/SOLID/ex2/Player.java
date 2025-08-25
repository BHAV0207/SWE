public class Player {
  private Decoder decoder;
  private Cache cache;
  private Ui ui;

  Player(Decoder decoder, Cache cache, Ui ui) {
    this.decoder = decoder;
    this.cache = cache;
    this.ui = ui;
  }

  void play(byte[] fileBytes) {
    byte[] decoded = decoder.decode(fileBytes);
    ui.drawUi(decoded);
    cache.caching(decoded);
  }
}