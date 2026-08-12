import React, { useState } from 'react';
import { Athlete } from '../types';
import { calculateACWR, getPacingZonesFromVDOT } from '../utils/sportsScience';
import { playButtonClickSound } from '../utils/audioSynth';
import { PixelShieldIcon, PixelHeartIcon, PixelFlameIcon, PixelBarChartIcon, PixelPlusIcon } from './PixelIcons';

interface AthletesRosterProps {
  athletes: Athlete[];
  selectedAthleteId: string;
  onSelectAthlete: (id: string) => void;
  onAddAthlete: (athlete: Athlete) => void;
  onUpdateAthlete: (athlete: Athlete) => void;
}

export const AthletesRoster: React.FC<AthletesRosterProps> = ({
  athletes,
  selectedAthleteId,
  onSelectAthlete,
  onAddAthlete,
  onUpdateAthlete,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const activeAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];
  const acwrData = calculateACWR(activeAthlete.acute7dKm, activeAthlete.chronic28dKm);
  const pacingZones = getPacingZonesFromVDOT(activeAthlete.vdot);

  // Form states for new athlete
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('Novice Runner Alchemist');
  const [newVo2Max, setNewVo2Max] = useState('52.0');
  const [newVdot, setNewVdot] = useState('48.0');
  const [newPrimaryDist, setNewPrimaryDist] = useState('10K');
  const [newAcuteKm, setNewAcuteKm] = useState('45');
  const [newChronicKm, setNewChronicKm] = useState('180');

  const handleCreateAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonClickSound();

    if (!newName.trim()) return;

    const created: Athlete = {
      id: `ath_${Date.now()}`,
      name: newName.trim(),
      title: newTitle.trim(),
      level: 1,
      exp: 100,
      maxExp: 1000,
      staminaHp: 100,
      staminaMaxHp: 100,
      manaMp: 100,
      vo2Max: parseFloat(newVo2Max) || 50,
      vdot: parseFloat(newVdot) || 45,
      acwr: calculateACWR(parseFloat(newAcuteKm) || 40, parseFloat(newChronicKm) || 160).ratio,
      acute7dKm: parseFloat(newAcuteKm) || 40,
      chronic28dKm: parseFloat(newChronicKm) || 160,
      avgCadence: 178,
      maxHr: 190,
      restingHr: 50,
      primaryDistance: newPrimaryDist,
      avatarIcon: 'shield',
      themeColor: '#38D9C4',
      pbs: [
        { distance: '5K', time: '21:30', vdotEst: parseFloat(newVdot) || 45 },
        { distance: '10K', time: '44:15', vdotEst: parseFloat(newVdot) || 45 },
      ],
    };

    onAddAthlete(created);
    onSelectAthlete(created.id);
    setShowAddModal(false);
    setNewName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="pixel-panel p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-silkscreen text-xs text-[#C9973E] uppercase tracking-wider">
            SECTION II: ATHLETES GUILD & CHARACTER HUDS
          </span>
          <h2 className="font-pixel text-lg text-[#E0E8F0] mt-1 flex items-center gap-2">
            <PixelShieldIcon size={24} color="#C9973E" />
            ATHLETE ROSTER & PHYSIOLOGY HUD
          </h2>
        </div>

        <button
          onClick={() => {
            playButtonClickSound();
            setShowAddModal(true);
          }}
          className="pixel-btn pixel-btn-amber text-xs px-4 py-2 flex items-center gap-2"
        >
          <PixelPlusIcon size={16} />
          RECRUIT NEW ATHLETE
        </button>
      </div>

      {/* Athlete Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {athletes.map((ath) => {
          const isSelected = ath.id === activeAthlete.id;
          const athAcwr = calculateACWR(ath.acute7dKm, ath.chronic28dKm);

          return (
            <div
              key={ath.id}
              onClick={() => {
                playButtonClickSound();
                onSelectAthlete(ath.id);
              }}
              className={`pixel-panel p-4 cursor-pointer transition-transform duration-100 ${
                isSelected ? 'pixel-panel-teal scale-[1.02]' : 'hover:border-[#38D9C4]'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-pixel text-xs text-[#38D9C4]">LVL {ath.level}</span>
                  <h3 className="font-silkscreen text-sm text-[#E0E8F0]">{ath.name}</h3>
                  <span className="text-[10px] font-tech text-[#8A9EB2] block">{ath.title}</span>
                </div>
                <span className="text-[11px] font-tech px-2 py-0.5 bg-[#070B0E] border border-[#1E2D3B] text-[#EBBF68]">
                  {ath.primaryDistance}
                </span>
              </div>

              {/* JRPG Bars */}
              <div className="space-y-1.5 my-3 font-tech text-[11px]">
                {/* Stamina HP */}
                <div>
                  <div className="flex justify-between text-[#8A9EB2]">
                    <span>HP (STAMINA):</span>
                    <span className="text-[#38D9C4] font-bold">{ath.staminaHp}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#070B0E] border border-[#1E2D3B]">
                    <div className="h-full bg-[#38D9C4]" style={{ width: `${ath.staminaHp}%` }} />
                  </div>
                </div>

                {/* VDOT Power MP */}
                <div>
                  <div className="flex justify-between text-[#8A9EB2]">
                    <span>MP (POWER / VDOT):</span>
                    <span className="text-[#C9973E] font-bold">{ath.vdot} VDOT</span>
                  </div>
                  <div className="w-full h-2 bg-[#070B0E] border border-[#1E2D3B]">
                    <div className="h-full bg-[#C9973E]" style={{ width: `${Math.min(100, (ath.vdot / 75) * 100)}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-tech text-[#8A9EB2] pt-2 border-t border-[#1E2D3B]">
                <span>VO2 Max: <strong className="text-[#E0E8F0]">{ath.vo2Max}</strong></span>
                <span>ACWR: <strong style={{ color: athAcwr.color }}>{athAcwr.ratio}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Athlete Detailed Character Sheet */}
      {activeAthlete && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Stats Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="pixel-panel p-5">
              <div className="flex justify-between items-center border-b border-[#2A3A4A] pb-3 mb-4">
                <div>
                  <span className="font-silkscreen text-xs text-[#38D9C4]">SELECTED ATHLETE CHARACTER SHEET</span>
                  <h3 className="font-pixel text-lg text-[#EBBF68] mt-1">{activeAthlete.name}</h3>
                  <span className="font-tech text-xs text-[#8A9EB2]">{activeAthlete.title} • Primary: {activeAthlete.primaryDistance}</span>
                </div>

                <div className="text-right">
                  <span className="font-pixel text-xs text-[#38D9C4] block">VDOT: {activeAthlete.vdot}</span>
                  <span className="font-tech text-xs text-[#E0E8F0]">VO2 Max: {activeAthlete.vo2Max} ml/kg/min</span>
                </div>
              </div>

              {/* Physiological Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-tech text-xs mb-4">
                <div className="bg-[#0B1015] p-2.5 border border-[#1E2D3B]">
                  <span className="text-[#8A9EB2] block text-[10px]">AVG CADENCE:</span>
                  <strong className="text-[#38D9C4] text-sm">{activeAthlete.avgCadence} BPM</strong>
                </div>

                <div className="bg-[#0B1015] p-2.5 border border-[#1E2D3B]">
                  <span className="text-[#8A9EB2] block text-[10px]">MAX HEART RATE:</span>
                  <strong className="text-[#E2654B] text-sm">{activeAthlete.maxHr} BPM</strong>
                </div>

                <div className="bg-[#0B1015] p-2.5 border border-[#1E2D3B]">
                  <span className="text-[#8A9EB2] block text-[10px]">RESTING HR:</span>
                  <strong className="text-[#38D9C4] text-sm">{activeAthlete.restingHr} BPM</strong>
                </div>

                <div className="bg-[#0B1015] p-2.5 border border-[#1E2D3B]">
                  <span className="text-[#8A9EB2] block text-[10px]">LEVEL EXP:</span>
                  <strong className="text-[#EBBF68] text-sm">{activeAthlete.exp} / {activeAthlete.maxExp}</strong>
                </div>
              </div>

              {/* Personal Bests Table */}
              <div className="mb-4">
                <h4 className="font-silkscreen text-xs text-[#C9973E] mb-2">🏆 PERSONAL BEST RECORDS (PB)</h4>
                <div className="bg-[#0B1015] border border-[#1E2D3B] font-tech text-xs divide-y divide-[#16222F]">
                  {activeAthlete.pbs.map((pb, idx) => (
                    <div key={idx} className="p-2 flex justify-between items-center">
                      <span className="text-[#E0E8F0] font-bold">{pb.distance}</span>
                      <span className="text-[#38D9C4]">{pb.time}</span>
                      <span className="text-[#8A9EB2] text-[10px]">VDOT ~{pb.vdotEst}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACWR Workload Fatigue Box */}
              <div className="p-4 bg-[#121A22] border-2 border-[#2A3E52]">
                <h4 className="font-silkscreen text-xs text-[#38D9C4] mb-2 flex justify-between items-center">
                  <span>⚖️ ACUTE : CHRONIC WORKLOAD RATIO (ACWR)</span>
                  <span className="font-tech text-sm font-bold" style={{ color: acwrData.color }}>
                    {acwrData.ratio} ({acwrData.status})
                  </span>
                </h4>

                <div className="grid grid-cols-2 gap-3 font-tech text-xs mb-3">
                  <div className="bg-[#0B1015] p-2 border border-[#1E2D3B]">
                    <span className="text-[#8A9EB2] block">ACUTE LOAD (LAST 7 DAYS):</span>
                    <strong className="text-[#EBBF68]">{activeAthlete.acute7dKm} KM</strong>
                  </div>

                  <div className="bg-[#0B1015] p-2 border border-[#1E2D3B]">
                    <span className="text-[#8A9EB2] block">CHRONIC LOAD (28D AVG/WK):</span>
                    <strong className="text-[#38D9C4]">{Math.round(activeAthlete.chronic28dKm / 4)} KM/WK</strong>
                  </div>
                </div>

                <p className="font-tech text-xs italic text-[#A0B0C0] bg-[#070B0E] p-2 border border-[#1E2D3B]">
                  "{acwrData.description}"
                </p>
              </div>
            </div>
          </div>

          {/* Pacing Zones Matrix Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="pixel-panel p-4">
              <h3 className="font-silkscreen text-sm text-[#C9973E] mb-3 border-b border-[#2A3A4A] pb-2">
                ⏱️ TRANSMUTED PACING ZONES (VDOT {activeAthlete.vdot})
              </h3>

              <div className="space-y-2.5">
                {pacingZones.map((pz, idx) => (
                  <div key={idx} className="bg-[#0B1015] p-3 border-2 border-[#1E2D3B]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-silkscreen text-xs" style={{ color: pz.color }}>
                        {pz.zone}: {pz.name}
                      </span>
                      <span className="font-tech text-xs font-bold text-[#E0E8F0] bg-[#16222F] px-2 py-0.5 border border-[#2A3A4A]">
                        {pz.paceRange}
                      </span>
                    </div>

                    <div className="flex justify-between font-tech text-[11px] text-[#8A9EB2] mt-1">
                      <span>HR: {pz.hrRangePct}</span>
                      <span className="italic">{pz.alchemicalAlias}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Athlete Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="pixel-dialogue p-6 max-w-lg w-full">
            <h3 className="font-pixel text-base text-[#C9973E] mb-4 flex justify-between items-center">
              <span>🛡️ RECRUIT ATHLETE ALCHEMIST</span>
              <button
                onClick={() => setShowAddModal(false)}
                className="pixel-btn text-xs px-2 py-1"
              >
                ✕
              </button>
            </h3>

            <form onSubmit={handleCreateAthlete} className="space-y-4 font-tech text-xs">
              <div>
                <label className="text-[#8A9EB2] block mb-1">ATHLETE NAME:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kai 'Flame-Legs' Tanaka"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="pixel-input w-full"
                />
              </div>

              <div>
                <label className="text-[#8A9EB2] block mb-1">ALCHEMICAL TITLE:</label>
                <input
                  type="text"
                  placeholder="e.g. 800m Speed Sprinter"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="pixel-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8A9EB2] block mb-1">EST. VDOT SCORE:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVdot}
                    onChange={(e) => setNewVdot(e.target.value)}
                    className="pixel-input w-full"
                  />
                </div>

                <div>
                  <label className="text-[#8A9EB2] block mb-1">VO2 MAX (ML/KG/MIN):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVo2Max}
                    onChange={(e) => setNewVo2Max(e.target.value)}
                    className="pixel-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8A9EB2] block mb-1">7-DAY ACUTE KM:</label>
                  <input
                    type="number"
                    value={newAcuteKm}
                    onChange={(e) => setNewAcuteKm(e.target.value)}
                    className="pixel-input w-full"
                  />
                </div>

                <div>
                  <label className="text-[#8A9EB2] block mb-1">28-DAY CHRONIC KM:</label>
                  <input
                    type="number"
                    value={newChronicKm}
                    onChange={(e) => setNewChronicKm(e.target.value)}
                    className="pixel-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8A9EB2] block mb-1">PRIMARY DISTANCE:</label>
                <select
                  value={newPrimaryDist}
                  onChange={(e) => setNewPrimaryDist(e.target.value)}
                  className="pixel-input w-full"
                >
                  <option value="5K / 10K">5K / 10K</option>
                  <option value="Half Marathon">Half Marathon</option>
                  <option value="Marathon">Marathon</option>
                  <option value="50K Trail">50K Trail</option>
                  <option value="800m / 1500m">800m / 1500m</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="pixel-btn text-xs px-4 py-2"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="pixel-btn pixel-btn-amber text-xs px-4 py-2"
                >
                  CONFIRM RECRUITMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
