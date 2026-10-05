import { CommentaryToast } from '../types/game';

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const GOAL_SOLO_LINES = [
  (p: string, t: string) =>
    `And it's in! Absolute delirium for ${t}! ${p} arrows it into the top corner, sheer footballing perfection!`,
  (p: string, t: string) =>
    `Oh, extraordinary! Look at that strike from ${p}! The goalkeeper was beaten all ends up! That is world-class!`,
  (p: string, t: string) =>
    `He's done it! What composure, what class! ${p} buries it with devastating authority for ${t}!`,
  (p: string, t: string) =>
    `Pick that one out! An explosive thunderbolt from ${p}! Devastating power, pinpoint accuracy, and ${t} roar ahead!`,
  (p: string, t: string) =>
    `And the net bulges! What an emphatic finish! ${p} with ice in the veins, slotting home with clinical elegance!`,
  (p: string, t: string) =>
    `Sensational! It simply does not get any better than that! Pure poetry in motion from ${p}!`,
  (p: string, t: string) =>
    `A goal of supreme quality! ${p} pulls the trigger from distance and leaves the stadium in raptures!`,
  (p: string, t: string) =>
    `Cometh the hour, cometh the man! ${p} delivers on the biggest stage for ${t}! Magnificent!`,
  (p: string, t: string) =>
    `And ${t} find the breakthrough! What a venomous strike by ${p} to ignite this contest!`
];

const GOAL_ASSIST_LINES = [
  (p: string, a: string, t: string) =>
    `And it's in! Superbly carved open by ${a}, and ${p} provides the golden finish for ${t}!`,
  (p: string, a: string, t: string) =>
    `What a team goal! Sublime vision from ${a}, threading the needle for ${p} to bury it with authority!`,
  (p: string, a: string, t: string) =>
    `Exquisite build-up play! A pinpoint delivery from ${a}, met on the half-volley by ${p}! Breathtaking football!`,
  (p: string, a: string, t: string) =>
    `Absolute telepathy between them! ${a} slips it through, and ${p} tucks it into the corner with effortless poise!`
];

const SAVE_LINES = [
  (p: string, _t: string) =>
    `What an incredible stop by ${p}! Point-blank, acrobatic brilliance to deny a certain goal!`,
  (p: string, _t: string) =>
    `How has he kept that out?! ${p} flies across the face of goal and claws it off the line with iron fingertips!`,
  (p: string, t: string) =>
    `Sensational goalkeeping! ${p} stands tall, makes himself enormous, and preserves the contest for ${t}!`,
  (p: string, _t: string) =>
    `Sprawling heroics in goal! ${p} pushes a venomous missile around the post! World-class defiance!`,
  (p: string, _t: string) =>
    `Unbelievable reflexes from ${p}! The fans were already celebrating, but the goalkeeper says not today!`,
  (p: string, _t: string) =>
    `Tipped over the crossbar! An astonishing reflex save by ${p} under maximum pressure!`
];

const RED_CARD_LINES = [
  (p: string, t: string) =>
    `And he's off! The referee reaches straight into the back pocket! Red card for ${p}! A moment of reckless madness, and ${t} are down to ten men!`,
  (p: string, t: string) =>
    `Straight red! No hesitation from the official! ${p} has crossed the line and marches down the tunnel in utter disbelief!`,
  (p: string, t: string) =>
    `The referee has seen enough! It's an early bath for ${p}! An enormous mountain for ${t} to climb now!`,
  (p: string, t: string) =>
    `It is a red card for ${p}! Absolute fury on the pitch, but that was a wildly dangerous challenge!`
];

const YELLOW_CARD_LINES = [
  (p: string, _t: string) =>
    `The referee brings play back and into the book he goes. A yellow card for ${p} after that cynical sliding challenge.`,
  (p: string, _t: string) =>
    `A yellow card brandished. ${p} will have to walk a disciplinary tightrope for the remainder of this match.`,
  (p: string, _t: string) =>
    `A cynical trip to halt the counter-attack, and ${p} receives a thoroughly deserved caution.`,
  (p: string, _t: string) =>
    `The referee produces the booking without hesitation. ${p} enters the notebook.`
];

const WOODWORK_LINES = [
  (t: string) =>
    `Clattering off the crossbar! The frame of the goal is still shuddering! Inches from absolute glory for ${t}!`,
  (t: string) =>
    `Off the post! Agony for ${t}! How has that venomous strike not found the back of the net?!`,
  (t: string) =>
    `Rattling against the upright! A thunderous effort denied by the cruelest of margins!`
];

export function generateCommentaryToast(
  type: CommentaryToast['type'],
  teamName: string,
  teamFlag: string,
  minute: number,
  playerName?: string,
  assistName?: string
): CommentaryToast {
  const id = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  let headline = '';
  let commentary = '';
  let spokenText = '';

  const playerDisplay = playerName || 'The striker';

  switch (type) {
    case 'goal': {
      headline = playerName ? `⚽ GOAL! ${playerName.toUpperCase()} (${minute}')` : `⚽ GOAL! (${minute}')`;
      if (assistName && playerName) {
        const lineFn = getRandom(GOAL_ASSIST_LINES);
        commentary = lineFn(playerName, assistName, teamName);
        spokenText = commentary;
      } else {
        const lineFn = getRandom(GOAL_SOLO_LINES);
        commentary = lineFn(playerDisplay, teamName);
        spokenText = commentary;
      }
      break;
    }

    case 'save': {
      headline = playerName ? `🧤 BIG SAVE: ${playerName.toUpperCase()}` : '🧤 WORLD-CLASS SAVE!';
      const lineFn = getRandom(SAVE_LINES);
      commentary = lineFn(playerDisplay, teamName);
      spokenText = commentary;
      break;
    }

    case 'red_card': {
      headline = playerName ? `🟥 RED CARD: ${playerName.toUpperCase()} SENT OFF` : '🟥 RED CARD!';
      const lineFn = getRandom(RED_CARD_LINES);
      commentary = lineFn(playerDisplay, teamName);
      spokenText = commentary;
      break;
    }

    case 'yellow_card': {
      headline = playerName ? `🟨 BOOKING: ${playerName.toUpperCase()}` : '🟨 YELLOW CARD';
      const lineFn = getRandom(YELLOW_CARD_LINES);
      commentary = lineFn(playerDisplay, teamName);
      spokenText = commentary;
      break;
    }

    case 'woodwork': {
      headline = '🥅 OFF THE WOODWORK!';
      const lineFn = getRandom(WOODWORK_LINES);
      commentary = lineFn(teamName);
      spokenText = commentary;
      break;
    }

    case 'halftime': {
      headline = '⏱️ HALF TIME';
      commentary = 'The referee blows the whistle to conclude the first half! 45 minutes of breathless football, and there is all to play for!';
      spokenText = 'And that brings an exhilarating first half to a close! 45 minutes of breathless, high-tempo football, and there is everything still to play for!';
      break;
    }

    case 'fulltime': {
      headline = '🏆 FULL TIME';
      commentary = 'The final whistle echoes across the stadium! An unforgettable encounter comes to an end!';
      spokenText = 'The final whistle sounds! An unforgettable encounter comes to an end! What an extraordinary exhibition of football!';
      break;
    }
  }

  return {
    id,
    type,
    headline,
    commentary,
    spokenText,
    playerName,
    teamName,
    teamFlag,
    minute,
    durationMs: 6500
  };
}
