interface MediaPlayer {
  void play(String fileType, String fileName);
}

class AdvancedMediaPlayer {
  void playMp4(String fileName) {
    System.out.println("MP4....");
  }

  void playVlc(String fileName) {
    System.out.println("Vlc....");
  }
}

class Adaptor implements MediaPlayer {
  private AdvancedMediaPlayer advancedMediaPlayer;

  Adaptor() {
    this.advancedMediaPlayer = new AdvancedMediaPlayer();
  }

  public void play(String fileType, String fileName) {
    if (fileType == "mp4") {
      advancedMediaPlayer.playMp4(fileName);
    } else {
      advancedMediaPlayer.playVlc(fileName);
    }
  }
}

public class MediaPlayerApp {
  public static void main(String[] args) {
    MediaPlayer player = new Adaptor();

    player.play("mp4", "movie.mp4");
    player.play("vlc", "video.vlc");
    // player.play("avi", "old_movie.avi"); // unsupported
  }
}
