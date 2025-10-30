package com.example.video;
import java.nio.file.Path;

public class App {
    public static void main(String[] args) {
        VideoPipelineFacade pipeline = new VideoPipelineFacade();
        
        System.out.println("=== Video Processing with All Filters ===");
        Path out = pipeline.process(
            Path.of("in.mp4"),
            Path.of("out.mp4"),
            true,
            0.5,
            3
        );
        
        System.out.println("Wrote " + out);
        
        System.out.println("\n=== Simple Video Processing ===");
        Path simpleOut = pipeline.process(Path.of("in.mp4"), Path.of("simple_out.mp4"));
        System.out.println("Simple processing wrote " + simpleOut);
        
        System.out.println("\n=== Selective Processing ===");
        Path selectiveOut = pipeline.process(
            Path.of("in.mp4"),
            Path.of("selective_out.mp4"),
            false,
            0.75,
            5
        );
        System.out.println("Selective processing wrote " + selectiveOut);
    }
}
