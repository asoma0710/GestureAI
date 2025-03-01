#!/bin/bash

# Set project name
PROJECT_NAME="GestureAI"

echo "🚀 Setting up the $PROJECT_NAME project structure..."

# Create Frontend Structure
mkdir -p frontend/{public,src/{components,pages,styles,utils},assets}
touch frontend/{package.json,index.html,tsconfig.json,vite.config.js}

# Create Backend Structure
mkdir -p backend/{src/{routes,controllers,services,models,middleware},scripts,logs}
touch backend/{requirements.txt,config.py,main.py}

# Create Database Structure
mkdir -p database/{migrations,sql,orm,seeders}
touch database/{db_config.py,setup.sql,schema.sql}

# Create Additional Folders
mkdir -p docs/mermaid_diagrams
mkdir scripts tests assets

# Create Documentation Files
touch docs/{API_reference.md,architecture.md,setup.md}
touch README.md

# Create Git Ignore
cat <<EOL > .gitignore
# Node Modules
node_modules/
dist/
# Python Bytecode
__pycache__/
*.pyc
# Virtual Environment
venv/
.env
# Logs
logs/
*.log
# Database
database/*.db
EOL

# Initialize Git if not already initialized
if [ ! -d ".git" ]; then
    git init
    git remote add origin https://github.com/asoma0710/GestureAI.git
fi

# Add and Commit to Git
git add .
git commit -m "Initial project setup with frontend, backend, and database structure"

# Push to GitHub
git branch -M main
git push -u origin main

echo "✅ GestureAI project structure created and pushed to GitHub!"

