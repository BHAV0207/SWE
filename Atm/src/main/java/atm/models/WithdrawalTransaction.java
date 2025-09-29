package atm.models;

/**
 * Withdrawal transaction implementation
 * Single Responsibility: Handle withdrawal transaction logic
 */
public class WithdrawalTransaction extends BaseTransaction {
    public WithdrawalTransaction(String cardNumber, int amount, long timestamp) {
        super(cardNumber, amount, timestamp);
        this.type = TransactionType.WITHDRAWAL;
    }
    
    @Override
    public TransactionType getType() {
        return type;
    }
}
