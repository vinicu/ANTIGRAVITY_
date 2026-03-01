const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const githubController = require('../controllers/githubController');

// Rota de Health Check (Pública)
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Rotas Protegidas
router.post('/sync/antigravity', authenticateToken, githubController.syncAntigravity);
router.get('/sync/status/:jobId', authenticateToken, githubController.getSyncStatus);

module.exports = router;
