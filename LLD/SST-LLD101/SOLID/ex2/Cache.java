public class Cache {
  private byte[] last;

  void caching(byte[] data) {
    last = data;
    System.out.println("Cached last frame? " + (last != null));
  }
}