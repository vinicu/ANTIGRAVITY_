# Garante que o remote seja SSH
git remote set-url origin git@github.com:vinicu/ANTIGRAVITY_.git

git add .
git commit -m "Auto-save: Antigravity sync - $(date '+%Y-%m-%d %H:%M:%S')" || echo "Nada para commitar"

# Push usando a chave SSH específica
GIT_SSH_COMMAND="ssh -i ~/.ssh/antigravity -o IdentitiesOnly=yes" git push origin main

echo "✓ Antigravity sincronizado com GitHub via SSH"


