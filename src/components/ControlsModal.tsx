import React from 'react';
import { retroAudio } from '../audio/retroAudio';
import { X, Gamepad2, Keyboard, Sparkles } from 'lucide-react';

interface ControlsModalProps {
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-emerald-500 shadow-2xl p-6 relative">
        <button
          onClick={() => {
            retroAudio.playMenuBeep();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <span className="font-arcade text-xs text-emerald-400 tracking-widest block mb-1">
            RETRO STRIKER '94 PLAYBOOK
          </span>
          <h2 className="font-pixel text-lg sm:text-xl text-yellow-300">
            CONTROLS & TACTICS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Keyboard Controls */}
          <div className="bg-slate-950 p-4 border border-slate-800">
            <div className="flex items-center gap-2 mb-3 text-emerald-400 font-pixel text-xs border-b border-slate-800 pb-2">
              <Keyboard className="w-4 h-4" />
              <span>PLAYER 1 (KEYBOARD)</span>
            </div>

            <div className="space-y-2 text-xs font-arcade text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">MOVE</span>
                <span className="font-pixel text-[10px] text-yellow-300">W, A, S, D / ARROWS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PASS / SWITCH</span>
                <span className="font-pixel text-[10px] text-yellow-300">J / Z</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SHOOT (CHARGE)</span>
                <span className="font-pixel text-[10px] text-yellow-300">K / X</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SLIDE TACKLE</span>
                <span className="font-pixel text-[10px] text-yellow-300">L / C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SPRINT (BURST)</span>
                <span className="font-pixel text-[10px] text-yellow-300">SHIFT / SPACE</span>
              </div>
            </div>
          </div>

          {/* Gamepad Controls */}
          <div className="bg-slate-950 p-4 border border-slate-800">
            <div className="flex items-center gap-2 mb-3 text-sky-400 font-pixel text-xs border-b border-slate-800 pb-2">
              <Gamepad2 className="w-4 h-4" />
              <span>GAMEPAD (PLUG & PLAY)</span>
            </div>

            <div className="space-y-2 text-xs font-arcade text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">MOVE</span>
                <span className="font-pixel text-[10px] text-sky-300">L-STICK / D-PAD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PASS / SWITCH</span>
                <span className="font-pixel text-[10px] text-sky-300">A / CROSS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SHOOT (HOLD)</span>
                <span className="font-pixel text-[10px] text-sky-300">X / SQUARE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SLIDE TACKLE</span>
                <span className="font-pixel text-[10px] text-sky-300">B / CIRCLE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SPRINT</span>
                <span className="font-pixel text-[10px] text-sky-300">RB / RT</span>
              </div>
            </div>
          </div>
        </div>

        {/* 16-Bit Pro Tips */}
        <div className="bg-emerald-950/30 border border-emerald-700/60 p-3.5 mb-6 text-xs font-arcade">
          <div className="flex items-center gap-1.5 text-yellow-300 font-pixel text-[11px] mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>16-BIT PRO TACTICS</span>
          </div>
          <ul className="space-y-1 text-slate-300 list-disc list-inside">
            <li><strong>BEND YOUR SHOTS:</strong> Steer your direction while charging the shot button to apply curling spin into the corner!</li>
            <li><strong>TIMED SLIDE TACKLES:</strong> Slide from the side or front for a clean poke. Sliding from behind risks a yellow or straight red card!</li>
            <li><strong>INSTANT REPLAY:</strong> Tap <strong className="text-emerald-400">[R]</strong> anytime during the match to rewind the last 5 seconds in slow motion!</li>
            <li><strong>LOCAL 2-PLAYER:</strong> Plug in two gamepads or use Numpad keys for Player 2 to battle head-to-head on the same screen!</li>
          </ul>
        </div>

        <button
          onClick={() => {
            retroAudio.playMenuBeep();
            onClose();
          }}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-pixel text-xs tracking-wider border border-emerald-300 cursor-pointer"
        >
          GOT IT · BACK TO GAME
        </button>
      </div>
    </div>
  );
};
