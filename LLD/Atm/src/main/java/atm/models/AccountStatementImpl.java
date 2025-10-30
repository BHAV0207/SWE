package atm.models;

import java.util.ArrayList;
import java.util.List;

/**
 * Account statement implementation
 * Single Responsibility: Handle account statement data and operations
 */
public class AccountStatementImpl implements AccountStatement {
    private String accountNumber;
    private List<Transaction> transactions;
    private int startingBalance;
    private int endingBalance;
    private String period;
    
    public AccountStatementImpl(String accountNumber, List<Transaction> transactions,
                               int startingBalance, int endingBalance, String period) {
        this.accountNumber = accountNumber;
        this.transactions = new ArrayList<>(transactions);
        this.startingBalance = startingBalance;
        this.endingBalance = endingBalance;
        this.period = period;
    }
    
    @Override
    public String getAccountNumber() {
        return accountNumber;
    }
    
    @Override
    public List<Transaction> getTransactions() {
        return new ArrayList<>(transactions);
    }
    
    @Override
    public int getStartingBalance() {
        return startingBalance;
    }
    
    @Override
    public int getEndingBalance() {
        return endingBalance;
    }
    
    @Override
    public String getPeriod() {
        return period;
    }
}
