package atm.components;

import atm.interfaces.PinEntry;

/**
 * PIN entry implementation
 * Single Responsibility: Handle PIN input and validation
 */
public class PinEntryImpl implements PinEntry {
    private String enteredPin;
    private boolean pinEntered;
    private int attemptCount;
    private static final int MAX_ATTEMPTS = 3;
    
    @Override
    public boolean enterPin(String pin) {
        if (attemptCount >= MAX_ATTEMPTS) {
            System.out.println("Maximum PIN attempts exceeded. Card will be retained.");
            return false;
        }
        
        if (isValidPin(pin)) {
            this.enteredPin = pin;
            this.pinEntered = true;
            this.attemptCount = 0; // Reset on successful entry
            System.out.println("PIN entered successfully");
            return true;
        } else {
            this.attemptCount++;
            System.out.println("Invalid PIN format. Attempts remaining: " + (MAX_ATTEMPTS - attemptCount));
            return false;
        }
    }
    
    @Override
    public void clearPin() {
        this.enteredPin = null;
        this.pinEntered = false;
        System.out.println("PIN cleared");
    }
    
    @Override
    public boolean isPinEntered() {
        return pinEntered;
    }
    
    private boolean isValidPin(String pin) {
        // PIN should be 4 digits
        return pin != null && pin.matches("\\d{4}");
    }
    
    public int getAttemptCount() {
        return attemptCount;
    }
    
    public boolean isMaxAttemptsReached() {
        return attemptCount >= MAX_ATTEMPTS;
    }
}
