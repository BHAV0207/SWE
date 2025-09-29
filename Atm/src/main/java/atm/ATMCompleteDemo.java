// Source code is decompiled from a .class file using FernFlower decompiler (from Intellij IDEA).
package atm;

import java.util.HashMap;

public class ATMCompleteDemo {
   public ATMCompleteDemo() {
   }

   public static void main(String[] var0) {
      System.out.println("=== Complete ATM System Feature Demo ===\n");
      ATM var1 = ATMFactory.createChaseATM("ATM001", "Downtown Branch");
      ATM var2 = ATMFactory.createWellsFargoATM("ATM002", "Mall Location");
      System.out.println("=== Demo 1: Complete Chase ATM Transaction Flow ===");
      demonstrateCompleteTransactionFlow(var1, "1234567890123456", "1234");
      System.out.println("\n" + "=".repeat(60) + "\n");
      System.out.println("=== Demo 2: PIN Change Feature ===");
      demonstratePinChange(var1, "1234567890123456", "1234", "9999");
      System.out.println("\n" + "=".repeat(60) + "\n");
      System.out.println("=== Demo 3: Deposit and Mini Statement ===");
      demonstrateDepositAndStatement(var1, "1234567890123456", "9999", 200);
      System.out.println("\n" + "=".repeat(60) + "\n");
      System.out.println("=== Demo 4: Wells Fargo ATM ===");
      demonstrateCompleteTransactionFlow(var2, "9876543210987654", "1111");
      System.out.println("\n" + "=".repeat(60) + "\n");
      System.out.println("=== Demo 5: Cash Dispenser Optimization ===");
      demonstrateCashDispenserOptimization(var1, "1234567890123456", "9999");
      System.out.println("\n" + "=".repeat(60) + "\n");
      System.out.println("=== Demo 6: Error Handling ===");
      demonstrateErrorHandling(var1);
      System.out.println("\n" + "=".repeat(60) + "\n");
      System.out.println("=== Demo 7: ATM Maintenance ===");
      demonstrateMaintenance(var1);
      System.out.println("\n=== All Features Demonstrated Successfully! ===");
   }

   private static void demonstrateCompleteTransactionFlow(ATM var0, String var1, String var2) {
      System.out.println("Starting complete transaction flow...");
      System.out.println("\n1. Inserting card...");
      if (var0.insertCard(var1)) {
         System.out.println("✓ Card inserted successfully");
         System.out.println("\n2. Entering PIN...");
         if (var0.enterPin(var2)) {
            System.out.println("✓ PIN verified successfully");
            System.out.println("\n3. Checking balance...");
            var0.checkBalance();
            System.out.println("\n4. Withdrawing $200...");
            var0.withdrawCash(200);
            System.out.println("\n5. Checking balance after withdrawal...");
            var0.checkBalance();
            System.out.println("\n6. Ejecting card...");
            var0.ejectCard();
            System.out.println("✓ Transaction completed successfully");
         } else {
            System.out.println("✗ PIN verification failed");
            var0.ejectCard();
         }
      } else {
         System.out.println("✗ Card insertion failed");
      }

   }

   private static void demonstratePinChange(ATM var0, String var1, String var2, String var3) {
      System.out.println("Demonstrating PIN change feature...");
      if (var0.insertCard(var1)) {
         if (var0.enterPin(var2)) {
            System.out.println("✓ PIN verified, changing PIN...");
            var0.changePin(var2, var3);
            var0.ejectCard();
            System.out.println("✓ PIN change process completed");
         } else {
            System.out.println("✗ PIN verification failed");
            var0.ejectCard();
         }
      } else {
         System.out.println("✗ Card insertion failed");
      }

   }

   private static void demonstrateDepositAndStatement(ATM var0, String var1, String var2, int var3) {
      System.out.println("Demonstrating deposit and mini statement...");
      if (var0.insertCard(var1)) {
         if (var0.enterPin(var2)) {
            System.out.println("✓ PIN verified");
            System.out.println("\nBalance before deposit:");
            var0.checkBalance();
            System.out.println("\nDepositing $" + var3 + "...");
            var0.depositCash(var3);
            System.out.println("\nBalance after deposit:");
            var0.checkBalance();
            System.out.println("\nRequesting mini statement...");
            var0.requestMiniStatement();
            var0.ejectCard();
            System.out.println("✓ Deposit and statement completed");
         } else {
            System.out.println("✗ PIN verification failed");
            var0.ejectCard();
         }
      } else {
         System.out.println("✗ Card insertion failed");
      }

   }

   private static void demonstrateCashDispenserOptimization(ATM var0, String var1, String var2) {
      System.out.println("Demonstrating cash dispenser optimization...");
      if (var0.insertCard(var1)) {
         if (var0.enterPin(var2)) {
            System.out.println("✓ PIN verified");
            int[] var3 = new int[]{1, 5, 10, 25, 50, 75, 100, 150, 200, 500};
            int[] var4 = var3;
            int var5 = var3.length;

            for(int var6 = 0; var6 < var5; ++var6) {
               int var7 = var4[var6];
               System.out.println("\nWithdrawing $" + var7 + ":");
               var0.withdrawCash(var7);
            }

            var0.ejectCard();
            System.out.println("✓ Cash dispenser optimization demonstrated");
         } else {
            System.out.println("✗ PIN verification failed");
            var0.ejectCard();
         }
      } else {
         System.out.println("✗ Card insertion failed");
      }

   }

   private static void demonstrateErrorHandling(ATM var0) {
      System.out.println("Demonstrating error handling...");
      System.out.println("\n1. Testing invalid card:");
      var0.insertCard("0000000000000000");
      System.out.println("\n2. Testing invalid PIN:");
      var0.insertCard("1234567890123456");
      var0.enterPin("9999");
      var0.ejectCard();
      System.out.println("\n3. Testing withdrawal without authentication:");
      var0.withdrawCash(100);
      System.out.println("\n4. Testing invalid withdrawal amount:");
      if (var0.insertCard("1234567890123456") && var0.enterPin("1234")) {
         var0.withdrawCash(-100);
         var0.withdrawCash(0);
         var0.ejectCard();
      }

      System.out.println("\n5. Testing excessive withdrawal:");
      if (var0.insertCard("1234567890123456") && var0.enterPin("1234")) {
         var0.withdrawCash(100000);
         var0.ejectCard();
      }

      System.out.println("✓ Error handling demonstrated");
   }

   private static void demonstrateMaintenance(ATM var0) {
      System.out.println("Demonstrating ATM maintenance features...");
      System.out.println("\nInitial ATM Status:");
      System.out.println(var0.getStatus());
      System.out.println("\nRefilling cash...");
      HashMap var1 = new HashMap();
      var1.put(20, 50);
      var1.put(50, 20);
      var1.put(100, 10);
      var0.refillCash(var1);
      System.out.println("\nRefilling paper...");
      var0.refillPaper();
      System.out.println("\nATM Status after maintenance:");
      System.out.println(var0.getStatus());
      System.out.println("\nTesting out of service mode...");
      var0.setOperational(false);
      System.out.println("Attempting transaction while out of service:");
      var0.insertCard("1234567890123456");
      System.out.println("\nBringing ATM back online...");
      var0.setOperational(true);
      System.out.println("\nTesting normal operation after maintenance:");
      if (var0.insertCard("1234567890123456") && var0.enterPin("1234")) {
         var0.checkBalance();
         var0.ejectCard();
      }

      System.out.println("✓ Maintenance features demonstrated");
   }
}
