public class Logger {
  private static volatile Logger instance;

  private Logger() {
  }

  public static Logger getInstance() {
    if (instance == null) {
      synchronized (Logger.class) {
        if (instance == null) {
          instance = new Logger();
        }
      }
    }

    return instance;
  }

  public void log(String message, String level) {
    if (!level.equals(INFO) && !level.equals(WARN) && !level.equals(ERROR)) {
      System.out.println("[UNKNOWN] " + message);
    } else {
      System.out.println("[" + level + "] " + message);
    }
  }

  // Optional: You could define constants for levels
  public static final String INFO = "INFO";
  public static final String WARN = "WARN";
  public static final String ERROR = "ERROR";
}

class App {
  public static void main(String[] args) {
    Logger log1 = Logger.getInstance();
    Logger log2 = Logger.getInstance();

    log1.log("Application started", Logger.INFO);
    log2.log("Low disk space", Logger.WARN);
    log2.log("Unable to save file", Logger.ERROR);

    System.out.println(log1 == log2); // should print true
  }
}
