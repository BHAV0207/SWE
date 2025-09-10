package Factory;

interface Notification {
  void send();
}

class EmailNotification implements Notification {
  public void send() {
    System.out.println("Sending Email Notification");
  }
}

class SmsNotification implements Notification {
  public void send() {
    System.out.println("SENDING sms");
  }
}

class NotificationFactory {
  public static Notification createNotification(String Type) {
    if (Type.equals("EMAIL")) {
      return new EmailNotification();
    } else if (Type.equals("SMS")) {
      return new SmsNotification();
    } else {
      return null;
    }
  }
}

public class App {
  public static void main(String[] args) {
    Notification n1 = NotificationFactory.createNotification("EMAIL");
    n1.send();

    Notification n2 = NotificationFactory.createNotification("SMS");
    n2.send();
  }
}