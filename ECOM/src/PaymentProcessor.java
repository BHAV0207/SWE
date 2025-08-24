public class PaymentProcessor {
  void pay(int productID) {
    System.out.println();
    SqlProductRepo spr = new SqlProductRepo();
    spr.getProductById(productID);
    System.out.println("Processing payment for this product...");
    System.out.println();
  }
}