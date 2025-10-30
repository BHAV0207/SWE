public class TaxCalculator {
  double taxRate;

  TaxCalculator(double taxRate) {
    this.taxRate = taxRate;
  }

  double totalWithTax(double subtotal) {
    double total = subtotal + subtotal * taxRate;
    return total;
  }
}