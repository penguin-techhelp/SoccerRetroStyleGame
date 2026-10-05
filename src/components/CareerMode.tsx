import React, { useState, useEffect } from 'react';
import { CardTier, ClubData, MarketListing, PlayerCard } from '../types/career';
import {
  createDefaultClub,
  DIVISION_OPPONENTS,
  generateTransferMarketListings,
  openBoosterPack,
  opponentToTeam,
  clubToTeam,
} from '../data/careerData';
import { Team } from '../types/game';
import { retroAudio } from '../audio/retroAudio';
import {
  ArrowLeft,
  Coins,
  Trophy,
  Users,
  ShoppingBag,
  Repeat,
  Play,
  Sparkles,
  Bot,
  Zap,
  Shield,
  Star,
  RefreshCw,
  Plus,
  Check,
  Award,
  ChevronRight,
} from 'lucide-react';

interface CareerModeProps {
  onBackToTitle: () => void;
  onLaunchMatch: (homeTeam: Team, awayTeam: Team, onMatchFinished: (result: { homeScore: number; awayScore: number }) => void) => void;
}

type CareerTab = 'matchday' | 'squad' | 'store' | 'market';

const STORAGE_KEY = 'retro_striker_career_v1';

export const CareerMode: React.FC<CareerModeProps> = ({ onBackToTitle, onLaunchMatch }) => {
  // Load persistent career club data or initialize
  const [club, setClub] = useState<ClubData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return createDefaultClub();
  });

  const [activeTab, setActiveTab] = useState<CareerTab>('matchday');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerCard | null>(null);
  const [swapTarget, setSwapTarget] = useState<PlayerCard | null>(null);

  // Market Listings
  const [marketListings, setMarketListings] = useState<MarketListing[]>(() => generateTransferMarketListings());

  // Pack Opening Animation State
  const [openingPackTier, setOpeningPackTier] = useState<CardTier | null>(null);
  const [revealedCards, setRevealedCards] = useState<PlayerCard[] | null>(null);
  const [packStep, setPackStep] = useState<'shaking' | 'revealed'>('shaking');

  // Trade-In Exchange State (Selected card IDs)
  const [tradeInSelectedIds, setTradeInSelectedIds] = useState<string[]>([]);
  const [tradeInTargetTier, setTradeInTargetTier] = useState<CardTier>('silver');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save to localStorage whenever club state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(club));
    } catch {
      // LocalStorage full or blocked
    }
  }, [club]);

  // Current Division Opponent
  const currentOpponents = DIVISION_OPPONENTS[club.division] || DIVISION_OPPONENTS[5];
  const currentOpponent = currentOpponents[club.seasonMatches % currentOpponents.length];

  // Team Rating calculation
  const teamOvr = Math.round(
    club.starting11.reduce((sum, p) => sum + p.rating, 0) / (club.starting11.length || 1)
  );

  // Card Tier Styling Helper
  const getTierBadge = (tier: CardTier) => {
    switch (tier) {
      case 'legend':
        return 'bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 text-slate-950 font-bold border-amber-300';
      case 'gold':
        return 'bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-bold border-yellow-300';
      case 'silver':
        return 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-950 font-bold border-slate-200';
      default:
        return 'bg-gradient-to-r from-amber-800 to-amber-900 text-amber-100 font-bold border-amber-700';
    }
  };

  const getTierCardBg = (tier: CardTier) => {
    switch (tier) {
      case 'legend':
        return 'border-2 border-amber-300 bg-gradient-to-b from-amber-950/90 via-slate-900 to-amber-950/80 shadow-amber-500/20 shadow-lg';
      case 'gold':
        return 'border-2 border-yellow-400 bg-gradient-to-b from-yellow-950/90 via-slate-900 to-yellow-950/80 shadow-yellow-500/10 shadow-md';
      case 'silver':
        return 'border-2 border-slate-400 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-sm';
      default:
        return 'border-2 border-amber-800/80 bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-950';
    }
  };

  // --- SQUAD MANAGEMENT: SWAP STARTER & BENCH ---
  const handleSelectCardForSwap = (card: PlayerCard, isStarter: boolean) => {
    retroAudio.playMenuBeep();

    if (!swapTarget) {
      setSwapTarget(card);
      setSelectedPlayer(card);
    } else {
      if (swapTarget.id === card.id) {
        setSwapTarget(null);
        return;
      }

      // Check if one is starter and one is bench, or both are starters
      const isTargetStarter = club.starting11.some((p) => p.id === swapTarget.id);

      if (isStarter && isTargetStarter) {
        // Swap positions in starting 11
        const newStarters = [...club.starting11];
        const idxA = newStarters.findIndex((p) => p.id === swapTarget.id);
        const idxB = newStarters.findIndex((p) => p.id === card.id);
        const temp = newStarters[idxA];
        newStarters[idxA] = newStarters[idxB];
        newStarters[idxB] = temp;
        setClub((prev) => ({ ...prev, starting11: newStarters }));
        showToast(`Swapped ${swapTarget.name} & ${card.name}!`);
      } else if (isTargetStarter && !isStarter) {
        // Swap starter with bench
        const newStarters = club.starting11.map((p) => (p.id === swapTarget.id ? card : p));
        const newBench = club.bench.map((p) => (p.id === card.id ? swapTarget : p));
        setClub((prev) => ({ ...prev, starting11: newStarters, bench: newBench }));
        showToast(`${card.name} promoted to Starting 11!`);
      } else if (!isTargetStarter && isStarter) {
        const newStarters = club.starting11.map((p) => (p.id === card.id ? swapTarget : p));
        const newBench = club.bench.map((p) => (p.id === swapTarget.id ? card : p));
        setClub((prev) => ({ ...prev, starting11: newStarters, bench: newBench }));
        showToast(`${swapTarget.name} promoted to Starting 11!`);
      }

      setSwapTarget(null);
      setSelectedPlayer(null);
    }
  };

  // --- QUICK SELL CARD ---
  const handleQuickSellCard = (card: PlayerCard) => {
    if (club.starting11.some((p) => p.id === card.id)) {
      showToast('Cannot sell an active starting player! Swap to bench first.');
      retroAudio.playMenuBeep();
      return;
    }

    retroAudio.playMenuBeep();
    const sellPrice = Math.max(50, Math.round(card.value * 0.75));

    setClub((prev) => ({
      ...prev,
      coins: prev.coins + sellPrice,
      bench: prev.bench.filter((p) => p.id !== card.id),
    }));

    setSelectedPlayer(null);
    showToast(`Sold ${card.name} for +${sellPrice} Coins! 🪙`);
  };

  // --- BUY CARD FROM MARKET ---
  const handleBuyMarketCard = (listing: MarketListing) => {
    if (club.coins < listing.price) {
      showToast('Not enough coins! Win matches or sell cards to earn coins.');
      retroAudio.playMenuBeep();
      return;
    }

    retroAudio.playGoalCelebration();

    setClub((prev) => ({
      ...prev,
      coins: prev.coins - listing.price,
      bench: [listing.card, ...prev.bench],
    }));

    setMarketListings((prev) =>
      prev.map((item) => (item.id === listing.id ? { ...item, isSoldOut: true } : item))
    );

    showToast(`Signed ${listing.card.name} (${listing.card.rating} OVR) to your club! ⭐`);
  };

  // --- REFRESH MARKET LISTINGS ---
  const handleRefreshMarket = () => {
    if (club.coins < 40) {
      showToast('Refreshing the scouting market costs 40 coins.');
      return;
    }
    retroAudio.playMenuBeep();
    setClub((prev) => ({ ...prev, coins: prev.coins - 40 }));
    setMarketListings(generateTransferMarketListings());
    showToast('Market refreshed with new player listings!');
  };

  // --- BUY / OPEN BOOSTER PACK ---
  const handleOpenPack = (tier: CardTier, cost: number) => {
    if (cost > 0 && club.coins < cost) {
      showToast('Not enough coins to buy this pack!');
      retroAudio.playMenuBeep();
      return;
    }

    retroAudio.playGoalCelebration();

    // Deduct coins or pack inventory
    setClub((prev) => ({
      ...prev,
      coins: cost > 0 ? prev.coins - cost : prev.coins,
      packsAvailable: {
        ...prev.packsAvailable,
        [tier]: Math.max(0, prev.packsAvailable[tier] - (cost === 0 ? 1 : 0)),
      },
    }));

    setOpeningPackTier(tier);
    setPackStep('shaking');

    setTimeout(() => {
      const pulledCards = openBoosterPack(tier);
      setRevealedCards(pulledCards);
      setPackStep('revealed');
      retroAudio.playWhistle(true);
    }, 1200);
  };

  // Claim unboxed cards into club bench
  const handleClaimUnboxedCards = () => {
    if (!revealedCards) return;
    retroAudio.playMenuBeep();

    setClub((prev) => ({
      ...prev,
      bench: [...revealedCards, ...prev.bench],
    }));

    setOpeningPackTier(null);
    setRevealedCards(null);
    showToast(`Added ${revealedCards.length} new players to your club!`);
  };

  // --- TRADE-IN / SBC EXCHANGE ---
  const handleToggleTradeInCard = (id: string) => {
    retroAudio.playMenuBeep();
    setTradeInSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleExecuteTradeIn = () => {
    if (tradeInSelectedIds.length !== 3) {
      showToast('Select exactly 3 cards to exchange!');
      return;
    }

    retroAudio.playGoalCelebration();

    // Remove 3 selected cards from bench
    const remainingBench = club.bench.filter((c) => !tradeInSelectedIds.includes(c.id));

    // Award upgraded pack
    setClub((prev) => ({
      ...prev,
      bench: remainingBench,
      packsAvailable: {
        ...prev.packsAvailable,
        [tradeInTargetTier]: prev.packsAvailable[tradeInTargetTier] + 1,
      },
    }));

    setTradeInSelectedIds([]);
    showToast(`Trade-in complete! Received 1 Free ${tradeInTargetTier.toUpperCase()} Pack! 🎁`);
  };

  // --- PLAY MATCH IN ENGINE ---
  const handleStartCareerMatch = () => {
    const userTeam = clubToTeam(club);
    const oppTeam = opponentToTeam(currentOpponent);

    retroAudio.playWhistle(true);

    onLaunchMatch(userTeam, oppTeam, ({ homeScore, awayScore }) => {
      // Process Match Rewards & Division Progression
      const isWin = homeScore > awayScore;
      const isDraw = homeScore === awayScore;

      const matchCoins = isWin ? 350 + homeScore * 50 : isDraw ? 160 + homeScore * 40 : 80;
      const pointsEarned = isWin ? 3 : isDraw ? 1 : 0;

      setClub((prev) => {
        const nextMatches = prev.seasonMatches + 1;
        const nextPoints = prev.seasonPoints + pointsEarned;
        let nextDivision = prev.division;
        let nextTitles = prev.record.titlesWon;
        let bonusPacks = { ...prev.packsAvailable };

        // Check Season End (Every 5 Matches)
        if (nextMatches >= 5) {
          if (nextPoints >= 10 && prev.division > 1) {
            // PROMOTION!
            nextDivision = prev.division - 1;
            nextTitles += 1;
            bonusPacks.silver += 1;
            if (nextDivision <= 2) bonusPacks.gold += 1;
            showToast(`🏆 DIVISION CHAMPIONS! Promoted to Division ${nextDivision}! +Silver Pack!`);
          } else if (nextPoints < 4 && prev.division < 5) {
            // RELEGATION
            nextDivision = prev.division + 1;
            showToast(`Relegated to Division ${nextDivision}. Rebuild and bounce back!`);
          } else {
            showToast(`Season complete! Retained spot in Division ${prev.division}.`);
          }

          return {
            ...prev,
            coins: prev.coins + matchCoins + (isWin ? 200 : 0),
            division: nextDivision,
            seasonPoints: 0,
            seasonMatches: 0,
            record: {
              wins: prev.record.wins + (isWin ? 1 : 0),
              draws: prev.record.draws + (isDraw ? 1 : 0),
              losses: prev.record.losses + (homeScore < awayScore ? 1 : 0),
              titlesWon: nextTitles,
            },
            packsAvailable: bonusPacks,
          };
        }

        // Mid-season match finished
        if (isWin) {
          bonusPacks.bronze += 1; // Free bronze booster on every win!
        }

        return {
          ...prev,
          coins: prev.coins + matchCoins,
          seasonPoints: nextPoints,
          seasonMatches: nextMatches,
          record: {
            wins: prev.record.wins + (isWin ? 1 : 0),
            draws: prev.record.draws + (isDraw ? 1 : 0),
            losses: prev.record.losses + (homeScore < awayScore ? 1 : 0),
            titlesWon: prev.record.titlesWon,
          },
          packsAvailable: bonusPacks,
        };
      });

      // Refresh market after match
      setMarketListings(generateTransferMarketListings());
    });
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-yellow-400 text-slate-950 font-arcade text-xs sm:text-sm font-bold px-4 py-2 border-2 border-slate-950 shadow-2xl rounded-xs animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Top Club Header Bar */}
      <header className="shrink-0 flex items-center justify-between px-3 sm:px-6 py-2 bg-slate-900 border-b border-emerald-900/80 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              retroAudio.playMenuBeep();
              onBackToTitle();
            }}
            className="p-1 sm:p-1.5 border border-slate-700 bg-slate-800 text-slate-300 hover:text-yellow-400 cursor-pointer"
            title="Main Menu"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">{club.badge}</span>
            <div>
              <h1 className="font-pixel text-xs sm:text-sm text-yellow-300 leading-none">
                {club.clubName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-1.5 py-0.2 bg-emerald-950 border border-emerald-500 font-pixel text-[8px] sm:text-[9px] text-emerald-400">
                  DIV {club.division}
                </span>
                <span className="font-arcade text-[10px] text-slate-400">
                  OVR: <strong className="text-yellow-400 font-pixel">{teamOvr}</strong>
                </span>
                <span className="font-arcade text-[10px] text-slate-400 hidden sm:inline">
                  W: {club.record.wins} D: {club.record.draws} L: {club.record.losses}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Currency & Season Points */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-yellow-500/80 rounded-xs shadow-inner">
            <Coins className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="font-pixel text-xs sm:text-sm text-yellow-300">
              {club.coins.toLocaleString()}
            </span>
          </div>

          <div className="hidden xs:flex flex-col items-end">
            <span className="font-arcade text-[10px] text-slate-400">SEASON PROGRESS</span>
            <span className="font-pixel text-[10px] text-emerald-400">
              {club.seasonPoints}/10 PTS · M{club.seasonMatches}/5
            </span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="shrink-0 flex items-center justify-around sm:justify-center sm:gap-4 px-2 py-1.5 bg-slate-950 border-b border-slate-800 text-xs font-arcade">
        <button
          onClick={() => {
            retroAudio.playMenuBeep();
            setActiveTab('matchday');
          }}
          className={`px-3 py-1.5 flex items-center gap-1.5 border transition-all cursor-pointer ${
            activeTab === 'matchday'
              ? 'border-emerald-400 bg-emerald-950/80 text-emerald-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>MATCHDAY</span>
        </button>

        <button
          onClick={() => {
            retroAudio.playMenuBeep();
            setActiveTab('squad');
          }}
          className={`px-3 py-1.5 flex items-center gap-1.5 border transition-all cursor-pointer ${
            activeTab === 'squad'
              ? 'border-yellow-400 bg-yellow-950/80 text-yellow-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>MY SQUAD ({club.starting11.length + club.bench.length})</span>
        </button>

        <button
          onClick={() => {
            retroAudio.playMenuBeep();
            setActiveTab('store');
          }}
          className={`px-3 py-1.5 flex items-center gap-1.5 border transition-all cursor-pointer relative ${
            activeTab === 'store'
              ? 'border-cyan-400 bg-cyan-950/80 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>PACK STORE</span>
          {Object.values(club.packsAvailable).some((c) => c > 0) && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-1 right-1" />
          )}
        </button>

        <button
          onClick={() => {
            retroAudio.playMenuBeep();
            setActiveTab('market');
          }}
          className={`px-3 py-1.5 flex items-center gap-1.5 border transition-all cursor-pointer ${
            activeTab === 'market'
              ? 'border-purple-400 bg-purple-950/80 text-purple-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>MARKET & TRADE</span>
        </button>
      </nav>

      {/* Tab Main Content */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col items-center">
        {/* ================= TAB 1: MATCHDAY ================= */}
        {activeTab === 'matchday' && (
          <div className="w-full max-w-3xl flex flex-col items-center gap-4 my-auto">
            {/* Fixture Matchup Card */}
            <div className="w-full bg-slate-900 border-2 border-emerald-600 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-600 text-slate-950 font-pixel text-[9px] font-bold">
                DIVISION {club.division} MATCH {club.seasonMatches + 1} OF 5
              </div>

              <div className="flex items-center justify-between gap-4 mt-2">
                {/* Home Team (User Club) */}
                <div className="flex-1 flex flex-col items-center text-center">
                  <span className="text-4xl sm:text-5xl mb-2">{club.badge}</span>
                  <span className="font-pixel text-xs sm:text-sm text-yellow-300">{club.clubName}</span>
                  <span className="font-arcade text-[10px] text-slate-400 mt-0.5">
                    OVR: <strong className="text-yellow-400 font-pixel">{teamOvr}</strong>
                  </span>
                </div>

                {/* VS Badge */}
                <div className="flex flex-col items-center shrink-0">
                  <span className="font-pixel text-xl sm:text-2xl text-slate-500">VS</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-[10px] font-arcade text-slate-300 border border-slate-700 mt-1">
                    STANDINGS: {club.seasonPoints} PTS
                  </span>
                </div>

                {/* Away Team (Division Opponent) */}
                <div className="flex-1 flex flex-col items-center text-center">
                  <span className="text-4xl sm:text-5xl mb-2">{currentOpponent.badge}</span>
                  <span className="font-pixel text-xs sm:text-sm text-sky-400">{currentOpponent.name}</span>
                  <span className="font-arcade text-[10px] text-slate-400 mt-0.5">
                    OVR: <strong className="text-sky-400 font-pixel">{currentOpponent.overallRating}</strong>
                  </span>
                </div>
              </div>

              {/* Match Play Button */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleStartCareerMatch}
                  className="w-full sm:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-pixel text-xs sm:text-sm font-bold border-2 border-emerald-300 shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>PLAY FIXTURE</span>
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] font-arcade text-slate-400">
                <span>🎁 MATCH REWARDS: 350+ COINS & PACK BOOSTER ON WIN</span>
                <span>🤖 AUTO-MODE TOGGLE AVAILABLE IN MATCH</span>
              </div>
            </div>

            {/* Division Standings Information */}
            <div className="w-full bg-slate-900/80 border border-slate-800 p-4">
              <h3 className="font-pixel text-xs text-yellow-300 mb-2 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span>DIVISION {club.division} PROMOTION CRITERIA</span>
              </h3>
              <p className="font-arcade text-xs text-slate-300 leading-relaxed">
                Win matches to climb from Division 5 all the way to Division 1 (World Elite)!
                Each season consists of 5 fixtures. Accumulate <strong>10 points</strong> (3 per win, 1 per draw) to win the title, gain promotion, and unlock elite player packs!
              </p>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MY SQUAD ================= */}
        {activeTab === 'squad' && (
          <div className="w-full max-w-4xl flex flex-col gap-4">
            <div className="flex items-center justify-between bg-slate-900 p-2.5 border border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-yellow-400" />
                <span className="font-pixel text-xs text-yellow-300">STARTING 11 (4-4-2)</span>
              </div>
              <span className="font-arcade text-xs text-slate-400">
                Click any card to inspect or swap positions with the bench
              </span>
            </div>

            {/* Starting 11 Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {club.starting11.map((player) => {
                const isSelected = selectedPlayer?.id === player.id;
                const isTarget = swapTarget?.id === player.id;

                return (
                  <div
                    key={player.id}
                    onClick={() => handleSelectCardForSwap(player, true)}
                    className={`relative p-2.5 rounded-none cursor-pointer transition-all flex flex-col items-center text-center ${getTierCardBg(
                      player.tier
                    )} ${
                      isSelected || isTarget
                        ? 'ring-2 ring-yellow-400 scale-105 z-10'
                        : 'hover:border-yellow-400'
                    }`}
                  >
                    {/* Role & Rating Header */}
                    <div className="w-full flex items-center justify-between mb-1">
                      <span className="font-pixel text-[10px] text-yellow-300 font-bold">
                        {player.role}
                      </span>
                      <span className="font-pixel text-xs font-bold text-slate-100">
                        {player.rating}
                      </span>
                    </div>

                    {/* Nationality & Jersey */}
                    <div className="text-xl my-1">{player.nationality.split(' ')[0]}</div>
                    <span className="font-pixel text-[10px] text-slate-200 truncate w-full">
                      {player.name}
                    </span>
                    <span className="font-arcade text-[9px] text-slate-400">
                      #{player.number}
                    </span>

                    {/* Quick Stats Grid */}
                    <div className="w-full grid grid-cols-2 gap-x-1 gap-y-0.5 text-[8px] font-pixel text-slate-300 mt-1.5 pt-1.5 border-t border-slate-800">
                      <div>PAC: {player.stats.speed}</div>
                      <div>SHO: {player.stats.shot}</div>
                      <div>PAS: {player.stats.pass}</div>
                      <div>DEF: {player.stats.defense}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bench / Reserves Drawer */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-pixel text-xs text-slate-300">
                  RESERVES & BENCH ({club.bench.length} CARDS)
                </span>
                <span className="font-arcade text-xs text-slate-400">
                  Select a starter, then select a bench card to swap
                </span>
              </div>

              {club.bench.length === 0 ? (
                <div className="p-6 bg-slate-900 border border-slate-800 text-center font-arcade text-xs text-slate-400">
                  No reserve cards. Open packs in the store or sign players from the Transfer Market!
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {club.bench.map((player) => {
                    const isSelected = selectedPlayer?.id === player.id;
                    const isTarget = swapTarget?.id === player.id;

                    return (
                      <div
                        key={player.id}
                        onClick={() => handleSelectCardForSwap(player, false)}
                        className={`relative p-2.5 rounded-none cursor-pointer transition-all flex flex-col items-center text-center ${getTierCardBg(
                          player.tier
                        )} ${
                          isSelected || isTarget
                            ? 'ring-2 ring-yellow-400 scale-105 z-10'
                            : 'hover:border-yellow-400 opacity-90 hover:opacity-100'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between mb-1">
                          <span className="font-pixel text-[10px] text-yellow-300">
                            {player.role}
                          </span>
                          <span className="font-pixel text-xs font-bold text-slate-100">
                            {player.rating}
                          </span>
                        </div>
                        <div className="text-xl my-1">{player.nationality.split(' ')[0]}</div>
                        <span className="font-pixel text-[10px] text-slate-200 truncate w-full">
                          {player.name}
                        </span>
                        <div className="w-full flex items-center justify-between mt-2 pt-1 border-t border-slate-800 text-[9px] font-arcade">
                          <span className="text-yellow-400">🪙 {player.value}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickSellCard(player);
                            }}
                            className="text-rose-400 hover:text-rose-200 underline text-[8px]"
                          >
                            SELL
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: PACK STORE ================= */}
        {activeTab === 'store' && (
          <div className="w-full max-w-4xl flex flex-col items-center gap-5">
            {/* Free Packs Inventory Notification */}
            {Object.entries(club.packsAvailable).some(([, count]) => count > 0) && (
              <div className="w-full p-3 bg-cyan-950/70 border border-cyan-500 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="font-pixel text-xs text-cyan-300">
                    UNCLAIMED REWARD PACKS READY!
                  </span>
                </div>
                <div className="flex items-center gap-2 font-arcade text-xs">
                  {club.packsAvailable.bronze > 0 && (
                    <button
                      onClick={() => handleOpenPack('bronze', 0)}
                      className="px-2 py-1 bg-amber-800 text-amber-100 border border-amber-600 font-pixel text-[9px]"
                    >
                      OPEN BRONZE ({club.packsAvailable.bronze})
                    </button>
                  )}
                  {club.packsAvailable.silver > 0 && (
                    <button
                      onClick={() => handleOpenPack('silver', 0)}
                      className="px-2 py-1 bg-slate-300 text-slate-950 border border-slate-100 font-pixel text-[9px]"
                    >
                      OPEN SILVER ({club.packsAvailable.silver})
                    </button>
                  )}
                  {club.packsAvailable.gold > 0 && (
                    <button
                      onClick={() => handleOpenPack('gold', 0)}
                      className="px-2 py-1 bg-yellow-400 text-slate-950 border border-yellow-200 font-pixel text-[9px]"
                    >
                      OPEN GOLD ({club.packsAvailable.gold})
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Booster Packs Shop Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Bronze Pack */}
              <div className="p-4 bg-gradient-to-b from-amber-950/80 to-slate-900 border-2 border-amber-700 flex flex-col items-center text-center shadow-lg">
                <span className="text-3xl mb-1">🥉</span>
                <h4 className="font-pixel text-xs text-amber-400">BRONZE BOOSTER</h4>
                <p className="font-arcade text-[10px] text-slate-400 my-2">
                  3 Players · 60 - 69 Rating
                </p>
                <div className="mt-auto w-full pt-3 border-t border-amber-900/60">
                  <button
                    onClick={() => handleOpenPack('bronze', 200)}
                    className="w-full py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 font-pixel text-[10px] border border-amber-500 cursor-pointer transition-colors"
                  >
                    🪙 200 COINS
                  </button>
                </div>
              </div>

              {/* Silver Pack */}
              <div className="p-4 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-400 flex flex-col items-center text-center shadow-lg">
                <span className="text-3xl mb-1">🥈</span>
                <h4 className="font-pixel text-xs text-slate-200">SILVER PRO PACK</h4>
                <p className="font-arcade text-[10px] text-slate-400 my-2">
                  3 Players · 70 - 79 Rating
                </p>
                <div className="mt-auto w-full pt-3 border-t border-slate-700">
                  <button
                    onClick={() => handleOpenPack('silver', 450)}
                    className="w-full py-2 bg-slate-300 hover:bg-white text-slate-950 font-pixel text-[10px] border border-slate-100 cursor-pointer transition-colors"
                  >
                    🪙 450 COINS
                  </button>
                </div>
              </div>

              {/* Gold Elite Pack */}
              <div className="p-4 bg-gradient-to-b from-yellow-950/80 to-slate-900 border-2 border-yellow-400 flex flex-col items-center text-center shadow-lg">
                <span className="text-3xl mb-1">🥇</span>
                <h4 className="font-pixel text-xs text-yellow-300">GOLD ELITE PACK</h4>
                <p className="font-arcade text-[10px] text-slate-400 my-2">
                  3 Players · 80 - 89 Rating
                </p>
                <div className="mt-auto w-full pt-3 border-t border-yellow-800">
                  <button
                    onClick={() => handleOpenPack('gold', 950)}
                    className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-pixel text-[10px] border border-yellow-200 font-bold cursor-pointer transition-colors"
                  >
                    🪙 950 COINS
                  </button>
                </div>
              </div>

              {/* Legend / Icon Pack */}
              <div className="p-4 bg-gradient-to-b from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-300 flex flex-col items-center text-center shadow-xl shadow-amber-500/20">
                <span className="text-3xl mb-1">👑</span>
                <h4 className="font-pixel text-xs text-amber-200">LEGENDS ICON</h4>
                <p className="font-arcade text-[10px] text-amber-300/80 my-2">
                  1 Guaranteed 90+ Legend Icon!
                </p>
                <div className="mt-auto w-full pt-3 border-t border-amber-700">
                  <button
                    onClick={() => handleOpenPack('legend', 2200)}
                    className="w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-pixel text-[10px] font-bold border border-yellow-100 cursor-pointer transition-colors"
                  >
                    🪙 2,200 COINS
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: TRANSFER MARKET & TRADE-IN ================= */}
        {activeTab === 'market' && (
          <div className="w-full max-w-4xl flex flex-col gap-6">
            {/* Live Transfer Market */}
            <div>
              <div className="flex items-center justify-between mb-3 bg-slate-900 p-2 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-purple-400" />
                  <span className="font-pixel text-xs text-purple-300">LIVE TRANSFER MARKET</span>
                </div>
                <button
                  onClick={handleRefreshMarket}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 font-arcade text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>REFRESH SCOUTS (🪙 40)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {marketListings.map((listing) => {
                  const card = listing.card;
                  return (
                    <div
                      key={listing.id}
                      className={`p-3 border flex items-center justify-between gap-3 ${getTierCardBg(
                        card.tier
                      )}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{card.nationality.split(' ')[0]}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-pixel text-xs text-slate-100">{card.name}</span>
                            <span className="font-pixel text-[10px] text-yellow-400">
                              {card.rating}
                            </span>
                          </div>
                          <span className="font-arcade text-[10px] text-slate-400">
                            {card.role} · PAC {card.stats.speed} · SHO {card.stats.shot}
                          </span>
                        </div>
                      </div>

                      {listing.isSoldOut ? (
                        <span className="font-pixel text-[10px] text-slate-500">SIGNED</span>
                      ) : (
                        <button
                          onClick={() => handleBuyMarketCard(listing)}
                          className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-pixel text-[10px] font-bold border border-yellow-200 cursor-pointer shrink-0"
                        >
                          🪙 {listing.price}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trade-In Exchange (SBC) */}
            <div className="p-4 bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-pixel text-xs text-yellow-300">
                  CARD EXCHANGE (TRADE 3 CARDS FOR 1 PACK)
                </span>
                <div className="flex items-center gap-1">
                  {(['silver', 'gold', 'legend'] as CardTier[]).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => {
                        retroAudio.playMenuBeep();
                        setTradeInTargetTier(tier);
                        setTradeInSelectedIds([]);
                      }}
                      className={`px-2 py-0.5 font-pixel text-[9px] uppercase border cursor-pointer ${
                        tradeInTargetTier === tier
                          ? 'border-yellow-400 bg-yellow-950 text-yellow-300'
                          : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tier} PACK
                    </button>
                  ))}
                </div>
              </div>

              <p className="font-arcade text-xs text-slate-400 mb-3">
                Select 3 player cards from your bench to trade in. Selected:{' '}
                <strong className="text-yellow-400">{tradeInSelectedIds.length} / 3</strong>
              </p>

              {/* Bench Trade Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto mb-3">
                {club.bench.map((card) => {
                  const isSelected = tradeInSelectedIds.includes(card.id);
                  return (
                    <div
                      key={card.id}
                      onClick={() => handleToggleTradeInCard(card.id)}
                      className={`p-2 border cursor-pointer text-center flex flex-col items-center ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-950/80'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-pixel text-[10px] text-slate-200 truncate w-full">
                        {card.name}
                      </span>
                      <span className="font-arcade text-[10px] text-yellow-400">
                        {card.rating} OVR · {card.role}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 mt-1" />
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleExecuteTradeIn}
                disabled={tradeInSelectedIds.length !== 3}
                className={`w-full py-2.5 font-pixel text-xs font-bold border transition-all cursor-pointer ${
                  tradeInSelectedIds.length === 3
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-300 shadow-md'
                    : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                }`}
              >
                EXCHANGE 3 CARDS FOR {tradeInTargetTier.toUpperCase()} PACK
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ================= PACK OPENING POPUP OVERLAY ================= */}
      {openingPackTier && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          {packStep === 'shaking' && (
            <div className="flex flex-col items-center text-center animate-bounce">
              <span className="text-6xl sm:text-7xl mb-3">🎁</span>
              <h3 className="font-pixel text-lg text-yellow-300 tracking-wider">
                TEARING OPEN {openingPackTier.toUpperCase()} PACK...
              </h3>
              <p className="font-arcade text-xs text-slate-400 mt-1">
                Revealing new players for your club!
              </p>
            </div>
          )}

          {packStep === 'revealed' && revealedCards && (
            <div className="w-full max-w-xl bg-slate-900 border-2 border-yellow-400 p-6 shadow-2xl flex flex-col items-center text-center">
              <span className="font-pixel text-xs text-yellow-400 mb-1">★ PACK REVEAL ★</span>
              <h3 className="font-pixel text-base sm:text-lg text-slate-100 mb-5">
                NEW SIGNINGS ARRIVED!
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-6">
                {revealedCards.map((card) => (
                  <div
                    key={card.id}
                    className={`p-3 flex flex-col items-center ${getTierCardBg(card.tier)} animate-fade-in`}
                  >
                    <span className="font-pixel text-[10px] text-yellow-300">{card.role}</span>
                    <span className="text-3xl my-1.5">{card.nationality.split(' ')[0]}</span>
                    <h4 className="font-pixel text-xs text-slate-100 truncate w-full">
                      {card.name}
                    </h4>
                    <span className="font-pixel text-sm font-bold text-yellow-400 my-1">
                      {card.rating} OVR
                    </span>
                    <span
                      className={`px-1.5 py-0.5 text-[8px] font-pixel rounded-xs uppercase ${getTierBadge(
                        card.tier
                      )}`}
                    >
                      {card.tier}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleClaimUnboxedCards}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-pixel text-xs font-bold border-2 border-yellow-200 cursor-pointer transition-transform hover:scale-102"
              >
                ADD TO CLUB SQUAD
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
