#!/bin/bash

echo "Please enter a file name"
read name 
if [ -f "$name" ]; then 
	wc -l "$name"
else 
	echo "File not found"
fi

