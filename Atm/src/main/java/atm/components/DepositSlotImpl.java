package atm.components;

import atm.interfaces.DepositSlot;
import atm.models.Check;
import java.util.ArrayList;
import java.util.List;

/**
 * Deposit slot implementation
 * Single Responsibility: Handle deposit operations for cash and checks
 */
public class DepositSlotImpl implements DepositSlot {
    private int depositedAmount;
    private List<Check> depositedChecks;
    
    public DepositSlotImpl() {
        this.depositedAmount = 0;
        this.depositedChecks = new ArrayList<>();
    }
    
    @Override
    public boolean depositCash(int amount) {
        if (amount > 0) {
            this.depositedAmount += amount;
            System.out.println("Cash deposited: $" + amount);
            return true;
        }
        return false;
    }
    
    @Override
    public boolean depositCheck(Check check) {
        if (check != null && check.getAmount() > 0) {
            this.depositedChecks.add(check);
            System.out.println("Check deposited: $" + check.getAmount() + 
                             " from " + check.getBankName());
            return true;
        }
        return false;
    }
    
    @Override
    public int getDepositedAmount() {
        return depositedAmount;
    }
    
    public List<Check> getDepositedChecks() {
        return new ArrayList<>(depositedChecks);
    }
    
    public void clearDeposits() {
        this.depositedAmount = 0;
        this.depositedChecks.clear();
    }
}
