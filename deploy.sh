#!/bin/bash

# Update and install dependencies
echo "Updating system..."
apt update && apt upgrade -y
apt install -y curl git postgresql postgresql-contrib nginx

# Install Node.js 20
echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
echo "Installing PM2..."
npm install -g pm2

# Clone or Update the repository
echo "Cloning or updating repository..."
if [ -d "secops" ]; then
    cd secops
    git fetch --all
    git reset --hard origin/main
else
    git clone https://github.com/Imiroxx/secops.git
    cd secops
fi

# Install project dependencies
echo "Installing project dependencies..."
npm install --include=dev

# Setup Database
echo "Setting up PostgreSQL..."
sudo -u postgres psql -c "CREATE USER secops WITH PASSWORD 'secops_pass';"
sudo -u postgres psql -c "CREATE DATABASE secops_db OWNER secops;"

# Create .env file
echo "Creating .env file..."
cat <<EOT > .env
DATABASE_URL=postgresql://secops:secops_pass@localhost:5432/secops_db
SESSION_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOT

# Build the project
echo "Building the project..."
npm run build

# Start with PM2
echo "Starting application with PM2..."
pm2 delete secops-global || true
pm2 start dist/index.cjs --name secops-global

# Save PM2 state
pm2 save
pm2 startup

echo "Deployment complete! Site should be running on port 3000."
