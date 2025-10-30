
class Pizza {
  private final boolean dough;
  private final boolean sauce;
  private final boolean cheese;
  private final boolean toppings;

  private Pizza(Builder builder) {
    this.dough = builder.dough;
    this.sauce = builder.sauce;
    this.cheese = builder.cheese;
    this.toppings = builder.toppings;
  }

  static class Builder {
    private final boolean dough;
    private boolean sauce;
    private boolean cheese;
    private boolean toppings;

    Builder(boolean dough) {
      this.dough = dough;
    }

    public Builder addSauce(boolean sauce) {
      this.sauce = sauce;
      return this;
    }

    public Builder addCheese(boolean cheese) {
      this.cheese = cheese;
      return this;
    }

    public Builder addToppings(boolean toppings) {
      this.toppings = toppings;
      return this;
    }

    public Pizza build() {
      return new Pizza(this);
    }
  }
}

public class PizzaBuilder {
  public static void main(String[] args) {
    Pizza pizza = new Pizza.Builder(true).addCheese(true).addSauce(true).build();

    System.out.println(pizza);
  }
}
