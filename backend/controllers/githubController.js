const simpleGit = require('simple-git');
const path = require('path');
const env = require('../config/env');

// Diretório raiz do projeto (onde está o .git)
const projectPath = path.resolve(__dirname, '../../');
const git = simpleGit(projectPath);

// Fila para sincronizar as operações git (evita concorrência e race conditions)
let gitQueue = Promise.resolve();

exports.syncAntigravity = async (req, res) => {
    // Adiciona a tarefa na fila para garantir execução atômica e aguarda sua conclusão
    await (gitQueue = gitQueue.then(async () => {
        try {
            const { message } = req.body;
            const commitMessage = message || `Auto-save: Antigravity sync - ${new Date().toISOString()}`;

            // Configura URL remota com token de forma segura (em memória para o comando push)
            const remoteRepo = `https://${env.GITHUB_TOKEN}@${env.GITHUB_REPO_URL}`;

            // Executa as operações git em sequência atômica
            await git.add('.');
            await git.commit(commitMessage);
            await git.push(remoteRepo, 'main');

            res.json({ success: true, message: 'Sincronização realizada com sucesso', commit: commitMessage });
        } catch (error) {
            console.error('Erro no sync:', error);
            res.status(500).json({ success: false, error: 'Falha na sincronização', details: error.message });
        }
    }).catch(error => {
        // Fallback para erros críticos na própria promessa da fila
        console.error('Erro crítico na fila do git:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Erro interno ao gerenciar fila de sincronização' });
        }
    }));
};
