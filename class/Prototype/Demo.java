package Prototype;

class Document implements Cloneable {
  String title;

  Document(String title) {
    this.title = title;
  }

  public void show() {
    System.out.println("Document: " + title);
  }

  public Document clone() {
    try {
      return (Document) super.clone();
    } catch (CloneNotSupportedException e) {
      throw new RuntimeException("Clone not supported");
    }
  }

}

public class Demo {
  public static void main(String[] args) {
    Document original = new Document("Resume Template");

    // Make a copy instead of creating again
    Document copy1 = original.clone();
    Document copy2 = original.clone();

    original.show();
    copy1.show();
    copy2.show();
  }
}
