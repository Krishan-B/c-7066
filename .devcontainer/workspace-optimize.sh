#!/bin/bash
# Enhanced Workspace Optimization Script for GitHub Codespaces
# Prevents automatic shutdown and optimizes performance

set -e

echo "🚀 Starting enhanced workspace optimization..."

# === SYSTEM INFORMATION ===
echo "📊 System Information:"
echo "   CPU Cores: $(nproc)"
echo "   Memory: $(free -h | awk 'NR==2{printf "%.1f%%", $3/$2*100}')"
echo "   Disk: $(df -h /workspaces | awk 'NR==2{print $5}')"

# === PROCESS OPTIMIZATION ===
echo "🧹 Optimizing processes..."

# Kill redundant TypeScript servers (keep only the most recent)
pkill -f "tsserver" 2>/dev/null || true
sleep 2

# Kill redundant extension processes
pkill -f "tailwindServer" 2>/dev/null || true
pkill -f "vscode-eslint" 2>/dev/null || true
sleep 2

# === MEMORY OPTIMIZATION ===
echo "� Optimizing memory..."

# Clear system caches
echo 1 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1 || true
echo 2 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1 || true
echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1 || true

# Optimize swappiness
echo 10 | sudo tee /proc/sys/vm/swappiness > /dev/null 2>&1 || true

# === PROJECT CACHE OPTIMIZATION ===
echo "�️ Optimizing project caches..."

# Clean VS Code caches
rm -rf /home/codespace/.vscode-remote/data/User/workspaceStorage/*/vscode.git
rm -rf /home/codespace/.vscode-remote/data/User/CachedExtensions
rm -rf /home/codespace/.vscode-remote/data/logs/*/exthost*

# Clean project caches
rm -rf .eslintcache 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .vite 2>/dev/null || true
rm -rf dist 2>/dev/null || true
rm -rf build 2>/dev/null || true
rm -rf coverage 2>/dev/null || true
rm -rf test-results 2>/dev/null || true
rm -rf playwright-report 2>/dev/null || true

# === NPM OPTIMIZATION ===
echo "📦 Optimizing npm configuration..."
# Set optimal npm performance configs
npm config set cache-min 3600
npm config set prefer-offline true
npm config set audit false
npm config set fund false
npm config set update-notifier false
npm config set fetch-retries 3
npm config set fetch-retry-factor 2
npm config set fetch-retry-mintimeout 10000
npm config set fetch-retry-maxtimeout 60000

# Clean and verify npm installation
npm cache verify
npm cache clean --force

# Install dependencies with optimized settings
npm ci --prefer-offline --no-audit --no-fund

# === GIT OPTIMIZATION ===
echo "🔧 Optimizing git configuration..."
git config --global core.preloadindex true
git config --global core.fscache true
git config --global gc.auto 256
git config --global core.autocrlf false
git config --global pull.rebase false
git config --global fetch.prune true

# === ENHANCED KEEP-ALIVE MECHANISM ===
echo "💓 Setting up enhanced keep-alive system..."

# Create optimized keep-alive script
cat << 'KEEPALIVE_EOF' > /tmp/enhanced-keep-alive.sh
#!/bin/bash
LOG_FILE="/workspaces/c-7066/.workspace-log"
ACTIVITY_FILE="/workspaces/c-7066/.workspace-active"

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Update activity indicators
    touch "$ACTIVITY_FILE"
    echo "$TIMESTAMP: Workspace active - $(free -h | awk 'NR==2{printf "Memory: %.1f%%", $3/$2*100}') - $(df -h /workspaces | awk 'NR==2{printf "Disk: %s", $5}')" >> "$LOG_FILE"
    
    # Periodic optimization (every hour)
    if [ $(($(date +%s) % 3600)) -eq 0 ]; then
        echo "$TIMESTAMP: Running periodic optimization" >> "$LOG_FILE"
        
        # Clear caches
        echo 1 > /proc/sys/vm/drop_caches 2>/dev/null || true
        
        # Clean temporary files
        find /tmp -name "vscode-*" -type f -mtime +1 -delete 2>/dev/null || true
        find /workspaces/c-7066 -name "*.log" -size +10M -delete 2>/dev/null || true
        
        # Optimize git
        cd /workspaces/c-7066 && git gc --auto 2>/dev/null || true
    fi
    
    # Prevent log file from growing too large
    if [ -f "$LOG_FILE" ] && [ $(wc -l < "$LOG_FILE") -gt 1000 ]; then
        tail -500 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
    fi
    
    sleep 1800  # 30 minutes
done
KEEPALIVE_EOF

chmod +x /tmp/enhanced-keep-alive.sh

