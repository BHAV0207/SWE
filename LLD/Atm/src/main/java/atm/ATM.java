package atm;

import atm.interfaces.*;
import atm.states.ATMContext;
import atm.components.*;
import atm.services.*;
import atm.models.*;
import java.util.Map;

/**
 * Main ATM class that orchestrates all components
 * Single Responsibility: Coordinate ATM operations and provide public API
 */
public class ATM {
    private final ATMContext context;
    private final String atmId;
    private final String location;
    private boolean isOperational;
    
    public ATM(String atmId, String location, BankService bankService) {
        this.atmId = atmId;
        this.location = location;
        this.isOperational = true;
        
        // Initialize hardware components
        CardReader cardReader = new CardReaderImpl();
        PinEntry pinEntry = new PinEntryImpl();
        CashDispenser cashDispenser = new CashDispenserImpl();
        Printer printer = new PrinterImpl();
        DepositSlot depositSlot = new DepositSlotImpl();
        
        // Create ATM context with all components
        this.context = new ATMContext(cardReader, pinEntry, cashDispenser, 
                                    printer, depositSlot, bankService);
    }
    
    // Public API methods
    public boolean insertCard(String cardNumber) {
        if (!isOperational) {
            System.out.println("ATM is currently out of service");
            return false;
        }
        
        context.insertCard(cardNumber);
        return context.getCardReader().isCardPresent();
    }
    
    public boolean enterPin(String pin) {
        if (!isOperational) {
            System.out.println("ATM is currently out of service");
            return false;
        }
        
        context.enterPin(pin);
        return context.getPinEntry().isPinEntered();
    }
    
    public boolean withdrawCash(int amount) {
        if (!isOperational) {
            System.out.println("ATM is currently out of service");
            return false;
        }
        
        if (amount <= 0) {
            System.out.println("Invalid withdrawal amount");
            return false;
        }
        
        context.withdrawCash(amount);
        return true;
    }
    
    public boolean depositCash(int amount) {
        if (!isOperational) {
            System.out.println("ATM is currently out of service");
            return false;
        }
        
        if (amount <= 0) {
            System.out.println("Invalid deposit amount");
            return false;
        }
        
        context.depositCash(amount);
        return true;
    }
    
    public boolean changePin(String oldPin, String newPin) {
        if (!isOperational) {
            System.out.println("ATM is currently out of service");
            return false;
        }
        
        if (oldPin == null || newPin == null || !isValidPin(newPin)) {
            System.out.println("Invalid PIN format");
            return false;
        }
        
        context.changePin(oldPin, newPin);
        return true;
    }
    
    public boolean requestMiniStatement() {
        if (!isOperational) {
            System.out.println("ATM is currently out of service");
            return false;
        }
        
        context.requestStatement();
        return true;
    }
    
    public boolean checkBalance() {
        if (!isOperational) {
            System.out.println("ATM is currently out of service");
            return false;
        }
        
        Account account = context.getCurrentAccount();
        if (account != null) {
            System.out.println("Current Balance: $" + account.getBalance());
            return true;
        }
        return false;
    }
    
    public void ejectCard() {
        context.ejectCard();
    }
    
    public void cancel() {
        context.cancel();
    }
    
    // Administrative methods
    public void setOperational(boolean operational) {
        this.isOperational = operational;
        if (!operational) {
            System.out.println("ATM " + atmId + " is now out of service");
        } else {
            System.out.println("ATM " + atmId + " is now operational");
        }
    }
    
    public void refillCash(Map<Integer, Integer> notesToAdd) {
        if (context.getCashDispenser() instanceof CashDispenserImpl) {
            CashDispenserImpl dispenser = (CashDispenserImpl) context.getCashDispenser();
            Map<Integer, Integer> currentNotes = dispenser.getAvailableNotes();
            
            for (Map.Entry<Integer, Integer> entry : notesToAdd.entrySet()) {
                int denomination = entry.getKey();
                int count = entry.getValue();
                currentNotes.put(denomination, currentNotes.getOrDefault(denomination, 0) + count);
            }
            
            System.out.println("Cash refilled successfully");
        }
    }
    
    public void refillPaper() {
        if (context.getPrinter() instanceof PrinterImpl) {
            PrinterImpl printer = (PrinterImpl) context.getPrinter();
            printer.refillPaper();
        }
    }
    
    public ATMStatus getStatus() {
        return new ATMStatus(
            atmId,
            location,
            isOperational,
            context.getCashDispenser().getAvailableCash(),
            context.getPrinter().isPaperAvailable(),
            context.getCardReader().isCardPresent()
        );
    }
    
    // Utility methods
    private boolean isValidPin(String pin) {
        return pin != null && pin.matches("\\d{4}");
    }
    
    public String getAtmId() {
        return atmId;
    }
    
    public String getLocation() {
        return location;
    }
    
    public boolean isOperational() {
        return isOperational;
    }
}
