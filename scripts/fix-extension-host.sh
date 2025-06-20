#!/bin/bash

set -eo pipefail
trap cleanup SIGINT SIGTERM EXIT

# Configuration
MEMORY_THRESHOLD=1024  # MB
CPU_THRESHOLD=80       # Percentage
LOG_FILE="${HOME}/.vscode-server/data/logs/extension-host-monitor.log"
METRICS_FILE="${HOME}/.vscode-server/data/logs/extension-metrics.json"
MAX_RESTART_ATTEMPTS=3
RESTART_COOLDOWN=300   # 5 minutes

# Initialize
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"
touch "$METRICS_FILE"

# Logging function
log() {
    local level=$1
    shift
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*"
    echo "$message" | tee -a "$LOG_FILE"
}

# Function to check if process is running
check_process() {
    pgrep -f "$1" >/dev/null
    return $?
}

# Function to get extension list
get_extensions() {
    local extensions_dir="${HOME}/.vscode-server/extensions"
    if [ -d "$extensions_dir" ]; then
        find "$extensions_dir" -maxdepth 1 -type d -exec basename {} \; | grep -v '^extensions$'
    fi
}

# Function to analyze extensions
analyze_extensions() {
    log "INFO" "Analyzing installed extensions..."
    local total_size=0
    
    while IFS= read -r ext; do
        local size=$(du -sm "${HOME}/.vscode-server/extensions/${ext}" 2>/dev/null | cut -f1)
        if [ -n "$size" ] && [ "$size" -gt 100 ]; then
            log "WARN" "Large extension detected: ${ext} (${size}MB)"
        fi
        total_size=$((total_size + size))
    done < <(get_extensions)
    
    log "INFO" "Total extensions size: ${total_size}MB"
}

# Function to monitor extension host
monitor_extension_host() {
    local pid=$(pgrep -f "extensionHost")
    if [ -n "$pid" ]; then
        # Memory monitoring
        local mem=$(ps -o rss= -p "$pid" | awk '{print $1/1024}')
        local cpu=$(ps -o %cpu= -p "$pid" | awk '{print int($1)}')
        
        # Record metrics
        local timestamp=$(date +%s)
        echo "{\"timestamp\":$timestamp,\"memory\":$mem,\"cpu\":$cpu}" >> "$METRICS_FILE"
        
        log "INFO" "Extension Host Memory: ${mem}MB, CPU: ${cpu}%"
        
        local issues=0
        if [ $(echo "$mem > $MEMORY_THRESHOLD" | bc -l) -eq 1 ]; then
            log "WARN" "High memory usage detected: ${mem}MB"
            issues=$((issues + 1))
        fi
        
        if [ "$cpu" -gt "$CPU_THRESHOLD" ]; then
            log "WARN" "High CPU usage detected: ${cpu}%"
            issues=$((issues + 1))
        fi
        
        return $issues
    fi
    return 1
}

# Cleanup function
cleanup() {
    log "INFO" "Shutting down extension host monitor..."
    # Save final metrics
    if [ -f "$METRICS_FILE" ]; then
        local avg_mem=$(awk -F'[:,]' '{sum+=$4} END {print sum/NR}' "$METRICS_FILE")
        local avg_cpu=$(awk -F'[:,]' '{sum+=$6} END {print sum/NR}' "$METRICS_FILE")
        log "INFO" "Average memory usage: ${avg_mem}MB"
        log "INFO" "Average CPU usage: ${avg_cpu}%"
    fi
    exit 0
}

# Function to optimize VS Code settings
optimize_settings() {
    log "INFO" "Optimizing VS Code settings..."
    
    # Backup current settings
    if [ -f ~/.vscode-server/data/Machine/settings.json ]; then
        cp ~/.vscode-server/data/Machine/settings.json ~/.vscode-server/data/Machine/settings.json.backup
        log "INFO" "Settings backup created"
    fi
    
    # Create optimized settings
    mkdir -p ~/.vscode-server/data/Machine/
    cat > ~/.vscode-server/data/Machine/settings.json << EOL
{
    "extensions.autoUpdate": false,
    "extensions.ignoreRecommendations": true,
    "extensions.autoCheckUpdates": false,
    "workbench.enableExperiments": false,
    "telemetry.telemetryLevel": "off",
    "files.watcherExclude": {
        "**/.git/objects/**": true,
        "**/.git/subtree-cache/**": true,
        "**/node_modules/**": true,
        "**/dist/**": true,
        "coverage/**": true
    },
    "search.exclude": {
        "**/node_modules": true,
        "**/dist": true,
        "coverage": true
    }
}
EOL

# Initialize metrics
echo "{}" > "$METRICS_FILE"

# Clear caches and analyze extensions
log "INFO" "🧹 Clearing extension caches..."
rm -rf ~/.vscode-server/data/User/workspaceStorage/* 2>/dev/null
rm -rf ~/.vscode-server/data/logs/* 2>/dev/null
rm -rf ~/.vscode-server/extensions/.obsolete 2>/dev/null

# Analyze extensions for potential issues
analyze_extensions

# Apply optimized settings
optimize_settings

# Initialize counters
restart_count=0
last_restart=0

log "INFO" "📊 Starting Extension Host Monitor..."
while true; do
    current_time=$(date +%s)
    
    if ! check_process "extensionHost"; then
        log "ERROR" "❌ Extension Host not running!"
        
        # Check restart cooldown
        if [ $((current_time - last_restart)) -lt "$RESTART_COOLDOWN" ]; then
            if [ "$restart_count" -ge "$MAX_RESTART_ATTEMPTS" ]; then
                log "ERROR" "⚠️ Maximum restart attempts reached. Manual intervention required."
                log "INFO" "Please try:"
                log "INFO" "1. Running 'code --disable-extensions' to start VS Code without extensions"
                log "INFO" "2. Removing problematic extensions identified in the log"
                log "INFO" "3. Clearing VS Code data: rm -rf ~/.vscode-server"
                exit 1
            fi
        else
            # Reset counter if cooldown period has passed
            restart_count=0
        fi
        
        log "INFO" "🔄 Attempting recovery (Attempt $((restart_count + 1))/${MAX_RESTART_ATTEMPTS})..."
        
        # Kill any stuck processes
        pkill -f "extensionHost"
        sleep 2
        
        # Record restart attempt
        restart_count=$((restart_count + 1))
        last_restart=$current_time
        
        # Check if recovery was successful
        if check_process "extensionHost"; then
            log "INFO" "✅ Extension Host recovered successfully!"
        else
            log "ERROR" "⚠️ Recovery failed."
            continue
        fi
    else
        # Monitor resource usage
        if ! monitor_extension_host; then
            log "WARN" "Resource usage is high - monitoring more frequently"
            sleep 30
        else
            sleep 60
        fi
    fi
done
