import java.util.HashMap;
import java.util.HashSet;
import java.util.List;

class BookPrice {
  private String name;
  private float price;

  BookPrice(String name, float price) {
    this.name = name;
    this.price = price;
  }

  public String getName() {
    return name;
  }

  public float getPrice() {
    return price;
  }

  @Override
  public String toString() {
    return "BookPrice{name='" + name + "', price=" + price + "}";
  }

}

public class BookQueries {
  private List<Book> books;

  BookQueries(List<Book> books) {
    this.books = books;
  }

  public int numberOfBooksByAuthor(String author) {
    HashMap<String, HashSet<String>> map = new HashMap<>();

    for (int i = 0; i < books.size(); i++) {
      String auth = books.get(i).getAuthor();
      String bookName = books.get(i).getName();

      if (map.containsKey(auth)) {
        map.get(auth).add(bookName);
      } else {
        HashSet<String> set = new HashSet<>();
        set.add(bookName);
        map.put(auth, set);
      }
    }
    return map.containsKey(author) ? map.get(author).size() : 0;
  }

  public HashSet<String> countOfAuthors() {
    HashSet<String> set = new HashSet<>();
    for (int i = 0; i < books.size(); i++) {
      set.add(books.get(i).getAuthor());
    }

    return set;
  }

  public HashSet<String> namesOfBooksByAuthor(String author) {
    HashSet<String> set = new HashSet<>();
    for (Book i : books) {
      if (i.getAuthor().equals(author)) {
        set.add(i.getName());
      }
    }

    return set;
  }

  public HashSet<String> booksByRating(float rating) {
    HashSet<String> set = new HashSet<>();

    for (Book i : books) {
      if (i.getUserRating() == rating) {
        set.add(i.getName());
      }
    }

    return set;
  }

  public HashSet<BookPrice> getBooksAndPricesByAuthor(String author) {
    HashSet<BookPrice> set = new HashSet<>();
    for (Book i : books) {
      if (i.getAuthor().equals(author)) {
        set.add(new BookPrice(i.getName(), i.getPrice()));
      }
    }

    return set;
  }

}
