#!/bin/bash

# Package Inboxed for Server Deployment
echo "📦 Packaging Inboxed for deployment..."

# Create deployment directory
rm -rf deployment-package/inboxed
mkdir -p deployment-package/inboxed

# Copy essential files
echo "📁 Copying source files..."
cp -r src deployment-package/inboxed/
cp package.json deployment-package/inboxed/
cp package-lock.json deployment-package/inboxed/
cp tsconfig.json deployment-package/inboxed/
cp jest.config.js deployment-package/inboxed/

echo "🐳 Copying Docker files..."
cp Dockerfile deployment-package/inboxed/
cp docker-compose.yml deployment-package/inboxed/
cp docker-compose.prod.yml deployment-package/inboxed/

echo "⚙️ Copying configuration files..."
cp .env.production deployment-package/inboxed/
cp deploy.sh deployment-package/inboxed/
cp inboxed.service deployment-package/inboxed/

echo "🌐 Copying nginx configuration..."
cp -r nginx deployment-package/inboxed/

echo "📚 Copying documentation..."
cp README.md deployment-package/inboxed/
cp LICENSE deployment-package/inboxed/

# Make scripts executable
chmod +x deployment-package/inboxed/deploy.sh

# Create archive
echo "🗜️ Creating deployment archive..."
cd deployment-package
tar -czf inboxed-deployment.tar.gz inboxed/
cd ..

echo "✅ Deployment package created!"
echo "📦 File: deployment-package/inboxed-deployment.tar.gz"
echo ""
echo "🚀 Next steps:"
echo "1. Transfer the archive to your server:"
echo "   scp deployment-package/inboxed-deployment.tar.gz andrej@mini-server:/home/andrej/"
echo ""
echo "2. On your server, extract and deploy:"
echo "   tar -xzf inboxed-deployment.tar.gz"
echo "   cd inboxed"
echo "   ./deploy.sh"
