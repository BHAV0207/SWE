package atm;

import atm.interfaces.BankService;
import atm.services.ChaseBankService;
import atm.services.WellsFargoBankService;

/**
 * ATM Factory for creating ATMs with different bank services
 * Single Responsibility: Create ATM instances with different configurations
 */
public class ATMFactory {
    public static ATM createChaseATM(String atmId, String location) {
        BankService bankService = new ChaseBankService();
        return new ATM(atmId, location, bankService);
    }
    
    public static ATM createWellsFargoATM(String atmId, String location) {
        BankService bankService = new WellsFargoBankService();
        return new ATM(atmId, location, bankService);
    }
    
    public static ATM createCustomATM(String atmId, String location, BankService bankService) {
        return new ATM(atmId, location, bankService);
    }
}
