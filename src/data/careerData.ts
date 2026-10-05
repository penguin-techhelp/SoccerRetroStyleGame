import { CardTier, ClubData, MarketListing, PlayerCard } from '../types/career';
import { Player, Team } from '../types/game';

// Basic Starter Squad (Rating 60 - 68)
export const STARTER_PLAYERS: PlayerCard[] = [
  {
    id: 'starter_gk_1',
    name: 'O. Miller',
    number: 1,
    role: 'GK',
    rating: 62,
    tier: 'bronze',
    nationality: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 ENG',
    stats: { speed: 56, shot: 35, pass: 58, defense: 66, stamina: 68 },
    value: 80,
    skinTone: '#f8d9c4',
    hairColor: '#451a03',
    hairStyle: 'short',
  },
  {
    id: 'starter_def_1',
    name: 'T. Evans',
    number: 2,
    role: 'DEF',
    rating: 64,
    tier: 'bronze',
    nationality: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 WAL',
    stats: { speed: 65, shot: 42, pass: 59, defense: 68, stamina: 72 },
    value: 95,
    skinTone: '#fce7d2',
    hairColor: '#78350f',
    hairStyle: 'buzz',
  },
  {
    id: 'starter_def_2',
    name: 'M. Novak',
    number: 4,
    role: 'DEF',
    rating: 66,
    tier: 'bronze',
    nationality: '🇵🇱 POL',
    stats: { speed: 59, shot: 48, pass: 62, defense: 71, stamina: 75 },
    value: 110,
    skinTone: '#ffedd5',
    hairColor: '#d97706',
    hairStyle: 'short',
  },
  {
    id: 'starter_def_3',
    name: 'D. Rossi',
    number: 5,
    role: 'DEF',
    rating: 65,
    tier: 'bronze',
    nationality: '🇮🇹 ITA',
    stats: { speed: 60, shot: 44, pass: 64, defense: 70, stamina: 74 },
    value: 105,
    skinTone: '#fed7aa',
    hairColor: '#1c1917',
    hairStyle: 'curly',
  },
  {
    id: 'starter_def_4',
    name: 'J. Silva',
    number: 3,
    role: 'DEF',
    rating: 64,
    tier: 'bronze',
    nationality: '🇧🇷 BRA',
    stats: { speed: 69, shot: 52, pass: 63, defense: 65, stamina: 70 },
    value: 100,
    skinTone: '#c28859',
    hairColor: '#000000',
    hairStyle: 'buzz',
  },
  {
    id: 'starter_mid_1',
    name: 'L. Weber',
    number: 7,
    role: 'MID',
    rating: 65,
    tier: 'bronze',
    nationality: '🇩🇪 GER',
    stats: { speed: 68, shot: 62, pass: 69, defense: 58, stamina: 76 },
    value: 115,
    skinTone: '#fde68a',
    hairColor: '#b45309',
    hairStyle: 'short',
  },
  {
    id: 'starter_mid_2',
    name: 'K. Tanaka',
    number: 8,
    role: 'MID',
    rating: 67,
    tier: 'bronze',
    nationality: '🇯🇵 JPN',
    stats: { speed: 72, shot: 64, pass: 73, defense: 62, stamina: 82 },
    value: 130,
    skinTone: '#fed7aa',
    hairColor: '#000000',
    hairStyle: 'short',
  },
  {
    id: 'starter_mid_3',
    name: 'A. Brooks',
    number: 6,
    role: 'MID',
    rating: 64,
    tier: 'bronze',
    nationality: '🇺🇸 USA',
    stats: { speed: 66, shot: 58, pass: 67, defense: 66, stamina: 78 },
    value: 105,
    skinTone: '#e2b388',
    hairColor: '#171717',
    hairStyle: 'buzz',
  },
  {
    id: 'starter_mid_4',
    name: 'H. Larsson',
    number: 11,
    role: 'MID',
    rating: 66,
    tier: 'bronze',
    nationality: '🇸🇪 SWE',
    stats: { speed: 71, shot: 66, pass: 68, defense: 55, stamina: 74 },
    value: 120,
    skinTone: '#fef08a',
    hairColor: '#f59e0b',
    hairStyle: 'long',
  },
  {
    id: 'starter_fwd_1',
    name: 'E. Santos',
    number: 9,
    role: 'FWD',
    rating: 68,
    tier: 'bronze',
    nationality: '🇧🇷 BRA',
    stats: { speed: 74, shot: 72, pass: 64, defense: 42, stamina: 73 },
    value: 145,
    skinTone: '#a86536',
    hairColor: '#09090b',
    hairStyle: 'curly',
  },
  {
    id: 'starter_fwd_2',
    name: 'C. Jones',
    number: 10,
    role: 'FWD',
    rating: 66,
    tier: 'bronze',
    nationality: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 ENG',
    stats: { speed: 73, shot: 70, pass: 61, defense: 45, stamina: 75 },
    value: 125,
    skinTone: '#ffedd5',
    hairColor: '#451a03',
    hairStyle: 'short',
  },
];

