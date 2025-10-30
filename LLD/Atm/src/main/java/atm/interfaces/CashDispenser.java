package atm.interfaces;

/**
 * Interface for cash dispenser functionality
 * Single Responsibility: Handle cash dispensing operations
 */
public interface CashDispenser {
    boolean dispenseCash(int amount);
    int getAvailableCash();
    boolean hasEnoughCash(int amount);
}
