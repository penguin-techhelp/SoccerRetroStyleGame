import { CommentaryToast } from '../types/game';

const GOAL_PHRASES = [
  'GOOOAAALLL! What a thunderbolt! The net is bulging!',
  'SWEET MOTHER OF SOCCER! An absolute missile into the top corner!',
  'CLINICAL FINISH! Leaves the keeper completely frozen!',
  'BACK OF THE NET! What an electric strike!',
  'SENSATIONAL HIT! The grandstand is erupting with roaring fans!',
  'MAGNIFICENT STRIKE! Rocketed into the mesh with ruthless power!',
  'UNSTOPPABLE! Pick that one out of the onion bag!',
  'PURE ARCADE MAGIC! What a sensational goal!'
];

const SAVE_PHRASES = [
  'WHAT A SAVE! Flings himself across the goal line to tip it away!',
  'HOW DID HE REACH THAT?! Acrobatic miracle stop!',
  'BRICK WALL! Standing tall and denying a certain goal!',
  'HEROIC REFLEXES! Pushes the rocket around the post!',
  'WORLD CLASS GOALKEEPING! Claws it right off the goal line!',
  'FINGERTIP RESCUE! Superhuman agility in between the sticks!',
  'NOT TODAY! Denies a surefire strike with iron palms!'
];

const RED_CARD_PHRASES = [
  'OFF! OFF! OFF! The referee pulls out the RED CARD! Sent for an early bath!',
  'STRAIGHT RED! Reckless challenge and down to 10 men!',
  'HE HAS TO GO! The referee has seen enough! Red card brandished!',
  'EARLY SHOWER! Outrageous challenge! He is marching down the tunnel!'
];

const YELLOW_CARD_PHRASES = [
  'INTO THE BOOK! A yellow card for that sliding challenge!',
  'CAUTION! The referee brandishes yellow! Walking a tightrope now!',
  'TAKEN DOWN! Cynical challenge earns a booking from the referee!'
];

const WOODWORK_PHRASES = [
  'CLANG! Rattled off the woodwork! The crossbar is still vibrating!',
  'OFF THE POST! Inches away from glory! What a thunderous blast!',
  'DENIED BY THE FRAME! Agony as the ball crashes against the upright!'
];

function getRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

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

  switch (type) {
    case 'goal':
      headline = playerName ? `GOOOAL: ${playerName.toUpperCase()}!` : 'SPECTACULAR GOAL!';
      commentary = `${getRandom(GOAL_PHRASES)} ${teamName} celebrate!`;
      if (assistName) {
        commentary += ` Great vision by ${assistName}!`;
      }
      break;

    case 'save':
      headline = playerName ? `BIG SAVE: ${playerName.toUpperCase()}!` : 'ACROBATIC SAVE!';
      commentary = playerName
        ? `${playerName} ${getRandom(SAVE_PHRASES).toLowerCase()}`
        : getRandom(SAVE_PHRASES);
      break;

    case 'red_card':
      headline = playerName ? `RED CARD: ${playerName.toUpperCase()} SENT OFF!` : 'RED CARD!';
      commentary = playerName
        ? `${playerName} gets sent off! ${getRandom(RED_CARD_PHRASES)}`
        : getRandom(RED_CARD_PHRASES);
      break;

    case 'yellow_card':
      headline = playerName ? `YELLOW CARD: ${playerName.toUpperCase()}` : 'BOOKING!';
      commentary = playerName
        ? `${playerName} ${getRandom(YELLOW_CARD_PHRASES).toLowerCase()}`
        : getRandom(YELLOW_CARD_PHRASES);
      break;

    case 'woodwork':
      headline = 'OFF THE WOODWORK!';
      commentary = getRandom(WOODWORK_PHRASES);
      break;
  }

  return {
    id,
    type,
    headline,
    commentary,
    playerName,
    teamName,
    teamFlag,
    minute,
    durationMs: 4500
  };
}
