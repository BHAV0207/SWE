interface PaymentProcessor {
  void pay(int amount);
}

class ThirdPartyPayment {
  void makePayment(int payment) {
    System.out.println(payment + " rupees has been paid....");
  }
}

class Adaptor implements PaymentProcessor {
  private ThirdPartyPayment thirdPartyPayment;

  Adaptor(ThirdPartyPayment thirdPartyPayment) {
    this.thirdPartyPayment = thirdPartyPayment;
  }

  public void pay(int amount) {
    thirdPartyPayment.makePayment(amount);
  }
}

public class App_WRONG_APPROACH {
  public static void main(String[] args) {
    ThirdPartyPayment pay = new ThirdPartyPayment();
    PaymentProcessor p = new Adaptor(pay);
    p.pay(100);
  }
}

// wrong approach , in the aabove code we are exposing the ThirdPartyPayment to
// the client in the main code which is wrong and should not be done , to avoid
// that we should make it priivate whihc we have done and instead of expecting
// anything in the constructor we should have nothing in the construtor and
// directly make the private object in the constructor , as shown in the next
// question of media Player