// 4 Basic Starter Bench Players
export const STARTER_BENCH: PlayerCard[] = [
  {
    id: 'starter_bench_1',
    name: 'F. Meyer',
    number: 12,
    role: 'GK',
    rating: 59,
    tier: 'bronze',
    nationality: '🇨🇭 SUI',
    stats: { speed: 52, shot: 30, pass: 54, defense: 62, stamina: 65 },
    value: 60,
    skinTone: '#ffedd5',
    hairColor: '#78350f',
    hairStyle: 'short',
  },
  {
    id: 'starter_bench_2',
    name: 'P. Gomez',
    number: 13,
    role: 'DEF',
    rating: 62,
    tier: 'bronze',
    nationality: '🇲🇽 MEX',
    stats: { speed: 64, shot: 40, pass: 57, defense: 65, stamina: 68 },
    value: 80,
    skinTone: '#c28859',
    hairColor: '#000000',
    hairStyle: 'buzz',
  },
  {
    id: 'starter_bench_3',
    name: 'B. Dupont',
    number: 14,
    role: 'MID',
    rating: 63,
    tier: 'bronze',
    nationality: '🇫🇷 FRA',
    stats: { speed: 66, shot: 60, pass: 65, defense: 58, stamina: 70 },
    value: 90,
    skinTone: '#fed7aa',
    hairColor: '#27272a',
    hairStyle: 'short',
  },
  {
    id: 'starter_bench_4',
    name: 'S. Al-Nasser',
    number: 15,
    role: 'FWD',
    rating: 64,
    tier: 'bronze',
    nationality: '🇸🇦 KSA',
    stats: { speed: 72, shot: 66, pass: 58, defense: 40, stamina: 69 },
    value: 100,
    skinTone: '#c4895c',
    hairColor: '#18181b',
    hairStyle: 'curly',
  },
];

