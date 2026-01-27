#!/bin/bash 

disk_usage=$(df -h / | awk ' NR==2 {print $5}' | sed 's/%//')
if [ "$disk_usage" -gt 80 ];then
	echo "disc usage critical"
else
	echo "disc usage normal"
fi

