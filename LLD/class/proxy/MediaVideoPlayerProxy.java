package proxy;

interface Media {
  void displayAndPlay();
}

class RealAudio implements Media {
  String filename;

  RealAudio(String filename) {
    this.filename = filename;
    RenderAudio();
  }

  private void RenderAudio() {
    System.out.println("audio rendered...");
  }

  public void displayAndPlay() {
    System.out.println("audio played....");
  }

}

class RealImage implements Media {
  String filename;

  RealImage(String filename) {
    this.filename = filename;
    RenderImage();
  }

  private void RenderImage() {
    System.out.println("Image rendered...");
  }

  public void displayAndPlay() {
    System.out.println("Image played....");
  }

}

class RealVideo implements Media {
  String filename;

  RealVideo(String filename) {
    this.filename = filename;
    RenderVideo();
  }

  private void RenderVideo() {
    System.out.println("video rendered...");
  }

  public void displayAndPlay() {
    System.out.println("video played....");
  }
}

class AudioProxy implements Media {
  private String filename;
  private Media audio;

  AudioProxy(String filename) {
    this.filename = filename;
  }

  public void displayAndPlay() {
    if (audio == null) {
      audio = new RealAudio(filename);
    }
    audio.displayAndPlay();
  }
}

class VideoProxy implements Media {
  private String filename;
  private Media video;

  VideoProxy(String filename) {
    this.filename = filename;
  }

  public void displayAndPlay() {
    if (video == null) {
      video = new RealVideo(filename);
    }
    video.displayAndPlay();
  }
}

class ImageProxy implements Media {
  private String filename;
  private Media image;

  ImageProxy(String filename) {
    this.filename = filename;
  }

  public void displayAndPlay() {
    if (image == null) {
      image = new RealImage(filename);
    }
    image.displayAndPlay();
  }
}

class MediaFactory {
  public static Media getMedia(String filename) {
    if (filename.endsWith(".mp3")) {
      return new AudioProxy(filename);
    } else if (filename.endsWith(".mp4")) {
      return new VideoProxy(filename);
    } else if (filename.endsWith(".png") || filename.endsWith(".jpg")) {
      return new ImageProxy(filename);
    } else {
      throw new IllegalArgumentException("Unsupported file type: " + filename);
    }
  }
}

public class MediaVideoPlayerProxy {
  public static void main(String[] args) {
    // Factory chooses correct proxy for each file
    Media song = MediaFactory.getMedia("track.mp3");
    Media movie = MediaFactory.getMedia("film.mp4");
    Media photo = MediaFactory.getMedia("picture.png");

    System.out.println("Objects created but not loaded yet...");

    // Lazy loading happens here
    song.displayAndPlay(); // renders + plays
    song.displayAndPlay(); // only plays

    movie.displayAndPlay(); // renders + plays
    photo.displayAndPlay(); // renders + plays
  }
}
