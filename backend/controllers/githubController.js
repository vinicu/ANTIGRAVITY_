const simpleGit = require('simple-git');
const path = require('path');
const env = require('../config/env');

// Diretório raiz do projeto (onde está o .git)
const projectPath = path.resolve(__dirname, '../../');
const git = simpleGit(projectPath);

exports.syncAntigravity = async (req, res) => {
    try {
        const { message } = req.body;
        const commitMessage = message || `Auto-save: Antigravity sync - ${new Date().toISOString()}`;

        // Configura URL remota com token de forma segura (em memória para o comando push)
        // Nota: simple-git permite passar opções para o comando push
        const remoteRepo = `https://${env.GITHUB_TOKEN}@github.com/vinicu/ANTIGRAVITY_.git`;

        await git.add('.');
        await git.commit(commitMessage);

        // Push para o remote configurado com o token
        await git.push(remoteRepo, 'main');

        res.json({ success: true, message: 'Sincronização realizada com sucesso', commit: commitMessage });
    } catch (error) {
        console.error('Erro no sync:', error);
        res.status(500).json({ success: false, error: 'Falha na sincronização', details: error.message });
    }
};
