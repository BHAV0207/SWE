enum Genre {
  FICTION, NONFICTION
}

public class Book {
  private String name;
  private String author;
  private float userRating;
  private int reviews;
  private float price;
  private int year;
  private Genre genre;

  Book(String name, String author, float userRating, int reviews, float price, int year, Genre genre) {
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

  public Genre getGenre() {
    return genre;
  }
}