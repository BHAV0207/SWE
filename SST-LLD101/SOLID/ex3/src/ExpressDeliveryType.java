public class ExpressDeliveryType implements PolicyCost {
  public double cost(double weightKg) {
    return 80 + 8 * weightKg;
  }

}