interface Coffee {
  String getDescription();

  double getCost();
}

// ConcreteComponent
class SimpleCoffee implements Coffee {
  public String getDescription() {
    return "Simple Coffee";
  }

  public double getCost() {
    return 5.0;
  }
}

// Base Decorator
abstract class CoffeeDecorator implements Coffee {
  protected Coffee decoratedCoffee;

  public CoffeeDecorator(Coffee coffee) {
    this.decoratedCoffee = coffee;
  }
}

// Concrete Decorators
class MilkDecorator extends CoffeeDecorator {
  public MilkDecorator(Coffee coffee) {
    super(coffee);
  }

  public String getDescription() {
    return decoratedCoffee.getDescription() + ", Milk";
  }

  public double getCost() {
    return decoratedCoffee.getCost() + 1.5;
  }
}

class SugarDecorator extends CoffeeDecorator {
  public SugarDecorator(Coffee coffee) {
    super(coffee);
  }

  public String getDescription() {
    return decoratedCoffee.getDescription() + ", Sugar";
  }

  public double getCost() {
    return decoratedCoffee.getCost() + 0.5;
  }
}

// Client
public class CoffeeDecorator {
  public static void main(String[] args) {
    Coffee coffee = new SimpleCoffee();
    System.out.println(coffee.getDescription() + " : $" + coffee.getCost());

    // Add milk
    coffee = new MilkDecorator(coffee);
    System.out.println(coffee.getDescription() + " : $" + coffee.getCost());

    // Add sugar
    coffee = new SugarDecorator(coffee);
    System.out.println(coffee.getDescription() + " : $" + coffee.getCost());
  }
}
