public class Card implements Payments {
  String pay(double amount) {
    return "Charged card: " + amount;
  }
}