// Rich Pool of Discoverable Player Cards Across Tiers (Bronze, Silver, Gold, Legend Icons)
export const CARD_DATABASE: Omit<PlayerCard, 'id'>[] = [
  // --- SILVER CARDS (70 - 79) ---
  {
    name: 'G. Chiellini',
    number: 3,
    role: 'DEF',
    rating: 78,
    tier: 'silver',
    nationality: '🇮🇹 ITA',
    stats: { speed: 70, shot: 55, pass: 72, defense: 83, stamina: 85 },
    value: 360,
    skinTone: '#ffedd5',
    hairColor: '#262626',
    hairStyle: 'buzz',
  },
  {
    name: 'J. Vardy',
    number: 9,
    role: 'FWD',
    rating: 79,
    tier: 'silver',
    nationality: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 ENG',
    stats: { speed: 88, shot: 82, pass: 68, defense: 54, stamina: 86 },
    value: 450,
    skinTone: '#ffedd5',
    hairColor: '#525252',
    hairStyle: 'short',
  },
  {
    name: 'M. Locatelli',
    number: 5,
    role: 'MID',
    rating: 77,
    tier: 'silver',
    nationality: '🇮🇹 ITA',
    stats: { speed: 72, shot: 74, pass: 81, defense: 76, stamina: 82 },
    value: 340,
    skinTone: '#fed7aa',
    hairColor: '#1c1917',
    hairStyle: 'short',
  },
  {
    name: 'K. Schmeichel',
    number: 1,
    role: 'GK',
    rating: 79,
    tier: 'silver',
    nationality: '🇩🇰 DEN',
    stats: { speed: 64, shot: 40, pass: 74, defense: 84, stamina: 80 },
    value: 400,
    skinTone: '#fef08a',
    hairColor: '#eab308',
    hairStyle: 'short',
  },
  {
    name: 'A. Davies',
    number: 19,
    role: 'DEF',
    rating: 79,
    tier: 'silver',
    nationality: '🇨🇦 CAN',
    stats: { speed: 92, shot: 68, pass: 75, defense: 76, stamina: 88 },
    value: 480,
    skinTone: '#713f12',
    hairColor: '#0a0a0a',
    hairStyle: 'buzz',
  },
  {
    name: 'T. Kubo',
    number: 14,
    role: 'MID',
    rating: 78,
    tier: 'silver',
    nationality: '🇯🇵 JPN',
    stats: { speed: 84, shot: 76, pass: 80, defense: 56, stamina: 78 },
    value: 390,
    skinTone: '#fed7aa',
    hairColor: '#18181b',
    hairStyle: 'short',
  },
  {
    name: 'D. Nunez',
    number: 9,
    role: 'FWD',
    rating: 78,
    tier: 'silver',
    nationality: '🇺🇾 URU',
    stats: { speed: 86, shot: 80, pass: 70, defense: 52, stamina: 84 },
    value: 410,
    skinTone: '#fed7aa',
    hairColor: '#0a0a0a',
    hairStyle: 'long',
  },
  {
    name: 'N. Pope',
    number: 22,
    role: 'GK',
    rating: 77,
    tier: 'silver',
    nationality: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 ENG',
    stats: { speed: 58, shot: 35, pass: 68, defense: 82, stamina: 78 },
    value: 330,
    skinTone: '#ffedd5',
    hairColor: '#525252',
    hairStyle: 'short',
  },

  // --- GOLD CARDS (80 - 89) ---
  {
    name: 'K. De Bruyne',
    number: 17,
    role: 'MID',
    rating: 88,
    tier: 'gold',
    nationality: '🇧🇪 BEL',
    stats: { speed: 78, shot: 88, pass: 95, defense: 72, stamina: 89 },
    value: 1250,
    skinTone: '#fed7aa',
    hairColor: '#d97706',
    hairStyle: 'short',
  },
  {
    name: 'V. van Dijk',
    number: 4,
    role: 'DEF',
    rating: 87,
    tier: 'gold',
    nationality: '🇳🇱 NED',
    stats: { speed: 80, shot: 62, pass: 78, defense: 92, stamina: 88 },
    value: 1100,
    skinTone: '#a16207',
    hairColor: '#0a0a0a',
    hairStyle: 'long',
  },
  {
    name: 'K. Mbappe',
    number: 7,
    role: 'FWD',
    rating: 89,
    tier: 'gold',
    nationality: '🇫🇷 FRA',
    stats: { speed: 96, shot: 91, pass: 82, defense: 48, stamina: 88 },
    value: 1600,
    skinTone: '#92400e',
    hairColor: '#09090b',
    hairStyle: 'buzz',
  },
  {
    name: 'E. Haaland',
    number: 9,
    role: 'FWD',
    rating: 88,
    tier: 'gold',
    nationality: '🇳🇴 NOR',
    stats: { speed: 89, shot: 94, pass: 72, defense: 54, stamina: 86 },
    value: 1450,
    skinTone: '#fef08a',
    hairColor: '#facc15',
    hairStyle: 'long',
  },
  {
    name: 'L. Modric',
    number: 10,
    role: 'MID',
    rating: 86,
    tier: 'gold',
    nationality: '🇭🇷 CRO',
    stats: { speed: 74, shot: 81, pass: 92, defense: 75, stamina: 85 },
    value: 980,
    skinTone: '#ffedd5',
    hairColor: '#ca8a04',
    hairStyle: 'long',
  },
  {
    name: 'Alisson',
    number: 1,
    role: 'GK',
    rating: 87,
    tier: 'gold',
    nationality: '🇧🇷 BRA',
    stats: { speed: 66, shot: 45, pass: 85, defense: 91, stamina: 84 },
    value: 1150,
    skinTone: '#ffedd5',
    hairColor: '#451a03',
    hairStyle: 'short',
  },
  {
    name: 'B. Saka',
    number: 7,
    role: 'FWD',
    rating: 85,
    tier: 'gold',
    nationality: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 ENG',
    stats: { speed: 89, shot: 84, pass: 85, defense: 62, stamina: 87 },
    value: 920,
    skinTone: '#78350f',
    hairColor: '#000000',
    hairStyle: 'buzz',
  },
  {
    name: 'R. Dias',
    number: 3,
    role: 'DEF',
    rating: 86,
    tier: 'gold',
    nationality: '🇵🇹 POR',
    stats: { speed: 74, shot: 58, pass: 79, defense: 90, stamina: 86 },
    value: 1020,
    skinTone: '#fed7aa',
    hairColor: '#262626',
    hairStyle: 'short',
  },

  // --- LEGEND / ICON CARDS (90 - 99) ---
  {
    name: 'Pelé',
    number: 10,
    role: 'FWD',
    rating: 98,
    tier: 'legend',
    nationality: '🇧🇷 BRA',
    stats: { speed: 96, shot: 98, pass: 94, defense: 65, stamina: 96 },
    value: 4500,
    skinTone: '#713f12',
    hairColor: '#000000',
    hairStyle: 'short',
  },
  {
    name: 'D. Maradona',
    number: 10,
    role: 'MID',
    rating: 97,
    tier: 'legend',
    nationality: '🇦🇷 ARG',
    stats: { speed: 94, shot: 96, pass: 97, defense: 58, stamina: 92 },
    value: 4200,
    skinTone: '#fed7aa',
    hairColor: '#09090b',
    hairStyle: 'curly',
  },
  {
    name: 'Z. Zidane',
    number: 5,
    role: 'MID',
    rating: 95,
    tier: 'legend',
    nationality: '🇫🇷 FRA',
    stats: { speed: 86, shot: 92, pass: 98, defense: 78, stamina: 91 },
    value: 3600,
    skinTone: '#ffedd5',
    hairColor: '#525252',
    hairStyle: 'buzz',
  },
  {
    name: 'R. Nazario',
    number: 9,
    role: 'FWD',
    rating: 96,
    tier: 'legend',
    nationality: '🇧🇷 BRA',
    stats: { speed: 97, shot: 97, pass: 85, defense: 52, stamina: 90 },
    value: 3900,
    skinTone: '#92400e',
    hairColor: '#0a0a0a',
    hairStyle: 'buzz',
  },
  {
    name: 'P. Maldini',
    number: 3,
    role: 'DEF',
    rating: 95,
    tier: 'legend',
    nationality: '🇮🇹 ITA',
    stats: { speed: 88, shot: 68, pass: 84, defense: 98, stamina: 94 },
    value: 3500,
    skinTone: '#fed7aa',
    hairColor: '#262626',
    hairStyle: 'long',
  },
  {
    name: 'L. Yashin',
    number: 1,
    role: 'GK',
    rating: 94,
    tier: 'legend',
    nationality: '🇷🇺 RUS',
    stats: { speed: 76, shot: 48, pass: 88, defense: 98, stamina: 94 },
    value: 3300,
    skinTone: '#ffedd5',
    hairColor: '#171717',
    hairStyle: 'short',
  },
  {
    name: 'J. Cruyff',
    number: 14,
    role: 'FWD',
    rating: 95,
    tier: 'legend',
    nationality: '🇳🇱 NED',
    stats: { speed: 93, shot: 94, pass: 96, defense: 62, stamina: 92 },
    value: 3700,
    skinTone: '#ffedd5',
    hairColor: '#78350f',
    hairStyle: 'long',
  },
  {
    name: 'Ronaldinho',
    number: 10,
    role: 'MID',
    rating: 94,
    tier: 'legend',
    nationality: '🇧🇷 BRA',
    stats: { speed: 92, shot: 90, pass: 95, defense: 56, stamina: 90 },
    value: 3400,
    skinTone: '#a16207',
    hairColor: '#09090b',
    hairStyle: 'long',
  },
];

