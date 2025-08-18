import java.util.List;

public class TestBookData {
  public static void main(String[] args) {
    BookData bd = new BookData("bestsellers with categories.csv");
    List<Book> books = bd.getBookData();

    for (Book b : books) {
      System.out.println(b);
    }
  }
}