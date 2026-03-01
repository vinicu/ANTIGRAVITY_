const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');

// Define the missing environment variables to load env
process.env.GITHUB_TOKEN = "dummy_token";
process.env.JWT_SECRET = "supersecret";
process.env.GITHUB_REPO_URL = "dummy_url";

const mockReq = (token) => ({
    headers: {
        authorization: token ? `Bearer ${token}` : undefined
    }
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const mockNext = () => {};

async function runTests() {
    console.log("Iniciando testes de JWT...");

    // Teste 1: Token válido com HS256
    const validToken = jwt.sign({ user: 'test' }, process.env.JWT_SECRET, { algorithm: 'HS256' });
    let res1 = mockRes();
    let req1 = mockReq(validToken);

    auth(req1, res1, () => {
        if (req1.user && req1.user.user === 'test') {
            console.log("✅ Teste 1 Passou: Token válido aceito.");
        } else {
            console.error("❌ Teste 1 Falhou: Usuário não configurado no request.");
        }
    });

    if (res1.statusCode) {
        console.error(`❌ Teste 1 Falhou: Resposta enviada com erro - ${res1.statusCode}`, res1.data);
    }

    // Teste 2: Token assinado com outro algoritmo (ex: HS512)
    const invalidToken = jwt.sign({ user: 'test' }, process.env.JWT_SECRET, { algorithm: 'HS512' });
    let res2 = mockRes();
    let req2 = mockReq(invalidToken);

    auth(req2, res2, () => {
        console.error("❌ Teste 2 Falhou: Token com algoritmo inválido não foi bloqueado!");
    });

    if (res2.statusCode === 403 && res2.data.error === 'Token inválido ou expirado') {
        console.log("✅ Teste 2 Passou: Token com algoritmo HS512 bloqueado.");
    } else {
        console.error("❌ Teste 2 Falhou: Resposta inesperada -", res2.statusCode, res2.data);
    }

    // Teste 3: Sem token
    let res3 = mockRes();
    let req3 = mockReq(null);

    auth(req3, res3, () => {
         console.error("❌ Teste 3 Falhou: Requisição sem token deveria ser bloqueada!");
    });

    if (res3.statusCode === 401 && res3.data.error === 'Token de autenticação não fornecido') {
        console.log("✅ Teste 3 Passou: Ausência de token bloqueada.");
    } else {
        console.error("❌ Teste 3 Falhou: Resposta inesperada -", res3.statusCode, res3.data);
    }
}

runTests().catch(console.error);
