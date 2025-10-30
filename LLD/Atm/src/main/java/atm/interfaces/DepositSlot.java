package atm.interfaces;

import atm.models.Check;

/**
 * Interface for deposit slot functionality
 * Single Responsibility: Handle deposit operations
 */
public interface DepositSlot {
    boolean depositCash(int amount);
    boolean depositCheck(Check check);
    int getDepositedAmount();
}
