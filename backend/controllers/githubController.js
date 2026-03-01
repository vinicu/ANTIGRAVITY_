const simpleGit = require('simple-git');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');

// Diretório raiz do projeto (onde está o .git)
const projectPath = path.resolve(__dirname, '../../');
const git = simpleGit(projectPath);

// Armazena o status dos jobs de sincronização em memória
const syncJobs = new Map();

exports.syncAntigravity = async (req, res) => {
    try {
        const { message } = req.body;
        const commitMessage = message || `Auto-save: Antigravity sync - ${new Date().toISOString()}`;
        const jobId = crypto.randomUUID();

        // Inicializa o job como pendente
        syncJobs.set(jobId, { status: 'pending', commitMessage, error: null });

        // Retorna a resposta imediatamente sem bloquear a thread
        res.status(202).json({
            success: true,
            message: 'Sincronização iniciada em background',
            jobId
        });

        // Configura URL remota com token de forma segura (em memória para o comando push)
        // Nota: simple-git permite passar opções para o comando push
        const remoteRepo = `https://${env.GITHUB_TOKEN}@${env.GITHUB_REPO_URL}`;

        // Executa as operações do git em background (fire and forget assíncrono)
        (async () => {
            try {
                await git.add('.');
                await git.commit(commitMessage);
                await git.push(remoteRepo, 'main');

                // Atualiza o status para completado
                syncJobs.set(jobId, { status: 'completed', commitMessage, error: null });
            } catch (error) {
                console.error(`Erro no job de sync ${jobId}:`, error);
                syncJobs.set(jobId, { status: 'error', commitMessage, error: error.message });
            } finally {
                // Limpeza do job após 1 hora para evitar memory leak
                setTimeout(() => {
                    syncJobs.delete(jobId);
                }, 3600000); // 1 hora
            }
        })();

    } catch (error) {
        console.error('Erro ao iniciar o sync:', error);
        res.status(500).json({ success: false, error: 'Falha ao iniciar sincronização', details: error.message });
    }
};

exports.getSyncStatus = (req, res) => {
    const { jobId } = req.params;
    const job = syncJobs.get(jobId);

    if (!job) {
        return res.status(404).json({ success: false, error: 'Job não encontrado' });
    }

    res.json({ success: true, jobId, ...job });
};
