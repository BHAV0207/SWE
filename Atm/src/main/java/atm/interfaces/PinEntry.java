package atm.interfaces;

/**
 * Interface for PIN entry functionality
 * Single Responsibility: Handle PIN input and validation
 */
public interface PinEntry {
    boolean enterPin(String pin);
    void clearPin();
    boolean isPinEntered();
}
