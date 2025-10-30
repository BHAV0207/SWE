package atm.services;

import atm.models.Account;
import atm.models.AccountImpl;

/**
 * Wells Fargo Bank service implementation
 * Single Responsibility: Handle Wells Fargo Bank specific operations
 */
public class WellsFargoBankService extends AbstractBankService {
    
    @Override
    protected void initializeBankData() {
        // Initialize sample accounts for Wells Fargo
        Account account1 = new AccountImpl("WF001", "9876543210987654", 7500);
        Account account2 = new AccountImpl("WF002", "9876543210987655", 3000);
        
        accounts.put("WF001", account1);
        accounts.put("WF002", account2);
        
        cardToAccountMapping.put("9876543210987654", "WF001");
        cardToAccountMapping.put("9876543210987655", "WF002");
        
        cardToPinMapping.put("9876543210987654", "1111");
        cardToPinMapping.put("9876543210987655", "2222");
    }
    
    @Override
    protected boolean additionalCardValidation(String cardNumber) {
        // Wells Fargo-specific validation
        return cardNumber.startsWith("9876");
    }
}
