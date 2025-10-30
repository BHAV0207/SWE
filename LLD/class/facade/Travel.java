package facade;

class flightBooking {

  void bookFlight(String flight) {
    System.out.println("flight booked");
  }

  void checkPrice(String location, String flight) {
    System.out.println("price checked ");
  }

  void cancelFLight(String flight) {
    System.out.println("cancel flight");
  }
}

class hotelBooking {
  void roomBooking(String Hotel, int roonNo) {
    System.out.println("booked flight");
  }
}

class car {
  void rentCar(String location, int duration) {
    System.out.println("renting car");
  }

  void cancelCar(String car) {
    System.out.println("car cancelled");
  }
}

class Facade {
  private flightBooking fb;
  private hotelBooking hb;
  private car c;

  Facade() {
    fb = new flightBooking();
    hb = new hotelBooking();
    c = new car();
  }

  void handleTrip() {
    fb.checkPrice("Toronoto", "Indigo");
    fb.bookFlight("indigo");
    hb.roomBooking("marriot", 100);
    c.rentCar("toronto", 3);
  }
}

public class Travel {
  public static void main(String[] args) {
    Facade f = new Facade();
    f.handleTrip();

  }
}
