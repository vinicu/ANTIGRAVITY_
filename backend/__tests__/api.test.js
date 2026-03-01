const http = require('http');
const app = require('../server');

describe('API Routes', () => {
    let server;
    let baseUrl;

    beforeAll((done) => {
        // Mock das dependências, para que os middlewares funcionem sem problemas
        process.env.GITHUB_TOKEN = 'mock-token';
        process.env.JWT_SECRET = 'mock-secret';
        process.env.GITHUB_REPO_URL = 'https://github.com/mock/repo';
        process.env.PORT = '0'; // Usa uma porta livre

        server = http.createServer(app);
        server.listen(0, () => {
            const port = server.address().port;
            baseUrl = `http://localhost:${port}`;
            done();
        });
    });

    afterAll((done) => {
        if (server) {
            server.close(done);
        } else {
            done();
        }
    });

    describe('GET /api/health', () => {
        it('deve retornar status HTTP 200', async () => {
            const response = await fetch(`${baseUrl}/api/health`);
            expect(response.status).toBe(200);
        });

        it('deve retornar a propriedade status com valor "ok"', async () => {
            const response = await fetch(`${baseUrl}/api/health`);
            const data = await response.json();
            expect(data).toHaveProperty('status', 'ok');
        });

        it('deve retornar a propriedade timestamp como uma string ISO de data válida', async () => {
            const response = await fetch(`${baseUrl}/api/health`);
            const data = await response.json();

            expect(data).toHaveProperty('timestamp');

            // O retorno é convertido para string ISO quando serializado no JSON
            const timestampStr = data.timestamp;
            expect(typeof timestampStr).toBe('string');

            const parsedDate = new Date(timestampStr);
            // Verifica se a string gera um timestamp válido
            expect(!isNaN(parsedDate.getTime())).toBe(true);
        });
    });
});
