public class Demo05 {
  public static void main(String[] args) {
    Shape rect = new Rectangle(5, 4);
    Shape square = new Square(4);

    System.out.println("Rectangle area: " + rect.area()); // 20
    System.out.println("Square area: " + square.area()); // 16
  }
}