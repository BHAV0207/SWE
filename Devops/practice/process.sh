#!/bin/bash

echo "write the process name"
read name

process_running=$(ps aux | grep "$name" | grep -v grep)

if [ -n "$process_running" ]; then
	echo "Process is running"
	echo "$process_running" | awk '{print $2}'
else 
	echo "Process not Running"
fi
