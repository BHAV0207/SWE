package atm.models;

/**
 * Enum for ATM states
 * Single Responsibility: Define ATM state constants
 */
public enum ATMState {
    IDLE, CARD_INSERTED, PIN_ENTERED, TRANSACTION, CASH_DISPENSING, 
    CARD_EJECTING, ERROR, MAINTENANCE
}
