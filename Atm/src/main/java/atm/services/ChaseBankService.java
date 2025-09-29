package atm.services;

import atm.models.Account;
import atm.models.AccountImpl;

/**
 * Chase Bank service implementation
 * Single Responsibility: Handle Chase Bank specific operations
 */
public class ChaseBankService extends AbstractBankService {
    
    @Override
    protected void initializeBankData() {
        // Initialize sample accounts for Chase Bank
        Account account1 = new AccountImpl("CHASE001", "1234567890123456", 5000);
        Account account2 = new AccountImpl("CHASE002", "1234567890123457", 2500);
        Account account3 = new AccountImpl("CHASE003", "1234567890123458", 10000);
        
        accounts.put("CHASE001", account1);
        accounts.put("CHASE002", account2);
        accounts.put("CHASE003", account3);
        
        cardToAccountMapping.put("1234567890123456", "CHASE001");
        cardToAccountMapping.put("1234567890123457", "CHASE002");
        cardToAccountMapping.put("1234567890123458", "CHASE003");
        
        cardToPinMapping.put("1234567890123456", "1234");
        cardToPinMapping.put("1234567890123457", "5678");
        cardToPinMapping.put("1234567890123458", "9012");
    }
    
    @Override
    protected boolean additionalCardValidation(String cardNumber) {
        // Chase-specific validation (e.g., card number starts with specific prefix)
        return cardNumber.startsWith("1234");
    }
}
