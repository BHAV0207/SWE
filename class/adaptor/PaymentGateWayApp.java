interface PaymentGateway {
  void processPayment();
}

class legacyApi {
  void processPaymentXML() {
    System.out.println("the payment is processed in XML");
  }
}

class PaymnetAdaptor implements PaymentGateway {
  legacyApi la;

  PaymnetAdaptor() {
    la = new legacyApi();
  }

  public void processPayment() {
    la.processPaymentXML();
  }
}

public class PaymentGateWayApp {
  public static void main(String[] args) {
    PaymentGateway pg = new PaymnetAdaptor();
    pg.processPayment();
  }

}
