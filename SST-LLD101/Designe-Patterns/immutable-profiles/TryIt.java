import com.example.profiles.*;

public class TryIt {
  public static void main(String[] args) {
    ProfileService svc = new ProfileService();
    UserProfile p = svc.createMinimal("u1", "a@b.com");

    System.out.println("Before: " + p.getEmail());

    // This line is gone — no setter!
    // p.setEmail("evil@example.com");

    // To "update", you build a new immutable object
    UserProfile updated = svc.updateDisplayName(p, "Bhavya");
    System.out.println("After:  " + updated.getDisplayName());

    System.out.println("=> In the solution, object is immutable.");
  }
}
