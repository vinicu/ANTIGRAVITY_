#!/bin/bash
# Script seguro para sincronização automática do Antigravity

cd /Users/viniciusouza/.gemini/antigravity/scratch

git config user.email "viniciusouza@gmail.com"
git config user.name "vinicu"

git add .
git commit -m "Auto-save: Antigravity sync - $(date '+%Y-%m-%d %H:%M:%S')"
# Usando a flag -i para especificar a chave SSH se necessário, ou assumindo config ~/.ssh/config
GIT_SSH_COMMAND="ssh -i ~/.ssh/antigravity" git push origin main

echo "✓ Antigravity sincronizado com GitHub"
