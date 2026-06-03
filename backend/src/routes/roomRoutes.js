const express = require('express');
const { createRoom, joinRoom, getActiveRoom, sendChallenge } = require('../controllers/roomController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.post('/create', createRoom);
router.post('/join', joinRoom);
router.post('/challenge', sendChallenge);
router.get('/active', getActiveRoom);

module.exports = router;
