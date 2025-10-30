import com.opencsv.CSVReader;
import java.io.FileReader;
import java.util.*;

public class BookData {
  private String filePath;
  private List<Book> bookData = null;

  public BookData(String filePath) {
    this.filePath = filePath;
  }

  private List<Book> csvToList() {
    List<Book> books = new ArrayList<>();
    try (CSVReader reader = new CSVReader(new FileReader(filePath))) {
      String[] data;
      reader.readNext(); // skip header row
      while ((data = reader.readNext()) != null) {
        books.add(new Book(
            data[0], // name
            data[1], // author
            Float.parseFloat(data[2]), // rating
            Integer.parseInt(data[3]), // reviews
            Float.parseFloat(data[4]), // price
            Integer.parseInt(data[5]), // year
            data[6] // genre
        ));
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return books;
  }

  public List<Book> getBookData() {
    if (bookData == null) {
      bookData = csvToList();
    }
    return bookData;
  }
}
