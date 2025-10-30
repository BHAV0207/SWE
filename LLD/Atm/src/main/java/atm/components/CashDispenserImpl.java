package atm.components;

import atm.interfaces.CashDispenser;
import java.util.*;

/**
 * Cash dispenser implementation with dynamic programming optimization
 * Single Responsibility: Handle cash dispensing with optimal currency distribution
 */
public class CashDispenserImpl implements CashDispenser {
    private Map<Integer, Integer> availableNotes; // denomination -> count
    private int totalCash;
    
    public CashDispenserImpl() {
        this.availableNotes = new HashMap<>();
        initializeNotes();
        calculateTotalCash();
    }
    
    private void initializeNotes() {
        // Initialize with common denominations
        availableNotes.put(1, 100);    // 100 $1 bills
        availableNotes.put(5, 50);     // 50 $5 bills
        availableNotes.put(10, 30);    // 30 $10 bills
        availableNotes.put(20, 20);    // 20 $20 bills
        availableNotes.put(50, 10);    // 10 $50 bills
        availableNotes.put(100, 5);    // 5 $100 bills
    }
    
    private void calculateTotalCash() {
        totalCash = availableNotes.entrySet().stream()
            .mapToInt(entry -> entry.getKey() * entry.getValue())
            .sum();
    }
    
    @Override
    public boolean dispenseCash(int amount) {
        if (!hasEnoughCash(amount)) {
            System.out.println("Insufficient cash in ATM");
            return false;
        }
        
        Map<Integer, Integer> dispensedNotes = calculateOptimalDispense(amount);
        if (dispensedNotes == null) {
            System.out.println("Cannot dispense exact amount with available denominations");
            return false;
        }
        
        // Update available notes
        for (Map.Entry<Integer, Integer> entry : dispensedNotes.entrySet()) {
            int denomination = entry.getKey();
            int count = entry.getValue();
            availableNotes.put(denomination, availableNotes.get(denomination) - count);
        }
        
        calculateTotalCash();
        printDispensedNotes(dispensedNotes);
        return true;
    }
    
    @Override
    public int getAvailableCash() {
        return totalCash;
    }
    
    @Override
    public boolean hasEnoughCash(int amount) {
        return totalCash >= amount;
    }
    
    // Dynamic Programming solution for optimal currency dispense
    private Map<Integer, Integer> calculateOptimalDispense(int amount) {
        List<Integer> denominations = new ArrayList<>(availableNotes.keySet());
        denominations.sort(Collections.reverseOrder()); // Start with highest denomination
        
        // DP table: dp[i] = minimum number of notes needed for amount i
        int[] dp = new int[amount + 1];
        int[] parent = new int[amount + 1]; // To track which denomination was used
        
        Arrays.fill(dp, Integer.MAX_VALUE);
        dp[0] = 0;
        
        for (int i = 1; i <= amount; i++) {
            for (int denomination : denominations) {
                if (i >= denomination && dp[i - denomination] != Integer.MAX_VALUE) {
                    int availableCount = availableNotes.get(denomination);
                    int neededCount = 1;
                    
                    // Check if we have enough notes of this denomination
                    if (neededCount <= availableCount) {
                        if (dp[i - denomination] + 1 < dp[i]) {
                            dp[i] = dp[i - denomination] + 1;
                            parent[i] = denomination;
                        }
                    }
                }
            }
        }
        
        if (dp[amount] == Integer.MAX_VALUE) {
            return null; // Cannot make exact change
        }
        
        // Reconstruct the solution
        Map<Integer, Integer> result = new HashMap<>();
        int currentAmount = amount;
        
        while (currentAmount > 0) {
            int denomination = parent[currentAmount];
            result.put(denomination, result.getOrDefault(denomination, 0) + 1);
            currentAmount -= denomination;
        }
        
        return result;
    }
    
    private void printDispensedNotes(Map<Integer, Integer> dispensedNotes) {
        System.out.println("Dispensing cash:");
        for (Map.Entry<Integer, Integer> entry : dispensedNotes.entrySet()) {
            System.out.println("$" + entry.getKey() + " x " + entry.getValue());
        }
    }
    
    public Map<Integer, Integer> getAvailableNotes() {
        return new HashMap<>(availableNotes);
    }
}