// Division Opponent Squads
export interface DivisionOpponent {
  id: string;
  name: string;
  badge: string;
  division: number;
  overallRating: number;
  primaryColor: string;
  secondaryColor: string;
}

export const DIVISION_OPPONENTS: Record<number, DivisionOpponent[]> = {
  5: [
    { id: 'div5_1', name: 'Metro Town FC', badge: '⚓', division: 5, overallRating: 64, primaryColor: '#0284c7', secondaryColor: '#ffffff' },
    { id: 'div5_2', name: 'Highland Athletic', badge: '⛰️', division: 5, overallRating: 66, primaryColor: '#15803d', secondaryColor: '#facc15' },
    { id: 'div5_3', name: 'Coastal Rovers', badge: '🌊', division: 5, overallRating: 67, primaryColor: '#0d9488', secondaryColor: '#ffffff' },
  ],
  4: [
    { id: 'div4_1', name: 'Spartan City', badge: '🛡️', division: 4, overallRating: 72, primaryColor: '#b91c1c', secondaryColor: '#ffffff' },
    { id: 'div4_2', name: 'Solaris United', badge: '☀️', division: 4, overallRating: 74, primaryColor: '#ca8a04', secondaryColor: '#1e293b' },
    { id: 'div4_3', name: 'Nordic Wolves', badge: '🐺', division: 4, overallRating: 75, primaryColor: '#475569', secondaryColor: '#38bdf8' },
  ],
  3: [
    { id: 'div3_1', name: 'Apex Dynamo', badge: '⚡', division: 3, overallRating: 79, primaryColor: '#7c3aed', secondaryColor: '#fbbf24' },
    { id: 'div3_2', name: 'Vanguard FC', badge: '⚔️', division: 3, overallRating: 81, primaryColor: '#be123c', secondaryColor: '#ffffff' },
    { id: 'div3_3', name: 'Royal Phoenix', badge: '🦅', division: 3, overallRating: 82, primaryColor: '#b45309', secondaryColor: '#fef08a' },
  ],
  2: [
    { id: 'div2_1', name: 'Imperial Dragons', badge: '🐉', division: 2, overallRating: 85, primaryColor: '#991b1b', secondaryColor: '#f59e0b' },
    { id: 'div2_2', name: 'Crown Titans', badge: '👑', division: 2, overallRating: 87, primaryColor: '#1e3a8a', secondaryColor: '#fbbf24' },
    { id: 'div2_3', name: 'Galactic Stars', badge: '✨', division: 2, overallRating: 88, primaryColor: '#0f172a', secondaryColor: '#38bdf8' },
  ],
  1: [
    { id: 'div1_1', name: 'World All-Stars', badge: '🌍', division: 1, overallRating: 92, primaryColor: '#eab308', secondaryColor: '#0f172a' },
    { id: 'div1_2', name: 'Legends XI', badge: '🏆', division: 1, overallRating: 94, primaryColor: '#6366f1', secondaryColor: '#fef08a' },
    { id: 'div1_3', name: 'Apex Champions', badge: '💎', division: 1, overallRating: 96, primaryColor: '#06b6d4', secondaryColor: '#f8fafc' },
  ],
};

