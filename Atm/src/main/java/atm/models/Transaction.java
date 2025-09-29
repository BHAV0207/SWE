package atm.models;

/**
 * Interface for transaction operations
 * Single Responsibility: Define transaction contract
 */
public interface Transaction {
    String getTransactionId();
    String getCardNumber();
    int getAmount();
    TransactionType getType();
    long getTimestamp();
    boolean execute();
}
