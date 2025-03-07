#!/bin/bash

# Check if the current directory is 'backend'
if [ "$(basename "$PWD")" != "backend" ]; then
    echo "Changing directory to 'backend'."
    cd backend || { echo "Directory 'backend' not found!"; exit 1; }
fi

# Check if .env file exists
if [ -f ".env" ]; then
    echo ".env file already exists. Checking for SECRET_KEY..."
    if grep -q "SECRET_KEY=" .env; then
        echo "SECRET_KEY is already set in .env. No changes made."
        exit 0
    fi
fi

# Generate a random 24-byte hex string
SECRET_KEY=$(openssl rand -hex 24)

# Create the .env file
echo "SECRET_KEY=$SECRET_KEY" > .env

echo ".env file created with SECRET_KEY."