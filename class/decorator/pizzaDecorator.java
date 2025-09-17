package decorator;

interface Pizza {
  String description();

  int cost();
}

class normalPizza implements Pizza {
  public String description() {
    return "normal pizza";
  }

  public int cost() {
    return 6;
  }
}

class baseDecorator implements Pizza {

}

class cheeseDecorator {

}

class VeggieDecorator {

}

public class pizzaDecorator {

}
