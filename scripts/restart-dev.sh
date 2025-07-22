#!/bin/bash

# Script to restart the React Native development server
# This ensures that any IP address changes take effect

echo "🔄 Restarting React Native development server..."

# Kill any existing Metro bundler processes
pkill -f "expo start" || true
pkill -f "metro" || true

# Wait a moment for processes to clean up
sleep 2

# Clear Metro bundler cache and restart
echo "🧹 Clearing Metro cache..."
npx expo start --clear

echo "✅ Development server restarted with fresh cache"
