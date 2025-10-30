public class Computer {
  private final String CPU;
  private final int RAM;
  private final int Storage;
  private final String GPU;
  private final String keyboard;
  private final String mouse;

  private Computer(ComputerBuilder builder) {
    this.CPU = builder.CPU;
    this.RAM = builder.RAM;
    this.Storage = builder.Storage;
    this.GPU = builder.GPU;
    this.keyboard = builder.keyboard;
    this.mouse = builder.mouse;
  }

  static class ComputerBuilder {
    private final String CPU;
    private final int RAM;
    private int Storage;
    private String GPU;
    private String keyboard;
    private String mouse;

    ComputerBuilder(String CPU, int RAM) {
      this.CPU = CPU;
      this.RAM = RAM;
    }

    public ComputerBuilder storage(int Storage) {
      this.Storage = Storage;
      return this;
    }

    public ComputerBuilder Gpu(String GPU) {
      this.GPU = GPU;
      return this;
    }

    public ComputerBuilder keyboard(String keyboard) {
      this.keyboard = keyboard;
      return this;
    }

    public ComputerBuilder mouse(String mouse) {
      this.mouse = mouse;
      return this;
    }

    public Computer build() {
      return new Computer(this);
    }
  }
}

class App {
  public static void main(String[] args) {
    Computer gamingPC = new Computer.ComputerBuilder("Intel i9", 32)
        .storage(1000)
        .Gpu("NVIDIA RTX 4090")
        .keyboard("Mechanical")
        .mouse("Gaming Mouse")
        .build();

    Computer officePC = new Computer.ComputerBuilder("Intel i5", 16)
        .build(); // minimal, no optional fields

  }
}
