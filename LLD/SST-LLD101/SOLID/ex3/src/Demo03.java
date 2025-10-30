public class Demo03 {
  public static void main(String[] args) {
    Shipment shipment = new Shipment("STANDARD", 100.0);
    PolicyCost policy = new StandardDeliveryType();

    ShippingCostCalculator calculator = new ShippingCostCalculator();
    System.out.println(calculator.cost(policy, shipment));
  }
}
