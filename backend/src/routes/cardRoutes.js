const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * @route GET /api/v1/cards
 * @desc Get all active cards from the master deck
 * @access Private
 */
router.get('/', authenticate, cardController.getCards);

module.exports = router;
