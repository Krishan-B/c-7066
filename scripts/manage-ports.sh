#!/bin/bash

# Port Forwarding Management Script
echo "🔌 Managing VS Code Port Forwarding..."
echo ""

# Check current forwarded ports
echo "📊 Current Port Status:"
echo "   - Main Dev Server (8080): Trade-Pro application"
echo "   - Vite Dev (5173): Development build"
echo "   - Vite Preview (4173): Production preview"
echo "   - Supabase Studio (54323): Database management"
echo "   - Node Debug (9229): Debugging"
echo ""

# Display port forwarding settings
echo "⚙️  Port Forwarding Configuration Applied:"
echo "   ✅ Disabled automatic port forwarding"
echo "   ✅ Set to process-based detection"
echo "   ✅ Configured specific port attributes"
echo "   ✅ Disabled forwarding on file open"
echo ""

# Instructions
echo "📋 Manual Port Management:"
echo "   1. Open VS Code Ports panel (View > Open View > Ports)"
echo "   2. Remove unnecessary forwarded ports"
echo "   3. Add specific ports only when needed"
echo "   4. Use port attributes for better control"
echo ""

echo "🎯 Essential Ports for Trade-Pro:"
echo "   - 8080: Main application (auto-opens browser)"
echo "   - 5173: Vite development server"
echo "   - 54323: Supabase Studio interface"
echo ""

echo "🚫 Ports to Avoid Auto-Forwarding:"
echo "   - 9229: Debug port (internal use)"
echo "   - 54321-54326: Supabase services (except Studio)"
echo "   - Random high ports: Usually temporary"
echo ""

echo "💡 Tips:"
echo "   - Use 'npm run dev' to start main server on 8080"
echo "   - Monitor Ports panel for unexpected forwards"
echo "   - Restart VS Code if port issues persist"
echo ""

echo "📖 For more details, see: docs/RENDERER_ERROR_FIXES.md section 10"
