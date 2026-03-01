const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth');

jest.mock('jsonwebtoken');
jest.mock('../config/env', () => ({
    JWT_SECRET: 'test_secret'
}));

describe('Middleware de Autenticação (authenticateToken)', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('deve retornar 401 se o token não for fornecido', () => {
        authenticateToken(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token de autenticação não fornecido' });
        expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar 403 se o token for inválido', () => {
        req.headers['authorization'] = 'Bearer token_invalido';
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(new Error('Token inválido'), null);
        });

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido ou expirado' });
        expect(next).not.toHaveBeenCalled();
    });

    it('deve chamar next e definir req.user se o token for válido', () => {
        req.headers['authorization'] = 'Bearer token_valido';
        const mockUser = { id: 1, name: 'User' };

        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, mockUser);
        });

        authenticateToken(req, res, next);

        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});
