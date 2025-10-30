package com.example.video;

import java.nio.file.Path;
import java.util.Objects;

public class VideoPipelineFacade {
    private final Decoder decoder;
    private final FilterEngine filterEngine;
    private final Encoder encoder;
    private final SharpenAdapter sharpenAdapter;

    public VideoPipelineFacade() {
        this.decoder = new Decoder();
        this.filterEngine = new FilterEngine();
        this.encoder = new Encoder();
        this.sharpenAdapter = new SharpenAdapter(new LegacySharpen());
    }

    public Path process(Path src, Path out, boolean gray, Double scale, Integer sharpenStrength) {
        Objects.requireNonNull(src, "src");
        Objects.requireNonNull(out, "out");

        try {
            System.out.println("Starting video processing pipeline...");
            
            System.out.println("Step 1: Decoding video from " + src);
            Frame[] frames = decoder.decode(src);
            System.out.println("Decoded " + frames.length + " frames");
            
            if (gray) {
                System.out.println("Step 2: Applying grayscale filter");
                frames = filterEngine.grayscale(frames);
            }
            
            if (scale != null) {
                System.out.println("Step 3: Scaling video by factor " + scale);
                frames = filterEngine.scale(frames, scale);
            }
            
            if (sharpenStrength != null) {
                System.out.println("Step 4: Applying sharpening with strength " + sharpenStrength);
                frames = sharpenAdapter.sharpen(frames, sharpenStrength);
            }
            
            System.out.println("Step 5: Encoding final video to " + out);
            Path result = encoder.encode(frames, out);
            System.out.println("Pipeline completed successfully!");
            
            return result;
            
        } catch (Exception e) {
            throw new RuntimeException("Video processing failed", e);
        }
    }

    public Path process(Path src, Path out) {
        return process(src, out, false, null, null);
    }
}