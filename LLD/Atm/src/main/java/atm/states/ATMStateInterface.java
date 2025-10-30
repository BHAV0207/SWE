package atm.states;

import atm.models.TransactionType;

/**
 * Interface for ATM state operations
 * Single Responsibility: Define state behavior contract
 */
public interface ATMStateInterface {
    void insertCard(ATMContext context, String cardNumber);
    void enterPin(ATMContext context, String pin);
    void selectTransaction(ATMContext context, TransactionType type);
    void withdrawCash(ATMContext context, int amount);
    void depositCash(ATMContext context, int amount);
    void changePin(ATMContext context, String oldPin, String newPin);
    void requestStatement(ATMContext context);
    void ejectCard(ATMContext context);
    void cancel(ATMContext context);
    String getStateName();
}
