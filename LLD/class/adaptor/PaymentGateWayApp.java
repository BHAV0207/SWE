interface converter{
  String convert(String inputData);
}

class XMLtoJSON implements converter{
  public String convert(String inputData){
    System.out.println("converting");
    return "converted";
  }
}


// Adaptor core code 
interface PaymentGateway {
  void processPayment();
}

class legacyApi {
  String processPaymentXML() {
    System.out.println("the payment is processed in XML");
    return "xml";
  }
}

class PaymnetAdaptor implements PaymentGateway {
  legacyApi la;
  private converter converter;

  PaymnetAdaptor() {
    la = new legacyApi();
    converter = new XMLtoJSON();
  }

  public void processPayment() {
    String xml = la.processPaymentXML();
    String json = converter.convert(xml);
    System.out.println("JSON returned: " + json);

  }
}

public class PaymentGateWayApp {
  public static void main(String[] args) {
    PaymentGateway pg = new PaymnetAdaptor();
    pg.processPayment();
  }

}
