package Prototype;

interface Shape {
  Shape clone();

  float area();
}

class Circle implements Shape {
  private float radius;

  Circle(float radius) {
    this.radius = radius;
  }

  public float area() {
    return (float) (3.14 * radius * radius);
  }

  public Shape clone() {
    return new Circle(this.radius);
  }

}

public class ShapePrototype {
  public static void main(String[] args) {
    // Original objects (expensive to create)
    Circle circle1 = new Circle(10);
    // Clone them instead of creating new
    Shape circle2 = circle1.clone();

    // Draw all
    circle1.area(); // areaing Circle with radius 10
    circle2.area(); // Drawing Circle with radius 10
  }
}
