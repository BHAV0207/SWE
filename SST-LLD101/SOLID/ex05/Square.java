public class Square implements Shape {
  private int side;

  Square(int side) {
    this.side = side;
  }

  @Override
  public int area() {
    return side * side;
  }
}