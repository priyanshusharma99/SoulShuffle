const { supabase } = require('../db/supabase');

/**
 * Fetch all active card dares along with their category details
 */
const getActiveCards = async () => {
  const { data, error } = await supabase
    .from('cards')
    .select(`
      id,
      category_id,
      name,
      power_description,
      image_url,
      attributes,
      card_type,
      card_categories (
        id,
        name,
        description,
        theme_color,
        icon_url
      )
    `)
    .eq('is_active', true);

  if (error) {
    const err = new Error(error.message);
    err.status = 400;
    throw err;
  }

  return data;
};

module.exports = {
  getActiveCards
};
