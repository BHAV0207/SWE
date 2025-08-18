import java.util.HashSet;
import java.util.List;

public class TestBookData {
  public static void main(String[] args) {
    BookData bd = new BookData("bestsellers with categories.csv");
    List<Book> books = bd.getBookData();

    BookQueries query = new BookQueries(books);
    // HashSet<BookPrice> results = query.getBooksAndPricesByAuthor("JJ Smith");
    // for (BookPrice bp : results) {
    // System.out.println(bp);
    // }

    // int results = query.numberOfBooksByAuthor("JJ Smith");
    // System.out.println(results);

    // HashSet<String> results = query.countOfAuthors();
    // for (String bp : results) {
    // System.out.println(bp);
    // }

    // HashSet<String> results = query.namesOfBooksByAuthor("JJ Smith");
    // for (String bp : results) {
    // System.out.println(bp);
    // }

    HashSet<String> results = query.booksByRating(4.7f);
    for (String bp : results) {
      System.out.println(bp);
    }

    // for (Book b : books) {
    // System.out.println(b);
    // }

  }
}