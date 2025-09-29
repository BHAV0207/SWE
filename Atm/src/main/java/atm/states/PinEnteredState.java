package atm.states;

import atm.models.TransactionType;

/**
 * PIN entered state implementation
 * Single Responsibility: Handle behavior when PIN is entered
 */
public class PinEnteredState implements ATMStateInterface {
    @Override
    public void insertCard(ATMContext context, String cardNumber) {
        System.out.println("Card already inserted and PIN entered.");
    }
    
    @Override
    public void enterPin(ATMContext context, String pin) {
        System.out.println("PIN already entered. Please select a transaction.");
    }
    
    @Override
    public void selectTransaction(ATMContext context, TransactionType type) {
        context.getStateData().put("selectedTransaction", type);
        context.setState(new TransactionState());
        System.out.println("Transaction selected: " + type);
    }
    
    @Override
    public void withdrawCash(ATMContext context, int amount) {
        selectTransaction(context, TransactionType.WITHDRAWAL);
        // Delegate to TransactionState for actual withdrawal
        context.getStateData().put("withdrawalAmount", amount);
    }
    
    @Override
    public void depositCash(ATMContext context, int amount) {
        selectTransaction(context, TransactionType.DEPOSIT);
        // Delegate to TransactionState for actual deposit
        context.getStateData().put("depositAmount", amount);
    }
    
    @Override
    public void changePin(ATMContext context, String oldPin, String newPin) {
        selectTransaction(context, TransactionType.PIN_CHANGE);
        // Delegate to TransactionState for actual PIN change
        context.getStateData().put("oldPin", oldPin);
        context.getStateData().put("newPin", newPin);
    }
    
    @Override
    public void requestStatement(ATMContext context) {
        selectTransaction(context, TransactionType.MINI_STATEMENT);
        // Delegate to TransactionState for actual statement request
    }
    
    @Override
    public void ejectCard(ATMContext context) {
        context.getCardReader().ejectCard();
        context.setState(new IdleState());
        System.out.println("Card ejected.");
    }
    
    @Override
    public void cancel(ATMContext context) {
        context.getCardReader().ejectCard();
        context.setState(new IdleState());
        System.out.println("Transaction cancelled. Card ejected.");
    }
    
    @Override
    public String getStateName() {
        return "PIN_ENTERED";
    }
}
