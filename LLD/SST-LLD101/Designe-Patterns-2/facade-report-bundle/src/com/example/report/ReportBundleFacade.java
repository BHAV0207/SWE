package com.example.report;

import java.io.UncheckedIOException;
import java.nio.file.Path;
import java.util.Map;
import java.util.Objects;

public class ReportBundleFacade {
    private final JsonWriter jsonWriter;
    private final Zipper zipper;
    private final AuditLog auditLog;

    public ReportBundleFacade() {
        this.jsonWriter = new JsonWriter();
        this.zipper = new Zipper();
        this.auditLog = new AuditLog();
    }

    public Path export(Map<String, Object> data, Path outDir, String baseName) {
        Objects.requireNonNull(data, "data");
        Objects.requireNonNull(outDir, "outDir");
        Objects.requireNonNull(baseName, "baseName");

        try {
            Path jsonFile = jsonWriter.write(data, outDir, baseName);
            
            Path zipFile = outDir.resolve(baseName + ".zip");
            Path resultZip = zipper.zip(jsonFile, zipFile);
            
            auditLog.log("exported " + resultZip);
            
            return resultZip;
            
        } catch (UncheckedIOException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to export report bundle", e);
        }
    }
}