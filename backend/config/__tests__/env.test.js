describe('Configuração de Variáveis de Ambiente (env.js)', () => {
    let originalEnv;
    let originalExit;
    let originalError;

    beforeEach(() => {
        // Guarda os valores originais de process.env, process.exit e console.error
        originalEnv = process.env;
        originalExit = process.exit;
        originalError = console.error;

        // Limpa o cache do require para reavaliar o módulo env.js a cada teste
        jest.resetModules();

        // Cria uma cópia do ambiente original para modificação
        process.env = { ...originalEnv };

        // Substitui process.exit e console.error por funções simuladas (mocks)
        process.exit = jest.fn();
        console.error = jest.fn();

        // Simula a dependência 'dotenv' para não depender do arquivo real '.env' no teste
        jest.mock('dotenv', () => ({
            config: jest.fn()
        }));
    });

    afterEach(() => {
        // Restaura os valores originais após cada teste
        process.env = originalEnv;
        process.exit = originalExit;
        console.error = originalError;
    });

    it('deve exportar as variáveis corretamente quando todas as variáveis obrigatórias estão presentes', () => {
        process.env.GITHUB_TOKEN = 'token-fake';
        process.env.JWT_SECRET = 'secret-fake';
        process.env.GITHUB_REPO_URL = 'url-fake';

        process.env.CLAUDE_API_KEY = 'claude-fake';
        process.env.DATABASE_URL = 'db-fake';
        process.env.PORT = '4000';

        const env = require('../env');

        expect(process.exit).not.toHaveBeenCalled();
        expect(console.error).not.toHaveBeenCalled();

        expect(env.GITHUB_TOKEN).toBe('token-fake');
        expect(env.JWT_SECRET).toBe('secret-fake');
        expect(env.GITHUB_REPO_URL).toBe('url-fake');
        expect(env.CLAUDE_API_KEY).toBe('claude-fake');
        expect(env.DATABASE_URL).toBe('db-fake');
        expect(env.PORT).toBe('4000');
    });

    it('deve usar a porta 3000 como padrão se process.env.PORT não estiver definido', () => {
        process.env.GITHUB_TOKEN = 'token-fake';
        process.env.JWT_SECRET = 'secret-fake';
        process.env.GITHUB_REPO_URL = 'url-fake';
        delete process.env.PORT;

        const env = require('../env');

        expect(env.PORT).toBe(3000);
    });

    it('deve chamar process.exit(1) e console.error quando faltarem variáveis obrigatórias', () => {
        delete process.env.GITHUB_TOKEN;
        process.env.JWT_SECRET = 'secret-fake';
        process.env.GITHUB_REPO_URL = 'url-fake';

        require('../env');

        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('GITHUB_TOKEN'));
        expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('deve reportar múltiplas variáveis de ambiente faltando', () => {
        delete process.env.GITHUB_TOKEN;
        delete process.env.JWT_SECRET;
        process.env.GITHUB_REPO_URL = 'url-fake';

        require('../env');

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('GITHUB_TOKEN, JWT_SECRET')
        );
        expect(process.exit).toHaveBeenCalledWith(1);
    });
});
