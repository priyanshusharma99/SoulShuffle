const cardService = require('../services/cardService');

/**
 * Controller to handle fetching the deck of active cards
 */
const getCards = async (req, res, next) => {
  try {
    const cards = await cardService.getActiveCards();
    res.status(200).json({
      status: 'success',
      data: { cards }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCards
};
