package com.example.render;

import java.util.HashMap;
import java.util.Map;

public class TextStyleFactory {
    private static final Map<String, TextStyle> styleCache = new HashMap<>();

    public static TextStyle getTextStyle(String font, int size, boolean bold) {
        String key = font + "|" + size + "|" + (bold ? "B" : "");
        
        return styleCache.computeIfAbsent(key, k -> new TextStyle(font, size, bold));
    }

    public static int getCacheSize() {
        return styleCache.size();
    }

    public static void clearCache() {
        styleCache.clear();
    }
}