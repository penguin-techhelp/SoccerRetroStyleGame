import React from 'react';
import { retroAudio } from '../audio/retroAudio';
import { X, Gamepad2, Keyboard, Sparkles, Laptop, Monitor } from 'lucide-react';

interface ControlsModalProps {
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900 border-2 border-emerald-500 shadow-2xl p-5 sm:p-6 relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={() => {
            retroAudio.playMenuBeep();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-500 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <span className="font-arcade text-xs text-emerald-400 tracking-widest block mb-1">
            OPTIMIZED FOR CHROMEBOOKS & WINDOWS LAPTOS (16:9)
          </span>
          <h2 className="font-pixel text-base sm:text-xl text-yellow-300">
            CONTROLS & 16:9 PLAYBOOK
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Player 1 Keyboard Controls */}
          <div className="bg-slate-950 p-3.5 border border-slate-800">
            <div className="flex items-center gap-2 mb-2.5 text-emerald-400 font-pixel text-xs border-b border-slate-800 pb-2">
              <Keyboard className="w-4 h-4" />
              <span>PLAYER 1 (LEFT SIDE OF KEYBOARD)</span>
            </div>

            <div className="space-y-1.5 text-xs font-arcade text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">MOVE</span>
                <span className="font-pixel text-[10px] text-yellow-300">W, A, S, D</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PASS / SWITCH</span>
                <span className="font-pixel text-[10px] text-yellow-300">J or Z</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SHOOT (CHARGE)</span>
                <span className="font-pixel text-[10px] text-yellow-300">K or X</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SLIDE TACKLE</span>
                <span className="font-pixel text-[10px] text-yellow-300">L or C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SPRINT (BURST)</span>
                <span className="font-pixel text-[10px] text-yellow-300">SPACE or SHIFT</span>
              </div>
            </div>
          </div>

          {/* Player 2 Laptop Keyboard Controls (No Numpad Needed!) */}
          <div className="bg-slate-950 p-3.5 border border-slate-800">
            <div className="flex items-center gap-2 mb-2.5 text-sky-400 font-pixel text-xs border-b border-slate-800 pb-2">
              <Laptop className="w-4 h-4" />
              <span>PLAYER 2 (RIGHT SIDE OF LAPTOP)</span>
            </div>

            <div className="space-y-1.5 text-xs font-arcade text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">MOVE</span>
                <span className="font-pixel text-[10px] text-sky-300">ARROW KEYS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PASS / SWITCH</span>
                <span className="font-pixel text-[10px] text-sky-300">N or COMMA (,)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SHOOT (CHARGE)</span>
                <span className="font-pixel text-[10px] text-sky-300">M or PERIOD (.)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SLIDE TACKLE</span>
                <span className="font-pixel text-[10px] text-sky-300">B or SLASH (/)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SPRINT (BURST)</span>
                <span className="font-pixel text-[10px] text-sky-300">RIGHT SHIFT / ENTER</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Hotkeys Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5 text-center text-xs font-arcade">
          <div className="bg-slate-950 p-2 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">16:9 FULLSCREEN</span>
            <span className="font-pixel text-[11px] text-emerald-400">[F] / [F11]</span>
          </div>
          <div className="bg-slate-950 p-2 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">LIVE STATS HUD</span>
            <span className="font-pixel text-[11px] text-yellow-400">[TAB] / [T]</span>
          </div>
          <div className="bg-slate-950 p-2 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">INSTANT REPLAY</span>
            <span className="font-pixel text-[11px] text-rose-400">[R]</span>
          </div>
          <div className="bg-slate-950 p-2 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">PAUSE MATCH</span>
            <span className="font-pixel text-[11px] text-sky-400">[P] / [ESC]</span>
          </div>
        </div>

        {/* Chromebook & Laptop Pro Tips */}
        <div className="bg-emerald-950/30 border border-emerald-700/60 p-3 mb-5 text-xs font-arcade">
          <div className="flex items-center gap-1.5 text-yellow-300 font-pixel text-[10px] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LAPTOP & CHROMEBOOK FEATURES</span>
          </div>
          <ul className="space-y-1 text-slate-300 list-disc list-inside">
            <li><strong>NO NUMPAD NEEDED:</strong> Play 2-player matches on any compact laptop or school Chromebook using the left and right halves of the keyboard.</li>
            <li><strong>TRUE 16:9 FULLSCREEN:</strong> Press <strong>[F]</strong> to expand edge-to-edge into your screen's native 16:9 aspect ratio.</li>
            <li><strong>CHROMEBOOK ECO ENGINE:</strong> On budget laptops or battery power, toggle Eco Mode for smooth, battery-friendly 60 FPS performance.</li>
            <li><strong>PLUG-AND-PLAY GAMEPADS:</strong> Xbox, PlayStation, and generic USB/Bluetooth controllers are auto-detected instantly.</li>
          </ul>
        </div>

        <button
          onClick={() => {
            retroAudio.playMenuBeep();
            onClose();
          }}
          className="w-full py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-pixel text-xs tracking-wider border border-emerald-300 cursor-pointer"
        >
          GOT IT · BACK TO GAME
        </button>
      </div>
    </div>
  );
};
