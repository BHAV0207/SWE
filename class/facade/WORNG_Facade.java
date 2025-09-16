class DVDPlayer {
  void on() {
    System.out.println("DVD Player ON");
  }

  void play(String movie) {
    System.out.println("Playing " + movie);
  }
}

class Projector {
  void on() {
    System.out.println("Projector ON");
  }
}

class SoundSystem {
  void on() {
    System.out.println("Sound System ON");
  }

  void setVolume(int level) {
    System.out.println("Volume set to " + level);
  }
}

class Lights {
  void dim(int level) {
    System.out.println("Lights dimmed to " + level + "%");
  }
}

class ClientWithoutFacade {
  public static void main(String[] args) {
    DVDPlayer dvd = new DVDPlayer();
    Projector projector = new Projector();
    SoundSystem sound = new SoundSystem();
    Lights lights = new Lights();

    lights.dim(30);
    projector.on();
    sound.on();
    sound.setVolume(8);
    dvd.on();
    dvd.play("Inception");
  }
}