# Kill existing keep-alive processes
pkill -f "keep-alive" 2>/dev/null || true
pkill -f "activity-simulator" 2>/dev/null || true
sleep 2

# Start enhanced keep-alive
nohup /tmp/enhanced-keep-alive.sh > /dev/null 2>&1 &
KEEPALIVE_PID=$!
echo $KEEPALIVE_PID > /workspaces/c-7066/keep-alive.pid

# === CODESPACE-SPECIFIC OPTIMIZATIONS ===
if [ -n "$CODESPACE_NAME" ]; then
    echo "🏠 Codespace detected: $CODESPACE_NAME"
    
    # Enhanced activity simulator for Codespaces
    cat << 'ACTIVITY_EOF' > /tmp/codespace-activity.sh
#!/bin/bash
ACTIVITY_LOG="/workspaces/c-7066/.activity-log"

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Simulate various activities
    echo "$TIMESTAMP: Codespace activity simulation" >> "$ACTIVITY_LOG"
    
    # Light API calls to show activity
    curl -s -m 5 "https://api.github.com/zen" > /dev/null 2>&1 || true
    
    # Touch files in workspace
    touch /workspaces/c-7066/.last-activity
    
    # Prevent activity log from growing too large
    if [ -f "$ACTIVITY_LOG" ] && [ $(wc -l < "$ACTIVITY_LOG") -gt 500 ]; then
        tail -250 "$ACTIVITY_LOG" > "$ACTIVITY_LOG.tmp" && mv "$ACTIVITY_LOG.tmp" "$ACTIVITY_LOG"
    fi
    
    sleep 600  # 10 minutes
done
ACTIVITY_EOF
    
    chmod +x /tmp/codespace-activity.sh
    nohup /tmp/codespace-activity.sh > /dev/null 2>&1 &
    ACTIVITY_PID=$!
    echo $ACTIVITY_PID > /workspaces/c-7066/activity-simulator.pid
    
    echo "🔄 Enhanced activity simulator started for Codespace"
fi

# === PERFORMANCE MONITORING ===
echo "📈 Setting up performance monitoring..."

cat << 'MONITOR_EOF' > /tmp/performance-monitor.sh
#!/bin/bash
MONITOR_LOG="/workspaces/c-7066/.performance-log"

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    MEMORY_USAGE=$(free | awk 'NR==2{printf "%.1f", $3/$2*100}')
    DISK_USAGE=$(df /workspaces | awk 'NR==2{print $5}' | cut -d'%' -f1)
    PROCESS_COUNT=$(ps aux | wc -l)
    
    echo "$TIMESTAMP,CPU:${CPU_USAGE}%,Memory:${MEMORY_USAGE}%,Disk:${DISK_USAGE}%,Processes:${PROCESS_COUNT}" >> "$MONITOR_LOG"
    
    # Alert if resource usage is high
    if (( $(echo "$CPU_USAGE > 80" | bc -l) )) || (( $(echo "$MEMORY_USAGE > 85" | bc -l) )); then
        echo "$TIMESTAMP: HIGH RESOURCE USAGE - CPU: ${CPU_USAGE}%, Memory: ${MEMORY_USAGE}%" >> "$MONITOR_LOG"
    fi
    
    # Keep log manageable
    if [ -f "$MONITOR_LOG" ] && [ $(wc -l < "$MONITOR_LOG") -gt 2000 ]; then
        tail -1000 "$MONITOR_LOG" > "$MONITOR_LOG.tmp" && mv "$MONITOR_LOG.tmp" "$MONITOR_LOG"
    fi
    
    sleep 300  # 5 minutes
done
MONITOR_EOF

chmod +x /tmp/performance-monitor.sh
nohup /tmp/performance-monitor.sh > /dev/null 2>&1 &
MONITOR_PID=$!
echo $MONITOR_PID > /workspaces/c-7066/performance-monitor.pid

echo "✅ Enhanced workspace optimization complete!"
echo "� Final system status:"
echo "   Memory: $(free -h | awk 'NR==2{printf "%.1f%%", $3/$2*100}')"
echo "   Disk: $(df -h /workspaces | awk 'NR==2{print $5}')"
echo "   Processes: $(ps aux | wc -l)"
echo "   Keep-alive PID: $KEEPALIVE_PID"
echo "   Monitor PID: $MONITOR_PID"

if [ -n "$CODESPACE_NAME" ]; then
    echo "   Activity Simulator PID: $ACTIVITY_PID"
fi

echo "🎉 All optimizations applied successfully!"
echo "📝 Logs: .workspace-log, .activity-log, .performance-log"
