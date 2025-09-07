package com.example.imports;

import java.nio.file.Path;
import java.util.List;
import java.util.Objects;

public class CsvProfileImporter implements ProfileImporter {
    private final NaiveCsvReader csvReader;
    private final ProfileService profileService;

    public CsvProfileImporter(NaiveCsvReader csvReader, ProfileService profileService) {
        this.csvReader = Objects.requireNonNull(csvReader, "csvReader");
        this.profileService = Objects.requireNonNull(profileService, "profileService");
    }

    @Override
    public int importFrom(Path csvFile) {
        Objects.requireNonNull(csvFile, "csvFile");
        
        List<String[]> rows = csvReader.read(csvFile);
        int successCount = 0;
        
        for (String[] row : rows) {
            try {
                // Parse columns: id, email, displayName
                if (row.length < 3) {
                    System.out.println("Skipping row with insufficient columns: " + String.join(",", row));
                    continue;
                }
                
                String id = row[0].trim();
                String email = row[1].trim();
                String displayName = row[2].trim();
                
                // Validate: skip invalid rows (missing id/email or bad email)
                if (id.isEmpty() || email.isEmpty()) {
                    System.out.println("Skipping row with missing id or email: " + String.join(",", row));
                    continue;
                }
                
                if (!email.contains("@")) {
                    System.out.println("Skipping row with invalid email: " + String.join(",", row));
                    continue;
                }
                
                profileService.createProfile(id, email, displayName);
                successCount++;
                
            } catch (Exception e) {
                System.out.println("Error processing row " + String.join(",", row) + ": " + e.getMessage());
            }
        }
        
        return successCount;
    }
}