public class Shipment {
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