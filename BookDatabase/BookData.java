import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.*;

public class BookData {

  private List<Book> csvToList() {
    List<Book> bookData = new ArrayList<>();
    try {
      BufferedReader br = new BufferedReader(new FileReader("bestsellers with categories.csv"));
      String line = br.readLine();

      while ((line = br.readLine()) != null) {

      }

    } catch (IOException e) {
      e.printStackTrace();
    }

    return bookData;
  }

  public List<Book> getBookData() {

  }
}
