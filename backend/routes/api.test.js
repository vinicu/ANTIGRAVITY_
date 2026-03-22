const express = require('express');
const request = require('supertest');

// Mocks
jest.mock('../middleware/auth', () => {
    return (req, res, next) => {
        if (req.headers.authorization === 'Bearer token-valido') {
            next();
        } else {
            res.status(401).json({ error: 'Não autorizado' });
        }
    };
});

jest.mock('../controllers/githubController', () => ({
    syncAntigravity: (req, res) => {
        res.json({ message: 'Sincronização iniciada' });
    }
}));

const apiRoutes = require('./api');

const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

describe('Rotas da API', () => {
    describe('GET /api/health', () => {
        it('deve retornar status ok e um timestamp', async () => {
            const response = await request(app).get('/api/health');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('timestamp');

            // Verifica se o timestamp é uma data válida no formato ISO
            const timestamp = new Date(response.body.timestamp);
            expect(timestamp.getTime()).not.toBeNaN();
        });
    });

    describe('POST /api/sync/antigravity', () => {
        it('deve retornar 401 se não houver token de autorização', async () => {
            const response = await request(app).post('/api/sync/antigravity');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Não autorizado');
        });

        it('deve acessar o controller se o token for válido', async () => {
            const response = await request(app)
                .post('/api/sync/antigravity')
                .set('Authorization', 'Bearer token-valido');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Sincronização iniciada');
        });
    });
});
