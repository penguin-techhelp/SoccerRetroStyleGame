import { Team } from '../types/game';

export const CLASSIC_TEAMS: Team[] = [
  {
    id: 'brazil',
    name: 'Brazil',
    countryCode: 'BRA',
    flag: '🇧🇷',
    starPlayer: 'Romário',
    formation: '4-4-2',
    primaryColor: '#FACC15',    // Canary Yellow
    secondaryColor: '#1D4ED8',  // Royal Blue shorts
    stripeColor: '#15803D',     // Green collar/trim
    gkColor: '#9333EA',         // Purple GK
    sockColor: '#FFFFFF',
    overallRating: 94,
    attributes: { speed: 95, attack: 96, defense: 88, stamina: 92 },
    squad: [
      { id: 'bra_1', name: 'Taffarel', number: 1, role: 'GK', teamId: 'brazil', stats: { speed: 70, shot: 30, pass: 65, tackle: 70, stamina: 90, keeper: 94 }, skinTone: '#F3C596', hairColor: '#3E2723', hairStyle: 'short' },
      { id: 'bra_2', name: 'Jorginho', number: 2, role: 'DEF', teamId: 'brazil', stats: { speed: 89, shot: 72, pass: 84, tackle: 85, stamina: 92, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'buzz' },
      { id: 'bra_3', name: 'Aldair', number: 3, role: 'DEF', teamId: 'brazil', stats: { speed: 84, shot: 60, pass: 78, tackle: 92, stamina: 90, keeper: 30 }, skinTone: '#8D5524', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'bra_4', name: 'Márcio Santos', number: 4, role: 'DEF', teamId: 'brazil', stats: { speed: 82, shot: 62, pass: 79, tackle: 90, stamina: 89, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'short' },
      { id: 'bra_6', name: 'Branco', number: 6, role: 'DEF', teamId: 'brazil', stats: { speed: 86, shot: 88, pass: 83, tackle: 86, stamina: 90, keeper: 30 }, skinTone: '#F3C596', hairColor: '#5C4033', hairStyle: 'curly' },
      { id: 'bra_5', name: 'Mauro Silva', number: 5, role: 'MID', teamId: 'brazil', stats: { speed: 82, shot: 70, pass: 86, tackle: 91, stamina: 94, keeper: 30 }, skinTone: '#8D5524', hairColor: '#000000', hairStyle: 'short' },
      { id: 'bra_8', name: 'Dunga', number: 8, role: 'MID', teamId: 'brazil', stats: { speed: 83, shot: 84, pass: 91, tackle: 93, stamina: 96, keeper: 30 }, skinTone: '#F3C596', hairColor: '#8B5A2B', hairStyle: 'buzz' },
      { id: 'bra_17', name: 'Mazinho', number: 17, role: 'MID', teamId: 'brazil', stats: { speed: 85, shot: 75, pass: 87, tackle: 85, stamina: 91, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'short' },
      { id: 'bra_9', name: 'Zinho', number: 9, role: 'MID', teamId: 'brazil', stats: { speed: 86, shot: 80, pass: 89, tackle: 79, stamina: 88, keeper: 30 }, skinTone: '#F3C596', hairColor: '#3E2723', hairStyle: 'curly' },
      { id: 'bra_7', name: 'Bebeto', number: 7, role: 'FWD', teamId: 'brazil', stats: { speed: 92, shot: 91, pass: 86, tackle: 60, stamina: 89, keeper: 30 }, skinTone: '#F3C596', hairColor: '#2B1B17', hairStyle: 'short' },
      { id: 'bra_11', name: 'Romário', number: 11, role: 'FWD', teamId: 'brazil', stats: { speed: 97, shot: 98, pass: 88, tackle: 55, stamina: 90, keeper: 30 }, skinTone: '#C68642', hairColor: '#000000', hairStyle: 'short' }
    ]
  },
  {
    id: 'italy',
    name: 'Italy',
    countryCode: 'ITA',
    flag: '🇮🇹',
    starPlayer: 'Roberto Baggio',
    formation: '4-4-2',
    primaryColor: '#1D4ED8',    // Azzurri Blue
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#DC2626',     // Italian Tricolor trim
    gkColor: '#16A34A',         // Green GK
    sockColor: '#1D4ED8',
    overallRating: 93,
    attributes: { speed: 88, attack: 92, defense: 97, stamina: 94 },
    squad: [
      { id: 'ita_1', name: 'Pagliuca', number: 1, role: 'GK', teamId: 'italy', stats: { speed: 68, shot: 30, pass: 60, tackle: 65, stamina: 90, keeper: 95 }, skinTone: '#F5D0A9', hairColor: '#171717', hairStyle: 'long' },
      { id: 'ita_3', name: 'Maldini', number: 3, role: 'DEF', teamId: 'italy', stats: { speed: 90, shot: 74, pass: 88, tackle: 98, stamina: 96, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#4A3728', hairStyle: 'long' },
      { id: 'ita_6', name: 'Baresi', number: 6, role: 'DEF', teamId: 'italy', stats: { speed: 85, shot: 70, pass: 90, tackle: 99, stamina: 95, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#3E2723', hairStyle: 'short' },
      { id: 'ita_2', name: 'Costacurta', number: 2, role: 'DEF', teamId: 'italy', stats: { speed: 84, shot: 62, pass: 81, tackle: 94, stamina: 92, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#2B1B17', hairStyle: 'short' },
      { id: 'ita_4', name: 'Benarrivo', number: 4, role: 'DEF', teamId: 'italy', stats: { speed: 88, shot: 68, pass: 80, tackle: 88, stamina: 93, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#171717', hairStyle: 'buzz' },
      { id: 'ita_14', name: 'Berti', number: 14, role: 'MID', teamId: 'italy', stats: { speed: 85, shot: 82, pass: 84, tackle: 86, stamina: 93, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#4A3728', hairStyle: 'curly' },
      { id: 'ita_11', name: 'Albertini', number: 11, role: 'MID', teamId: 'italy', stats: { speed: 83, shot: 86, pass: 94, tackle: 85, stamina: 92, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#3E2723', hairStyle: 'curly' },
      { id: 'ita_13', name: 'D. Baggio', number: 13, role: 'MID', teamId: 'italy', stats: { speed: 84, shot: 87, pass: 85, tackle: 89, stamina: 95, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#171717', hairStyle: 'short' },
      { id: 'ita_16', name: 'Donadoni', number: 16, role: 'MID', teamId: 'italy', stats: { speed: 89, shot: 84, pass: 91, tackle: 78, stamina: 90, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#2B1B17', hairStyle: 'short' },
      { id: 'ita_10', name: 'R. Baggio', number: 10, role: 'FWD', teamId: 'italy', stats: { speed: 94, shot: 97, pass: 95, tackle: 62, stamina: 91, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#3E2723', hairStyle: 'long' },
      { id: 'ita_19', name: 'Massaro', number: 19, role: 'FWD', teamId: 'italy', stats: { speed: 88, shot: 89, pass: 80, tackle: 65, stamina: 88, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#171717', hairStyle: 'short' }
    ]
  },
  {
    id: 'germany',
    name: 'Germany',
    countryCode: 'GER',
    flag: '🇩🇪',
    starPlayer: 'Jürgen Klinsmann',
    formation: '3-5-2',
    primaryColor: '#F8FAFC',    // Classic White
    secondaryColor: '#090D16',  // Jet Black shorts
    stripeColor: '#DC2626',     // Red/Gold accents
    gkColor: '#0284C7',         // Bright Blue GK
    sockColor: '#F8FAFC',
    overallRating: 92,
    attributes: { speed: 89, attack: 91, defense: 94, stamina: 97 },
    squad: [
      { id: 'ger_1', name: 'Illgner', number: 1, role: 'GK', teamId: 'germany', stats: { speed: 68, shot: 30, pass: 62, tackle: 65, stamina: 90, keeper: 93 }, skinTone: '#FCE0CD', hairColor: '#E6C280', hairStyle: 'short' },
      { id: 'ger_4', name: 'Kohler', number: 4, role: 'DEF', teamId: 'germany', stats: { speed: 85, shot: 60, pass: 78, tackle: 96, stamina: 95, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#5C4033', hairStyle: 'buzz' },
      { id: 'ger_6', name: 'Buchwald', number: 6, role: 'DEF', teamId: 'germany', stats: { speed: 83, shot: 65, pass: 80, tackle: 94, stamina: 94, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#8B5A2B', hairStyle: 'curly' },
      { id: 'ger_3', name: 'Brehme', number: 3, role: 'DEF', teamId: 'germany', stats: { speed: 87, shot: 92, pass: 90, tackle: 90, stamina: 95, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#E6C280', hairStyle: 'short' },
      { id: 'ger_10', name: 'Matthäus', number: 10, role: 'MID', teamId: 'germany', stats: { speed: 90, shot: 94, pass: 95, tackle: 93, stamina: 98, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#4A3728', hairStyle: 'short' },
      { id: 'ger_7', name: 'Möller', number: 7, role: 'MID', teamId: 'germany', stats: { speed: 90, shot: 88, pass: 89, tackle: 75, stamina: 91, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#8B5A2B', hairStyle: 'short' },
      { id: 'ger_8', name: 'Häßler', number: 8, role: 'MID', teamId: 'germany', stats: { speed: 92, shot: 90, pass: 93, tackle: 70, stamina: 90, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#E6C280', hairStyle: 'curly' },
      { id: 'ger_16', name: 'Sammer', number: 16, role: 'MID', teamId: 'germany', stats: { speed: 88, shot: 84, pass: 91, tackle: 94, stamina: 96, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#B22222', hairStyle: 'short' },
      { id: 'ger_17', name: 'Wagner', number: 17, role: 'MID', teamId: 'germany', stats: { speed: 85, shot: 82, pass: 85, tackle: 84, stamina: 93, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#3E2723', hairStyle: 'buzz' },
      { id: 'ger_18', name: 'Klinsmann', number: 18, role: 'FWD', teamId: 'germany', stats: { speed: 95, shot: 96, pass: 84, tackle: 68, stamina: 95, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#E6C280', hairStyle: 'short' },
      { id: 'ger_13', name: 'Völler', number: 13, role: 'FWD', teamId: 'germany', stats: { speed: 90, shot: 92, pass: 83, tackle: 66, stamina: 92, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#8B5A2B', hairStyle: 'curly' }
    ]
  },
  {
    id: 'argentina',
    name: 'Argentina',
    countryCode: 'ARG',
    flag: '🇦🇷',
    starPlayer: 'Diego Maradona',
    formation: '4-3-3',
    primaryColor: '#38BDF8',    // Sky Blue & White
    secondaryColor: '#0F172A',  // Black shorts
    stripeColor: '#FFFFFF',     // Vertical stripes
    gkColor: '#F59E0B',         // Amber GK
    sockColor: '#FFFFFF',
    overallRating: 93,
    attributes: { speed: 92, attack: 96, defense: 87, stamina: 90 },
    squad: [
      { id: 'arg_1', name: 'Islas', number: 1, role: 'GK', teamId: 'argentina', stats: { speed: 70, shot: 30, pass: 64, tackle: 68, stamina: 88, keeper: 92 }, skinTone: '#F5D0A9', hairColor: '#2B1B17', hairStyle: 'curly' },
      { id: 'arg_4', name: 'Sensini', number: 4, role: 'DEF', teamId: 'argentina', stats: { speed: 85, shot: 70, pass: 82, tackle: 90, stamina: 92, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#3E2723', hairStyle: 'short' },
      { id: 'arg_2', name: 'Vázquez', number: 2, role: 'DEF', teamId: 'argentina', stats: { speed: 82, shot: 62, pass: 78, tackle: 91, stamina: 90, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#171717', hairStyle: 'buzz' },
      { id: 'arg_6', name: 'Cáceres', number: 6, role: 'DEF', teamId: 'argentina', stats: { speed: 83, shot: 65, pass: 79, tackle: 89, stamina: 91, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#4A3728', hairStyle: 'short' },
      { id: 'arg_3', name: 'Chamot', number: 3, role: 'DEF', teamId: 'argentina', stats: { speed: 87, shot: 72, pass: 80, tackle: 88, stamina: 93, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#171717', hairStyle: 'short' },
      { id: 'arg_5', name: 'Redondo', number: 5, role: 'MID', teamId: 'argentina', stats: { speed: 86, shot: 84, pass: 96, tackle: 92, stamina: 94, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#4A3728', hairStyle: 'long' },
      { id: 'arg_8', name: 'Simeone', number: 8, role: 'MID', teamId: 'argentina', stats: { speed: 87, shot: 85, pass: 88, tackle: 95, stamina: 97, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#171717', hairStyle: 'short' },
      { id: 'arg_10', name: 'Maradona', number: 10, role: 'MID', teamId: 'argentina', stats: { speed: 94, shot: 99, pass: 99, tackle: 70, stamina: 91, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#171717', hairStyle: 'curly' },
      { id: 'arg_7', name: 'Caniggia', number: 7, role: 'FWD', teamId: 'argentina', stats: { speed: 98, shot: 92, pass: 85, tackle: 58, stamina: 93, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#E6C280', hairStyle: 'long' },
      { id: 'arg_9', name: 'Batistuta', number: 9, role: 'FWD', teamId: 'argentina', stats: { speed: 93, shot: 99, pass: 80, tackle: 66, stamina: 93, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#4A3728', hairStyle: 'long' },
      { id: 'arg_19', name: 'Balbo', number: 19, role: 'FWD', teamId: 'argentina', stats: { speed: 88, shot: 89, pass: 81, tackle: 62, stamina: 89, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#2B1B17', hairStyle: 'short' }
    ]
  },
  {
    id: 'netherlands',
    name: 'Netherlands',
    countryCode: 'NED',
    flag: '🇳🇱',
    starPlayer: 'Dennis Bergkamp',
    formation: '4-3-3',
    primaryColor: '#F97316',    // Electric Orange
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#1D4ED8',     // Blue trim
    gkColor: '#EAB308',         // Gold GK
    sockColor: '#F97316',
    overallRating: 92,
    attributes: { speed: 91, attack: 94, defense: 89, stamina: 92 },
    squad: [
      { id: 'ned_1', name: 'Van der Sar', number: 1, role: 'GK', teamId: 'netherlands', stats: { speed: 72, shot: 30, pass: 75, tackle: 68, stamina: 90, keeper: 96 }, skinTone: '#FCE0CD', hairColor: '#8B5A2B', hairStyle: 'short' },
      { id: 'ned_2', name: 'Reiziger', number: 2, role: 'DEF', teamId: 'netherlands', stats: { speed: 91, shot: 65, pass: 82, tackle: 88, stamina: 93, keeper: 30 }, skinTone: '#5C381E', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'ned_3', name: 'Stam', number: 3, role: 'DEF', teamId: 'netherlands', stats: { speed: 88, shot: 68, pass: 80, tackle: 97, stamina: 95, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#171717', hairStyle: 'buzz' },
      { id: 'ned_4', name: 'F. de Boer', number: 4, role: 'DEF', teamId: 'netherlands', stats: { speed: 82, shot: 86, pass: 93, tackle: 92, stamina: 91, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#4A3728', hairStyle: 'short' },
      { id: 'ned_5', name: 'Numan', number: 5, role: 'DEF', teamId: 'netherlands', stats: { speed: 87, shot: 74, pass: 84, tackle: 87, stamina: 92, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#8B5A2B', hairStyle: 'short' },
      { id: 'ned_16', name: 'Davids', number: 16, role: 'MID', teamId: 'netherlands', stats: { speed: 94, shot: 88, pass: 89, tackle: 96, stamina: 99, keeper: 30 }, skinTone: '#5C381E', hairColor: '#000000', hairStyle: 'long' },
      { id: 'ned_7', name: 'R. de Boer', number: 7, role: 'MID', teamId: 'netherlands', stats: { speed: 88, shot: 86, pass: 89, tackle: 82, stamina: 92, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#4A3728', hairStyle: 'short' },
      { id: 'ned_11', name: 'Overmars', number: 11, role: 'MID', teamId: 'netherlands', stats: { speed: 99, shot: 89, pass: 88, tackle: 68, stamina: 93, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#3E2723', hairStyle: 'short' },
      { id: 'ned_8', name: 'Bergkamp', number: 8, role: 'FWD', teamId: 'netherlands', stats: { speed: 92, shot: 97, pass: 98, tackle: 64, stamina: 91, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#E6C280', hairStyle: 'short' },
      { id: 'ned_9', name: 'Kluivert', number: 9, role: 'FWD', teamId: 'netherlands', stats: { speed: 93, shot: 94, pass: 85, tackle: 68, stamina: 92, keeper: 30 }, skinTone: '#5C381E', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'ned_17', name: 'Van Hooijdonk', number: 17, role: 'FWD', teamId: 'netherlands', stats: { speed: 84, shot: 93, pass: 80, tackle: 62, stamina: 88, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'short' }
    ]
  },
  {
    id: 'france',
    name: 'France',
    countryCode: 'FRA',
    flag: '🇫🇷',
    starPlayer: 'Zinedine Zidane',
    formation: '4-3-3',
    primaryColor: '#1E3A8A',    // Deep French Blue
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#DC2626',     // Red bar
    gkColor: '#FACC15',         // Yellow GK
    sockColor: '#DC2626',
    overallRating: 93,
    attributes: { speed: 90, attack: 93, defense: 95, stamina: 94 },
    squad: [
      { id: 'fra_16', name: 'Barthez', number: 16, role: 'GK', teamId: 'france', stats: { speed: 75, shot: 30, pass: 70, tackle: 70, stamina: 90, keeper: 95 }, skinTone: '#FCE0CD', hairColor: '#171717', hairStyle: 'buzz' },
      { id: 'fra_15', name: 'Thuram', number: 15, role: 'DEF', teamId: 'france', stats: { speed: 92, shot: 75, pass: 84, tackle: 96, stamina: 96, keeper: 30 }, skinTone: '#5C381E', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'fra_8', name: 'Desailly', number: 8, role: 'DEF', teamId: 'france', stats: { speed: 89, shot: 70, pass: 82, tackle: 98, stamina: 96, keeper: 30 }, skinTone: '#5C381E', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'fra_5', name: 'Blanc', number: 5, role: 'DEF', teamId: 'france', stats: { speed: 82, shot: 82, pass: 88, tackle: 95, stamina: 92, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#4A3728', hairStyle: 'short' },
      { id: 'fra_3', name: 'Lizarazu', number: 3, role: 'DEF', teamId: 'france', stats: { speed: 93, shot: 74, pass: 86, tackle: 92, stamina: 95, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#171717', hairStyle: 'short' },
      { id: 'fra_7', name: 'Deschamps', number: 7, role: 'MID', teamId: 'france', stats: { speed: 84, shot: 78, pass: 91, tackle: 94, stamina: 96, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#8B5A2B', hairStyle: 'short' },
      { id: 'fra_17', name: 'Petit', number: 17, role: 'MID', teamId: 'france', stats: { speed: 86, shot: 88, pass: 89, tackle: 90, stamina: 94, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#E6C280', hairStyle: 'long' },
      { id: 'fra_10', name: 'Zidane', number: 10, role: 'MID', teamId: 'france', stats: { speed: 90, shot: 96, pass: 99, tackle: 78, stamina: 93, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#4A3728', hairStyle: 'short' },
      { id: 'fra_12', name: 'Henry', number: 12, role: 'FWD', teamId: 'france', stats: { speed: 98, shot: 95, pass: 88, tackle: 62, stamina: 93, keeper: 30 }, skinTone: '#5C381E', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'fra_9', name: 'Guivarc\'h', number: 9, role: 'FWD', teamId: 'france', stats: { speed: 85, shot: 86, pass: 78, tackle: 65, stamina: 89, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#3E2723', hairStyle: 'short' },
      { id: 'fra_6', name: 'Djorkaeff', number: 6, role: 'FWD', teamId: 'france', stats: { speed: 91, shot: 92, pass: 92, tackle: 68, stamina: 91, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#171717', hairStyle: 'short' }
    ]
  },
  {
    id: 'england',
    name: 'England',
    countryCode: 'ENG',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    starPlayer: 'Alan Shearer',
    formation: '4-4-2',
    primaryColor: '#F8FAFC',    // White
    secondaryColor: '#1E293B',  // Navy shorts
    stripeColor: '#DC2626',     // St George Red
    gkColor: '#10B981',         // Green GK
    sockColor: '#F8FAFC',
    overallRating: 91,
    attributes: { speed: 89, attack: 92, defense: 91, stamina: 93 },
    squad: [
      { id: 'eng_1', name: 'Seaman', number: 1, role: 'GK', teamId: 'england', stats: { speed: 68, shot: 30, pass: 64, tackle: 66, stamina: 90, keeper: 94 }, skinTone: '#FCE0CD', hairColor: '#3E2723', hairStyle: 'long' },
      { id: 'eng_2', name: 'G. Neville', number: 2, role: 'DEF', teamId: 'england', stats: { speed: 86, shot: 68, pass: 85, tackle: 90, stamina: 94, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#8B5A2B', hairStyle: 'short' },
      { id: 'eng_5', name: 'Adams', number: 5, role: 'DEF', teamId: 'england', stats: { speed: 82, shot: 70, pass: 78, tackle: 96, stamina: 95, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#4A3728', hairStyle: 'buzz' },
      { id: 'eng_6', name: 'Southgate', number: 6, role: 'DEF', teamId: 'england', stats: { speed: 83, shot: 66, pass: 80, tackle: 92, stamina: 92, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#3E2723', hairStyle: 'short' },
      { id: 'eng_3', name: 'Pearce', number: 3, role: 'DEF', teamId: 'england', stats: { speed: 87, shot: 90, pass: 82, tackle: 94, stamina: 96, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#4A3728', hairStyle: 'buzz' },
      { id: 'eng_11', name: 'Anderton', number: 11, role: 'MID', teamId: 'england', stats: { speed: 87, shot: 84, pass: 89, tackle: 79, stamina: 90, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#8B5A2B', hairStyle: 'short' },
      { id: 'eng_4', name: 'Ince', number: 4, role: 'MID', teamId: 'england', stats: { speed: 88, shot: 82, pass: 87, tackle: 95, stamina: 96, keeper: 30 }, skinTone: '#5C381E', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'eng_8', name: 'Gascoigne', number: 8, role: 'MID', teamId: 'england', stats: { speed: 91, shot: 93, pass: 96, tackle: 78, stamina: 89, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#E6C280', hairStyle: 'short' },
      { id: 'eng_17', name: 'McManaman', number: 17, role: 'MID', teamId: 'england', stats: { speed: 93, shot: 85, pass: 91, tackle: 72, stamina: 92, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#8B5A2B', hairStyle: 'curly' },
      { id: 'eng_9', name: 'Shearer', number: 9, role: 'FWD', teamId: 'england', stats: { speed: 92, shot: 98, pass: 83, tackle: 68, stamina: 94, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#8B5A2B', hairStyle: 'buzz' },
      { id: 'eng_10', name: 'Sheringham', number: 10, role: 'FWD', teamId: 'england', stats: { speed: 86, shot: 91, pass: 90, tackle: 65, stamina: 89, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#4A3728', hairStyle: 'short' }
    ]
  },
  {
    id: 'nigeria',
    name: 'Nigeria',
    countryCode: 'NGA',
    flag: '🇳🇬',
    starPlayer: 'Nwankwo Kanu',
    formation: '4-4-2',
    primaryColor: '#16A34A',    // Eagle Green
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#22C55E',     // Bright Green
    gkColor: '#EAB308',         // Gold GK
    sockColor: '#16A34A',
    overallRating: 90,
    attributes: { speed: 96, attack: 92, defense: 86, stamina: 95 },
    squad: [
      { id: 'nga_1', name: 'Rufai', number: 1, role: 'GK', teamId: 'nigeria', stats: { speed: 72, shot: 30, pass: 62, tackle: 65, stamina: 88, keeper: 91 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'nga_2', name: 'West', number: 2, role: 'DEF', teamId: 'nigeria', stats: { speed: 88, shot: 65, pass: 78, tackle: 94, stamina: 95, keeper: 30 }, skinTone: '#3D2314', hairColor: '#16A34A', hairStyle: 'curly' },
      { id: 'nga_5', name: 'Uche', number: 5, role: 'DEF', teamId: 'nigeria', stats: { speed: 86, shot: 62, pass: 80, tackle: 91, stamina: 93, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'nga_6', name: 'Okechukwu', number: 6, role: 'DEF', teamId: 'nigeria', stats: { speed: 85, shot: 64, pass: 82, tackle: 92, stamina: 94, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'short' },
      { id: 'nga_3', name: 'Babayaro', number: 3, role: 'DEF', teamId: 'nigeria', stats: { speed: 93, shot: 74, pass: 84, tackle: 88, stamina: 95, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'nga_7', name: 'Finidi', number: 7, role: 'MID', teamId: 'nigeria', stats: { speed: 96, shot: 88, pass: 91, tackle: 76, stamina: 94, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'short' },
      { id: 'nga_10', name: 'Okocha', number: 10, role: 'MID', teamId: 'nigeria', stats: { speed: 94, shot: 93, pass: 98, tackle: 74, stamina: 92, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'short' },
      { id: 'nga_15', name: 'Oliseh', number: 15, role: 'MID', teamId: 'nigeria', stats: { speed: 87, shot: 92, pass: 90, tackle: 93, stamina: 96, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'nga_11', name: 'Amunike', number: 11, role: 'MID', teamId: 'nigeria', stats: { speed: 95, shot: 89, pass: 88, tackle: 72, stamina: 93, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'nga_4', name: 'Kanu', number: 4, role: 'FWD', teamId: 'nigeria', stats: { speed: 93, shot: 95, pass: 94, tackle: 66, stamina: 91, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'short' },
      { id: 'nga_14', name: 'Amokachi', number: 14, role: 'FWD', teamId: 'nigeria', stats: { speed: 95, shot: 92, pass: 82, tackle: 75, stamina: 94, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'buzz' }
    ]
  },
  {
    id: 'spain',
    name: 'Spain',
    countryCode: 'ESP',
    flag: '🇪🇸',
    starPlayer: 'Fernando Hierro',
    formation: '4-4-2',
    primaryColor: '#DC2626',    // Spanish Red
    secondaryColor: '#1E3A8A',  // Navy shorts
    stripeColor: '#FACC15',     // Gold diamonds
    gkColor: '#0284C7',         // Cyan GK
    sockColor: '#000000',
    overallRating: 90,
    attributes: { speed: 88, attack: 90, defense: 91, stamina: 91 },
    squad: [
      { id: 'esp_1', name: 'Zubizarreta', number: 1, role: 'GK', teamId: 'spain', stats: { speed: 68, shot: 30, pass: 64, tackle: 65, stamina: 89, keeper: 93 }, skinTone: '#F5D0A9', hairColor: '#3E2723', hairStyle: 'short' },
      { id: 'esp_2', name: 'Ferrer', number: 2, role: 'DEF', teamId: 'spain', stats: { speed: 89, shot: 65, pass: 82, tackle: 90, stamina: 92, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#171717', hairStyle: 'buzz' },
      { id: 'esp_4', name: 'Hierro', number: 4, role: 'DEF', teamId: 'spain', stats: { speed: 84, shot: 92, pass: 92, tackle: 96, stamina: 94, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#2B1B17', hairStyle: 'short' },
      { id: 'esp_5', name: 'Nadal', number: 5, role: 'DEF', teamId: 'spain', stats: { speed: 83, shot: 74, pass: 84, tackle: 94, stamina: 95, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#4A3728', hairStyle: 'short' },
      { id: 'esp_3', name: 'Sergi', number: 3, role: 'DEF', teamId: 'spain', stats: { speed: 91, shot: 72, pass: 85, tackle: 88, stamina: 94, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#171717', hairStyle: 'short' },
      { id: 'esp_6', name: 'Guardiola', number: 6, role: 'MID', teamId: 'spain', stats: { speed: 82, shot: 80, pass: 97, tackle: 88, stamina: 92, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#3E2723', hairStyle: 'short' },
      { id: 'esp_7', name: 'Goikoetxea', number: 7, role: 'MID', teamId: 'spain', stats: { speed: 88, shot: 84, pass: 86, tackle: 84, stamina: 91, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#4A3728', hairStyle: 'short' },
      { id: 'esp_8', name: 'Bakero', number: 8, role: 'MID', teamId: 'spain', stats: { speed: 85, shot: 88, pass: 89, tackle: 82, stamina: 91, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#8B5A2B', hairStyle: 'short' },
      { id: 'esp_11', name: 'Luis Enrique', number: 11, role: 'MID', teamId: 'spain', stats: { speed: 90, shot: 89, pass: 88, tackle: 87, stamina: 96, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#171717', hairStyle: 'short' },
      { id: 'esp_10', name: 'Salinas', number: 10, role: 'FWD', teamId: 'spain', stats: { speed: 86, shot: 88, pass: 78, tackle: 60, stamina: 88, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#2B1B17', hairStyle: 'short' },
      { id: 'esp_9', name: 'Caminero', number: 9, role: 'FWD', teamId: 'spain', stats: { speed: 89, shot: 91, pass: 87, tackle: 76, stamina: 92, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#171717', hairStyle: 'short' }
    ]
  },
  {
    id: 'usa',
    name: 'USA',
    countryCode: 'USA',
    flag: '🇺🇸',
    starPlayer: 'Alexi Lalas',
    formation: '4-4-2',
    primaryColor: '#3B82F6',    // Denim Blue Star Kit
    secondaryColor: '#DC2626',  // Red shorts
    stripeColor: '#FFFFFF',     // White stars/stripes
    gkColor: '#10B981',         // Green GK
    sockColor: '#FFFFFF',
    overallRating: 86,
    attributes: { speed: 87, attack: 85, defense: 87, stamina: 94 },
    squad: [
      { id: 'usa_1', name: 'Meola', number: 1, role: 'GK', teamId: 'usa', stats: { speed: 68, shot: 30, pass: 60, tackle: 64, stamina: 89, keeper: 91 }, skinTone: '#F5D0A9', hairColor: '#171717', hairStyle: 'long' },
      { id: 'usa_2', name: 'Balboa', number: 2, role: 'DEF', teamId: 'usa', stats: { speed: 86, shot: 76, pass: 80, tackle: 90, stamina: 94, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'long' },
      { id: 'usa_22', name: 'Lalas', number: 22, role: 'DEF', teamId: 'usa', stats: { speed: 82, shot: 78, pass: 76, tackle: 93, stamina: 95, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#D97706', hairStyle: 'long' },
      { id: 'usa_4', name: 'Dooley', number: 4, role: 'DEF', teamId: 'usa', stats: { speed: 83, shot: 72, pass: 82, tackle: 88, stamina: 92, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#4A3728', hairStyle: 'short' },
      { id: 'usa_20', name: 'Caligiuri', number: 20, role: 'DEF', teamId: 'usa', stats: { speed: 86, shot: 75, pass: 81, tackle: 87, stamina: 93, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#3E2723', hairStyle: 'short' },
      { id: 'usa_5', name: 'Dooley', number: 5, role: 'MID', teamId: 'usa', stats: { speed: 84, shot: 78, pass: 84, tackle: 86, stamina: 93, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#8B5A2B', hairStyle: 'short' },
      { id: 'usa_8', name: 'Stewart', number: 8, role: 'MID', teamId: 'usa', stats: { speed: 92, shot: 84, pass: 86, tackle: 78, stamina: 94, keeper: 30 }, skinTone: '#5C381E', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'usa_9', name: 'Ramos', number: 9, role: 'MID', teamId: 'usa', stats: { speed: 88, shot: 85, pass: 92, tackle: 79, stamina: 92, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#171717', hairStyle: 'short' },
      { id: 'usa_6', name: 'Harkes', number: 6, role: 'MID', teamId: 'usa', stats: { speed: 87, shot: 83, pass: 88, tackle: 85, stamina: 94, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#4A3728', hairStyle: 'short' },
      { id: 'usa_11', name: 'Wynalda', number: 11, role: 'FWD', teamId: 'usa', stats: { speed: 90, shot: 91, pass: 80, tackle: 62, stamina: 90, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#3E2723', hairStyle: 'short' },
      { id: 'usa_13', name: 'Jones', number: 13, role: 'FWD', teamId: 'usa', stats: { speed: 94, shot: 86, pass: 82, tackle: 70, stamina: 95, keeper: 30 }, skinTone: '#5C381E', hairColor: '#000000', hairStyle: 'curly' }
    ]
  },
  {
    id: 'mexico',
    name: 'Mexico',
    countryCode: 'MEX',
    flag: '🇲🇽',
    starPlayer: 'Jorge Campos',
    formation: '4-4-2',
    primaryColor: '#15803D',    // Forest Green
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#DC2626',     // Red trim
    gkColor: '#F43F5E',         // Neon Multi-color Campos style!
    sockColor: '#DC2626',
    overallRating: 88,
    attributes: { speed: 90, attack: 88, defense: 87, stamina: 91 },
    squad: [
      { id: 'mex_1', name: 'Campos', number: 1, role: 'GK', teamId: 'mexico', stats: { speed: 88, shot: 75, pass: 78, tackle: 75, stamina: 94, keeper: 94 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'curly' },
      { id: 'mex_2', name: 'Suárez', number: 2, role: 'DEF', teamId: 'mexico', stats: { speed: 86, shot: 74, pass: 85, tackle: 92, stamina: 93, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'short' },
      { id: 'mex_3', name: 'Ramírez Perales', number: 3, role: 'DEF', teamId: 'mexico', stats: { speed: 83, shot: 62, pass: 79, tackle: 90, stamina: 91, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'buzz' },
      { id: 'mex_4', name: 'Ignacio Ambriz', number: 4, role: 'DEF', teamId: 'mexico', stats: { speed: 84, shot: 82, pass: 84, tackle: 91, stamina: 94, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'short' },
      { id: 'mex_5', name: 'Ramón Ramírez', number: 5, role: 'DEF', teamId: 'mexico', stats: { speed: 92, shot: 80, pass: 88, tackle: 86, stamina: 94, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'short' },
      { id: 'mex_6', name: 'Bernal', number: 6, role: 'MID', teamId: 'mexico', stats: { speed: 85, shot: 76, pass: 84, tackle: 85, stamina: 92, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'short' },
      { id: 'mex_8', name: 'García Aspe', number: 8, role: 'MID', teamId: 'mexico', stats: { speed: 85, shot: 93, pass: 92, tackle: 87, stamina: 95, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#4A3728', hairStyle: 'short' },
      { id: 'mex_10', name: 'García', number: 10, role: 'MID', teamId: 'mexico', stats: { speed: 89, shot: 90, pass: 88, tackle: 70, stamina: 90, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'short' },
      { id: 'mex_7', name: 'Hermosillo', number: 7, role: 'FWD', teamId: 'mexico', stats: { speed: 87, shot: 89, pass: 78, tackle: 64, stamina: 89, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'short' },
      { id: 'mex_9', name: 'Hugo Sánchez', number: 9, role: 'FWD', teamId: 'mexico', stats: { speed: 91, shot: 97, pass: 86, tackle: 60, stamina: 88, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'curly' },
      { id: 'mex_11', name: 'Zague', number: 11, role: 'FWD', teamId: 'mexico', stats: { speed: 93, shot: 90, pass: 82, tackle: 62, stamina: 91, keeper: 30 }, skinTone: '#F5D0A9', hairColor: '#4A3728', hairStyle: 'short' }
    ]
  },
  {
    id: 'colombia',
    name: 'Colombia',
    countryCode: 'COL',
    flag: '🇨🇴',
    starPlayer: 'Carlos Valderrama',
    formation: '4-4-2',
    primaryColor: '#FACC15',    // Bright Yellow
    secondaryColor: '#1D4ED8',  // Blue shorts
    stripeColor: '#DC2626',     // Red trim
    gkColor: '#000000',         // René Higuita black
    sockColor: '#DC2626',
    overallRating: 89,
    attributes: { speed: 90, attack: 92, defense: 86, stamina: 91 },
    squad: [
      { id: 'col_1', name: 'Córdoba', number: 1, role: 'GK', teamId: 'colombia', stats: { speed: 74, shot: 30, pass: 68, tackle: 66, stamina: 90, keeper: 92 }, skinTone: '#5C381E', hairColor: '#000000', hairStyle: 'short' },
      { id: 'col_2', name: 'Herrera', number: 2, role: 'DEF', teamId: 'colombia', stats: { speed: 88, shot: 68, pass: 82, tackle: 88, stamina: 92, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'buzz' },
      { id: 'col_4', name: 'Perea', number: 4, role: 'DEF', teamId: 'colombia', stats: { speed: 85, shot: 62, pass: 78, tackle: 92, stamina: 93, keeper: 30 }, skinTone: '#5C381E', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'col_3', name: 'Mendoza', number: 3, role: 'DEF', teamId: 'colombia', stats: { speed: 84, shot: 65, pass: 80, tackle: 90, stamina: 91, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'short' },
      { id: 'col_5', name: 'Pérez', number: 5, role: 'DEF', teamId: 'colombia', stats: { speed: 87, shot: 70, pass: 83, tackle: 87, stamina: 92, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'short' },
      { id: 'col_6', name: 'Gómez', number: 6, role: 'MID', teamId: 'colombia', stats: { speed: 85, shot: 78, pass: 86, tackle: 89, stamina: 93, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'short' },
      { id: 'col_8', name: 'Álvarez', number: 8, role: 'MID', teamId: 'colombia', stats: { speed: 86, shot: 82, pass: 88, tackle: 94, stamina: 96, keeper: 30 }, skinTone: '#C68642', hairColor: '#171717', hairStyle: 'long' },
      { id: 'col_10', name: 'Valderrama', number: 10, role: 'MID', teamId: 'colombia', stats: { speed: 84, shot: 89, pass: 99, tackle: 75, stamina: 92, keeper: 30 }, skinTone: '#C68642', hairColor: '#EAB308', hairStyle: 'curly' },
      { id: 'col_19', name: 'Rincón', number: 19, role: 'MID', teamId: 'colombia', stats: { speed: 92, shot: 92, pass: 90, tackle: 86, stamina: 96, keeper: 30 }, skinTone: '#5C381E', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'col_11', name: 'Asprilla', number: 11, role: 'FWD', teamId: 'colombia', stats: { speed: 97, shot: 94, pass: 86, tackle: 62, stamina: 93, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'col_9', name: 'Valencia', number: 9, role: 'FWD', teamId: 'colombia', stats: { speed: 90, shot: 91, pass: 81, tackle: 64, stamina: 90, keeper: 30 }, skinTone: '#5C381E', hairColor: '#000000', hairStyle: 'short' }
    ]
  },
  {
    id: 'croatia',
    name: 'Croatia',
    countryCode: 'CRO',
    flag: '🇭🇷',
    starPlayer: 'Davor Šuker',
    formation: '3-5-2',
    primaryColor: '#DC2626',    // Checkered Red & White
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#FFFFFF',     // Red/White checkers
    gkColor: '#0284C7',         // Blue GK
    sockColor: '#1E3A8A',
    overallRating: 90,
    attributes: { speed: 89, attack: 93, defense: 88, stamina: 92 },
    squad: [
      { id: 'cro_1', name: 'Ladić', number: 1, role: 'GK', teamId: 'croatia', stats: { speed: 68, shot: 30, pass: 64, tackle: 65, stamina: 89, keeper: 93 }, skinTone: '#FCE0CD', hairColor: '#4A3728', hairStyle: 'short' },
      { id: 'cro_4', name: 'Štimac', number: 4, role: 'DEF', teamId: 'croatia', stats: { speed: 83, shot: 68, pass: 80, tackle: 93, stamina: 93, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#3E2723', hairStyle: 'buzz' },
      { id: 'cro_6', name: 'Bilić', number: 6, role: 'DEF', teamId: 'croatia', stats: { speed: 84, shot: 72, pass: 83, tackle: 94, stamina: 94, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#171717', hairStyle: 'short' },
      { id: 'cro_20', name: 'Šimić', number: 20, role: 'DEF', teamId: 'croatia', stats: { speed: 86, shot: 65, pass: 82, tackle: 91, stamina: 93, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#4A3728', hairStyle: 'short' },
      { id: 'cro_7', name: 'Asanović', number: 7, role: 'MID', teamId: 'croatia', stats: { speed: 86, shot: 86, pass: 92, tackle: 80, stamina: 91, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#3E2723', hairStyle: 'short' },
      { id: 'cro_10', name: 'Boban', number: 10, role: 'MID', teamId: 'croatia', stats: { speed: 89, shot: 90, pass: 96, tackle: 85, stamina: 94, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#4A3728', hairStyle: 'short' },
      { id: 'cro_8', name: 'Prosinečki', number: 8, role: 'MID', teamId: 'croatia', stats: { speed: 86, shot: 92, pass: 97, tackle: 74, stamina: 89, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#E6C280', hairStyle: 'short' },
      { id: 'cro_13', name: 'Stanić', number: 13, role: 'MID', teamId: 'croatia', stats: { speed: 91, shot: 88, pass: 87, tackle: 84, stamina: 95, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#3E2723', hairStyle: 'short' },
      { id: 'cro_17', name: 'Jarni', number: 17, role: 'MID', teamId: 'croatia', stats: { speed: 96, shot: 89, pass: 89, tackle: 86, stamina: 96, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#4A3728', hairStyle: 'short' },
      { id: 'cro_9', name: 'Šuker', number: 9, role: 'FWD', teamId: 'croatia', stats: { speed: 93, shot: 99, pass: 88, tackle: 62, stamina: 92, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#171717', hairStyle: 'short' },
      { id: 'cro_19', name: 'Vlaović', number: 19, role: 'FWD', teamId: 'croatia', stats: { speed: 91, shot: 89, pass: 82, tackle: 60, stamina: 90, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#3E2723', hairStyle: 'short' }
    ]
  },
  {
    id: 'japan',
    name: 'Japan',
    countryCode: 'JPN',
    flag: '🇯🇵',
    starPlayer: 'Hidetoshi Nakata',
    formation: '4-4-2',
    primaryColor: '#1D4ED8',    // Samurai Blue Flame
    secondaryColor: '#FFFFFF',  // White shorts
    stripeColor: '#EF4444',     // Red flame accent
    gkColor: '#15803D',         // Green GK
    sockColor: '#1D4ED8',
    overallRating: 86,
    attributes: { speed: 92, attack: 85, defense: 85, stamina: 95 },
    squad: [
      { id: 'jpn_20', name: 'Kawaguchi', number: 20, role: 'GK', teamId: 'japan', stats: { speed: 78, shot: 30, pass: 64, tackle: 66, stamina: 92, keeper: 93 }, skinTone: '#FCE0CD', hairColor: '#171717', hairStyle: 'short' },
      { id: 'jpn_2', name: 'Narahashi', number: 2, role: 'DEF', teamId: 'japan', stats: { speed: 90, shot: 66, pass: 82, tackle: 86, stamina: 93, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#171717', hairStyle: 'short' },
      { id: 'jpn_4', name: 'Ihara', number: 4, role: 'DEF', teamId: 'japan', stats: { speed: 84, shot: 68, pass: 80, tackle: 92, stamina: 94, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#171717', hairStyle: 'buzz' },
      { id: 'jpn_17', name: 'Akita', number: 17, role: 'DEF', teamId: 'japan', stats: { speed: 83, shot: 64, pass: 78, tackle: 91, stamina: 93, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#171717', hairStyle: 'buzz' },
      { id: 'jpn_3', name: 'Soma', number: 3, role: 'DEF', teamId: 'japan', stats: { speed: 92, shot: 70, pass: 84, tackle: 87, stamina: 95, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#171717', hairStyle: 'short' },
      { id: 'jpn_6', name: 'Yamaguchi', number: 6, role: 'MID', teamId: 'japan', stats: { speed: 87, shot: 76, pass: 86, tackle: 88, stamina: 94, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#171717', hairStyle: 'short' },
      { id: 'jpn_8', name: 'Nakata', number: 8, role: 'MID', teamId: 'japan', stats: { speed: 92, shot: 92, pass: 95, tackle: 84, stamina: 96, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#B45309', hairStyle: 'short' },
      { id: 'jpn_10', name: 'Nanami', number: 10, role: 'MID', teamId: 'japan', stats: { speed: 86, shot: 84, pass: 92, tackle: 79, stamina: 92, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#171717', hairStyle: 'short' },
      { id: 'jpn_11', name: 'Miura', number: 11, role: 'MID', teamId: 'japan', stats: { speed: 91, shot: 88, pass: 86, tackle: 70, stamina: 91, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#171717', hairStyle: 'short' },
      { id: 'jpn_9', name: 'Nakayama', number: 9, role: 'FWD', teamId: 'japan', stats: { speed: 89, shot: 90, pass: 79, tackle: 68, stamina: 94, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#171717', hairStyle: 'short' },
      { id: 'jpn_18', name: 'Jo', number: 18, role: 'FWD', teamId: 'japan', stats: { speed: 90, shot: 86, pass: 81, tackle: 65, stamina: 91, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#171717', hairStyle: 'curly' }
    ]
  },
  {
    id: 'cameroon',
    name: 'Cameroon',
    countryCode: 'CMR',
    flag: '🇨🇲',
    starPlayer: 'Roger Milla',
    formation: '4-4-2',
    primaryColor: '#15803D',    // Indomitable Lions Green
    secondaryColor: '#DC2626',  // Red shorts
    stripeColor: '#FACC15',     // Yellow trim
    gkColor: '#000000',         // Thomas N'Kono black pants/top
    sockColor: '#FACC15',
    overallRating: 88,
    attributes: { speed: 94, attack: 90, defense: 87, stamina: 95 },
    squad: [
      { id: 'cmr_1', name: 'N\'Kono', number: 1, role: 'GK', teamId: 'cameroon', stats: { speed: 72, shot: 30, pass: 65, tackle: 66, stamina: 90, keeper: 94 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'short' },
      { id: 'cmr_2', name: 'Ebwellé', number: 2, role: 'DEF', teamId: 'cameroon', stats: { speed: 89, shot: 64, pass: 80, tackle: 90, stamina: 94, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'cmr_4', name: 'Song', number: 4, role: 'DEF', teamId: 'cameroon', stats: { speed: 91, shot: 70, pass: 82, tackle: 96, stamina: 96, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'long' },
      { id: 'cmr_5', name: 'Kundé', number: 5, role: 'DEF', teamId: 'cameroon', stats: { speed: 85, shot: 82, pass: 84, tackle: 92, stamina: 93, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'short' },
      { id: 'cmr_6', name: 'Tataw', number: 6, role: 'DEF', teamId: 'cameroon', stats: { speed: 88, shot: 68, pass: 81, tackle: 89, stamina: 94, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'cmr_8', name: 'Mbouh', number: 8, role: 'MID', teamId: 'cameroon', stats: { speed: 87, shot: 80, pass: 86, tackle: 90, stamina: 95, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'short' },
      { id: 'cmr_10', name: 'Mfédé', number: 10, role: 'MID', teamId: 'cameroon', stats: { speed: 90, shot: 88, pass: 91, tackle: 76, stamina: 92, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'short' },
      { id: 'cmr_14', name: 'Makanaky', number: 14, role: 'MID', teamId: 'cameroon', stats: { speed: 92, shot: 85, pass: 89, tackle: 75, stamina: 93, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'curly' },
      { id: 'cmr_7', name: 'Omam-Biyik', number: 7, role: 'FWD', teamId: 'cameroon', stats: { speed: 96, shot: 93, pass: 82, tackle: 68, stamina: 94, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'cmr_9', name: 'Roger Milla', number: 9, role: 'FWD', teamId: 'cameroon', stats: { speed: 91, shot: 97, pass: 88, tackle: 64, stamina: 90, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'short' },
      { id: 'cmr_11', name: 'Pagal', number: 11, role: 'FWD', teamId: 'cameroon', stats: { speed: 93, shot: 86, pass: 81, tackle: 65, stamina: 91, keeper: 30 }, skinTone: '#3D2314', hairColor: '#000000', hairStyle: 'buzz' }
    ]
  },
  {
    id: 'sweden',
    name: 'Sweden',
    countryCode: 'SWE',
    flag: '🇸🇪',
    starPlayer: 'Tomas Brolin',
    formation: '4-4-2',
    primaryColor: '#FACC15',    // Nordic Yellow
    secondaryColor: '#1D4ED8',  // Blue shorts
    stripeColor: '#1E3A8A',     // Deep blue trim
    gkColor: '#EF4444',         // Ravelli red jersey
    sockColor: '#FACC15',
    overallRating: 89,
    attributes: { speed: 89, attack: 90, defense: 89, stamina: 94 },
    squad: [
      { id: 'swe_1', name: 'Ravelli', number: 1, role: 'GK', teamId: 'sweden', stats: { speed: 70, shot: 30, pass: 62, tackle: 68, stamina: 91, keeper: 95 }, skinTone: '#FCE0CD', hairColor: '#3E2723', hairStyle: 'short' },
      { id: 'swe_2', name: 'R. Nilsson', number: 2, role: 'DEF', teamId: 'sweden', stats: { speed: 88, shot: 68, pass: 84, tackle: 89, stamina: 93, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#E6C280', hairStyle: 'short' },
      { id: 'swe_3', name: 'P. Andersson', number: 3, role: 'DEF', teamId: 'sweden', stats: { speed: 84, shot: 76, pass: 83, tackle: 94, stamina: 94, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#8B5A2B', hairStyle: 'buzz' },
      { id: 'swe_4', name: 'Björklund', number: 4, role: 'DEF', teamId: 'sweden', stats: { speed: 85, shot: 62, pass: 80, tackle: 92, stamina: 92, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#E6C280', hairStyle: 'short' },
      { id: 'swe_5', name: 'Ljung', number: 5, role: 'DEF', teamId: 'sweden', stats: { speed: 86, shot: 70, pass: 82, tackle: 88, stamina: 93, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#4A3728', hairStyle: 'short' },
      { id: 'swe_6', name: 'Schwarz', number: 6, role: 'MID', teamId: 'sweden', stats: { speed: 87, shot: 88, pass: 88, tackle: 95, stamina: 97, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#3E2723', hairStyle: 'short' },
      { id: 'swe_8', name: 'Ingesson', number: 8, role: 'MID', teamId: 'sweden', stats: { speed: 85, shot: 84, pass: 87, tackle: 91, stamina: 96, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#E6C280', hairStyle: 'buzz' },
      { id: 'swe_9', name: 'Thern', number: 9, role: 'MID', teamId: 'sweden', stats: { speed: 86, shot: 86, pass: 92, tackle: 88, stamina: 95, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#8B5A2B', hairStyle: 'short' },
      { id: 'swe_11', name: 'Brolin', number: 11, role: 'MID', teamId: 'sweden', stats: { speed: 93, shot: 94, pass: 94, tackle: 70, stamina: 92, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#E6C280', hairStyle: 'curly' },
      { id: 'swe_10', name: 'Dahlin', number: 10, role: 'FWD', teamId: 'sweden', stats: { speed: 94, shot: 92, pass: 84, tackle: 68, stamina: 92, keeper: 30 }, skinTone: '#8D5524', hairColor: '#000000', hairStyle: 'buzz' },
      { id: 'swe_19', name: 'K. Andersson', number: 19, role: 'FWD', teamId: 'sweden', stats: { speed: 91, shot: 95, pass: 82, tackle: 66, stamina: 91, keeper: 30 }, skinTone: '#FCE0CD', hairColor: '#E6C280', hairStyle: 'short' }
    ]
  }
];

export const FORMATION_COORDS: Record<string, { role: string; xPct: number; yPct: number }[]> = {
  '4-4-2': [
    { role: 'GK', xPct: 0.05, yPct: 0.5 },
    { role: 'DEF', xPct: 0.22, yPct: 0.15 },
    { role: 'DEF', xPct: 0.20, yPct: 0.38 },
    { role: 'DEF', xPct: 0.20, yPct: 0.62 },
    { role: 'DEF', xPct: 0.22, yPct: 0.85 },
    { role: 'MID', xPct: 0.44, yPct: 0.15 },
    { role: 'MID', xPct: 0.40, yPct: 0.38 },
    { role: 'MID', xPct: 0.40, yPct: 0.62 },
    { role: 'MID', xPct: 0.44, yPct: 0.85 },
    { role: 'FWD', xPct: 0.64, yPct: 0.35 },
    { role: 'FWD', xPct: 0.64, yPct: 0.65 }
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
