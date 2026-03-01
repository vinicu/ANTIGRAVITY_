const mockGit = {
    add: jest.fn().mockResolvedValue(),
    commit: jest.fn().mockResolvedValue(),
    push: jest.fn().mockResolvedValue()
};

jest.mock('simple-git', () => {
    return jest.fn(() => mockGit);
});

const { syncAntigravity } = require('../../controllers/githubController');

describe('githubController.syncAntigravity', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        mockReq = {
            body: {
                message: 'Test commit message'
            }
        };

        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };

        // Reset as implementações mockadas entre os testes
        mockGit.add.mockResolvedValue();
        mockGit.commit.mockResolvedValue();
        mockGit.push.mockResolvedValue();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve sincronizar com sucesso', async () => {
        await syncAntigravity(mockReq, mockRes);

        expect(mockGit.add).toHaveBeenCalledWith('.');
        expect(mockGit.commit).toHaveBeenCalledWith('Test commit message');
        expect(mockGit.push).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            message: 'Sincronização realizada com sucesso',
            commit: 'Test commit message'
        });
    });

    it('deve tratar erros de sincronização', async () => {
        const error = new Error('Falha no push do Git');
        mockGit.push.mockRejectedValue(error);

        // Captura o console.error para evitar ruído na saída do teste
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await syncAntigravity(mockReq, mockRes);

        expect(consoleSpy).toHaveBeenCalledWith('Erro no sync:', error);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: 'Falha na sincronização',
            details: 'Falha no push do Git'
        });

        consoleSpy.mockRestore();
    });
});
