#!/bin/bash

echo "enter file name"

read name

if [ -f $name ]; then 
	wc -l $name grep "ERROR"
	wc -l $name grep "WARN"
else
	echo "log file does not exist"
fi
