package atm;

import atm.models.*;
import java.util.*;

/**
 * ATM System Demo - Shows all key features
 */
public class ATMDemo {
    
    public static void main(String[] args) {
        System.out.println("=== ATM System Demo ===\n");
        
        ATM chaseATM = ATMFactory.createChaseATM("ATM001", "Downtown Branch");
        ATM wellsFargoATM = ATMFactory.createWellsFargoATM("ATM002", "Mall Location");
        
        System.out.println("1. Basic Transaction Flow:");
        basicTransaction(chaseATM, "1234567890123456", "1234");
        
        System.out.println("\n2. Cash Dispenser Optimization:");
        cashDispenserDemo(chaseATM, "1234567890123456", "1234");
        
        System.out.println("\n3. Multi-Bank Support:");
        multiBankDemo();
        
        System.out.println("\n4. Error Handling:");
        errorHandlingDemo(chaseATM);
        
        System.out.println("\n5. ATM Maintenance:");
        maintenanceDemo(chaseATM);
        
        System.out.println("\n=== Demo Complete ===");
    }
    
    private static void basicTransaction(ATM atm, String cardNumber, String pin) {
        if (atm.insertCard(cardNumber) && atm.enterPin(pin)) {
            atm.checkBalance();
            atm.withdrawCash(100);
            atm.checkBalance();
            atm.ejectCard();
        }
    }
    
    private static void cashDispenserDemo(ATM atm, String cardNumber, String pin) {
        if (atm.insertCard(cardNumber) && atm.enterPin(pin)) {
            int[] amounts = {1, 5, 25, 50, 100, 200};
            for (int amount : amounts) {
                System.out.println("Withdrawing $" + amount + ":");
                atm.withdrawCash(amount);
            }
            atm.ejectCard();
        }
    }
    
    private static void multiBankDemo() {
        ATM chaseATM = ATMFactory.createChaseATM("CHASE001", "Chase Branch");
        ATM wellsFargoATM = ATMFactory.createWellsFargoATM("WF001", "Wells Fargo Branch");
        
        System.out.println("Chase Bank:");
        if (chaseATM.insertCard("1234567890123456") && chaseATM.enterPin("1234")) {
            chaseATM.checkBalance();
            chaseATM.ejectCard();
        }
        
        System.out.println("Wells Fargo:");
        if (wellsFargoATM.insertCard("9876543210987654") && wellsFargoATM.enterPin("1111")) {
            wellsFargoATM.checkBalance();
            wellsFargoATM.ejectCard();
        }
    }
    
    private static void errorHandlingDemo(ATM atm) {
        System.out.println("Invalid card:");
        atm.insertCard("invalid");
        
        System.out.println("Invalid PIN:");
        if (atm.insertCard("1234567890123456")) {
            atm.enterPin("9999");
            atm.ejectCard();
        }
        
        System.out.println("Invalid amounts:");
        if (atm.insertCard("1234567890123456") && atm.enterPin("1234")) {
            atm.withdrawCash(-100);
            atm.withdrawCash(0);
            atm.ejectCard();
        }
        
        System.out.println("ATM out of service:");
        atm.setOperational(false);
        atm.insertCard("1234567890123456");
        atm.setOperational(true);
    }
    
    private static void maintenanceDemo(ATM atm) {
        System.out.println("Initial status: " + atm.getStatus());
        
        Map<Integer, Integer> cashToAdd = new HashMap<>();
        cashToAdd.put(20, 50);
        cashToAdd.put(50, 20);
        atm.refillCash(cashToAdd);
        
        atm.refillPaper();
        
        System.out.println("After maintenance: " + atm.getStatus());
    }
}
