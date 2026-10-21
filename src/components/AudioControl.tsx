import React, { useState } from 'react';
import { AmbientSoundType } from '../types';
import { soundscape } from '../utils/audio';
import { Volume2, VolumeX, CloudRain, Flame, Waves } from 'lucide-react';

export const AudioControl: React.FC = () => {
  const [currentSound, setCurrentSound] = useState<AmbientSoundType>('none');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.35);

  const toggleSound = (sound: AmbientSoundType) => {
    if (currentSound === sound) {
      soundscape.stop();
      setCurrentSound('none');
    } else {
      soundscape.play(sound);
      setCurrentSound(sound);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundscape.setVolume(newVol);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition-colors cursor-pointer ${
          currentSound !== 'none'
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white'
            : 'text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800'
        }`}
        title="Ambiance sonore apaisante"
      >
        {currentSound !== 'none' ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">
          {currentSound === 'rain' ? 'Pluie douce' :
           currentSound === 'crackle' ? 'Crépitement' :
           currentSound === 'drone' ? 'Ondes calmes' : 'Ambiance'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-56 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl z-50">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              Fond sonore de concentration
            </span>
          </div>

          <div className="space-y-1 mb-3">
            <button
              onClick={() => toggleSound('rain')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                currentSound === 'rain'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                Pluie apaisante
              </span>
              {currentSound === 'rain' && <span className="text-[10px] text-neutral-400">Actif</span>}
            </button>

            <button
              onClick={() => toggleSound('crackle')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                currentSound === 'crackle'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Feu & vinyle
              </span>
              {currentSound === 'crackle' && <span className="text-[10px] text-neutral-400">Actif</span>}
            </button>

            <button
              onClick={() => toggleSound('drone')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                currentSound === 'drone'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Waves className="w-3.5 h-3.5 text-emerald-500" />
                Ondes calmes (432Hz)
              </span>
              {currentSound === 'drone' && <span className="text-[10px] text-neutral-400">Actif</span>}
            </button>
          </div>

          {currentSound !== 'none' && (
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                <span>Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-neutral-900 dark:accent-neutral-100 cursor-pointer h-1 bg-neutral-200 dark:bg-neutral-700 rounded-lg"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
