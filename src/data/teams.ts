import { FormationType, Player, PlayerRole, Team } from '../types/game';
import { OFFICIAL_PLAYERS, OfficialPlayer } from './officialDatabase';

export { OFFICIAL_PLAYERS, type OfficialPlayer };

export const FORMATION_COORDS: Record<FormationType, { role: PlayerRole; xPct: number; yPct: number }[]> = {
  '4-4-2': [
    { role: 'GK', xPct: 0.05, yPct: 0.5 },
    { role: 'DEF', xPct: 0.22, yPct: 0.15 },
    { role: 'DEF', xPct: 0.20, yPct: 0.38 },
    { role: 'DEF', xPct: 0.20, yPct: 0.62 },
    { role: 'DEF', xPct: 0.22, yPct: 0.85 },
    { role: 'MID', xPct: 0.40, yPct: 0.18 },
    { role: 'MID', xPct: 0.38, yPct: 0.40 },
    { role: 'MID', xPct: 0.38, yPct: 0.60 },
    { role: 'MID', xPct: 0.40, yPct: 0.82 },
    { role: 'FWD', xPct: 0.65, yPct: 0.35 },
    { role: 'FWD', xPct: 0.65, yPct: 0.65 }
  ],
  '4-3-3': [
    { role: 'GK', xPct: 0.05, yPct: 0.5 },
    { role: 'DEF', xPct: 0.22, yPct: 0.15 },
    { role: 'DEF', xPct: 0.20, yPct: 0.38 },
    { role: 'DEF', xPct: 0.20, yPct: 0.62 },
    { role: 'DEF', xPct: 0.22, yPct: 0.85 },
    { role: 'MID', xPct: 0.40, yPct: 0.25 },
    { role: 'MID', xPct: 0.38, yPct: 0.50 },
    { role: 'MID', xPct: 0.40, yPct: 0.75 },
    { role: 'FWD', xPct: 0.65, yPct: 0.18 },
    { role: 'FWD', xPct: 0.68, yPct: 0.50 },
    { role: 'FWD', xPct: 0.65, yPct: 0.82 }
  ],
  '3-5-2': [
    { role: 'GK', xPct: 0.05, yPct: 0.5 },
    { role: 'DEF', xPct: 0.20, yPct: 0.25 },
    { role: 'DEF', xPct: 0.18, yPct: 0.50 },
    { role: 'DEF', xPct: 0.20, yPct: 0.75 },
    { role: 'MID', xPct: 0.38, yPct: 0.12 },
    { role: 'MID', xPct: 0.36, yPct: 0.32 },
    { role: 'MID', xPct: 0.34, yPct: 0.50 },
    { role: 'MID', xPct: 0.36, yPct: 0.68 },
    { role: 'MID', xPct: 0.38, yPct: 0.88 },
    { role: 'FWD', xPct: 0.65, yPct: 0.35 },
    { role: 'FWD', xPct: 0.65, yPct: 0.65 }
  ],
  '5-3-2': [
    { role: 'GK', xPct: 0.05, yPct: 0.5 },
    { role: 'DEF', xPct: 0.22, yPct: 0.10 },
    { role: 'DEF', xPct: 0.18, yPct: 0.30 },
    { role: 'DEF', xPct: 0.16, yPct: 0.50 },
    { role: 'DEF', xPct: 0.18, yPct: 0.70 },
    { role: 'DEF', xPct: 0.22, yPct: 0.90 },
    { role: 'MID', xPct: 0.38, yPct: 0.25 },
    { role: 'MID', xPct: 0.36, yPct: 0.50 },
    { role: 'MID', xPct: 0.38, yPct: 0.75 },
    { role: 'FWD', xPct: 0.65, yPct: 0.35 },
    { role: 'FWD', xPct: 0.65, yPct: 0.65 }
  ]
};

// Map Official Database Player POS to Game PlayerRole
function mapPosToRole(pos: string): PlayerRole {
  if (pos === 'GK') return 'GK';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return 'DEF';
  if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(pos)) return 'MID';
  return 'FWD';
}

function convertOfficialToSquadPlayer(op: OfficialPlayer, teamId: string, assignedNumber: number, skinTone: string, hairColor: string, hairStyle: 'short' | 'curly' | 'long' | 'buzz'): Team['squad'][0] {
  return {
    id: `${teamId}_${op.id}`,
    name: op.name,
    number: assignedNumber,
    role: mapPosToRole(op.pos),
    teamId,
    stats: {
      speed: op.pac,
      shot: op.sho,
      pass: op.pas,
      tackle: op.def,
      stamina: op.phy,
      keeper: op.pos === 'GK' ? (op.ref || op.ovr) : 30
    },
    skinTone,
    hairColor,
    hairStyle
  };
}

function createSquadFiller(teamId: string, num: number, name: string, role: PlayerRole, stats: { speed: number; shot: number; pass: number; tackle: number; stamina: number; keeper: number }, skinTone = '#F5D0A9', hairColor = '#2B1B17', hairStyle: 'short' | 'curly' | 'long' | 'buzz' = 'short'): Team['squad'][0] {
  return {
    id: `${teamId}_fill_${num}`,
    name,
    number: num,
    role,
    teamId,
    stats,
    skinTone,
    hairColor,
    hairStyle
  };
}

// Helper to find official player by ID
const getOfficial = (id: string) => OFFICIAL_PLAYERS.find(p => p.id === id)!;

