package atm.models;

import java.util.ArrayList;
import java.util.List;

/**
 * Account implementation
 * Single Responsibility: Handle account operations and data management
 */
public class AccountImpl implements Account {
    private String accountNumber;
    private String cardNumber;
    private int balance;
    private List<Transaction> transactions;
    
    public AccountImpl(String accountNumber, String cardNumber, int initialBalance) {
        this.accountNumber = accountNumber;
        this.cardNumber = cardNumber;
        this.balance = initialBalance;
        this.transactions = new ArrayList<>();
    }
    
    @Override
    public String getAccountNumber() {
        return accountNumber;
    }
    
    @Override
    public String getCardNumber() {
        return cardNumber;
    }
    
    @Override
    public int getBalance() {
        return balance;
    }
    
    @Override
    public boolean withdraw(int amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            return true;
        }
        return false;
    }
    
    @Override
    public boolean deposit(int amount) {
        if (amount > 0) {
            balance += amount;
            return true;
        }
        return false;
    }
    
    @Override
    public void addTransaction(Transaction transaction) {
        transactions.add(transaction);
    }
    
    @Override
    public AccountStatement generateStatement(int days) {
        long cutoffTime = System.currentTimeMillis() - (days * 24 * 60 * 60 * 1000L);
        
        List<Transaction> recentTransactions = new ArrayList<>();
        int startingBalance = balance;
        
        // Calculate starting balance by reversing recent transactions
        for (int i = transactions.size() - 1; i >= 0; i--) {
            Transaction transaction = transactions.get(i);
            if (transaction.getTimestamp() >= cutoffTime) {
                recentTransactions.add(0, transaction); // Add to beginning
                // Adjust starting balance
                if (transaction.getType() == TransactionType.WITHDRAWAL) {
                    startingBalance += transaction.getAmount();
                } else if (transaction.getType() == TransactionType.DEPOSIT) {
                    startingBalance -= transaction.getAmount();
                }
            } else {
                break;
            }
        }
        
        return new AccountStatementImpl(accountNumber, recentTransactions, 
                                      startingBalance, balance, days + " days");
    }
}
