#!/bin/bash

# Snake and Ladder Game Build Script

echo "=== Snake and Ladder Game Build Script ==="

# Create output directory
mkdir -p build

# Compile main source files
echo "Compiling main source files..."
javac -d build -cp . src/main/java/com/snakeandladder/**/*.java

if [ $? -eq 0 ]; then
    echo "✓ Main source files compiled successfully"
else
    echo "✗ Compilation failed for main source files"
    exit 1
fi

# Compile test files
echo "Compiling test files..."
if [ -f "src/test/java/com/snakeandladder/GameTest.java" ]; then
    javac -d build -cp build src/test/java/com/snakeandladder/GameTest.java
    
    if [ $? -eq 0 ]; then
        echo "✓ Test files compiled successfully"
    else
        echo "✗ Compilation failed for test files"
        exit 1
    fi
else
    echo "⚠ No test files found, skipping test compilation"
fi

echo ""
echo "=== Build Complete ==="
echo "To run the game:"
echo "  java -cp build com.snakeandladder.GameRunner"
echo ""
echo "To run tests:"
echo "  java -cp build com.snakeandladder.GameTest"
