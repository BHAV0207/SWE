package atm.components;

import atm.interfaces.Printer;
import atm.models.Transaction;
import atm.models.AccountStatement;
import java.util.Date;

/**
 * Printer implementation
 * Single Responsibility: Handle printing operations for receipts and statements
 */
public class PrinterImpl implements Printer {
    private boolean paperAvailable;
    private int paperCount;
    
    public PrinterImpl() {
        this.paperAvailable = true;
        this.paperCount = 100; // Initial paper count
    }
    
    @Override
    public boolean printReceipt(Transaction transaction) {
        if (!isPaperAvailable()) {
            System.out.println("Printer out of paper");
            return false;
        }
        
        System.out.println("=== TRANSACTION RECEIPT ===");
        System.out.println("Transaction ID: " + transaction.getTransactionId());
        System.out.println("Card Number: " + maskCardNumber(transaction.getCardNumber()));
        System.out.println("Transaction Type: " + transaction.getType());
        System.out.println("Amount: $" + transaction.getAmount());
        System.out.println("Date: " + new Date(transaction.getTimestamp()));
        System.out.println("=============================");
        
        paperCount--;
        if (paperCount <= 0) {
            paperAvailable = false;
        }
        
        return true;
    }
    
    @Override
    public boolean printStatement(AccountStatement statement) {
        if (!isPaperAvailable()) {
            System.out.println("Printer out of paper");
            return false;
        }
        
        System.out.println("=== ACCOUNT STATEMENT ===");
        System.out.println("Account: " + statement.getAccountNumber());
        System.out.println("Period: " + statement.getPeriod());
        System.out.println("Starting Balance: $" + statement.getStartingBalance());
        System.out.println("Ending Balance: $" + statement.getEndingBalance());
        System.out.println("\nTransactions:");
        
        for (Transaction transaction : statement.getTransactions()) {
            System.out.println(transaction.getType() + " - $" + transaction.getAmount() + 
                             " - " + new Date(transaction.getTimestamp()));
        }
        System.out.println("=========================");
        
        paperCount--;
        if (paperCount <= 0) {
            paperAvailable = false;
        }
        
        return true;
    }
    
    @Override
    public boolean isPaperAvailable() {
        return paperAvailable;
    }
    
    private String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) return "****";
        return "****-****-****-" + cardNumber.substring(cardNumber.length() - 4);
    }
    
    public void refillPaper() {
        this.paperCount = 100;
        this.paperAvailable = true;
        System.out.println("Printer paper refilled");
    }
}
