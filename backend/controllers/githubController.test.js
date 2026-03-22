const env = require('../config/env');
const simpleGit = require('simple-git');

jest.mock('simple-git');
jest.mock('../config/env', () => ({
    GITHUB_TOKEN: 'test_token',
    GITHUB_REPO_URL: 'github.com/test/repo',
}));

describe('githubController', () => {
    let mockGit;
    let req;
    let res;
    let syncAntigravity;

    beforeEach(() => {
        // Limpa todos os mocks antes de cada teste
        jest.clearAllMocks();

        // Configuração dos mocks para req e res
        req = {
            body: {}
        };

        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };

        // Configuração dos métodos mock para simple-git
        mockGit = {
            add: jest.fn().mockResolvedValue(true),
            commit: jest.fn().mockResolvedValue(true),
            push: jest.fn().mockResolvedValue(true)
        };

        // Redefine a instância que já foi criada na importação em githubController.js
        // A maneira correta de lidar com um módulo que exporta uma função que retorna um objeto
        // quando chamado diretamente no topo do arquivo é interceptar o resultado antes.
        // Já que ele já foi carregado, vamos fazer o require interceptar o retorno:
        simpleGit.mockReturnValue(mockGit);

        // Forçar um recarregamento do controller para pegar o novo retorno do simpleGit
        jest.isolateModules(() => {
            const controller = require('./githubController');
            syncAntigravity = controller.syncAntigravity;
        });
    });

    it('deve realizar commit e push com sucesso', async () => {
        req.body.message = 'Mensagem de teste';

        await syncAntigravity(req, res);

        expect(mockGit.add).toHaveBeenCalledWith('.');
        expect(mockGit.commit).toHaveBeenCalledWith('Mensagem de teste');

        const expectedRemoteRepo = `https://${env.GITHUB_TOKEN}@${env.GITHUB_REPO_URL}`;
        expect(mockGit.push).toHaveBeenCalledWith(expectedRemoteRepo, 'main');

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Sincronização realizada com sucesso',
            commit: 'Mensagem de teste'
        });
    });

    it('deve usar a mensagem padrão se nenhuma mensagem for fornecida', async () => {
        await syncAntigravity(req, res);

        expect(mockGit.commit).toHaveBeenCalled();
        const commitMessage = mockGit.commit.mock.calls[0][0];
        expect(commitMessage).toMatch(/^Auto-save: Antigravity sync -/);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Sincronização realizada com sucesso',
            commit: commitMessage
        });
    });

    it('deve retornar status 500 em caso de erro', async () => {
        const errorMessage = 'Erro simulado no git push';
        mockGit.push.mockRejectedValue(new Error(errorMessage));

        await syncAntigravity(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: 'Falha na sincronização',
            details: errorMessage
        });
    });
});
