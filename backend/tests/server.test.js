const request = require('supertest');

// Mocks devem vir antes de requerer a aplicação
jest.mock('../config/env', () => ({
    PORT: 3000,
    GITHUB_TOKEN: 'fake-token',
    JWT_SECRET: 'fake-secret',
    GITHUB_REPO_URL: 'fake-url'
}));

// Mock do middleware de rotas ou controler pode ser feito se necessário
// Mas vamos apenas adicionar uma rota simulando erro global antes de app.use('/api', ...) para forçar erro,
// ou simplesmente podemos mockar o apiRoutes para jogar erro em alguma chamada.
// Neste caso, a melhor maneira sem mexer no server.js é mockar um dos middlewares ou rotas que ele importa.
jest.mock('../routes/api', () => {
    const express = require('express');
    const router = express.Router();

    router.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date() });
    });

    router.get('/force-error', (req, res, next) => {
        next(new Error('Erro forçado para teste'));
    });

    return router;
});

const app = require('../server');

describe('Server & Error Handler', () => {
    let originalConsoleError;

    beforeAll(() => {
        // Suprimir o console.error do handler de erro para manter o log de teste limpo
        originalConsoleError = console.error;
        console.error = jest.fn();
    });

    afterAll(() => {
        // Restaurar o console.error original
        console.error = originalConsoleError;
    });

    it('deve responder à rota de health check mockada com 200', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
    });

    it('deve usar o global error handler quando um middleware lança um erro e retornar 500', async () => {
        const response = await request(app).get('/api/force-error');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Erro interno no servidor' });
        expect(console.error).toHaveBeenCalled();
    });
});
