package atm.models;

/**
 * Base transaction implementation
 * Single Responsibility: Provide common transaction functionality
 */
public abstract class BaseTransaction implements Transaction {
    protected String transactionId;
    protected String cardNumber;
    protected int amount;
    protected TransactionType type;
    protected long timestamp;
    
    public BaseTransaction(String cardNumber, int amount, long timestamp) {
        this.transactionId = generateTransactionId();
        this.cardNumber = cardNumber;
        this.amount = amount;
        this.timestamp = timestamp;
    }
    
    @Override
    public String getTransactionId() {
        return transactionId;
    }
    
    @Override
    public String getCardNumber() {
        return cardNumber;
    }
    
    @Override
    public int getAmount() {
        return amount;
    }
    
    @Override
    public long getTimestamp() {
        return timestamp;
    }
    
    @Override
    public boolean execute() {
        return true; // Default implementation
    }
    
    private String generateTransactionId() {
        return "TXN" + System.currentTimeMillis() + (int)(Math.random() * 1000);
    }
}
