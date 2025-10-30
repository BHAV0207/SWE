package atm.models;

import java.util.List;

/**
 * Interface for account statement operations
 * Single Responsibility: Define account statement contract
 */
public interface AccountStatement {
    String getAccountNumber();
    List<Transaction> getTransactions();
    int getStartingBalance();
    int getEndingBalance();
    String getPeriod();
}
