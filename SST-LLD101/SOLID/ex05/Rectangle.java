public class Rectangle implements Shape {
  private int w, h;

  Rectangle(int w, int h) {
    this.w = w;
    this.h = h;
  }

  @Override
  public int area() {
    return w * h;
  }
}