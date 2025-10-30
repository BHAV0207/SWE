package proxy;

interface Image {
  void display();
}

class RealImage implements Image {
  String imgUrl;

  RealImage(String imgUrl) {
    this.imgUrl = imgUrl;
    loading();
  }

  private void loading() {
    System.out.println("loading the image");
  }

  public void display() {
    System.out.println("displaying the image");
  }
}

class Proxy implements Image {
  private String filename;
  private Image ri;

  Proxy(String filename) {
    this.filename = filename;
  }

  public void display() {
    if (ri == null) {
      ri = new RealImage(filename);
    }
    ri.display();
  }
}

public class app {
  public static void main(String[] args) {
    Image img1 = new Proxy("photo1.png");
    Image img2 = new Proxy("photo2.png");

    // At this point, images are NOT loaded yet
    System.out.println("Images created but not loaded...");

    img1.display(); // loads + displays
    img1.display(); // already loaded, just displays

    img2.display(); // loads + displays
  }
}