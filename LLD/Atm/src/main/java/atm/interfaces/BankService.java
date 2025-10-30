package atm.interfaces;

import atm.models.Account;

/**
 * Interface for bank service functionality
 * Single Responsibility: Handle bank operations and account management
 */
public interface BankService {
    boolean validateCard(String cardNumber);
    boolean validatePin(String cardNumber, String pin);
    Account getAccount(String cardNumber);
    boolean updateAccount(Account account);
    boolean changePin(String cardNumber, String oldPin, String newPin);
}
