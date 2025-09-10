package AbstractFactory;

interface Button {
  void paint();
}

interface Checkbox {
  void paint();
}

interface UIFactory {
  Button createButton();

  Checkbox createCheckBox();
}

class LightButton implements Button {
  public void paint() {
    System.out.println("Rendering a Light Button");
  }
}

class LightCheckBox implements Checkbox {
  public void paint() {
    System.out.println("rendering light checkbox");
  }
}

class DarkButton implements Button {
  public void paint() {
    System.out.println("Rendering a Dark Button");
  }
}

class DarkCheckbox implements Checkbox {
  public void paint() {
    System.out.println("rendering dark checkbox");
  }
}

class LightThemeFactory implements UIFactory {
  public Button createButton() {
    return new LightButton();
  }

  public Checkbox createCheckBox() {
    return new LightCheckBox(); // we'll implement this next
  }
}

class DarkThemeFactory implements UIFactory {
  public Button createButton() {
    return new DarkButton();
  }

  public Checkbox createCheckBox() {
    return new DarkCheckbox();
  }
}

public class Theme {
  public static void main(String[] args) {
    UIFactory lightFactory = new LightThemeFactory();
    Button lightButton = lightFactory.createButton();
    Checkbox lightCheckbox = lightFactory.createCheckBox();
    lightButton.paint();
    lightCheckbox.paint();

    UIFactory darkFactory = new DarkThemeFactory();
    Button darkButton = darkFactory.createButton();
    Checkbox darkCheckbox = darkFactory.createCheckBox();
    darkButton.paint();
    darkCheckbox.paint();
  }
}