// Initial Career Club Generator
export function createDefaultClub(): ClubData {
  return {
    clubName: 'Retro Rovers FC',
    badge: '🦁',
    primaryColor: '#e11d48', // Crimson Red
    secondaryColor: '#ffffff',
    coins: 350,
    division: 5,
    seasonPoints: 0,
    seasonMatches: 0,
    record: {
      wins: 0,
      draws: 0,
      losses: 0,
      titlesWon: 0,
    },
    starting11: [...STARTER_PLAYERS],
    bench: [...STARTER_BENCH],
    packsAvailable: {
      bronze: 1, // 1 free welcome booster pack!
      silver: 0,
      gold: 0,
      legend: 0,
    },
  };
}

// Random ID Generator
function genId(prefix = 'c'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// Generate Booster Pack Cards
export function openBoosterPack(tier: CardTier): PlayerCard[] {
  const result: PlayerCard[] = [];
  const count = tier === 'legend' ? 1 : 3;

  for (let i = 0; i < count; i++) {
    let pool = CARD_DATABASE.filter((c) => c.tier === tier);
    if (pool.length === 0) pool = CARD_DATABASE;

    // Small chance of pulling 1 tier higher in regular packs
    if (tier === 'bronze' && Math.random() < 0.25) {
      pool = CARD_DATABASE.filter((c) => c.tier === 'silver');
    } else if (tier === 'silver' && Math.random() < 0.2) {
      pool = CARD_DATABASE.filter((c) => c.tier === 'gold');
    } else if (tier === 'gold' && Math.random() < 0.15) {
      pool = CARD_DATABASE.filter((c) => c.tier === 'legend');
    }

    const template = pool[Math.floor(Math.random() * pool.length)];
    result.push({
      ...template,
      id: genId('pack'),
      number: Math.floor(Math.random() * 89) + 2,
    });
  }

  return result;
}

// Generate Transfer Market Listings
export function generateTransferMarketListings(): MarketListing[] {
  const selectedTemplates = [...CARD_DATABASE]
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);

  return selectedTemplates.map((tmpl) => {
    const card: PlayerCard = {
      ...tmpl,
      id: genId('mkt'),
      number: Math.floor(Math.random() * 89) + 2,
    };
    return {
      id: genId('listing'),
      card,
      price: card.value,
      isSoldOut: false,
    };
  });
}

