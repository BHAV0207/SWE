#!/bin/bash

echo "insert a number"
read number

if [ $number -eq 0 ]; then
	echo "zero"
elif [ $number -lt 0  ]; then
	echo "negative"
else
	echo "positive"
fi


