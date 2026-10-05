export type CardTier = 'bronze' | 'silver' | 'gold' | 'legend';

export interface PlayerCard {
  id: string;
  name: string;
  number: number;
  role: 'GK' | 'DEF' | 'MID' | 'FWD';
  rating: number; // 55 - 99
  tier: CardTier;
  nationality: string; // Flag + code, e.g. "🇧🇷 BRA"
  stats: {
    speed: number;
    shot: number;
    pass: number;
    defense: number;
    stamina: number;
  };
  value: number; // Coin sell/buy value
  skinTone: string;
  hairColor: string;
  hairStyle: 'short' | 'curly' | 'long' | 'buzz';
}

export interface ClubData {
  clubName: string;
  badge: string; // Emoji crest
  primaryColor: string;
  secondaryColor: string;
  coins: number;
  division: number; // 5 (Grassroots) up to 1 (World Elite)
  seasonPoints: number; // Points in current season (10 needed for promotion)
  seasonMatches: number; // 0 to 5 matches per season
  record: {
    wins: number;
    draws: number;
    losses: number;
    titlesWon: number;
  };
  starting11: PlayerCard[]; // Exactly 11 active starters
  bench: PlayerCard[];      // Reserve cards collection
  packsAvailable: {
    bronze: number;
    silver: number;
    gold: number;
    legend: number;
  };
}

export interface MarketListing {
  id: string;
  card: PlayerCard;
  price: number;
  isSoldOut?: boolean;
}
