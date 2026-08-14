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
import { 
  toggleBgm, 
  setBgmTrack, 
  setBgmVolume, 
  BGM_TRACKS 
} from '../utils/bgmPlayer';
import { useAuth } from '../context/AuthContext';

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
  const [bgmOn, setBgmOn] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [bgmVolume, setVolumeState] = useState(35);
  const [showBgmMenu, setShowBgmMenu] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const { user, signInWithGoogle, logout, loading: authLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

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

  const handleBgmToggle = () => {
    playButtonClickSound();
    const isPlaying = toggleBgm();
    setBgmOn(isPlaying);
  };

  const handleTrackChange = (idx: number) => {
    playButtonClickSound();
    setCurrentTrackIdx(idx);
    setBgmTrack(idx);
    setBgmOn(true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolumeState(val);
    setBgmVolume(val / 100);
  };

  const handleGoogleLogin = async () => {
    playButtonClickSound();
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setAuthError(err?.message || 'Failed to sign in with Google');
      }
    }
  };

  const handleLogout = async () => {
    playButtonClickSound();
    try {
      await logout();
    } catch (err: any) {
      console.error(err);
    }
  };

  const navItems: { id: TabType; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'crucible', label: 'Transmutation Forge', icon: <PixelFlaskIcon size={18} color={activeTab === 'crucible' ? '#0E151B' : '#38D9C4'} />, color: 'teal' },
    { id: 'roster', label: 'Athletes Guild', icon: <PixelShieldIcon size={18} color={activeTab === 'roster' ? '#0E151B' : '#C9973E'} />, color: 'amber' },
    { id: 'calculator', label: 'Formula Matrix', icon: <PixelBarChartIcon size={18} color={activeTab === 'calculator' ? '#0E151B' : '#E2654B'} />, color: 'red' },
    { id: 'grimoire', label: 'Alchemist Codex', icon: <PixelScrollIcon size={18} color={activeTab === 'grimoire' ? '#0E151B' : '#EBBF68'} />, color: 'amber' },
    { id: 'coach_ai', label: 'Master AI', icon: <PixelWizardIcon size={18} color={activeTab === 'coach_ai' ? '#0E151B' : '#38D9C4'} />, color: 'teal' },
  ];

  return (
    <header className="bg-[#101923] border-b-4 border-[#070B0E] relative z-20 shadow-lg">
      {/* Top Retro HUD Status Bar */}
      <div className="bg-[#070B0E] text-[#8A9EB2] text-xs font-tech px-4 py-1.5 flex flex-wrap justify-between items-center border-b border-[#1E2D3B] gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[#C9973E] font-bold flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-[#C9973E] animate-pulse"></span>
            CYBER-ALCHEMY V3.2
          </span>
          <span className="hidden sm:inline text-[#2A3A4A]">|</span>
          <span className="hidden sm:inline">CYCLE: <strong className="text-[#E0E8F0]">2026.08</strong></span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {selectedAthleteName && (
            <span className="hidden md:inline-block text-[#EBBF68] bg-[#16222F] px-2 py-0.5 border border-[#2A3A4A] text-[11px]">
              FOCUS ATHLETE: <strong>{selectedAthleteName}</strong>
            </span>
          )}

          <span className="text-[#38D9C4] font-bold tracking-wider text-[11px]">{currentTimeStr || '12:00:00'}</span>

          {/* Sound FX Toggle Button */}
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

          {/* BGM Music Player Control Section */}
          <div className="relative flex items-center gap-1.5">
            <button
              onClick={handleBgmToggle}
              className={`px-2.5 py-0.5 border text-[10px] font-silkscreen uppercase transition-colors flex items-center gap-1.5 ${
                bgmOn 
                  ? 'bg-[#2E2812] text-[#EBBF68] border-[#C9973E] shadow-[0_0_8px_rgba(201,151,62,0.3)] animate-pulse' 
                  : 'bg-[#182028] text-[#6A8095] border-[#2A3A4A]'
              }`}
              title="Toggle Retro Background Music"
            >
              {/* Retro Equalizer Animation Bars */}
              {bgmOn ? (
                <span className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-[#EBBF68] h-3 animate-bounce"></span>
                  <span className="w-0.5 bg-[#38D9C4] h-2 animate-pulse"></span>
                  <span className="w-0.5 bg-[#EBBF68] h-3.5 animate-bounce"></span>
                </span>
              ) : (
                <span>🎵</span>
              )}
              <span>BGM: {bgmOn ? 'ON 🎶' : 'OFF 🔇'}</span>
            </button>

            {/* Music Options & Track Switcher Dropdown Toggle */}
            <button
              onClick={() => {
                playButtonClickSound();
                setShowBgmMenu(!showBgmMenu);
              }}
              className="bg-[#16222F] hover:bg-[#1E2D3B] text-[#EBBF68] border border-[#2A3A4A] px-2 py-0.5 text-[10px] font-silkscreen flex items-center gap-1"
              title="Alchemist Jukebox - Select Track & Volume"
            >
              <span>📻</span>
              <span>ALCHEMIST JUKEBOX</span>
            </button>

            {/* BGM Dropdown Overlay */}
            {showBgmMenu && (
              <div className="absolute right-0 top-7 w-64 bg-[#101923] border-2 border-[#C9973E] shadow-2xl p-3 z-50 font-tech text-xs space-y-3">
                <div className="flex justify-between items-center border-b border-[#2A3A4A] pb-1.5">
                  <span className="font-silkscreen text-[#C9973E] text-[11px] flex items-center gap-1">
                    📻 ALCHEMIST JUKEBOX
                  </span>
                  <button
                    onClick={() => setShowBgmMenu(false)}
                    className="text-[#8A9EB2] hover:text-[#E0E8F0] font-bold text-xs"
                  >
                    ✕
                  </button>
                </div>

                {/* Track Selector List */}
                <div className="space-y-1">
                  <div className="text-[10px] text-[#8A9EB2] font-silkscreen">SELECT THEME:</div>
                  {BGM_TRACKS.map((t, idx) => (
                    <button
                      key={t.id}
                      onClick={() => handleTrackChange(idx)}
                      className={`w-full text-left px-2 py-1 border text-[11px] font-tech flex justify-between items-center transition-colors ${
                        currentTrackIdx === idx && bgmOn
                          ? 'bg-[#C9973E]/20 text-[#EBBF68] border-[#C9973E]'
                          : 'bg-[#16222F] text-[#8A9EB2] border-[#2A3A4A] hover:bg-[#1E2D3B] hover:text-[#E0E8F0]'
                      }`}
                    >
                      <span className="truncate">
                        {idx + 1}. {t.title}
                      </span>
                      <span className="text-[9px] opacity-75 font-silkscreen">{t.tempo} BPM</span>
                    </button>
                  ))}
                </div>

                {/* Volume Slider */}
                <div>
                  <div className="flex justify-between text-[10px] font-silkscreen text-[#8A9EB2] mb-1">
                    <span>VOLUME:</span>
                    <span className="text-[#38D9C4]">{bgmVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={bgmVolume}
                    onChange={handleVolumeChange}
                    className="w-full accent-[#C9973E] cursor-pointer h-1.5 bg-[#0E151B]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Google / Gmail Auth Widget */}
          {authLoading ? (
            <span className="text-[10px] text-[#8A9EB2] animate-pulse font-silkscreen">LOADING...</span>
          ) : user ? (
            <div className="flex items-center gap-2 bg-[#16222F] px-2 py-0.5 border border-[#38D9C4]/40">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-4 h-4 rounded-full border border-[#38D9C4]" />
              ) : (
                <span className="text-xs">👤</span>
              )}
              <span className="text-[11px] text-[#38D9C4] font-bold max-w-[100px] truncate">
                {user.displayName || user.email?.split('@')[0] || 'ALCHEMIST'}
              </span>
              <button
                onClick={handleLogout}
                className="text-[10px] text-[#E2654B] hover:underline font-silkscreen ml-1"
                title="Log Out"
              >
                [LOGOUT]
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="bg-[#1D2B3A] hover:bg-[#283C50] text-[#E0E8F0] border border-[#C9973E] px-2.5 py-0.5 text-[11px] font-silkscreen flex items-center gap-1.5 transition-all shadow-md active:translate-y-0.5"
              title="Sign in with Gmail / Google Account"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="text-[#C9973E] font-bold">LOG IN VIA GMAIL</span>
            </button>
          )}
        </div>
      </div>

      {authError && (
        <div className="bg-[#4A1D1D] text-[#E2654B] text-[11px] px-4 py-1 text-center font-tech border-b border-[#E2654B]/30">
          ⚠️ AUTH NOTICE: {authError}
        </div>
      )}

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


