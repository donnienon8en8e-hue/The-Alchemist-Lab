import React, { useState, useEffect } from 'react';
import { TabType } from '../types';
import { CelestialLogo } from './CelestialLogo';
import { 
  PixelFlaskIcon, 
  PixelShieldIcon, 
  PixelBarChartIcon, 
  PixelScrollIcon, 
  PixelWizardIcon 
} from './PixelIcons';
import { isSoundEnabled, toggleSound, playTabSwitchSound, playButtonClickSound } from '../utils/audioSynth';

interface AlchemicalHeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedAthleteName?: string;
}

export const AlchemicalHeader: React.FC<AlchemicalHeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedAthleteName,
}) => {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setCurrentTimeStr(`${hrs}:${mins}:${secs}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (tab: TabType) => {
    playTabSwitchSound();
    setActiveTab(tab);
  };

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    if (newState) playButtonClickSound();
  };

  const navItems: { id: TabType; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'crucible', label: 'Crucible Lab', icon: <PixelFlaskIcon size={18} color={activeTab === 'crucible' ? '#0E151B' : '#38D9C4'} />, color: 'teal' },
    { id: 'roster', label: 'Athletes Guild', icon: <PixelShieldIcon size={18} color={activeTab === 'roster' ? '#0E151B' : '#C9973E'} />, color: 'amber' },
    { id: 'calculator', label: 'Formula Matrix', icon: <PixelBarChartIcon size={18} color={activeTab === 'calculator' ? '#0E151B' : '#E2654B'} />, color: 'red' },
    { id: 'grimoire', label: 'Grimoire Log', icon: <PixelScrollIcon size={18} color={activeTab === 'grimoire' ? '#0E151B' : '#EBBF68'} />, color: 'amber' },
    { id: 'coach_ai', label: 'Master AI', icon: <PixelWizardIcon size={18} color={activeTab === 'coach_ai' ? '#0E151B' : '#38D9C4'} />, color: 'teal' },
  ];

  return (
    <header className="bg-[#101923] border-b-4 border-[#070B0E] relative z-20 shadow-lg">
      {/* Top Retro HUD Status Bar */}
      <div className="bg-[#070B0E] text-[#8A9EB2] text-xs font-tech px-4 py-1 flex flex-wrap justify-between items-center border-b border-[#1E2D3B]">
        <div className="flex items-center gap-4">
          <span className="text-[#C9973E] font-bold flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-[#C9973E] animate-pulse"></span>
            CYBER-ALCHEMY V3.2
          </span>
          <span className="hidden sm:inline text-[#2A3A4A]">|</span>
          <span className="hidden sm:inline">CYCLE: <strong className="text-[#E0E8F0]">2026.08</strong></span>
          <span className="hidden md:inline text-[#2A3A4A]">|</span>
          <span className="hidden md:inline text-[#38D9C4]">MOON PHASE: WAXING CRESCENT</span>
        </div>

        <div className="flex items-center gap-3">
          {selectedAthleteName && (
            <span className="text-[#EBBF68] bg-[#16222F] px-2 py-0.5 border border-[#2A3A4A] text-[11px]">
              FOCUS ATHLETE: <strong>{selectedAthleteName}</strong>
            </span>
          )}

          <span className="text-[#38D9C4] font-bold tracking-wider">{currentTimeStr || '12:00:00'}</span>

          <button
            onClick={handleSoundToggle}
            className={`px-2 py-0.5 border text-[10px] font-silkscreen uppercase transition-colors ${
              soundOn 
                ? 'bg-[#184240] text-[#38D9C4] border-[#38D9C4]' 
                : 'bg-[#211818] text-[#8B5A5A] border-[#4A2D2D]'
            }`}
            title="Toggle 8-bit Audio Effects"
          >
            SFX: {soundOn ? 'ON 🔊' : 'OFF 🔇'}
          </button>
        </div>
      </div>

      {/* Main Branding & Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Branding with Sun-Moon Emblem */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabChange('crucible')}>
          <CelestialLogo size={52} />
          <div>
            <h1 className="font-pixel text-lg sm:text-xl text-[#C9973E] tracking-tight drop-shadow-[2px_2px_0px_#070B0E]">
              THE ALCHEMIST LAB
            </h1>
            <p className="font-silkscreen text-xs text-[#38D9C4] tracking-wide">
              Sports Science & Training Transmutation Studio
            </p>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <nav className="flex flex-wrap gap-2 justify-center">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            let btnClass = 'pixel-btn text-xs px-3 py-2 flex items-center gap-2 ';
            if (isActive) {
              if (item.color === 'amber') btnClass += 'pixel-btn-amber ';
              else if (item.color === 'teal') btnClass += 'pixel-btn-teal ';
              else if (item.color === 'red') btnClass += 'pixel-btn-red ';
            }

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={btnClass}
              >
                {item.icon}
                <span className="font-silkscreen">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
