package atm.models;

/**
 * Model class for check deposits
 * Single Responsibility: Represent check data
 */
public class Check {
    private String checkNumber;
    private int amount;
    private String bankName;
    
    public Check(String checkNumber, int amount, String bankName) {
        this.checkNumber = checkNumber;
        this.amount = amount;
        this.bankName = bankName;
    }
    
    public String getCheckNumber() { 
        return checkNumber; 
    }
    
    public int getAmount() { 
        return amount; 
    }
    
    public String getBankName() { 
        return bankName; 
    }
}
