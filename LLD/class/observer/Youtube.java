package observer;

import java.util.ArrayList;
import java.util.List;

interface Observer {
  void update(String message);
}

interface Subject {
  void attach(Observer o);

  void detach(Observer o);

  void notifyObservers(String message);
}

class Channel implements Subject {
  private List<Observer> subscribers = new ArrayList<>();

  public void attach(Observer o) {
    subscribers.add(o);
  }

  public void detach(Observer o) {
    subscribers.remove(o);
  }

  public void notifyObservers(String message) {
    for (Observer o : subscribers) {
      o.update(message);
    }
  }

  // Business logic: new video upload
  public void uploadVideo(String title) {
    System.out.println("Channel uploaded: " + title);
    notifyObservers("New video: " + title);
  }
}

class Subscriber implements Observer {
  private String name;

  public Subscriber(String name) {
    this.name = name;
  }

  public void update(String message) {
    System.out.println(name + " received notification -> " + message);
  }
}

public class Youtube {
  public static void main(String[] args) {
    Channel channel = new Channel();

    Observer s1 = new Subscriber("Alice");
    Observer s2 = new Subscriber("Bob");

    channel.attach(s1);
    channel.attach(s2);

    channel.uploadVideo("Observer Pattern Tutorial");
  }
}
