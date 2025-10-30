package atm.models;

/**
 * ATM status model
 * Single Responsibility: Represent ATM status information
 */
public class ATMStatus {
    private final String atmId;
    private final String location;
    private final boolean isOperational;
    private final int availableCash;
    private final boolean paperAvailable;
    private final boolean cardPresent;
    
    public ATMStatus(String atmId, String location, boolean isOperational,
                    int availableCash, boolean paperAvailable, boolean cardPresent) {
        this.atmId = atmId;
        this.location = location;
        this.isOperational = isOperational;
        this.availableCash = availableCash;
        this.paperAvailable = paperAvailable;
        this.cardPresent = cardPresent;
    }
    
    @Override
    public String toString() {
        return String.format(
            "ATM Status - ID: %s, Location: %s, Operational: %s, " +
            "Available Cash: $%d, Paper Available: %s, Card Present: %s",
            atmId, location, isOperational, availableCash, paperAvailable, cardPresent
        );
    }
    
    // Getters
    public String getAtmId() { return atmId; }
    public String getLocation() { return location; }
    public boolean isOperational() { return isOperational; }
    public int getAvailableCash() { return availableCash; }
    public boolean isPaperAvailable() { return paperAvailable; }
    public boolean isCardPresent() { return cardPresent; }
}
