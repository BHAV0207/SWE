package com.example.report;

import java.nio.file.Path;
import java.util.Map;

public class App {
    public static void main(String[] args) {
        Map<String, Object> data = Map.of("name", "Quarterly", "period", "Q3-2025", "revenue", 1250000);
        
        // Use the facade to replace all the direct subsystem calls
        ReportBundleFacade facade = new ReportBundleFacade();
        Path zip = facade.export(data, Path.of("out"), "report");
        
        System.out.println("DONE " + zip);
        System.out.println("Report bundle exported successfully!");
        System.out.println("Check audit.log for export confirmation.");
    }
}