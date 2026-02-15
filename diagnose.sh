#!/bin/bash
source .env
echo "Testando autenticacao com GitHub API..."
response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user)
echo "Status Code Auth: $response"

if [ "$response" == "200" ]; then
    echo "Token valido. Verificando acesso ao repositorio..."
    repo_status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/vinicu/ANTIGRAVITY_)
    echo "Status Code Repo: $repo_status"
    if [ "$repo_status" == "404" ]; then
        echo "Repositorio nao encontrado ou token sem acesso (privado?)."
    elif [ "$repo_status" == "403" ]; then
        echo "Acesso negado ao repositorio."
    elif [ "$repo_status" == "200" ]; then
        echo "Acesso ao repositorio OK via API."
    fi
else
    echo "Token invalido ou expirado."
fi
