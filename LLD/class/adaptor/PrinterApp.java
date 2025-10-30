interface NewPrinter {
  void print();
}

class oldPrinter {
  void oldprinter() {
    System.out.println("old printer....");
  }
}

class Adaptor implements NewPrinter {
  private oldPrinter op;

  Adaptor() {
    this.op = new oldPrinter();
  }

  public void print() {
    op.oldprinter();
  }
}

public class PrinterApp {
  public static void main(String[] args) {
    NewPrinter np = new Adaptor();
    np.print();

  }
}
