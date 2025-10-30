package atm.components;

import atm.interfaces.CardReader;

/**
 * Card reader implementation
 * Single Responsibility: Handle card insertion and ejection operations
 */
public class CardReaderImpl implements CardReader {
    private String currentCard;
    private boolean cardPresent;
    
    @Override
    public boolean insertCard(String cardNumber) {
        if (isValidCardNumber(cardNumber)) {
            this.currentCard = cardNumber;
            this.cardPresent = true;
            System.out.println("Card inserted successfully: " + maskCardNumber(cardNumber));
            return true;
        }
        System.out.println("Invalid card format");
        return false;
    }
    
    @Override
    public boolean ejectCard() {
        if (cardPresent) {
            System.out.println("Card ejected: " + maskCardNumber(currentCard));
            this.currentCard = null;
            this.cardPresent = false;
            return true;
        }
        return false;
    }
    
    @Override
    public String getCardNumber() {
        return currentCard;
    }
    
    @Override
    public boolean isCardPresent() {
        return cardPresent;
    }
    
    private boolean isValidCardNumber(String cardNumber) {
        // Basic validation - card number should be 16 digits
        return cardNumber != null && cardNumber.matches("\\d{16}");
    }
    
    private String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) return "****";
        return "****-****-****-" + cardNumber.substring(cardNumber.length() - 4);
    }
}
