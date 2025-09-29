package atm.interfaces;

import atm.models.Transaction;
import atm.models.AccountStatement;

/**
 * Interface for printer functionality
 * Single Responsibility: Handle printing operations
 */
public interface Printer {
    boolean printReceipt(Transaction transaction);
    boolean printStatement(AccountStatement statement);
    boolean isPaperAvailable();
}
