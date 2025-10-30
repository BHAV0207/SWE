package atm.states;

import atm.interfaces.*;
import atm.models.*;
import java.util.HashMap;
import java.util.Map;

/**
 * Context class for ATM state management
 * Single Responsibility: Manage ATM state transitions and component coordination
 */
public class ATMContext {
    private ATMStateInterface currentState;
    private String cardNumber;
    private String pin;
    private Account currentAccount;
    private Transaction currentTransaction;
    private final Map<String, Object> stateData;
    
    // ATM Components
    private final CardReader cardReader;
    private final PinEntry pinEntry;
    private final CashDispenser cashDispenser;
    private final Printer printer;
    private final DepositSlot depositSlot;
    private final BankService bankService;
    
    public ATMContext(CardReader cardReader, PinEntry pinEntry, CashDispenser cashDispenser,
                     Printer printer, DepositSlot depositSlot, BankService bankService) {
        this.cardReader = cardReader;
        this.pinEntry = pinEntry;
        this.cashDispenser = cashDispenser;
        this.printer = printer;
        this.depositSlot = depositSlot;
        this.bankService = bankService;
        this.stateData = new HashMap<>();
        this.currentState = new IdleState();
    }
    
    // State transition methods
    public void setState(ATMStateInterface newState) {
        System.out.println("ATM State changed from " + currentState.getStateName() + 
                          " to " + newState.getStateName());
        this.currentState = newState;
    }
    
    // Delegate all operations to current state
    public void insertCard(String cardNumber) {
        currentState.insertCard(this, cardNumber);
    }
    
    public void enterPin(String pin) {
        currentState.enterPin(this, pin);
    }
    
    public void selectTransaction(TransactionType type) {
        currentState.selectTransaction(this, type);
    }
    
    public void withdrawCash(int amount) {
        currentState.withdrawCash(this, amount);
    }
    
    public void depositCash(int amount) {
        currentState.depositCash(this, amount);
    }
    
    public void changePin(String oldPin, String newPin) {
        currentState.changePin(this, oldPin, newPin);
    }
    
    public void requestStatement() {
        currentState.requestStatement(this);
    }
    
    public void ejectCard() {
        currentState.ejectCard(this);
    }
    
    public void cancel() {
        currentState.cancel(this);
    }
    
    // Getters and setters
    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }
    
    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }
    
    public Account getCurrentAccount() { return currentAccount; }
    public void setCurrentAccount(Account currentAccount) { this.currentAccount = currentAccount; }
    
    public Transaction getCurrentTransaction() { return currentTransaction; }
    public void setCurrentTransaction(Transaction currentTransaction) { this.currentTransaction = currentTransaction; }
    
    public Map<String, Object> getStateData() { return stateData; }
    
    // Component getters
    public CardReader getCardReader() { return cardReader; }
    public PinEntry getPinEntry() { return pinEntry; }
    public CashDispenser getCashDispenser() { return cashDispenser; }
    public Printer getPrinter() { return printer; }
    public DepositSlot getDepositSlot() { return depositSlot; }
    public BankService getBankService() { return bankService; }
}
