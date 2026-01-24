#!/bin/bash

echo "Please provide the directory name"
read name
if [ -d "$name" ]; then 
	ls "$name"/*.txt
else 
	echo "Directory not found"
fi

