package facade;

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

class Facade {
  private DVDPlayer dvd;
  private Projector projector;
  private SoundSystem sound;
  private Lights lights;

  Facade(DVDPlayer dvd, Projector projector, SoundSystem sound, Lights lights) {
    this.dvd = dvd;
    this.projector = projector;
    this.sound = sound;
    this.lights = lights;
  }

  public void watchMovie(String movie) {
    System.out.println("Get ready to watch a movie...");
    lights.dim(30);
    projector.on();
    sound.on();
    sound.setVolume(8);
    dvd.on();
    dvd.play(movie);
  }

  public void endMovie() {
    System.out.println("Shutting movie theater down...");
    lights.dim(100);
    System.out.println("All systems OFF");
  }
}

public class HomeThreatre {
  public static void main(String[] args) {
    Facade fac = new Facade(new DVDPlayer(), new Projector(), new SoundSystem(), new Lights());

    fac.watchMovie("inception");
    fac.endMovie();
  }
}
