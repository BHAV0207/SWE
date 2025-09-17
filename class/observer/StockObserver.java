package observer;

import java.util.*;

interface Observer {
  void thresholdUpdates(String message, double threshold);
}

interface Subject {
  void subscribe(Observer o, double threshold);

  void unsubscribe(Observer o);

  void notifyObservers(String message, double price);
}

class TradingApp implements Subject {
  Map<Observer, Double> map = new HashMap<>();

  public void subscribe(Observer o, double threshold) {
    map.put(o, threshold);
  }

  public void unsubscribe(Observer o) {
    map.remove(o);
  }

  public void notifyObservers(String stock, double price) {
    for (Map.Entry<Observer, Double> entry : map.entrySet()) {
      if (price >= entry.getValue()) {
        entry.getKey().thresholdUpdates(stock, price);
      }
    }
  }
}

class TradingAppProxy implements Subject {
  private TradingApp realApp = new TradingApp();
  private Map<Observer, Long> lastNotifiedTime = new HashMap<>();
  private long throttleInterval = 5000; // 5 seconds

  public void subscribe(Observer o, double threshold) {
    realApp.subscribe(o, threshold);
  }

  public void unsubscribe(Observer o) {
    realApp.unsubscribe(o);
    lastNotifiedTime.remove(o);
  }

  public void notifyObservers(String stock, double price) {
    long now = System.currentTimeMillis();

    for (Map.Entry<Observer, Double> entry : realApp.map.entrySet()) {
      Observer o = entry.getKey();
      double threshold = entry.getValue();

      if (price >= threshold) {
        long lastTime = lastNotifiedTime.getOrDefault(o, 0L);
        if (now - lastTime >= throttleInterval) {
          o.thresholdUpdates(stock, price); // notify this observer only
          lastNotifiedTime.put(o, now);
        }
      }
    }
  }
}

class Subscriber implements Observer {
  String name;

  Subscriber(String name) {
    this.name = name;
  }

  public void thresholdUpdates(String stock, double threshold) {
    System.out.println(name + " notified: " + stock + " price is " + threshold);
  }
}

public class StockObserver {
  public static void main(String[] args) {
    TradingAppProxy proxy = new TradingAppProxy();

    Observer alice = new Subscriber("Alice");
    Observer bob = new Subscriber("Bob");

    proxy.subscribe(alice, 100.0); // notify if stock >= 100
    proxy.subscribe(bob, 200.0);

    System.out.println("First update:");
    proxy.notifyObservers("Tesla", 150.0); // Alice notified, Bob not yet

    // Thread.sleep(2000); // 2 seconds later (less than throttle interval)
    System.out.println("\nSecond update (too soon for Alice):");
    proxy.notifyObservers("Tesla", 180.0); // Proxy blocks Alice (too frequent)

    // Thread.sleep(4000); // wait more to cross 5 sec throttle
    System.out.println("\nThird update:");
    proxy.notifyObservers("Tesla", 250.0); // Bo

  }
}
