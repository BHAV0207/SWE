package atm.interfaces;

/**
 * Interface for card reader functionality
 * Single Responsibility: Handle card insertion and ejection
 */
public interface CardReader {
    boolean insertCard(String cardNumber);
    boolean ejectCard();
    String getCardNumber();
    boolean isCardPresent();
}
