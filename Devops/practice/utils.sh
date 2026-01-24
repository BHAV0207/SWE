#!/bin/bash

create_timestamp_dir(){
	project_one="$1"
	timestamp=$(date +%Y%m%d-%H%M%S)
	dir_path="/tmp/${project_name}-${timestamp}"

	mkdir -p "$dir_path"
	echo "$dir_path"
}
