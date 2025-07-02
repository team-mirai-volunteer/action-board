#!/bin/bash

# Create log file with timestamp
LOG_FILE="poster_data/auto-load-$(date +%Y%m%d-%H%M%S).log"

echo "Starting auto-load process at $(date)" | tee "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "Arguments: $@" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# Run the auto-load script with all passed arguments and pipe output to both console and log file
npm run poster:auto-load -- "$@" 2>&1 | tee -a "$LOG_FILE"

echo "========================================" | tee -a "$LOG_FILE"
echo "Completed at $(date)" | tee -a "$LOG_FILE"
echo "Log saved to: $LOG_FILE"