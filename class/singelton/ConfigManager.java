import java.util.HashMap;

public class ConfigManager {
  private static volatile ConfigManager instance;
  private HashMap<String, String> map = new HashMap<>();

  private ConfigManager() {
  };

  public static ConfigManager getInstance() {
    if (instance == null) {
      synchronized (ConfigManager.class) {
        if (instance == null) {
          instance = new ConfigManager();
        }
      }
    }
    return instance;
  }

  public void setConfig(String title, String theme) {
    if (map.containsKey(title)) {
      System.out.print(title + "Aready exists");
    } else {
      map.put(title, theme);
      System.out.print(title + "setting done");
    }
  }

  public String getConfig(String title) {
    if (map.containsKey(title)) {
      return map.get(title);
    }
    return "does not exist";
  }
}

class App {
  public static void main(String[] args) {
    ConfigManager config1 = ConfigManager.getInstance();
    ConfigManager config2 = ConfigManager.getInstance();

    config1.setConfig("theme", "dark");
    System.out.println(config2.getConfig("theme")); // should print "dark"

    System.out.println(config1 == config2); // should print true
  }
}