// enum Genre {
//   FICTION, NONFICTION
// }

public class Book {
  private String name;
  private String author;
  private float userRating;
  private int reviews;
  private float price;
  private int year;
  private String genre;

  public Book(String name, String author, float userRating, int reviews, float price, int year, String genre) {
    this.name = name;
    this.author = author;
    this.userRating = userRating;
    this.reviews = reviews;
    this.price = price;
    this.year = year;
    this.genre = genre;
  }

  public String getName() {
    return name;
  }

  public String getAuthor() {
    return author;
  }

  public float getUserRating() {
    return userRating;
  }

  public int getReviews() {
    return reviews;
  }

  public float getPrice() {
    return price;
  }

  public int getYear() {
    return year;
  }

  public String getGenre() {
    return genre;
  }

  @Override
  public String toString() {
    return "Book{name='" + name + "', author='" + author + "', rating=" + userRating +
        ", reviews=" + reviews + ", price=" + price + ", year=" + year +
        ", genre=" + genre + "}";
  }
}
