interface PolicyCost {
  double cost(double weightKg);
}

public class ShippingCostCalculator {
  double cost(PolicyCost policy, Shipment s) {
    return policy.cost(s.getWeightDetails());
  }
}

class StandardDeliveryType implements PolicyCost {
  public double cost(double weightKg) {
    return 50 + 5 * weightKg;
  }

}

class ExpressDeliveryType implements PolicyCost {
  public double cost(double weightKg) {
    return 80 + 8 * weightKg;
  }

}

class OvernightDeliveryType implements PolicyCost {
  public double cost(double weightKg) {
    return 120 + 10 * weightKg;
  }

}

class Shipment {
  private String type;
  private double weightKg;

  Shipment(String type, double w) {
    this.type = type;
    this.weightKg = w;
  }

  public String getTypeDetails() {
    return type;
  }

  public double getWeightDetails() {
    return weightKg;
  }
}

class Demo03 {
  public static void main(String[] args) {
    Shipment shipment = new Shipment("EXPRESS", 100.0);
    PolicyCost policy = new ExpressDeliveryType();

    ShippingCostCalculator calculator = new ShippingCostCalculator();
    System.out.println(calculator.cost(policy, shipment));
  }
}