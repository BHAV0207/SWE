public class StandardDeliveryType implements PolicyCost {
  public double cost(double weightKg) {
    return 50 + 5 * weightKg;
  }

}