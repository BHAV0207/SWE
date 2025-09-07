package com.example.video;

import java.util.Objects;

public class SharpenAdapter {
    private final LegacySharpen legacySharpen;

    public SharpenAdapter(LegacySharpen legacySharpen) {
        this.legacySharpen = Objects.requireNonNull(legacySharpen, "legacySharpen");
    }

    public Frame[] sharpen(Frame[] frames, int strength) {
        Objects.requireNonNull(frames, "frames");
        
        String frameHandle = convertFramesToHandle(frames);
        
        String sharpenedHandle = legacySharpen.applySharpen(frameHandle, strength);
        
        return convertHandleToFrames(sharpenedHandle, frames);
    }

    private String convertFramesToHandle(Frame[] frames) {
        StringBuilder handle = new StringBuilder("FRAMES:");
        for (Frame frame : frames) {
            handle.append(frame.w).append("x").append(frame.h).append(",");
        }
        return handle.toString();
    }

    private Frame[] convertHandleToFrames(String handle, Frame[] originalFrames) {
        Frame[] result = new Frame[originalFrames.length];
        for (int i = 0; i < originalFrames.length; i++) {
            result[i] = new Frame(originalFrames[i].w, originalFrames[i].h);
        }
        return result;
    }
}

    
