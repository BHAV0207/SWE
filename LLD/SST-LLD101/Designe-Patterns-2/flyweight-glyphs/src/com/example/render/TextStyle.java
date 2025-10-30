package com.example.render;

import java.util.Objects;

public final class TextStyle {
    private final String font;
    private final int size;
    private final boolean bold;

    public TextStyle(String font, int size, boolean bold) {
        this.font = Objects.requireNonNull(font, "font");
        this.size = size;
        this.bold = bold;
    }

    public String getFont() {
        return font;
    }

    public int getSize() {
        return size;
    }

    public boolean isBold() {
        return bold;
    }

    public int getDrawCost() {
        return size + (bold ? 10 : 0);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TextStyle textStyle = (TextStyle) o;
        return size == textStyle.size && 
               bold == textStyle.bold && 
               Objects.equals(font, textStyle.font);
    }

    @Override
    public int hashCode() {
        return Objects.hash(font, size, bold);
    }

    @Override
    public String toString() {
        return "TextStyle{" +
                "font='" + font + '\'' +
                ", size=" + size +
                ", bold=" + bold +
                '}';
    }
}
