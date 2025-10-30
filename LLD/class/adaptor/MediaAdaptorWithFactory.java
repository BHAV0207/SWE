interface MediaPlayer {
  void play(String filename);
}

class Mp4 {
  void playMp4(String filename) {
    System.out.println("mp4 playing....");
  }
}

class playVLC {
  void playVLC(String fileName) {
    System.out.println("mp3 playing....");
  }
}

class Mp4Adaptor implements MediaPlayer {
  private Mp4 mp4;

  Mp4Adaptor() {
    this.mp4 = new Mp4();
  }

  public void play(String filename) {
    mp4.playMp4(filename);
  }
}

class VlcAdaptor implements MediaPlayer {
  private playVLC playVlc;

  VlcAdaptor() {
    this.playVlc = new playVLC();
  }

  public void play(String filename) {
    playVlc.playVLC(filename);
  }
}

class PlayerFactory {
  public static MediaPlayer getAdapter(String fileType) {
    switch (fileType.toLowerCase()) {
      case "mp4":
        return new Mp4Adaptor();
      case "vlc":
        return new VlcAdaptor();
      default:
        throw new IllegalArgumentException("Unsupported format: " + fileType);
    }
  }
}

public class MediaAdaptorWithFactory {
  public static void main(String[] args) {
    MediaPlayer player1 = PlayerFactory.getAdapter("mp4");
    player1.play("movie.mp4");

    MediaPlayer player2 = PlayerFactory.getAdapter("vlc");
    player2.play("clip.vlc");

  }
}
