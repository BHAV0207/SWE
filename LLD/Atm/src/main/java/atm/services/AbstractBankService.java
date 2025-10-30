package atm.services;

import atm.interfaces.BankService;
import atm.models.Account;
import java.util.HashMap;
import java.util.Map;

/**
 * Abstract bank service implementation
 * Single Responsibility: Provide common bank service functionality
 */
public abstract class AbstractBankService implements BankService {
    protected Map<String, Account> accounts;
    protected Map<String, String> cardToAccountMapping;
    protected Map<String, String> cardToPinMapping;
    
    public AbstractBankService() {
        this.accounts = new HashMap<>();
        this.cardToAccountMapping = new HashMap<>();
        this.cardToPinMapping = new HashMap<>();
        initializeBankData();
    }
    
    // Template method - subclasses can override specific parts
    @Override
    public boolean validateCard(String cardNumber) {
        return cardToAccountMapping.containsKey(cardNumber);
    }
    
    @Override
    public boolean validatePin(String cardNumber, String pin) {
        if (!validateCard(cardNumber)) {
            return false;
        }
        String storedPin = cardToPinMapping.get(cardNumber);
        return storedPin != null && storedPin.equals(pin);
    }
    
    @Override
    public Account getAccount(String cardNumber) {
        String accountNumber = cardToAccountMapping.get(cardNumber);
        if (accountNumber != null) {
            return accounts.get(accountNumber);
        }
        return null;
    }
    
    @Override
    public boolean updateAccount(Account account) {
        if (account != null) {
            accounts.put(account.getAccountNumber(), account);
            return true;
        }
        return false;
    }
    
    @Override
    public boolean changePin(String cardNumber, String oldPin, String newPin) {
        if (validatePin(cardNumber, oldPin)) {
            cardToPinMapping.put(cardNumber, newPin);
            return true;
        }
        return false;
    }
    
    // Abstract method for bank-specific initialization
    protected abstract void initializeBankData();
    
    // Hook method for additional validation
    protected boolean additionalCardValidation(String cardNumber) {
        return true; // Default implementation
    }
}