// Convert Career Squad to Engine-compatible Team object
export function clubToTeam(club: ClubData): Team {
  const avgRating = Math.round(
    club.starting11.reduce((acc, p) => acc + p.rating, 0) / club.starting11.length
  );

  return {
    id: 'career_user_club',
    name: club.clubName,
    countryCode: 'CLB',
    flag: club.badge,
    starPlayer: club.starting11[9]?.name || club.starting11[0]?.name || 'Captain',
    formation: '4-4-2',
    primaryColor: club.primaryColor,
    secondaryColor: club.secondaryColor,
    sockColor: club.primaryColor,
    gkColor: '#fbbf24',
    overallRating: avgRating,
    attributes: {
      speed: avgRating,
      attack: avgRating,
      defense: avgRating,
      stamina: avgRating,
    },
    squad: club.starting11.map((c) => ({
      id: c.id,
      name: c.name,
      number: c.number,
      role: c.role,
      teamId: 'career_user_club',
      stats: {
        speed: c.stats.speed,
        shot: c.stats.shot,
        pass: c.stats.pass,
        tackle: c.stats.defense,
        stamina: c.stats.stamina,
        keeper: c.role === 'GK' ? c.stats.defense : 30,
      },
      skinTone: c.skinTone,
      hairColor: c.hairColor,
      hairStyle: c.hairStyle,
    })),
  };
}

// Generate Opponent Team from DivisionOpponent
export function opponentToTeam(opp: DivisionOpponent): Team {
  const rating = opp.overallRating;
  const oppSquad = CARD_DATABASE.filter((c) => Math.abs(c.rating - rating) < 8)
    .sort(() => 0.5 - Math.random())
    .slice(0, 11);

  while (oppSquad.length < 11) {
    oppSquad.push(CARD_DATABASE[Math.floor(Math.random() * CARD_DATABASE.length)]);
  }

  return {
    id: opp.id,
    name: opp.name,
    countryCode: 'OPP',
    flag: opp.badge,
    starPlayer: oppSquad[9]?.name || oppSquad[0]?.name || 'Star Player',
    formation: '4-4-2',
    primaryColor: opp.primaryColor,
    secondaryColor: opp.secondaryColor,
    sockColor: opp.primaryColor,
    gkColor: '#38bdf8',
    overallRating: rating,
    attributes: {
      speed: rating,
      attack: rating,
      defense: rating,
      stamina: rating,
    },
    squad: oppSquad.map((c, idx) => ({
      id: `opp_${opp.id}_${idx}`,
      name: c.name,
      number: idx + 1,
      role: idx === 0 ? 'GK' : idx <= 4 ? 'DEF' : idx <= 8 ? 'MID' : 'FWD',
      teamId: opp.id,
      stats: {
        speed: c.stats.speed,
        shot: c.stats.shot,
        pass: c.stats.pass,
        tackle: c.stats.defense,
        stamina: c.stats.stamina,
        keeper: idx === 0 ? c.stats.defense : 30,
      },
      skinTone: c.skinTone,
      hairColor: c.hairColor,
      hairStyle: c.hairStyle,
    })),
  };
}
