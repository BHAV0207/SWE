package com.example.render;

public class App {
    public static void main(String[] args) {
        Renderer r = new Renderer();
        String testText = "Hello Flyweight! ".repeat(2000);
        
        System.out.println("Rendering text with " + testText.length() + " characters...");
        System.out.println("Cost=" + r.render(testText));
        System.out.println("Cached styles: " + TextStyleFactory.getCacheSize());
        
        // Demonstrate that styles are shared
        TextStyle style1 = TextStyleFactory.getTextStyle("Inter", 14, true);
        TextStyle style2 = TextStyleFactory.getTextStyle("Inter", 14, true);
        System.out.println("Style objects are same instance: " + (style1 == style2));
        
        // Show memory optimization
        System.out.println("\nMemory Optimization Demonstration:");
        System.out.println("Text length: " + testText.length() + " characters");
        System.out.println("Unique styles created: " + TextStyleFactory.getCacheSize());
        System.out.println("Memory saved: " + (testText.length() - TextStyleFactory.getCacheSize()) + " style objects");
    }
}