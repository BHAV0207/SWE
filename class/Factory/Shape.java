interface Shapes {
  void draw();
}

class Circle implements Shapes {
  public void draw() {
    System.out.println("circle drawing");
  }
}

class Square implements Shapes {
  public void draw() {
    System.out.println("Square drawing");
  }
}

class Rectangle implements Shapes {
  public void draw() {
    System.out.println("Rectangle drawing");
  }
}

class ShapeFactory {
  public static Shapes createShape(String Type) {
    if (Type.equals("CIRCLE")) {
      return new Circle();
    } else if (Type.equals("Square")) {
      return new Square();
    } else {
      return new Rectangle();
    }
  }
}

public class Shape {
  public static void main(String[] args) {
    Shapes s1 = ShapeFactory.createShape("CIRCLE");
    s1.draw(); // Drawing a Circle

    Shapes s2 = ShapeFactory.createShape("RECTANGLE");
    s2.draw(); // Drawing a Rectangle

    Shapes s3 = ShapeFactory.createShape("SQUARE");
    s3.draw(); // Drawing a Square
  }
}
