// Mock simple-git
const mockAdd = jest.fn();
const mockCommit = jest.fn();
const mockPush = jest.fn();

jest.mock('simple-git', () => {
    return jest.fn(() => ({
        add: mockAdd,
        commit: mockCommit,
        push: mockPush
    }));
});

// Mock environment variables
jest.mock('../../config/env', () => ({
    GITHUB_TOKEN: 'mock-token',
    GITHUB_REPO_URL: 'mock-repo.com/user/repo.git'
}));

const { syncAntigravity } = require('../../controllers/githubController');

describe('githubController.syncAntigravity', () => {
    let req;
    let res;

    beforeEach(() => {
        // Resetar todos os mocks antes de cada teste
        jest.clearAllMocks();

        req = {
            body: {}
        };

        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };

        // Mock do console.error para suprimir a saída durante os testes de erro
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('deve realizar a sincronização com sucesso utilizando uma mensagem personalizada', async () => {
        req.body.message = 'Fixing critical bug in production';

        mockAdd.mockResolvedValue();
        mockCommit.mockResolvedValue();
        mockPush.mockResolvedValue();

        await syncAntigravity(req, res);

        // Verifica se simple-git foi chamado
        expect(mockAdd).toHaveBeenCalledWith('.');
        expect(mockCommit).toHaveBeenCalledWith('Fixing critical bug in production');
        expect(mockPush).toHaveBeenCalledWith(
            'https://mock-token@mock-repo.com/user/repo.git',
            'main'
        );

        // Verifica a resposta de sucesso
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Sincronização realizada com sucesso',
            commit: 'Fixing critical bug in production'
        });
        expect(res.status).not.toHaveBeenCalled();
    });

    it('deve utilizar a mensagem padrão quando nenhuma mensagem for fornecida no req.body', async () => {
        // req.body.message é undefined
        mockAdd.mockResolvedValue();
        mockCommit.mockResolvedValue();
        mockPush.mockResolvedValue();

        // Travando a data para o teste não flutuar
        const mockDate = new Date('2023-10-10T10:00:00.000Z');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

        await syncAntigravity(req, res);

        const expectedCommitMessage = `Auto-save: Antigravity sync - ${mockDate.toISOString()}`;

        expect(mockAdd).toHaveBeenCalledWith('.');
        expect(mockCommit).toHaveBeenCalledWith(expectedCommitMessage);
        expect(mockPush).toHaveBeenCalledWith(
            'https://mock-token@mock-repo.com/user/repo.git',
            'main'
        );

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Sincronização realizada com sucesso',
            commit: expectedCommitMessage
        });
    });

    it('deve retornar status 500 se o push falhar', async () => {
        req.body.message = 'Deploy';

        mockAdd.mockResolvedValue();
        mockCommit.mockResolvedValue();

        const mockError = new Error('Git push failed remotely');
        mockPush.mockRejectedValue(mockError);

        await syncAntigravity(req, res);

        expect(console.error).toHaveBeenCalledWith('Erro no sync:', mockError);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: 'Falha na sincronização',
            details: 'Git push failed remotely'
        });
    });

    it('deve retornar status 500 se o commit falhar', async () => {
        mockAdd.mockResolvedValue();

        const mockError = new Error('Nada a commitar');
        mockCommit.mockRejectedValue(mockError);

        await syncAntigravity(req, res);

        expect(console.error).toHaveBeenCalledWith('Erro no sync:', mockError);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: 'Falha na sincronização',
            details: 'Nada a commitar'
        });

        // Push não deve ser chamado
        expect(mockPush).not.toHaveBeenCalled();
    });
});
