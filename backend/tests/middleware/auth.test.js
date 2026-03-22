const jwt = require('jsonwebtoken');
const authenticateToken = require('../../middleware/auth');

jest.mock('jsonwebtoken');
jest.mock('../../config/env', () => ({
    JWT_SECRET: 'test_secret'
}));

describe('Auth Middleware', () => {
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

    it('deve retornar 401 se nenhum token for fornecido', () => {
        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token de autenticação não fornecido' });
        expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar 403 se o token for inválido', () => {
        req.headers['authorization'] = 'Bearer invalid_token';

        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(new Error('Invalid token'), null);
        });

        authenticateToken(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('invalid_token', 'test_secret', expect.any(Function));
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido ou expirado' });
        expect(next).not.toHaveBeenCalled();
    });

    it('deve chamar next() e definir req.user se o token for válido', () => {
        req.headers['authorization'] = 'Bearer valid_token';
        const mockUser = { id: 1, name: 'Test User' };

        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, mockUser);
        });

        authenticateToken(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('valid_token', 'test_secret', expect.any(Function));
        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
});
