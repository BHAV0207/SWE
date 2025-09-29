package atm.models;

/**
 * Balance inquiry transaction implementation
 * Single Responsibility: Handle balance inquiry transaction logic
 */
public class BalanceInquiryTransaction extends BaseTransaction {
    public BalanceInquiryTransaction(String cardNumber, int amount, long timestamp) {
        super(cardNumber, 0, timestamp); // Balance inquiry has no amount
        this.type = TransactionType.BALANCE_INQUIRY;
    }
    
    @Override
    public TransactionType getType() {
        return type;
    }
}
