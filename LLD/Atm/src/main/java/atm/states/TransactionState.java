package atm.states;

import atm.models.TransactionType;
import atm.models.Transaction;
import atm.models.AccountStatement;
import atm.models.WithdrawalTransaction;
import atm.models.DepositTransaction;

/**
 * Transaction state implementation
 * Single Responsibility: Handle behavior during transaction processing
 */
public class TransactionState implements ATMStateInterface {
    @Override
    public void insertCard(ATMContext context, String cardNumber) {
        System.out.println("Transaction in progress. Please complete or cancel current transaction.");
    }
    
    @Override
    public void enterPin(ATMContext context, String pin) {
        System.out.println("PIN already entered. Transaction in progress.");
    }
    
    @Override
    public void selectTransaction(ATMContext context, TransactionType type) {
        System.out.println("Transaction already selected. Please complete current transaction.");
    }
    
    @Override
    public void withdrawCash(ATMContext context, int amount) {
        TransactionType selectedType = (TransactionType) context.getStateData().get("selectedTransaction");
        if (selectedType == TransactionType.WITHDRAWAL) {
            // Get amount from state data if not provided directly
            int withdrawalAmount = amount > 0 ? amount : (Integer) context.getStateData().getOrDefault("withdrawalAmount", 0);
            
            if (context.getCashDispenser().hasEnoughCash(withdrawalAmount) && 
                context.getCurrentAccount().withdraw(withdrawalAmount)) {
                
                context.getCashDispenser().dispenseCash(withdrawalAmount);
                Transaction transaction = new WithdrawalTransaction(
                    context.getCardNumber(), withdrawalAmount, System.currentTimeMillis());
                context.getCurrentAccount().addTransaction(transaction);
                context.getBankService().updateAccount(context.getCurrentAccount());
                
                System.out.println("Withdrawal successful. Amount: $" + withdrawalAmount);
                context.setState(new PinEnteredState());
            } else {
                System.out.println("Withdrawal failed. Insufficient funds or cash not available.");
                context.setState(new PinEnteredState());
            }
        } else {
            System.out.println("Invalid operation for current transaction type.");
        }
    }
    
    @Override
    public void depositCash(ATMContext context, int amount) {
        TransactionType selectedType = (TransactionType) context.getStateData().get("selectedTransaction");
        if (selectedType == TransactionType.DEPOSIT) {
            // Get amount from state data if not provided directly
            int depositAmount = amount > 0 ? amount : (Integer) context.getStateData().getOrDefault("depositAmount", 0);
            
            if (context.getDepositSlot().depositCash(depositAmount)) {
                context.getCurrentAccount().deposit(depositAmount);
                Transaction transaction = new DepositTransaction(
                    context.getCardNumber(), depositAmount, System.currentTimeMillis());
                context.getCurrentAccount().addTransaction(transaction);
                context.getBankService().updateAccount(context.getCurrentAccount());
                
                System.out.println("Deposit successful. Amount: $" + depositAmount);
                context.setState(new PinEnteredState());
            } else {
                System.out.println("Deposit failed.");
                context.setState(new PinEnteredState());
            }
        } else {
            System.out.println("Invalid operation for current transaction type.");
        }
    }
    
    @Override
    public void changePin(ATMContext context, String oldPin, String newPin) {
        TransactionType selectedType = (TransactionType) context.getStateData().get("selectedTransaction");
        if (selectedType == TransactionType.PIN_CHANGE) {
            // Get PINs from state data if not provided directly
            String oldPinToUse = oldPin != null ? oldPin : (String) context.getStateData().get("oldPin");
            String newPinToUse = newPin != null ? newPin : (String) context.getStateData().get("newPin");
            
            if (context.getBankService().changePin(context.getCardNumber(), oldPinToUse, newPinToUse)) {
                System.out.println("PIN changed successfully.");
                context.setState(new PinEnteredState());
            } else {
                System.out.println("PIN change failed. Invalid old PIN.");
                context.setState(new PinEnteredState());
            }
        } else {
            System.out.println("Invalid operation for current transaction type.");
        }
    }
    
    @Override
    public void requestStatement(ATMContext context) {
        TransactionType selectedType = (TransactionType) context.getStateData().get("selectedTransaction");
        if (selectedType == TransactionType.MINI_STATEMENT) {
            AccountStatement statement = context.getCurrentAccount().generateStatement(30);
            context.getPrinter().printStatement(statement);
            System.out.println("Mini statement printed.");
            context.setState(new PinEnteredState());
        } else {
            System.out.println("Invalid operation for current transaction type.");
        }
    }
    
    @Override
    public void ejectCard(ATMContext context) {
        System.out.println("Please complete or cancel current transaction first.");
    }
    
    @Override
    public void cancel(ATMContext context) {
        context.setState(new PinEnteredState());
        System.out.println("Transaction cancelled.");
    }
    
    @Override
    public String getStateName() {
        return "TRANSACTION";
    }
}
