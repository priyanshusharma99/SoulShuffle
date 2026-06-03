import api from './api';

export interface CardCategory {
  id: string;
  name: string;
  description: string;
  theme_color: string;
  icon_url: string | null;
}

export interface CardAttributes {
  difficulty?: string;
  time?: string;
  stars?: number;
  description?: string;
}

export interface Card {
  id: string;
  category_id: string;
  name: string;
  power_description: string;
  image_url: string | null;
  attributes: CardAttributes | null;
  card_type: 'ACTION' | 'WILDCARD';
  card_categories: CardCategory | null;
}

/**
 * Fetch the master deck of cards/dares from the backend
 */
export const fetchCards = async (): Promise<Card[]> => {
  const response = await api.get('/cards');
  return response.data.data.cards;
};
