package atm.models;

/**
 * Enum for transaction types
 * Single Responsibility: Define transaction type constants
 */
public enum TransactionType {
    WITHDRAWAL, DEPOSIT, PIN_CHANGE, BALANCE_INQUIRY, MINI_STATEMENT
}
