const simpleGit = require('simple-git');

jest.mock('simple-git');

// Mock dotenv para evitar problemas de carregamento no env.js
jest.mock('dotenv', () => ({
    config: jest.fn()
}));

// Mock env directly
jest.mock('../config/env', () => {
    return {
        GITHUB_TOKEN: 'token-secreto-super-confidencial',
        GITHUB_REPO_URL: 'github.com/usuario/repo.git',
        CLAUDE_API_KEY: 'test-key',
        JWT_SECRET: 'test-secret',
        PORT: 3000
    };
});

const env = require('../config/env');
const { syncAntigravity } = require('../controllers/githubController');

describe('githubController', () => {
    let mockGit;
    let req;
    let res;

    beforeEach(() => {
        mockGit = {
            add: jest.fn().mockResolvedValue(),
            commit: jest.fn().mockResolvedValue(),
            push: jest.fn()
        };
        // O controller chama simpleGit(projectPath) e guarda a instância,
        // então mockamos o construtor simpleGit para retornar mockGit
        simpleGit.mockReturnValue(mockGit);

        // Limpa o require cache para garantir que o controller pegue o simpleGit recém-mockado
        jest.isolateModules(() => {
            const { syncAntigravity: isolatedSync } = require('../controllers/githubController');
            this.syncAntigravity = isolatedSync;
        });

        req = {
            body: {
                message: 'Test commit'
            }
        };

        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };

        // Suppress console.error in tests
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('deve remover GITHUB_TOKEN da mensagem de erro e do console.error', async () => {
        const errorMsg = `Command failed: git push https://${env.GITHUB_TOKEN}@${env.GITHUB_REPO_URL} main`;
        mockGit.push.mockRejectedValue(new Error(errorMsg));

        await this.syncAntigravity(req, res);

        // Verifica console.error
        expect(console.error).toHaveBeenCalled();
        const consoleErrorMsg = console.error.mock.calls[0][1];
        expect(consoleErrorMsg).not.toContain(env.GITHUB_TOKEN);
        expect(consoleErrorMsg).toContain('***');

        // Verifica a resposta HTTP
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalled();
        const jsonResponse = res.json.mock.calls[0][0];
        expect(jsonResponse.details).not.toContain(env.GITHUB_TOKEN);
        expect(jsonResponse.details).toContain('***');
    });
});
