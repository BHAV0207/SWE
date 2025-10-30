package singelton;

class Database {
  private static volatile Database instance;

  private Database() {
  };

  public static Database getInstance() {
    if (instance == null) {
      synchronized (Database.class) {
        if (instance == null) {
          instance = new Database();
        }
      }
    }
    return instance;
  }

  public void print(String message) {
    System.out.println(message);
  }
}

class App {
  public static void main(String[] args) {
    Database db1 = Database.getInstance();
    Database db2 = Database.getInstance();

    db1.print("matter form 1");
    db2.print("matter from 2 ");

    System.out.println(db1.equals(db2));
  }
}