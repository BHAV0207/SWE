package facade;

class CardValidator {
  void validateCardNumber(int cardNumber) {
    System.out.println("validated");
  }
}

class FraudChecker {
  void fraudCheck(int cardNumber, float amount) {
    System.out.println("fraud check complete");
  }
}

class BankAPI {
  void bankApi(int cardNumber, float amount) {
    System.out.println("api checked");
  }
}

class NotificationService {
  void notificationService(String user, float amount) {
    System.out.println("notification sent....");
  }
}

class Facade {
  private CardValidator cv;
  private FraudChecker fc;
  private BankAPI ba;
  private NotificationService ns;

  Facade(CardValidator cv, FraudChecker fc, BankAPI ba, NotificationService ns) {
    this.cv = cv;
    this.fc = fc;
    this.ba = ba;
    this.ns = ns;
  }

  public void makePayment(int cardNumber, float amount, String user) {
    cv.validateCardNumber(cardNumber);
    fc.fraudCheck(cardNumber, amount);
    ba.bankApi(cardNumber, amount);
    ns.notificationService(user, amount);
  }
}

public class ECommerceApp {
  public static void main(String[] args) {
    Facade fc = new Facade(new CardValidator(), new FraudChecker(), new BankAPI(), new NotificationService());
    fc.makePayment(1234, 0, "bhav");
  }
}
