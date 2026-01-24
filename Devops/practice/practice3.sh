#!/bin/bash

for ((i=1; i<=10; i++))
do
	if [ $((i%2)) -eq 0 ]; then
		echo "$i Even"
	else 
		echo "$i Odd"
	fi
done

		
