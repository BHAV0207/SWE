package atm.states;

import atm.models.TransactionType;

/**
 * Idle state implementation
 * Single Responsibility: Handle behavior when ATM is idle
 */
public class IdleState implements ATMStateInterface {
    @Override
    public void insertCard(ATMContext context, String cardNumber) {
        if (context.getCardReader().insertCard(cardNumber)) {
            context.setCardNumber(cardNumber);
            context.setState(new CardInsertedState());
        } else {
            System.out.println("Invalid card. Please try again.");
        }
    }
    
    @Override
    public void enterPin(ATMContext context, String pin) {
        System.out.println("Please insert card first.");
    }
    
    @Override
    public void selectTransaction(ATMContext context, TransactionType type) {
        System.out.println("Please insert card and enter PIN first.");
    }
    
    @Override
    public void withdrawCash(ATMContext context, int amount) {
        System.out.println("Please insert card and enter PIN first.");
    }
    
    @Override
    public void depositCash(ATMContext context, int amount) {
        System.out.println("Please insert card and enter PIN first.");
    }
    
    @Override
    public void changePin(ATMContext context, String oldPin, String newPin) {
        System.out.println("Please insert card and enter PIN first.");
    }
    
    @Override
    public void requestStatement(ATMContext context) {
        System.out.println("Please insert card and enter PIN first.");
    }
    
    @Override
    public void ejectCard(ATMContext context) {
        System.out.println("No card to eject.");
    }
    
    @Override
    public void cancel(ATMContext context) {
        System.out.println("No operation to cancel.");
    }
    
    @Override
    public String getStateName() {
        return "IDLE";
    }
}
