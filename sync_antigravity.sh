#!/bin/bash
# Script seguro para sincronização automática do Antigravity

cd /Users/viniciusouza/.gemini/antigravity/scratch

git config user.email "viniciusouza@gmail.com"
git config user.name "vinicu"

# Carrega variáveis de ambiente (Token)
if [ -f .env ]; then
    source .env
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo "Erro: GITHUB_TOKEN não encontrado no .env"
    exit 1
fi

git add .
git commit -m "Auto-save: Antigravity sync - $(date '+%Y-%m-%d %H:%M:%S')"

# Usa o token para autenticar sem salvar no config global
git push https://vinicu:${GITHUB_TOKEN}@github.com/vinicu/ANTIGRAVITY_.git main

echo "✓ Antigravity sincronizado com GitHub com segurança"

