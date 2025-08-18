import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.*;

public class BookData {

  // cache for loaded books
  private List<Book> bookData = null;

  // private helper to read csv and build Book objects
  private List<Book> csvToList() {
    List<Book> books = new ArrayList<>();

    try (BufferedReader br = new BufferedReader(new FileReader("bestsellers with categories.csv"))) {
      String line = br.readLine(); // skip header row

      while ((line = br.readLine()) != null) {
        String[] data = line.split(",");

        String name = data[0];
        String author = data[1];
        float userRating = Float.parseFloat(data[2]);
        int reviews = Integer.parseInt(data[3]);
        float price = Float.parseFloat(data[4]);
        int year = Integer.parseInt(data[5]);
        Genre genre = Genre.valueOf(data[6].toUpperCase());

        books.add(new Book(name, author, userRating, reviews, price, year, genre));
      }
    } catch (IOException e) {
      e.printStackTrace();
    }

    return books;
  }

  // public accessor
  public List<Book> getBookData() {
    if (bookData == null) {
      bookData = csvToList();
    }
    return bookData;
  }
}