export const CLASSIC_TEAMS: Team[] = [
  // 1. FC Capital
  {
    id: 'fc_capital',
    name: 'FC Capital',
    countryCode: 'CAP',
    flag: '🏛️',
    starPlayer: 'Viktor Drake',
    formation: '4-3-3',
    primaryColor: '#1E3A8A',    // Royal Navy
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#FACC15',     // Gold trim
    gkColor: '#10B981',         // Emerald GK
    sockColor: '#1E3A8A',
    overallRating: 88,
    attributes: { speed: 88, attack: 90, defense: 83, stamina: 86 },
    squad: [
      createSquadFiller('fc_capital', 1, 'M. Alvez', 'GK', { speed: 65, shot: 30, pass: 68, tackle: 60, stamina: 85, keeper: 86 }, '#F5D0A9', '#171717', 'short'),
      createSquadFiller('fc_capital', 2, 'R. Mendez', 'DEF', { speed: 82, shot: 55, pass: 76, tackle: 84, stamina: 86, keeper: 30 }, '#C68642', '#171717', 'buzz'),
      createSquadFiller('fc_capital', 3, 'T. Ramos', 'DEF', { speed: 78, shot: 50, pass: 74, tackle: 87, stamina: 88, keeper: 30 }, '#F5D0A9', '#4A3728', 'short'),
      createSquadFiller('fc_capital', 4, 'D. Silva', 'DEF', { speed: 80, shot: 48, pass: 72, tackle: 86, stamina: 87, keeper: 30 }, '#8D5524', '#000000', 'buzz'),
      createSquadFiller('fc_capital', 5, 'L. Morales', 'DEF', { speed: 84, shot: 60, pass: 78, tackle: 83, stamina: 89, keeper: 30 }, '#F5D0A9', '#2B1B17', 'short'),
      convertOfficialToSquadPlayer(getOfficial('034'), 'fc_capital', 10, '#F5D0A9', '#4A3728', 'short'), // Enzo Vision (CAM 84)
      createSquadFiller('fc_capital', 8, 'C. Navas', 'MID', { speed: 80, shot: 75, pass: 86, tackle: 80, stamina: 88, keeper: 30 }, '#C68642', '#171717', 'curly'),
      createSquadFiller('fc_capital', 6, 'G. Delgado', 'MID', { speed: 76, shot: 70, pass: 84, tackle: 85, stamina: 90, keeper: 30 }, '#F5D0A9', '#2B1B17', 'short'),
      convertOfficialToSquadPlayer(getOfficial('014'), 'fc_capital', 7, '#C68642', '#000000', 'buzz'), // Dario Swift (RW 84)
      convertOfficialToSquadPlayer(getOfficial('001'), 'fc_capital', 9, '#F5D0A9', '#8B5A2B', 'short'), // Viktor Drake (ST 88)
      createSquadFiller('fc_capital', 11, 'J. Moreno', 'FWD', { speed: 88, shot: 82, pass: 78, tackle: 45, stamina: 84, keeper: 30 }, '#F5D0A9', '#171717', 'long')
    ]
  },

  // 2. Bavaria FC
  {
    id: 'bavaria_fc',
    name: 'Bavaria FC',
    countryCode: 'BAV',
    flag: '🦁',
    starPlayer: 'Gunnar Vault',
    formation: '4-4-2',
    primaryColor: '#DC2626',    // Crimson Red
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#FACC15',     // Bavarian Gold
    gkColor: '#1E3A8A',         // Navy GK
    sockColor: '#DC2626',
    overallRating: 87,
    attributes: { speed: 85, attack: 88, defense: 89, stamina: 92 },
    squad: [
      convertOfficialToSquadPlayer(getOfficial('090'), 'bavaria_fc', 1, '#FCE0CD', '#E6C280', 'short'), // Gunnar Vault (GK 87)
      createSquadFiller('bavaria_fc', 2, 'F. Keller', 'DEF', { speed: 84, shot: 55, pass: 76, tackle: 84, stamina: 88, keeper: 30 }, '#FCE0CD', '#5C4033', 'short'),
      convertOfficialToSquadPlayer(getOfficial('067'), 'bavaria_fc', 4, '#FCE0CD', '#4A3728', 'buzz'), // Klaus Rampart (CB 85)
      createSquadFiller('bavaria_fc', 5, 'J. Steiner', 'DEF', { speed: 76, shot: 45, pass: 72, tackle: 86, stamina: 90, keeper: 30 }, '#FCE0CD', '#8B5A2B', 'short'),
      convertOfficialToSquadPlayer(getOfficial('078'), 'bavaria_fc', 3, '#FCE0CD', '#E6C280', 'short'), // Axel Runner (LB 82)
      createSquadFiller('bavaria_fc', 7, 'S. Brandt', 'MID', { speed: 85, shot: 78, pass: 82, tackle: 75, stamina: 88, keeper: 30 }, '#FCE0CD', '#4A3728', 'short'),
      createSquadFiller('bavaria_fc', 8, 'H. Schultz', 'MID', { speed: 78, shot: 82, pass: 86, tackle: 84, stamina: 92, keeper: 30 }, '#FCE0CD', '#2B1B17', 'short'),
      createSquadFiller('bavaria_fc', 6, 'M. Wagner', 'MID', { speed: 75, shot: 72, pass: 85, tackle: 86, stamina: 91, keeper: 30 }, '#FCE0CD', '#5C4033', 'curly'),
      convertOfficialToSquadPlayer(getOfficial('046'), 'bavaria_fc', 11, '#FCE0CD', '#E6C280', 'short'), // Otto Weber (LM 80)
      convertOfficialToSquadPlayer(getOfficial('006'), 'bavaria_fc', 9, '#FCE0CD', '#8B5A2B', 'buzz'), // Karl Hammer (ST 83)
      createSquadFiller('bavaria_fc', 10, 'E. Richter', 'FWD', { speed: 86, shot: 85, pass: 80, tackle: 48, stamina: 86, keeper: 30 }, '#FCE0CD', '#4A3728', 'short')
    ]
  },

  // 3. London Red
  {
    id: 'london_red',
    name: 'London Red',
    countryCode: 'LRD',
    flag: '🔴',
    starPlayer: 'Oscar "The Wall" Ward',
    formation: '4-4-2',
    primaryColor: '#B91C1C',    // Arsenal Crimson
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#E2E8F0',     // White sleeves
    gkColor: '#16A34A',         // Green GK
    sockColor: '#B91C1C',
    overallRating: 86,
    attributes: { speed: 91, attack: 85, defense: 87, stamina: 88 },
    squad: [
      convertOfficialToSquadPlayer(getOfficial('089'), 'london_red', 1, '#8D5524', '#000000', 'short'), // Oscar "The Wall" Ward (GK 88)
      createSquadFiller('london_red', 2, 'A. Dixon', 'DEF', { speed: 84, shot: 52, pass: 75, tackle: 84, stamina: 89, keeper: 30 }, '#FCE0CD', '#4A3728', 'short'),
      createSquadFiller('london_red', 4, 'P. Adams', 'DEF', { speed: 76, shot: 48, pass: 72, tackle: 88, stamina: 92, keeper: 30 }, '#FCE0CD', '#2B1B17', 'buzz'),
      createSquadFiller('london_red', 5, 'M. Keown', 'DEF', { speed: 78, shot: 40, pass: 70, tackle: 87, stamina: 90, keeper: 30 }, '#FCE0CD', '#5C4033', 'short'),
      createSquadFiller('london_red', 3, 'N. Winter', 'DEF', { speed: 83, shot: 56, pass: 76, tackle: 82, stamina: 88, keeper: 30 }, '#FCE0CD', '#4A3728', 'short'),
      convertOfficialToSquadPlayer(getOfficial('039'), 'london_red', 7, '#8D5524', '#000000', 'buzz'), // Kofi Sterling (RM 81)
      convertOfficialToSquadPlayer(getOfficial('053'), 'london_red', 4, '#5C3818', '#000000', 'short'), // Demetrius Cole (CDM 84)
      createSquadFiller('london_red', 8, 'R. Parlor', 'MID', { speed: 82, shot: 76, pass: 83, tackle: 82, stamina: 94, keeper: 30 }, '#FCE0CD', '#E6C280', 'curly'),
      convertOfficialToSquadPlayer(getOfficial('017'), 'london_red', 11, '#C68642', '#171717', 'buzz'), // Flynn Flash (RW 82)
      createSquadFiller('london_red', 9, 'I. Wright', 'FWD', { speed: 90, shot: 88, pass: 78, tackle: 45, stamina: 88, keeper: 30 }, '#8D5524', '#000000', 'buzz'),
      createSquadFiller('london_red', 10, 'D. Berg', 'FWD', { speed: 82, shot: 87, pass: 90, tackle: 52, stamina: 84, keeper: 30 }, '#FCE0CD', '#E6C280', 'short')
    ]
  },

  // 4. Madrid Royal
  {
    id: 'madrid_royal',
    name: 'Madrid Royal',
    countryCode: 'MDR',
    flag: '👑',
    starPlayer: 'Hector Stone',
    formation: '4-3-3',
    primaryColor: '#FFFFFF',    // Pristine White
    secondaryColor: '#0F172A',  // Navy Shorts
    stripeColor: '#EAB308',     // Royal Gold
    gkColor: '#F97316',         // Orange GK
    sockColor: '#FFFFFF',
    overallRating: 87,
    attributes: { speed: 86, attack: 87, defense: 90, stamina: 88 },
    squad: [
      createSquadFiller('madrid_royal', 1, 'I. Casal', 'GK', { speed: 66, shot: 30, pass: 68, tackle: 62, stamina: 86, keeper: 87 }, '#F5D0A9', '#171717', 'short'),
      createSquadFiller('madrid_royal', 2, 'M. Salgado', 'DEF', { speed: 85, shot: 58, pass: 78, tackle: 85, stamina: 92, keeper: 30 }, '#F5D0A9', '#E6C280', 'long'),
      convertOfficialToSquadPlayer(getOfficial('064'), 'madrid_royal', 4, '#F5D0A9', '#4A3728', 'short'), // Hector Stone (CB 87)
      createSquadFiller('madrid_royal', 5, 'F. Hierro', 'DEF', { speed: 78, shot: 74, pass: 84, tackle: 88, stamina: 90, keeper: 30 }, '#F5D0A9', '#2B1B17', 'short'),
      convertOfficialToSquadPlayer(getOfficial('080'), 'madrid_royal', 3, '#F5D0A9', '#171717', 'short'), // Javier Glide (LWB 82)
      convertOfficialToSquadPlayer(getOfficial('048'), 'madrid_royal', 10, '#F5D0A9', '#2B1B17', 'curly'), // Gael Montero (LM 82)
      createSquadFiller('madrid_royal', 8, 'G. Redondo', 'MID', { speed: 80, shot: 75, pass: 90, tackle: 85, stamina: 89, keeper: 30 }, '#F5D0A9', '#E6C280', 'long'),
      createSquadFiller('madrid_royal', 6, 'C. Seedorf', 'MID', { speed: 84, shot: 82, pass: 87, tackle: 82, stamina: 93, keeper: 30 }, '#8D5524', '#000000', 'buzz'),
      createSquadFiller('madrid_royal', 7, 'R. Gonzalez', 'FWD', { speed: 88, shot: 90, pass: 85, tackle: 50, stamina: 89, keeper: 30 }, '#F5D0A9', '#171717', 'short'),
      createSquadFiller('madrid_royal', 9, 'D. Suker', 'FWD', { speed: 84, shot: 92, pass: 82, tackle: 45, stamina: 86, keeper: 30 }, '#F5D0A9', '#4A3728', 'short'),
      createSquadFiller('madrid_royal', 11, 'P. Mijat', 'FWD', { speed: 89, shot: 88, pass: 84, tackle: 48, stamina: 86, keeper: 30 }, '#F5D0A9', '#171717', 'short')
    ]
  },

  // 5. Buenos Aires FC
  {
    id: 'buenos_aires',
    name: 'Buenos Aires FC',
    countryCode: 'BAF',
    flag: '☀️',
    starPlayer: 'Diego Maestro',
    formation: '4-4-2',
    primaryColor: '#38BDF8',    // Albiceleste Sky Blue
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#FACC15',     // Sun of May Gold
    gkColor: '#A855F7',         // Violet GK
    sockColor: '#38BDF8',
    overallRating: 88,
    attributes: { speed: 87, attack: 92, defense: 83, stamina: 86 },
    squad: [
      convertOfficialToSquadPlayer(getOfficial('093'), 'buenos_aires', 1, '#F5D0A9', '#2B1B17', 'curly'), // Mateo Block (GK 84)
      createSquadFiller('buenos_aires', 4, 'J. Zanetti', 'DEF', { speed: 88, shot: 62, pass: 82, tackle: 88, stamina: 96, keeper: 30 }, '#F5D0A9', '#171717', 'short'),
      createSquadFiller('buenos_aires', 2, 'R. Ayala', 'DEF', { speed: 82, shot: 50, pass: 75, tackle: 90, stamina: 92, keeper: 30 }, '#F5D0A9', '#2B1B17', 'long'),
      createSquadFiller('buenos_aires', 6, 'W. Samuel', 'DEF', { speed: 78, shot: 45, pass: 72, tackle: 89, stamina: 91, keeper: 30 }, '#C68642', '#000000', 'buzz'),
      createSquadFiller('buenos_aires', 3, 'J. Sorin', 'DEF', { speed: 84, shot: 68, pass: 80, tackle: 84, stamina: 95, keeper: 30 }, '#F5D0A9', '#4A3728', 'long'),
      createSquadFiller('buenos_aires', 8, 'D. Simeone', 'MID', { speed: 80, shot: 76, pass: 84, tackle: 91, stamina: 97, keeper: 30 }, '#F5D0A9', '#171717', 'short'),
      convertOfficialToSquadPlayer(getOfficial('030'), 'buenos_aires', 10, '#F5D0A9', '#171717', 'curly'), // Diego Maestro (CAM 88)
      createSquadFiller('buenos_aires', 5, 'F. Redondo', 'MID', { speed: 78, shot: 74, pass: 92, tackle: 86, stamina: 90, keeper: 30 }, '#F5D0A9', '#E6C280', 'long'),
      createSquadFiller('buenos_aires', 7, 'C. Lopez', 'MID', { speed: 92, shot: 82, pass: 82, tackle: 50, stamina: 88, keeper: 30 }, '#F5D0A9', '#2B1B17', 'long'),
      createSquadFiller('buenos_aires', 9, 'G. Batistuta', 'FWD', { speed: 89, shot: 96, pass: 80, tackle: 52, stamina: 92, keeper: 30 }, '#F5D0A9', '#E6C280', 'long'),
      createSquadFiller('buenos_aires', 11, 'H. Crespo', 'FWD', { speed: 88, shot: 91, pass: 78, tackle: 48, stamina: 89, keeper: 30 }, '#F5D0A9', '#4A3728', 'long')
    ]
  },

  // 6. Turin Zebras
  {
    id: 'turin_zebras',
    name: 'Turin Zebras',
    countryCode: 'TRZ',
    flag: '🦓',
    starPlayer: 'Dante Granite',
    formation: '4-4-2',
    primaryColor: '#090D16',    // Black & White stripes
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#E2E8F0',     // White stripes
    gkColor: '#EAB308',         // Gold GK
    sockColor: '#090D16',
    overallRating: 86,
    attributes: { speed: 84, attack: 85, defense: 91, stamina: 89 },
    squad: [
      createSquadFiller('turin_zebras', 1, 'A. Peruzzi', 'GK', { speed: 65, shot: 30, pass: 64, tackle: 62, stamina: 88, keeper: 88 }, '#F5D0A9', '#2B1B17', 'short'),
      convertOfficialToSquadPlayer(getOfficial('083'), 'turin_zebras', 2, '#F5D0A9', '#171717', 'short'), // Giacomo Wing (RB 81)
      convertOfficialToSquadPlayer(getOfficial('068'), 'turin_zebras', 6, '#F5D0A9', '#4A3728', 'buzz'), // Dante Granite (CB 84)
      createSquadFiller('turin_zebras', 4, 'M. Carrera', 'DEF', { speed: 78, shot: 48, pass: 72, tackle: 88, stamina: 90, keeper: 30 }, '#F5D0A9', '#2B1B17', 'short'),
      createSquadFiller('turin_zebras', 3, 'G. Pessotto', 'DEF', { speed: 83, shot: 58, pass: 80, tackle: 84, stamina: 93, keeper: 30 }, '#F5D0A9', '#4A3728', 'short'),
      convertOfficialToSquadPlayer(getOfficial('056'), 'turin_zebras', 5, '#F5D0A9', '#171717', 'short'), // Sandro Bastoni (CDM 83)
      createSquadFiller('turin_zebras', 8, 'A. Conte', 'MID', { speed: 82, shot: 80, pass: 85, tackle: 88, stamina: 96, keeper: 30 }, '#F5D0A9', '#3E2723', 'short'),
      createSquadFiller('turin_zebras', 7, 'A. Di Livio', 'MID', { speed: 87, shot: 72, pass: 83, tackle: 82, stamina: 95, keeper: 30 }, '#F5D0A9', '#2B1B17', 'buzz'),
      createSquadFiller('turin_zebras', 10, 'A. Del Piero', 'MID', { speed: 89, shot: 93, pass: 92, tackle: 52, stamina: 88, keeper: 30 }, '#F5D0A9', '#171717', 'short'),
      convertOfficialToSquadPlayer(getOfficial('009'), 'turin_zebras', 9, '#F5D0A9', '#3E2723', 'curly'), // Giacomo Rossi (ST 82)
      createSquadFiller('turin_zebras', 11, 'F. Ravanelli', 'FWD', { speed: 86, shot: 90, pass: 78, tackle: 58, stamina: 92, keeper: 30 }, '#F5D0A9', '#E2E8F0', 'short')
    ]
  },

  // 7. Munich United
  {
    id: 'munich_united',
    name: 'Munich United',
    countryCode: 'MNU',
    flag: '🦅',
    starPlayer: 'Tobias Kross',
    formation: '4-4-2',
    primaryColor: '#991B1B',    // Maroon Red
    secondaryColor: '#1E293B',  // Slate Navy shorts
    stripeColor: '#FFFFFF',     // White trim
    gkColor: '#0284C7',         // Sky Blue GK
    sockColor: '#991B1B',
    overallRating: 86,
    attributes: { speed: 82, attack: 86, defense: 88, stamina: 92 },
    squad: [
      convertOfficialToSquadPlayer(getOfficial('094'), 'munich_united', 1, '#FCE0CD', '#4A3728', 'short'), // Klaus Shielding (GK 84)
      createSquadFiller('munich_united', 2, 'K. Laux', 'DEF', { speed: 83, shot: 52, pass: 75, tackle: 84, stamina: 89, keeper: 30 }, '#FCE0CD', '#E6C280', 'short'),
      createSquadFiller('munich_united', 4, 'B. Linke', 'DEF', { speed: 76, shot: 48, pass: 72, tackle: 87, stamina: 92, keeper: 30 }, '#FCE0CD', '#5C4033', 'buzz'),
      createSquadFiller('munich_united', 5, 'S. Kuffour', 'DEF', { speed: 84, shot: 42, pass: 70, tackle: 89, stamina: 93, keeper: 30 }, '#5C3818', '#000000', 'buzz'),
      createSquadFiller('munich_united', 3, 'M. Tarnat', 'DEF', { speed: 84, shot: 82, pass: 80, tackle: 82, stamina: 91, keeper: 30 }, '#FCE0CD', '#E6C280', 'short'),
      convertOfficialToSquadPlayer(getOfficial('051'), 'munich_united', 8, '#FCE0CD', '#8B5A2B', 'short'), // Tobias Kross (CDM 86)
      createSquadFiller('munich_united', 6, 'J. Jeremies', 'MID', { speed: 78, shot: 72, pass: 82, tackle: 90, stamina: 96, keeper: 30 }, '#FCE0CD', '#4A3728', 'buzz'),
      convertOfficialToSquadPlayer(getOfficial('036'), 'munich_united', 10, '#FCE0CD', '#E6C280', 'curly'), // Lukas Loomis (CAM 81)
      createSquadFiller('munich_united', 7, 'M. Basler', 'MID', { speed: 84, shot: 88, pass: 88, tackle: 68, stamina: 85, keeper: 30 }, '#FCE0CD', '#5C4033', 'short'),
      convertOfficialToSquadPlayer(getOfficial('004'), 'munich_united', 9, '#FCE0CD', '#2B1B17', 'short'), // Luka Iron (ST 82)
      createSquadFiller('munich_united', 11, 'A. Zickler', 'FWD', { speed: 92, shot: 84, pass: 76, tackle: 45, stamina: 86, keeper: 30 }, '#FCE0CD', '#E6C280', 'short')
    ]
  },

  // 8. Real Lombardy
  {
    id: 'real_lombardy',
    name: 'Real Lombardy',
    countryCode: 'RLM',
    flag: '🐍',
    starPlayer: 'Bruno Cannon',
    formation: '4-4-2',
    primaryColor: '#1D4ED8',    // Inter Royal Blue
    secondaryColor: '#0F172A',  // Black shorts
    stripeColor: '#3B82F6',     // Blue stripes
    gkColor: '#F43F5E',         // Rose GK
    sockColor: '#1D4ED8',
    overallRating: 86,
    attributes: { speed: 86, attack: 88, defense: 87, stamina: 88 },
    squad: [
      createSquadFiller('real_lombardy', 1, 'G. Pagliari', 'GK', { speed: 65, shot: 30, pass: 62, tackle: 60, stamina: 88, keeper: 86 }, '#F5D0A9', '#171717', 'short'),
      convertOfficialToSquadPlayer(getOfficial('077'), 'real_lombardy', 2, '#F5D0A9', '#2B1B17', 'short'), // Rocco Strider (RB 82)
      createSquadFiller('real_lombardy', 6, 'G. Bergomi', 'DEF', { speed: 78, shot: 48, pass: 75, tackle: 92, stamina: 93, keeper: 30 }, '#F5D0A9', '#171717', 'buzz'),
      createSquadFiller('real_lombardy', 5, 'L. Blanc', 'DEF', { speed: 77, shot: 62, pass: 82, tackle: 90, stamina: 90, keeper: 30 }, '#F5D0A9', '#5C4033', 'short'),
      createSquadFiller('real_lombardy', 3, 'T. West', 'DEF', { speed: 86, shot: 45, pass: 70, tackle: 88, stamina: 92, keeper: 30 }, '#5C3818', '#15803D', 'curly'),
      convertOfficialToSquadPlayer(getOfficial('028'), 'real_lombardy', 8, '#F5D0A9', '#4A3728', 'short'), // Marco Vance (CM 85)
      createSquadFiller('real_lombardy', 4, 'B. Cauet', 'MID', { speed: 82, shot: 74, pass: 83, tackle: 85, stamina: 94, keeper: 30 }, '#F5D0A9', '#E6C280', 'buzz'),
      createSquadFiller('real_lombardy', 10, 'A. Recoba', 'MID', { speed: 89, shot: 94, pass: 90, tackle: 45, stamina: 82, keeper: 30 }, '#F5D0A9', '#171717', 'short'),
      createSquadFiller('real_lombardy', 7, 'F. Moriero', 'MID', { speed: 88, shot: 78, pass: 84, tackle: 70, stamina: 88, keeper: 30 }, '#F5D0A9', '#2B1B17', 'short'),
      convertOfficialToSquadPlayer(getOfficial('002'), 'real_lombardy', 9, '#F5D0A9', '#3E2723', 'short'), // Bruno Cannon (ST 85)
      createSquadFiller('real_lombardy', 11, 'I. Zamorano', 'FWD', { speed: 85, shot: 89, pass: 78, tackle: 58, stamina: 91, keeper: 30 }, '#F5D0A9', '#171717', 'long')
    ]
  },

  // 9. Paris Athletic
  {
    id: 'paris_athletic',
    name: 'Paris Athletic',
    countryCode: 'PAR',
    flag: '⚜️',
    starPlayer: 'Julien Mercer',
    formation: '4-3-3',
    primaryColor: '#0F172A',    // Midnight Navy
    secondaryColor: '#EF4444',  // Red Accent
    stripeColor: '#FFFFFF',     // White trim
    gkColor: '#14B8A6',         // Teal GK
    sockColor: '#0F172A',
    overallRating: 85,
    attributes: { speed: 86, attack: 87, defense: 84, stamina: 85 },
    squad: [
      convertOfficialToSquadPlayer(getOfficial('099'), 'paris_athletic', 1, '#F5D0A9', '#4A3728', 'short'), // Hugo Palmer (GK 81)
      convertOfficialToSquadPlayer(getOfficial('079'), 'paris_athletic', 2, '#F5D0A9', '#2B1B17', 'buzz'), // Eugen Surge (RB 83)
      createSquadFiller('paris_athletic', 4, 'A. Roche', 'DEF', { speed: 76, shot: 45, pass: 72, tackle: 85, stamina: 88, keeper: 30 }, '#F5D0A9', '#5C4033', 'short'),
      createSquadFiller('paris_athletic', 5, 'P. Le Guen', 'DEF', { speed: 75, shot: 78, pass: 82, tackle: 84, stamina: 89, keeper: 30 }, '#F5D0A9', '#2B1B17', 'short'),
      createSquadFiller('paris_athletic', 3, 'B. Colleter', 'DEF', { speed: 82, shot: 52, pass: 74, tackle: 82, stamina: 87, keeper: 30 }, '#F5D0A9', '#4A3728', 'short'),
      convertOfficialToSquadPlayer(getOfficial('029'), 'paris_athletic', 10, '#F5D0A9', '#171717', 'curly'), // Julien Mercer (CAM 85)
      createSquadFiller('paris_athletic', 8, 'V. Guerin', 'MID', { speed: 84, shot: 78, pass: 85, tackle: 82, stamina: 92, keeper: 30 }, '#F5D0A9', '#4A3728', 'short'),
      createSquadFiller('paris_athletic', 6, 'D. Bravo', 'MID', { speed: 80, shot: 75, pass: 84, tackle: 78, stamina: 88, keeper: 30 }, '#F5D0A9', '#2B1B17', 'short'),
      createSquadFiller('paris_athletic', 7, 'D. Ginola', 'FWD', { speed: 88, shot: 86, pass: 88, tackle: 50, stamina: 86, keeper: 30 }, '#F5D0A9', '#4A3728', 'long'),
      convertOfficialToSquadPlayer(getOfficial('007'), 'paris_athletic', 9, '#F5D0A9', '#3E2723', 'short'), // Gabriel Thorne (CF 83)
      createSquadFiller('paris_athletic', 11, 'G. Weah', 'FWD', { speed: 92, shot: 90, pass: 82, tackle: 55, stamina: 90, keeper: 30 }, '#5C3818', '#000000', 'buzz')
    ]
  },

  // 10. Amsterdam Orange
  {
    id: 'amsterdam_orange',
    name: 'Amsterdam Orange',
    countryCode: 'AMS',
    flag: '🦁',
    starPlayer: 'Jens Van Der Boom',
    formation: '4-3-3',
    primaryColor: '#EA580C',    // Total Football Orange
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#0F172A',     // Black trim
    gkColor: '#3B82F6',         // Blue GK
    sockColor: '#EA580C',
    overallRating: 86,
    attributes: { speed: 88, attack: 87, defense: 85, stamina: 88 },
    squad: [
      createSquadFiller('amsterdam_orange', 1, 'E. Van Der Sar', 'GK', { speed: 64, shot: 30, pass: 75, tackle: 60, stamina: 88, keeper: 89 }, '#FCE0CD', '#4A3728', 'short'),
      createSquadFiller('amsterdam_orange', 2, 'M. Reiziger', 'DEF', { speed: 89, shot: 50, pass: 78, tackle: 85, stamina: 92, keeper: 30 }, '#8D5524', '#000000', 'buzz'),
      createSquadFiller('amsterdam_orange', 4, 'D. Blind', 'DEF', { speed: 76, shot: 65, pass: 86, tackle: 89, stamina: 90, keeper: 30 }, '#FCE0CD', '#5C4033', 'short'),
      createSquadFiller('amsterdam_orange', 5, 'F. De Boer', 'DEF', { speed: 78, shot: 82, pass: 88, tackle: 88, stamina: 89, keeper: 30 }, '#FCE0CD', '#4A3728', 'short'),
      convertOfficialToSquadPlayer(getOfficial('084'), 'amsterdam_orange', 3, '#FCE0CD', '#E6C280', 'short'), // Niels Overlap (LWB 81)
      convertOfficialToSquadPlayer(getOfficial('054'), 'amsterdam_orange', 6, '#FCE0CD', '#4A3728', 'buzz'), // Bram Van Dijk (CDM 84)
      createSquadFiller('amsterdam_orange', 8, 'E. Davids', 'MID', { speed: 89, shot: 82, pass: 86, tackle: 92, stamina: 97, keeper: 30 }, '#8D5524', '#000000', 'long'),
      createSquadFiller('amsterdam_orange', 10, 'C. Seedorf', 'MID', { speed: 85, shot: 84, pass: 88, tackle: 82, stamina: 92, keeper: 30 }, '#8D5524', '#000000', 'buzz'),
      createSquadFiller('amsterdam_orange', 7, 'F. George', 'FWD', { speed: 90, shot: 82, pass: 84, tackle: 52, stamina: 86, keeper: 30 }, '#8D5524', '#000000', 'buzz'),
      createSquadFiller('amsterdam_orange', 9, 'P. Kluivert', 'FWD', { speed: 88, shot: 91, pass: 83, tackle: 54, stamina: 89, keeper: 30 }, '#8D5524', '#000000', 'short'),
      convertOfficialToSquadPlayer(getOfficial('015'), 'amsterdam_orange', 11, '#FCE0CD', '#E6C280', 'long') // Jens Van Der Boom (LW 85)
    ]
  },

  // 11. Stockholm Blue
  {
    id: 'stockholm_blue',
    name: 'Stockholm Blue',
    countryCode: 'STO',
    flag: '⚔️',
    starPlayer: 'Leo Lindqvist',
    formation: '4-4-2',
    primaryColor: '#0284C7',    // Nordic Sky Blue
    secondaryColor: '#FACC15',  // Scandinavian Gold shorts
    stripeColor: '#38BDF8',     // Ice Blue
    gkColor: '#10B981',         // Forest Green GK
    sockColor: '#0284C7',
    overallRating: 85,
    attributes: { speed: 87, attack: 85, defense: 83, stamina: 88 },
    squad: [
      convertOfficialToSquadPlayer(getOfficial('096'), 'stockholm_blue', 1, '#FCE0CD', '#E6C280', 'short'), // Tobias Glove (GK 83)
      createSquadFiller('stockholm_blue', 2, 'R. Nilsson', 'DEF', { speed: 84, shot: 55, pass: 78, tackle: 83, stamina: 88, keeper: 30 }, '#FCE0CD', '#5C4033', 'short'),
      createSquadFiller('stockholm_blue', 4, 'P. Andersson', 'DEF', { speed: 78, shot: 52, pass: 75, tackle: 88, stamina: 92, keeper: 30 }, '#FCE0CD', '#4A3728', 'buzz'),
      createSquadFiller('stockholm_blue', 5, 'J. Bjorklund', 'DEF', { speed: 80, shot: 46, pass: 72, tackle: 86, stamina: 90, keeper: 30 }, '#FCE0CD', '#E6C280', 'short'),
      createSquadFiller('stockholm_blue', 3, 'P. Kamark', 'DEF', { speed: 82, shot: 54, pass: 76, tackle: 82, stamina: 88, keeper: 30 }, '#FCE0CD', '#8B5A2B', 'short'),
      createSquadFiller('stockholm_blue', 7, 'S. Schwarz', 'MID', { speed: 83, shot: 82, pass: 85, tackle: 88, stamina: 94, keeper: 30 }, '#FCE0CD', '#4A3728', 'short'),
      convertOfficialToSquadPlayer(getOfficial('026'), 'stockholm_blue', 10, '#FCE0CD', '#E6C280', 'short'), // Leo Lindqvist (CAM 87)
      createSquadFiller('stockholm_blue', 8, 'H. Mild', 'MID', { speed: 82, shot: 78, pass: 83, tackle: 85, stamina: 92, keeper: 30 }, '#FCE0CD', '#8B5A2B', 'buzz'),
      convertOfficialToSquadPlayer(getOfficial('024'), 'stockholm_blue', 11, '#FCE0CD', '#E6C280', 'curly'), // Elias Dart (LW 80)
      createSquadFiller('stockholm_blue', 9, 'M. Dahlin', 'FWD', { speed: 87, shot: 88, pass: 80, tackle: 52, stamina: 88, keeper: 30 }, '#8D5524', '#000000', 'short'),
      createSquadFiller('stockholm_blue', 17, 'K. Andersson', 'FWD', { speed: 82, shot: 90, pass: 78, tackle: 54, stamina: 92, keeper: 30 }, '#FCE0CD', '#E6C280', 'short')
    ]
  },

  // 12. Rio Samba
  {
    id: 'rio_samba',
    name: 'Rio Samba',
    countryCode: 'RIO',
    flag: '🌴',
    starPlayer: 'Darius Reflex',
    formation: '4-3-3',
    primaryColor: '#EAB308',    // Canary Yellow
    secondaryColor: '#16A34A',  // Green shorts
    stripeColor: '#2563EB',     // Blue trim
    gkColor: '#9333EA',         // Purple GK
    sockColor: '#FFFFFF',
    overallRating: 85,
    attributes: { speed: 88, attack: 87, defense: 82, stamina: 85 },
    squad: [
      convertOfficialToSquadPlayer(getOfficial('095'), 'rio_samba', 1, '#C68642', '#171717', 'short'), // Darius Reflex (GK 83)
      createSquadFiller('rio_samba', 2, 'C. Cafu', 'DEF', { speed: 92, shot: 68, pass: 82, tackle: 85, stamina: 98, keeper: 30 }, '#8D5524', '#000000', 'buzz'),
      createSquadFiller('rio_samba', 3, 'L. Carlos', 'DEF', { speed: 82, shot: 55, pass: 76, tackle: 87, stamina: 90, keeper: 30 }, '#C68642', '#171717', 'short'),
      createSquadFiller('rio_samba', 4, 'J. Roque', 'DEF', { speed: 80, shot: 50, pass: 74, tackle: 86, stamina: 89, keeper: 30 }, '#8D5524', '#000000', 'buzz'),
      createSquadFiller('rio_samba', 6, 'R. Carlos', 'DEF', { speed: 95, shot: 94, pass: 84, tackle: 84, stamina: 96, keeper: 30 }, '#C68642', '#000000', 'buzz'),
      convertOfficialToSquadPlayer(getOfficial('035'), 'rio_samba', 8, '#C68642', '#171717', 'short'), // Mateus Silva (CM 81)
      createSquadFiller('rio_samba', 5, 'E. Emerson', 'MID', { speed: 82, shot: 76, pass: 85, tackle: 88, stamina: 93, keeper: 30 }, '#8D5524', '#000000', 'short'),
      createSquadFiller('rio_samba', 10, 'R. Rivaldo', 'MID', { speed: 89, shot: 93, pass: 92, tackle: 56, stamina: 87, keeper: 30 }, '#8D5524', '#000000', 'curly'),
      convertOfficialToSquadPlayer(getOfficial('020'), 'rio_samba', 11, '#C68642', '#171717', 'buzz'), // Rafa Spark (LW 82)
      createSquadFiller('rio_samba', 9, 'R. Ronaldo', 'FWD', { speed: 96, shot: 97, pass: 86, tackle: 50, stamina: 89, keeper: 30 }, '#C68642', '#000000', 'buzz'),
      createSquadFiller('rio_samba', 7, 'E. Denilson', 'FWD', { speed: 94, shot: 80, pass: 85, tackle: 45, stamina: 86, keeper: 30 }, '#8D5524', '#000000', 'short')
    ]
  },

  // 13. Eastern Star
  {
    id: 'eastern_star',
    name: 'Eastern Star',
    countryCode: 'EAS',
    flag: '⭐',
    starPlayer: 'Igor Sentry',
    formation: '5-3-2',
    primaryColor: '#881337',    // Deep Maroon
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#FACC15',     // Gold Star trim
    gkColor: '#0D9488',         // Teal GK
    sockColor: '#881337',
    overallRating: 84,
    attributes: { speed: 80, attack: 84, defense: 88, stamina: 91 },
    squad: [
      convertOfficialToSquadPlayer(getOfficial('091'), 'eastern_star', 1, '#FCE0CD', '#5C4033', 'short'), // Igor Sentry (GK 85)
      createSquadFiller('eastern_star', 2, 'A. Khlestov', 'DEF', { speed: 82, shot: 50, pass: 74, tackle: 84, stamina: 90, keeper: 30 }, '#FCE0CD', '#4A3728', 'short'),
      convertOfficialToSquadPlayer(getOfficial('075'), 'eastern_star', 4, '#FCE0CD', '#2B1B17', 'buzz'), // Viktor Ironhide (CB 82)
      createSquadFiller('eastern_star', 5, 'Y. Nikiforov', 'DEF', { speed: 79, shot: 76, pass: 78, tackle: 88, stamina: 92, keeper: 30 }, '#FCE0CD', '#E6C280', 'short'),
      createSquadFiller('eastern_star', 6, 'V. Onopko', 'DEF', { speed: 76, shot: 55, pass: 76, tackle: 89, stamina: 93, keeper: 30 }, '#FCE0CD', '#8B5A2B', 'buzz'),
      createSquadFiller('eastern_star', 3, 'S. Gorlukovich', 'DEF', { speed: 78, shot: 48, pass: 70, tackle: 87, stamina: 94, keeper: 30 }, '#FCE0CD', '#4A3728', 'short'),
      createSquadFiller('eastern_star', 8, 'A. Mostovoi', 'MID', { speed: 84, shot: 86, pass: 89, tackle: 75, stamina: 88, keeper: 30 }, '#FCE0CD', '#4A3728', 'long'),
      createSquadFiller('eastern_star', 10, 'V. Karpin', 'MID', { speed: 86, shot: 84, pass: 87, tackle: 80, stamina: 92, keeper: 30 }, '#FCE0CD', '#E6C280', 'short'),
      createSquadFiller('eastern_star', 7, 'I. Kolyvanov', 'MID', { speed: 82, shot: 82, pass: 83, tackle: 68, stamina: 87, keeper: 30 }, '#FCE0CD', '#2B1B17', 'short'),
      convertOfficialToSquadPlayer(getOfficial('012'), 'eastern_star', 9, '#FCE0CD', '#4A3728', 'short'), // Igor Volkov (ST 81)
      createSquadFiller('eastern_star', 11, 'S. Yuran', 'FWD', { speed: 84, shot: 87, pass: 78, tackle: 52, stamina: 89, keeper: 30 }, '#FCE0CD', '#E6C280', 'short')
    ]
  },

  // 14. Lisbon Lions
  {
    id: 'lisbon_lions',
    name: 'Lisbon Lions',
    countryCode: 'LIS',
    flag: '🛡️',
    starPlayer: 'Santi Blaze',
    formation: '4-3-3',
    primaryColor: '#15803D',    // Sporting Green
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#FACC15',     // Golden Lion
    gkColor: '#EF4444',         // Red GK
    sockColor: '#15803D',
    overallRating: 84,
    attributes: { speed: 89, attack: 85, defense: 83, stamina: 85 },
    squad: [
      createSquadFiller('lisbon_lions', 1, 'V. Baia', 'GK', { speed: 66, shot: 30, pass: 70, tackle: 60, stamina: 86, keeper: 86 }, '#F5D0A9', '#171717', 'short'),
      createSquadFiller('lisbon_lions', 2, 'P. Secretário', 'DEF', { speed: 84, shot: 55, pass: 76, tackle: 82, stamina: 88, keeper: 30 }, '#F5D0A9', '#2B1B17', 'short'),
      createSquadFiller('lisbon_lions', 4, 'J. Couto', 'DEF', { speed: 78, shot: 52, pass: 74, tackle: 88, stamina: 91, keeper: 30 }, '#F5D0A9', '#4A3728', 'long'),
      createSquadFiller('lisbon_lions', 5, 'H. Costa', 'DEF', { speed: 76, shot: 46, pass: 72, tackle: 87, stamina: 90, keeper: 30 }, '#F5D0A9', '#171717', 'short'),
      convertOfficialToSquadPlayer(getOfficial('088'), 'lisbon_lions', 3, '#F5D0A9', '#2B1B17', 'short'), // Tomas Line (LB 80)
      convertOfficialToSquadPlayer(getOfficial('062'), 'lisbon_lions', 6, '#F5D0A9', '#171717', 'buzz'), // Tito Santos (CDM 80)
      createSquadFiller('lisbon_lions', 8, 'P. Sousa', 'MID', { speed: 82, shot: 76, pass: 89, tackle: 84, stamina: 90, keeper: 30 }, '#F5D0A9', '#3E2723', 'short'),
      createSquadFiller('lisbon_lions', 10, 'R. Costa', 'MID', { speed: 86, shot: 88, pass: 93, tackle: 58, stamina: 87, keeper: 30 }, '#F5D0A9', '#2B1B17', 'long'),
      createSquadFiller('lisbon_lions', 7, 'L. Figo', 'FWD', { speed: 90, shot: 89, pass: 91, tackle: 58, stamina: 91, keeper: 30 }, '#F5D0A9', '#171717', 'short'),
      createSquadFiller('lisbon_lions', 9, 'P. Pauleta', 'FWD', { speed: 86, shot: 91, pass: 78, tackle: 45, stamina: 88, keeper: 30 }, '#F5D0A9', '#2B1B17', 'short'),
      convertOfficialToSquadPlayer(getOfficial('016'), 'lisbon_lions', 11, '#F5D0A9', '#3E2723', 'curly') // Santi Blaze (LW 83)
    ]
  },

  // 15. Belgrade Red
  {
    id: 'belgrade_red',
    name: 'Belgrade Red',
    countryCode: 'BEL',
    flag: '⚡',
    starPlayer: 'Nemanja Steel',
    formation: '3-5-2',
    primaryColor: '#B91C1C',    // Red Star Belgrade
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#1D4ED8',     // Blue stripe
    gkColor: '#059669',         // Emerald GK
    sockColor: '#B91C1C',
    overallRating: 85,
    attributes: { speed: 85, attack: 85, defense: 87, stamina: 88 },
    squad: [
      createSquadFiller('belgrade_red', 1, 'I. Kralj', 'GK', { speed: 64, shot: 30, pass: 66, tackle: 60, stamina: 87, keeper: 84 }, '#FCE0CD', '#4A3728', 'short'),
      convertOfficialToSquadPlayer(getOfficial('070'), 'belgrade_red', 5, '#FCE0CD', '#2B1B17', 'buzz'), // Nemanja Steel (CB 84)
      createSquadFiller('belgrade_red', 4, 'S. Mihajlovic', 'DEF', { speed: 78, shot: 95, pass: 91, tackle: 88, stamina: 90, keeper: 30 }, '#FCE0CD', '#4A3728', 'short'),
      createSquadFiller('belgrade_red', 6, 'G. Djorovic', 'DEF', { speed: 80, shot: 52, pass: 76, tackle: 86, stamina: 91, keeper: 30 }, '#FCE0CD', '#171717', 'short'),
      convertOfficialToSquadPlayer(getOfficial('081'), 'belgrade_red', 2, '#FCE0CD', '#4A3728', 'short'), // Milan Sweep (RWB 82)
      createSquadFiller('belgrade_red', 7, 'V. Jugovic', 'MID', { speed: 84, shot: 82, pass: 86, tackle: 86, stamina: 94, keeper: 30 }, '#FCE0CD', '#2B1B17', 'short'),
      createSquadFiller('belgrade_red', 8, 'S. Stojkovic', 'MID', { speed: 85, shot: 88, pass: 92, tackle: 62, stamina: 86, keeper: 30 }, '#FCE0CD', '#4A3728', 'short'),
      createSquadFiller('belgrade_red', 10, 'D. Stankovic', 'MID', { speed: 84, shot: 86, pass: 86, tackle: 82, stamina: 92, keeper: 30 }, '#FCE0CD', '#171717', 'buzz'),
      convertOfficialToSquadPlayer(getOfficial('022'), 'belgrade_red', 11, '#FCE0CD', '#2B1B17', 'curly'), // Milan Petrov (LW 83)
      createSquadFiller('belgrade_red', 9, 'P. Mijatovic', 'FWD', { speed: 88, shot: 90, pass: 84, tackle: 50, stamina: 88, keeper: 30 }, '#FCE0CD', '#171717', 'short'),
      createSquadFiller('belgrade_red', 18, 'S. Milosevic', 'FWD', { speed: 83, shot: 89, pass: 78, tackle: 52, stamina: 90, keeper: 30 }, '#FCE0CD', '#4A3728', 'short')
    ]
  },

  // 16. Copenhagen FC
  {
    id: 'copenhagen_fc',
    name: 'Copenhagen FC',
    countryCode: 'COP',
    flag: '⚓',
    starPlayer: 'Sven Titan',
    formation: '4-4-2',
    primaryColor: '#F8FAFC',    // Pure White
    secondaryColor: '#1E3A8A',  // Navy shorts
    stripeColor: '#38BDF8',     // Cyan trim
    gkColor: '#D97706',         // Amber GK
    sockColor: '#F8FAFC',
    overallRating: 84,
    attributes: { speed: 83, attack: 84, defense: 87, stamina: 89 },
    squad: [
      createSquadFiller('copenhagen_fc', 1, 'P. Schmeichel', 'GK', { speed: 68, shot: 35, pass: 72, tackle: 65, stamina: 92, keeper: 91 }, '#FCE0CD', '#E6C280', 'short'),
      convertOfficialToSquadPlayer(getOfficial('087'), 'copenhagen_fc', 2, '#FCE0CD', '#4A3728', 'short'), // Soren Edge (RB 80)
      convertOfficialToSquadPlayer(getOfficial('073'), 'copenhagen_fc', 4, '#FCE0CD', '#E6C280', 'buzz'), // Sven Titan (CB 83)
      createSquadFiller('copenhagen_fc', 5, 'J. Heintze', 'DEF', { speed: 81, shot: 55, pass: 76, tackle: 85, stamina: 90, keeper: 30 }, '#FCE0CD', '#8B5A2B', 'short'),
      createSquadFiller('copenhagen_fc', 3, 'M. Schjonberg', 'DEF', { speed: 82, shot: 62, pass: 76, tackle: 84, stamina: 91, keeper: 30 }, '#FCE0CD', '#E6C280', 'short'),
      createSquadFiller('copenhagen_fc', 7, 'T. Helveg', 'MID', { speed: 86, shot: 74, pass: 83, tackle: 85, stamina: 94, keeper: 30 }, '#FCE0CD', '#4A3728', 'short'),
      convertOfficialToSquadPlayer(getOfficial('031'), 'copenhagen_fc', 8, '#FCE0CD', '#E6C280', 'short'), // Soren Holm (CM 82)
      createSquadFiller('copenhagen_fc', 6, 'A. Nielsen', 'MID', { speed: 80, shot: 78, pass: 84, tackle: 86, stamina: 92, keeper: 30 }, '#FCE0CD', '#5C4033', 'buzz'),
      createSquadFiller('copenhagen_fc', 10, 'M. Laudrup', 'MID', { speed: 88, shot: 89, pass: 95, tackle: 55, stamina: 86, keeper: 30 }, '#FCE0CD', '#4A3728', 'short'),
      createSquadFiller('copenhagen_fc', 9, 'E. Sand', 'FWD', { speed: 86, shot: 88, pass: 80, tackle: 50, stamina: 89, keeper: 30 }, '#FCE0CD', '#E6C280', 'short'),
      createSquadFiller('copenhagen_fc', 11, 'B. Laudrup', 'FWD', { speed: 92, shot: 88, pass: 89, tackle: 52, stamina: 88, keeper: 30 }, '#FCE0CD', '#4A3728', 'long')
    ]
  },

  // 17. Merseyside Red
  {
    id: 'merseyside_red',
    name: 'Merseyside Red',
    countryCode: 'MER',
    flag: '🔴',
    starPlayer: 'Ray Shield',
    formation: '4-3-3',
    primaryColor: '#DC2626',    // Liverpool Red
    secondaryColor: '#991B1B',  // Deep Red shorts
    stripeColor: '#FFFFFF',     // White trim
    gkColor: '#EAB308',         // Gold GK
    sockColor: '#DC2626',
    overallRating: 85,
    attributes: { speed: 86, attack: 87, defense: 86, stamina: 87 },
    squad: [
      createSquadFiller('merseyside_red', 1, 'D. James', 'GK', { speed: 66, shot: 30, pass: 68, tackle: 60, stamina: 86, keeper: 84 }, '#8D5524', '#000000', 'short'),
      createSquadFiller('merseyside_red', 2, 'R. Jones', 'DEF', { speed: 85, shot: 52, pass: 76, tackle: 82, stamina: 88, keeper: 30 }, '#FCE0CD', '#4A3728', 'short'),
      convertOfficialToSquadPlayer(getOfficial('065'), 'merseyside_red', 4, '#FCE0CD', '#2B1B17', 'buzz'), // Ray Shield (CB 85)
      createSquadFiller('merseyside_red', 5, 'P. Babb', 'DEF', { speed: 82, shot: 45, pass: 70, tackle: 85, stamina: 89, keeper: 30 }, '#8D5524', '#000000', 'buzz'),
      createSquadFiller('merseyside_red', 3, 'S. Bjornebye', 'DEF', { speed: 83, shot: 62, pass: 80, tackle: 81, stamina: 88, keeper: 30 }, '#FCE0CD', '#E6C280', 'short'),
      createSquadFiller('merseyside_red', 8, 'J. Redknapp', 'MID', { speed: 80, shot: 82, pass: 88, tackle: 80, stamina: 86, keeper: 30 }, '#FCE0CD', '#4A3728', 'short'),
      createSquadFiller('merseyside_red', 6, 'P. Ince', 'MID', { speed: 82, shot: 76, pass: 84, tackle: 88, stamina: 93, keeper: 30 }, '#8D5524', '#000000', 'buzz'),
      createSquadFiller('merseyside_red', 10, 'S. McManaman', 'MID', { speed: 90, shot: 82, pass: 87, tackle: 55, stamina: 90, keeper: 30 }, '#FCE0CD', '#E6C280', 'long'),
      convertOfficialToSquadPlayer(getOfficial('003'), 'merseyside_red', 9, '#FCE0CD', '#4A3728', 'short'), // Mateo Ross (CF 84)
      createSquadFiller('merseyside_red', 7, 'M. Owen', 'FWD', { speed: 97, shot: 92, pass: 80, tackle: 40, stamina: 87, keeper: 30 }, '#FCE0CD', '#5C4033', 'short'),
      createSquadFiller('merseyside_red', 11, 'R. Fowler', 'FWD', { speed: 87, shot: 94, pass: 82, tackle: 45, stamina: 86, keeper: 30 }, '#FCE0CD', '#E6C280', 'short')
    ]
  },

  // 18. Ruhr Yellow
  {
    id: 'ruhr_yellow',
    name: 'Ruhr Yellow',
    countryCode: 'RUH',
    flag: '🐝',
    starPlayer: 'Magnus Fortress',
    formation: '4-4-2',
    primaryColor: '#FACC15',    // BVB Neon Yellow
    secondaryColor: '#0F172A',  // Black shorts
    stripeColor: '#171717',     // Black trim
    gkColor: '#2563EB',         // Royal Blue GK
    sockColor: '#FACC15',
    overallRating: 85,
    attributes: { speed: 83, attack: 86, defense: 89, stamina: 90 },
    squad: [
      createSquadFiller('ruhr_yellow', 1, 'S. Klos', 'GK', { speed: 65, shot: 30, pass: 68, tackle: 62, stamina: 87, keeper: 86 }, '#FCE0CD', '#4A3728', 'short'),
      createSquadFiller('ruhr_yellow', 2, 'J. Heinrich', 'DEF', { speed: 86, shot: 62, pass: 78, tackle: 84, stamina: 92, keeper: 30 }, '#FCE0CD', '#E6C280', 'short'),
      convertOfficialToSquadPlayer(getOfficial('066'), 'ruhr_yellow', 5, '#FCE0CD', '#2B1B17', 'buzz'), // Magnus Fortress (CB 88)
      createSquadFiller('ruhr_yellow', 4, 'J. Kohler', 'DEF', { speed: 78, shot: 50, pass: 74, tackle: 92, stamina: 94, keeper: 30 }, '#FCE0CD', '#5C4033', 'short'),
      createSquadFiller('ruhr_yellow', 3, 'D. Dede', 'DEF', { speed: 88, shot: 58, pass: 80, tackle: 82, stamina: 91, keeper: 30 }, '#8D5524', '#000000', 'buzz'),
      createSquadFiller('ruhr_yellow', 8, 'M. Sammer', 'MID', { speed: 82, shot: 80, pass: 88, tackle: 92, stamina: 94, keeper: 30 }, '#FCE0CD', '#E6C280', 'short'),
      createSquadFiller('ruhr_yellow', 6, 'P. Lambert', 'MID', { speed: 80, shot: 72, pass: 84, tackle: 88, stamina: 95, keeper: 30 }, '#FCE0CD', '#4A3728', 'short'),
      createSquadFiller('ruhr_yellow', 10, 'A. Moller', 'MID', { speed: 88, shot: 88, pass: 90, tackle: 68, stamina: 88, keeper: 30 }, '#FCE0CD', '#5C4033', 'short'),
      createSquadFiller('ruhr_yellow', 7, 'L. Ricken', 'MID', { speed: 86, shot: 84, pass: 82, tackle: 65, stamina: 86, keeper: 30 }, '#FCE0CD', '#E6C280', 'short'),
      convertOfficialToSquadPlayer(getOfficial('010'), 'ruhr_yellow', 9, '#FCE0CD', '#4A3728', 'buzz'), // Hektor Bormann (ST 82)
      createSquadFiller('ruhr_yellow', 11, 'S. Chapuisat', 'FWD', { speed: 86, shot: 89, pass: 82, tackle: 52, stamina: 88, keeper: 30 }, '#FCE0CD', '#2B1B17', 'short')
    ]
  },

  // 19. Manchester Red
  {
    id: 'manchester_red',
    name: 'Manchester Red',
    countryCode: 'MCR',
    flag: '👹',
    starPlayer: 'Gideon Steel',
    formation: '4-4-2',
    primaryColor: '#DC2626',    // United Red
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#0F172A',     // Black trim
    gkColor: '#10B981',         // Green GK
    sockColor: '#0F172A',
    overallRating: 86,
    attributes: { speed: 86, attack: 87, defense: 88, stamina: 90 },
    squad: [
      createSquadFiller('manchester_red', 1, 'P. Van Der Gouw', 'GK', { speed: 64, shot: 30, pass: 68, tackle: 60, stamina: 85, keeper: 85 }, '#FCE0CD', '#4A3728', 'short'),
      createSquadFiller('manchester_red', 2, 'G. Neville', 'DEF', { speed: 84, shot: 55, pass: 82, tackle: 86, stamina: 94, keeper: 30 }, '#FCE0CD', '#5C4033', 'short'),
      createSquadFiller('manchester_red', 4, 'J. Stam', 'DEF', { speed: 85, shot: 50, pass: 76, tackle: 94, stamina: 95, keeper: 30 }, '#FCE0CD', '#4A3728', 'buzz'),
      createSquadFiller('manchester_red', 5, 'R. Johnsen', 'DEF', { speed: 82, shot: 54, pass: 78, tackle: 87, stamina: 89, keeper: 30 }, '#FCE0CD', '#E6C280', 'short'),
      createSquadFiller('manchester_red', 3, 'D. Irwin', 'DEF', { speed: 82, shot: 78, pass: 84, tackle: 85, stamina: 91, keeper: 30 }, '#FCE0CD', '#4A3728', 'short'),
      createSquadFiller('manchester_red', 7, 'D. Beckham', 'MID', { speed: 84, shot: 92, pass: 97, tackle: 76, stamina: 94, keeper: 30 }, '#FCE0CD', '#E6C280', 'short'),
      convertOfficialToSquadPlayer(getOfficial('052'), 'manchester_red', 6, '#FCE0CD', '#171717', 'buzz'), // Gideon Steel (CDM 85)
      createSquadFiller('manchester_red', 8, 'P. Scholes', 'MID', { speed: 80, shot: 93, pass: 95, tackle: 78, stamina: 91, keeper: 30 }, '#FCE0CD', '#8B5A2B', 'short'),
      createSquadFiller('manchester_red', 11, 'R. Giggs', 'MID', { speed: 95, shot: 85, pass: 88, tackle: 60, stamina: 90, keeper: 30 }, '#FCE0CD', '#171717', 'curly'),
      convertOfficialToSquadPlayer(getOfficial('011'), 'manchester_red', 9, '#FCE0CD', '#4A3728', 'short'), // Rex Hunter (ST 80)
      createSquadFiller('manchester_red', 10, 'A. Cole', 'FWD', { speed: 91, shot: 90, pass: 78, tackle: 45, stamina: 87, keeper: 30 }, '#5C3818', '#000000', 'buzz')
    ]
  },

  // 20. North London Blue
  {
    id: 'north_london_blue',
    name: 'North London Blue',
    countryCode: 'NLB',
    flag: '🔵',
    starPlayer: 'Felix Prophet',
    formation: '4-3-3',
    primaryColor: '#2563EB',    // Royal Blue
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#60A5FA',     // Sky Blue trim
    gkColor: '#F59E0B',         // Amber GK
    sockColor: '#2563EB',
    overallRating: 84,
    attributes: { speed: 87, attack: 85, defense: 84, stamina: 86 },
    squad: [
      createSquadFiller('north_london_blue', 1, 'E. De Goey', 'GK', { speed: 64, shot: 30, pass: 66, tackle: 60, stamina: 85, keeper: 84 }, '#FCE0CD', '#4A3728', 'short'),
      createSquadFiller('north_london_blue', 2, 'D. Petrescu', 'DEF', { speed: 86, shot: 74, pass: 80, tackle: 82, stamina: 90, keeper: 30 }, '#FCE0CD', '#2B1B17', 'short'),
      convertOfficialToSquadPlayer(getOfficial('072'), 'north_london_blue', 4, '#FCE0CD', '#4A3728', 'buzz'), // Garrick Bastion (CB 82)
      createSquadFiller('north_london_blue', 5, 'F. Leboeuf', 'DEF', { speed: 78, shot: 76, pass: 82, tackle: 86, stamina: 89, keeper: 30 }, '#FCE0CD', '#4A3728', 'buzz'),
      createSquadFiller('north_london_blue', 3, 'G. Le Saux', 'DEF', { speed: 86, shot: 65, pass: 80, tackle: 83, stamina: 91, keeper: 30 }, '#FCE0CD', '#E6C280', 'short'),
      convertOfficialToSquadPlayer(getOfficial('032'), 'north_london_blue', 10, '#FCE0CD', '#4A3728', 'curly'), // Felix Prophet (CAM 82)
      createSquadFiller('north_london_blue', 8, 'D. Wise', 'MID', { speed: 80, shot: 78, pass: 83, tackle: 87, stamina: 95, keeper: 30 }, '#FCE0CD', '#2B1B17', 'short'),
      createSquadFiller('north_london_blue', 6, 'R. Di Matteo', 'MID', { speed: 82, shot: 84, pass: 86, tackle: 80, stamina: 88, keeper: 30 }, '#FCE0CD', '#171717', 'short'),
      createSquadFiller('north_london_blue', 7, 'G. Zola', 'FWD', { speed: 90, shot: 92, pass: 94, tackle: 45, stamina: 85, keeper: 30 }, '#F5D0A9', '#171717', 'short'),
      convertOfficialToSquadPlayer(getOfficial('005'), 'north_london_blue', 9, '#FCE0CD', '#E6C280', 'short'), // Jaxson Vane (ST 81)
      createSquadFiller('north_london_blue', 11, 'T. Flo', 'FWD', { speed: 84, shot: 88, pass: 76, tackle: 45, stamina: 88, keeper: 30 }, '#FCE0CD', '#E6C280', 'short')
    ]
  }
];
