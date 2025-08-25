
public class Demo04 {
  public static void main(String[] args) {
    Payment payment = new Payment("UPI", 400);
    Payments provider = new Upi();
    PaymentService service = new PaymentService();

    System.out.println(service.pay(provider, payment));
  }
}