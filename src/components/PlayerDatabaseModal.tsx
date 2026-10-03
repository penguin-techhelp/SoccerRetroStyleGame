import React, { useState } from 'react';
import { OFFICIAL_PLAYERS, OfficialPlayer } from '../data/officialDatabase';
import { retroAudio } from '../audio/retroAudio';
import { X, Search, Shield, Zap, Sparkles, Filter, Award } from 'lucide-react';

interface PlayerDatabaseModalProps {
  onClose: () => void;
}

export const PlayerDatabaseModal: React.FC<PlayerDatabaseModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVol, setSelectedVol] = useState<string>('all');
  const [selectedClub, setSelectedClub] = useState<string>('all');

  // Unique list of all clubs
  const clubs = Array.from(new Set(OFFICIAL_PLAYERS.map((p) => p.club))).sort();

  const filteredPlayers = OFFICIAL_PLAYERS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.club.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.includes(searchTerm);

    let matchesVol = true;
    const num = p.number;
    if (selectedVol === 'vol1') matchesVol = num <= 25;
    else if (selectedVol === 'vol2') matchesVol = num >= 26 && num <= 50;
    else if (selectedVol === 'vol3') matchesVol = num >= 51 && num <= 75;
    else if (selectedVol === 'vol4') matchesVol = num >= 76 && num <= 100;

    let matchesClub = true;
    if (selectedClub !== 'all') matchesClub = p.club === selectedClub;

    return matchesSearch && matchesVol && matchesClub;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-emerald-500 shadow-2xl p-4 sm:p-6 flex flex-col my-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <div>
              <span className="font-arcade text-[10px] text-emerald-400 block tracking-widest">
                OFFICIAL RETRO ARCADE SOCCER DATABASE
              </span>
              <h2 className="font-pixel text-base sm:text-xl text-yellow-300">
                100 UNLICENSED PLAYERS ROSTER
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              retroAudio.playMenuBeep();
              onClose();
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4 text-xs font-arcade">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search player, club, position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 pl-8 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* Volume Filter */}
          <select
            value={selectedVol}
            onChange={(e) => {
              retroAudio.playMenuBeep();
              setSelectedVol(e.target.value);
            }}
            className="bg-slate-950 border border-slate-700 px-3 py-2 text-slate-200 focus:outline-none focus:border-yellow-400 cursor-pointer"
          >
            <option value="all">ALL VOLUMES (001 - 100)</option>
            <option value="vol1">VOL I: ATTACKERS & WINGERS (001-025)</option>
            <option value="vol2">VOL II: PLAYMAKERS & MIDFIELDERS (026-050)</option>
            <option value="vol3">VOL III: DEFENDERS & ANCHORS (051-075)</option>
            <option value="vol4">VOL IV: FULLBACKS & GOALKEEPERS (076-100)</option>
          </select>

          {/* Club Filter */}
          <select
            value={selectedClub}
            onChange={(e) => {
              retroAudio.playMenuBeep();
              setSelectedClub(e.target.value);
            }}
            className="bg-slate-950 border border-slate-700 px-3 py-2 text-slate-200 focus:outline-none focus:border-yellow-400 cursor-pointer"
          >
            <option value="all">ALL CLUBS ({clubs.length} CLUBS)</option>
            {clubs.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Database Table */}
        <div className="border border-slate-800 bg-slate-950/70 overflow-x-auto mb-4 flex-1 max-h-[55vh]">
          <table className="w-full text-left text-xs font-arcade border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px]">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-2">PLAYER NAME</th>
                <th className="py-2.5 px-2">CLUB</th>
                <th className="py-2.5 px-2 text-center">POS</th>
                <th className="py-2.5 px-2 text-center text-yellow-300 font-pixel">PAC</th>
                <th className="py-2.5 px-2 text-center text-rose-300 font-pixel">SHO</th>
                <th className="py-2.5 px-2 text-center text-emerald-300 font-pixel">PAS</th>
                <th className="py-2.5 px-2 text-center text-sky-300 font-pixel">DRI</th>
                <th className="py-2.5 px-2 text-center text-amber-300 font-pixel">DEF</th>
                <th className="py-2.5 px-2 text-center text-purple-300 font-pixel">PHY</th>
                <th className="py-2.5 px-3 text-right text-yellow-400 font-pixel">OVR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredPlayers.map((p) => {
                const isStar = p.ovr >= 85;

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-800/60 transition-colors ${
                      isStar ? 'bg-yellow-950/15' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-slate-400 font-mono text-[11px] tabular-nums">
                      {p.id}
                    </td>
                    <td className="py-2 px-2 font-medium text-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {isStar && <Sparkles className="w-3 h-3 text-yellow-400 shrink-0" />}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-slate-300">
                      <span className="truncate max-w-[130px] block">{p.club}</span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-pixel rounded ${
                          p.pos === 'GK'
                            ? 'bg-amber-950 text-amber-300 border border-amber-600/50'
                            : ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(p.pos)
                            ? 'bg-sky-950 text-sky-300 border border-sky-600/50'
                            : ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(p.pos)
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                            : 'bg-rose-950 text-rose-300 border border-rose-600/50'
                        }`}
                      >
                        {p.pos}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center font-mono tabular-nums text-yellow-300">
                      {p.pac}
                    </td>
                    <td className="py-2 px-2 text-center font-mono tabular-nums text-rose-300">
                      {p.sho}
                    </td>
                    <td className="py-2 px-2 text-center font-mono tabular-nums text-emerald-300">
                      {p.pas}
                    </td>
                    <td className="py-2 px-2 text-center font-mono tabular-nums text-sky-300">
                      {p.dri}
                    </td>
                    <td className="py-2 px-2 text-center font-mono tabular-nums text-amber-300">
                      {p.def}
                    </td>
                    <td className="py-2 px-2 text-center font-mono tabular-nums text-purple-300">
                      {p.phy}
                    </td>
                    <td className="py-2 px-3 text-right font-pixel text-[11px] tabular-nums">
                      <span
                        className={
                          p.ovr >= 87
                            ? 'text-yellow-400 font-bold'
                            : p.ovr >= 84
                            ? 'text-emerald-400'
                            : 'text-slate-300'
                        }
                      >
                        {p.ovr}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info & close */}
        <div className="flex items-center justify-between font-arcade text-xs pt-2 border-t border-slate-800">
          <span className="text-slate-400">
            SHOWING <strong className="text-yellow-400">{filteredPlayers.length}</strong> OF 100 PLAYERS
          </span>

          <button
            onClick={() => {
              retroAudio.playMenuBeep();
              onClose();
            }}
            className="py-2 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 cursor-pointer font-bold transition-colors"
          >
            CLOSE [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
