package atm.states;

import atm.models.TransactionType;

/**
 * Card inserted state implementation
 * Single Responsibility: Handle behavior when card is inserted
 */
public class CardInsertedState implements ATMStateInterface {
    @Override
    public void insertCard(ATMContext context, String cardNumber) {
        System.out.println("Card already inserted. Please enter PIN.");
    }
    
    @Override
    public void enterPin(ATMContext context, String pin) {
        // First validate PIN format through PinEntry
        if (context.getPinEntry().enterPin(pin)) {
            // Then validate PIN against bank records
            if (context.getBankService().validatePin(context.getCardNumber(), pin)) {
                context.setPin(pin);
                context.setCurrentAccount(context.getBankService().getAccount(context.getCardNumber()));
                context.setState(new PinEnteredState());
                System.out.println("PIN verified successfully.");
            } else {
                System.out.println("Invalid PIN. Please try again.");
                context.setState(new IdleState());
                context.getCardReader().ejectCard();
            }
        } else {
            System.out.println("Invalid PIN format or max attempts exceeded.");
            context.setState(new IdleState());
            context.getCardReader().ejectCard();
        }
    }
    
    @Override
    public void selectTransaction(ATMContext context, TransactionType type) {
        System.out.println("Please enter PIN first.");
    }
    
    @Override
    public void withdrawCash(ATMContext context, int amount) {
        System.out.println("Please enter PIN first.");
    }
    
    @Override
    public void depositCash(ATMContext context, int amount) {
        System.out.println("Please enter PIN first.");
    }
    
    @Override
    public void changePin(ATMContext context, String oldPin, String newPin) {
        System.out.println("Please enter PIN first.");
    }
    
    @Override
    public void requestStatement(ATMContext context) {
        System.out.println("Please enter PIN first.");
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
        return "CARD_INSERTED";
    }
}
