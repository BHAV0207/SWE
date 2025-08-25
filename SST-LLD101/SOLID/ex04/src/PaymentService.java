public class PaymentService {
  String pay(Payments payment, Payment p) {
    return payment.pay(p.amount);
  }
}
