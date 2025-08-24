public class Demo01 {
    public static void main(String[] args) {
        // new OrderService().checkout("a@shop.com", 100.0);
        TaxCalculator tax = new TaxCalculator(0.28);
        OrderService service = new OrderService(new MessageClient(), new DataStorage(), tax);
        service.checkout("jainbhav0207@gmail.com", 100.0);

    }
}
