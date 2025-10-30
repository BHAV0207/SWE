package atm.models;

/**
 * Deposit transaction implementation
 * Single Responsibility: Handle deposit transaction logic
 */
public class DepositTransaction extends BaseTransaction {
    public DepositTransaction(String cardNumber, int amount, long timestamp) {
        super(cardNumber, amount, timestamp);
        this.type = TransactionType.DEPOSIT;
    }
    
    @Override
    public TransactionType getType() {
        return type;
    }
}
