#!/bin/bash

check_files() {
    for file in "$@"
    do
        if [ -f "$file" ]; then
            echo "$file exists"
        else
            echo "$file missing"
        fi
    done
}

check_files "$@"

