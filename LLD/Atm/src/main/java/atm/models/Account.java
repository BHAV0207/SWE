package atm.models;
/**
 * Interface for account operations
 * Single Responsibility: Define account contract
 */
public interface Account {
    String getAccountNumber();
    String getCardNumber();
    int getBalance();
    boolean withdraw(int amount);
    boolean deposit(int amount);
    void addTransaction(Transaction transaction);
    AccountStatement generateStatement(int days);
}
