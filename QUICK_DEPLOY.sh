#!/bin/bash
# 🚀 Quick Deploy Script for Razorpay Payment Gate
# This script helps you deploy to Railway (backend) and Vercel (frontend)

set -e

echo "📦 Razorpay Payment Gate - Full Deployment Script"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v git &> /dev/null; then
    echo "❌ git not found. Please install git first."
    exit 1
fi
if ! command -v node &> /dev/null; then
    echo "❌ node not found. Please install Node.js first."
    exit 1
fi
if ! command -v python3 &> /dev/null; then
    echo "❌ python3 not found. Please install Python 3.8+ first."
    exit 1
fi
echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Step 1: Test locally
echo -e "${BLUE}Step 1: Testing locally...${NC}"
echo "Starting backend server in background..."
cd RazorPay
BIND_HOST=0.0.0.0 python -m merchant.server &
BACKEND_PID=$!
sleep 2

echo "Testing backend API..."
if curl -s http://localhost:8080/api/ledger > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API working${NC}"
else
    echo "❌ Backend API not responding"
    kill $BACKEND_PID
    exit 1
fi

# Test frontend build
echo "Building frontend..."
cd frontend
npm install > /dev/null 2>&1
npm run build > /dev/null 2>&1
echo -e "${GREEN}✓ Frontend builds successfully${NC}"

# Cleanup
cd ..
kill $BACKEND_PID
echo ""

# Step 2: Deploy instructions
echo -e "${BLUE}Step 2: Deployment Instructions${NC}"
echo ""
echo "📋 BACKEND (Python) - Deploy to Railway:"
echo "  1. Go to https://railway.app"
echo "  2. Sign in with GitHub"
echo "  3. Click 'New Project' → 'Deploy from GitHub'  "
echo "  4. Select this repository"
echo "  5. Set Root Directory: RazorPay"
echo "  6. Set Start Command: python -m merchant.server"
echo "  7. Add Environment Variables:"
echo "     PORT=8080"
echo "     BIND_HOST=0.0.0.0"
echo "     ALLOWED_ORIGINS=http://localhost:3000"
echo "  8. Deploy and copy the Railway URL"
echo ""

echo "📋 FRONTEND (Next.js) - Deploy to Vercel:"
echo "  1. Go to https://vercel.com"
echo "  2. Sign in with GitHub"
echo "  3. Click 'Import Project' and select this repo"
echo "  4. Set Root Directory: RazorPay/frontend"
echo "  5. Add Environment Variables:"
echo "     NEXT_PUBLIC_API_BASE_URL=<your-railway-url>"
echo "     NEXT_PUBLIC_MERCHANT_SERVER_URL=<your-railway-url>"
echo "     NEXT_PUBLIC_DEMO_MODE=true"
echo "  6. Deploy"
echo ""

echo -e "${YELLOW}💡 After deployment:${NC}"
echo "  - Update Railway ALLOWED_ORIGINS with your Vercel URL"
echo "  - Test at your Vercel URL"
echo "  - Login with: judge@razorpay.dev / demo"
echo ""

echo -e "${GREEN}🎉 Ready for deployment!${NC}"
echo ""
echo "Full guide: see DEPLOYMENT_GUIDE.md"
