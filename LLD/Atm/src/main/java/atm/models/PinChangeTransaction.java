package atm.models;

/**
 * PIN change transaction implementation
 * Single Responsibility: Handle PIN change transaction logic
 */
public class PinChangeTransaction extends BaseTransaction {
    public PinChangeTransaction(String cardNumber, int amount, long timestamp) {
        super(cardNumber, 0, timestamp); // PIN change has no amount
        this.type = TransactionType.PIN_CHANGE;
    }
    
    @Override
    public TransactionType getType() {
        return type;
    }
}
