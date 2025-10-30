package com.example.orders;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class Order {
  private final String id;
  private final String customerEmail;
  private final List<OrderLine> lines;
  private final Integer discountPercent;
  private final boolean expedited;
  private final String notes;

  private Order(Builder builder) {
    this.id = builder.id;
    this.customerEmail = builder.customerEmail;
    // defensive copy
    this.lines = Collections.unmodifiableList(new ArrayList<>(builder.lines));
    this.discountPercent = builder.discountPercent;
    this.expedited = builder.expedited;
    this.notes = builder.notes;
  }

  public String getId() {
    return id;
  }

  public String getCustomerEmail() {
    return customerEmail;
  }

  public List<OrderLine> getLines() {
    return lines;
  }

  public Integer getDiscountPercent() {
    return discountPercent;
  }

  public boolean isExpedited() {
    return expedited;
  }

  public String getNotes() {
    return notes;
  }

  public int totalBeforeDiscount() {
    int sum = 0;
    for (OrderLine l : lines)
      sum += l.getQuantity() * l.getUnitPriceCents();
    return sum;
  }

  public int totalAfterDiscount() {
    int base = totalBeforeDiscount();
    if (discountPercent == null)
      return base;
    return base - (base * discountPercent / 100);
  }

  // ---- Builder nested class ----
  public static class Builder {
    private final String id;
    private final String customerEmail;
    private final List<OrderLine> lines = new ArrayList<>();

    private Integer discountPercent;
    private boolean expedited;
    private String notes;

    public Builder(String id, String customerEmail, OrderLine firstLine) {
      this.id = id;
      this.customerEmail = customerEmail;
      if (firstLine != null)
        this.lines.add(firstLine);
    }

    public Builder addLine(OrderLine line) {
      if (line != null)
        lines.add(line);
      return this;
    }

    public Builder discountPercent(Integer d) {
      this.discountPercent = d;
      return this;
    }

    public Builder expedited(boolean e) {
      this.expedited = e;
      return this;
    }

    public Builder notes(String n) {
      this.notes = n;
      return this;
    }

    public Order build() {
      // validations
      if (!PricingRules.isValidEmail(customerEmail))
        throw new IllegalArgumentException("Invalid email: " + customerEmail);
      if (!PricingRules.isValidDiscount(discountPercent))
        throw new IllegalArgumentException("Invalid discount: " + discountPercent);
      if (lines.isEmpty())
        throw new IllegalStateException("Order must have at least one line");

      return new Order(this);
    }
  }
}
