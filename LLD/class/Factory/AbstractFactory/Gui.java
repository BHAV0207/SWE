package AbstractFactory;

interface Button {
  void render();
}

interface Menu {
  void render();
}

interface GUIFactory {
  Button createButton();

  Menu createMenu();
}

class windowButton implements Button {
  public void render() {
    System.out.println("rendering windows button");
  }
}

class macButton implements Button {
  public void render() {
    System.out.println("rendering windows menu");
  }
}

class windowMenu implements Menu {
  public void render() {
    System.out.println("rendering mac button");
  }
}

class macMenu implements Menu {
  public void render() {
    System.out.println("rendering mac menu");
  }
}

class WindowsFactory implements GUIFactory {
  public Button createButton() {
    return new windowButton();
  }

  @Override
  public Menu createMenu() {
    return new windowMenu();
  }

}

class MacFactory implements GUIFactory {

  @Override
  public Button createButton() {
    return new macButton();
  }

  @Override
  public Menu createMenu() {
    return new macMenu();
  }

}

public class Gui {
  public static void main(String[] args) {
    GUIFactory factory = new WindowsFactory();
    Button b = factory.createButton();
    Menu m = factory.createMenu();

    b.render(); // "Rendering Windows Button"
    m.render(); // "Rendering Windows Menu"

    factory = new MacFactory();
    b = factory.createButton();
    m = factory.createMenu();

    b.render(); // "Rendering Mac Button"
    m.render(); // "Rendering Mac Menu"
  }
}
