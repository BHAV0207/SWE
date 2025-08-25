public class OvernightDeliveryType implements PolicyCost {
  public double cost(double weightKg) {
    return 120 + 10 * weightKg;
  }

}