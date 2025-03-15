#!/bin/bash

# Set the log directory
LOG_DIR="/fluentd/log"

# Cleanup aggregated logs older than 30 days
find ${LOG_DIR}/aggregated -type f -mtime +30 -delete

# Cleanup error logs older than 7 days
find ${LOG_DIR}/error -type f -mtime +7 -delete

# Cleanup rate limited logs older than 3 days
find ${LOG_DIR}/rate_limited -type f -mtime +3 -delete

# Cleanup elasticsearch buffer files older than 1 day
find ${LOG_DIR}/elasticsearch -type f -mtime +1 -delete

# Cleanup position files that have no corresponding log files
for pos_file in ${LOG_DIR}/*.pos; do
    log_file=$(grep -o '".*"' "$pos_file" | tr -d '"')
    if [ ! -f "$log_file" ]; then
        rm "$pos_file"
    fi
done

# Log the cleanup
echo "[$(date)] Log cleanup completed" >> ${LOG_DIR}/cleanup.log 