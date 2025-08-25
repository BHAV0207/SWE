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