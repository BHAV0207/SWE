#!/bin/bash

echo "Enter log file name"
read name

if [ -f "$name" ]; then
    echo "Total lines:"
    wc -l < "$name"

    echo "ERROR count:"
    grep "ERROR" "$name" | wc -l

    echo "WARN count:"
    grep "WARN" "$name" | wc -l
else
    echo "Log file not found"
fi

