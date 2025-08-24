public class OrderService {
    private MessageClient email;
    private DataStorage storage;
    private TaxCalculator calc;

    OrderService(MessageClient email, DataStorage storage, TaxCalculator calc) {
        this.email = email;
        this.storage = storage;
        this.calc = calc;

    }

    void checkout(String customerEmail, double subtotal) {
        double total = calc.totalWithTax(subtotal);
        email.send(customerEmail, "Thanks! Your total is " + total);
        storage.storeData();
    }
}
