#!/bin/bash

# Trade-Pro Development Server Startup Script
# Date: June 19, 2025

clear
echo "🚀 Trade-Pro CFD Trading Platform"
echo "================================="
echo "🎯 Starting your professional Trading Engine..."
echo ""
echo "📊 Features Ready:"
echo "   ✅ Multi-Asset CFD Trading (Forex, Stocks, Crypto, Indices, Commodities)"
echo "   ✅ Real-Time Position Tracking & P&L"
echo "   ✅ Advanced Risk Management (VaR, Margin Calls)"
echo "   ✅ Professional Trading Dashboard"
echo "   ✅ Enterprise Security (JWT, RLS)"
echo ""
echo "🌐 Server will start on: http://localhost:8080"
echo "📱 Simple Browser has been opened for you"
echo ""
echo "⏳ Starting development server..."
echo ""

# Start the development server
cd /workspaces/Trade-Pro
npm run dev:client
