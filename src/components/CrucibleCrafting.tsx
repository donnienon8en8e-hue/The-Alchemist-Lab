import React, { useState } from 'react';
import { Athlete, Ingredient, BrewedWorkout } from '../types';
import { INITIAL_INGREDIENTS } from '../data/initialData';
import { getPacingZonesFromVDOT, calculateACWR } from '../utils/sportsScience';
import { playBrewBubblingSound, playTransmutationSuccessSound, playButtonClickSound } from '../utils/audioSynth';
import { PixelFlaskIcon, PixelVialIcon, PixelFlameIcon, PixelHourglassIcon, PixelCompassIcon, PixelPlusIcon } from './PixelIcons';

interface CrucibleCraftingProps {
  athletes: Athlete[];
  selectedAthleteId: string;
  onSelectAthlete: (id: string) => void;
  onSaveBrewedWorkout: (workout: BrewedWorkout) => void;
}

export const CrucibleCrafting: React.FC<CrucibleCraftingProps> = ({
  athletes,
  selectedAthleteId,
  onSelectAthlete,
  onSaveBrewedWorkout,
}) => {
  const athlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];
  const pacingZones = getPacingZonesFromVDOT(athlete ? athlete.vdot : 50);

  // Ingredient quantities map
  const [quantities, setQuantities] = useState<Record<string, number>>({
    aerobic_base: 5, // 5 km
    lactate_buffer: 15, // 15 mins
    phoenix_surge: 0,
    glycogen_surge: 0,
    cadence_crystal: 4,
    moonlight_dew: 0,
  });

  const [customTitle, setCustomTitle] = useState('');
  const [isBrewing, setIsBrewing] = useState(false);
  const [latestElixir, setLatestElixir] = useState<BrewedWorkout | null>(null);

  const handleQuantityChange = (id: string, delta: number) => {
    playButtonClickSound();
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [id]: updated };
    });
  };

  // Calculate live alchemical metrics
  let totalStressTSS = 0;
  let predictedVo2MaxBoost = 0;
  let recoveryHoursNeeded = 8;
  let estimatedDistanceKm = 0;
  let estimatedDurationMins = 0;

  INITIAL_INGREDIENTS.forEach((ing) => {
    const qty = quantities[ing.id] || 0;
    if (qty > 0) {
      totalStressTSS += Math.round(ing.baseStress * qty * 3.5);
      predictedVo2MaxBoost += ing.baseVo2Gain * qty * 0.05;
      recoveryHoursNeeded += ing.baseRecoveryHours * qty * 1.2;

      if (ing.type === 'aerobic') estimatedDistanceKm += qty;
      if (ing.type === 'threshold') {
        estimatedDurationMins += qty;
        estimatedDistanceKm += qty * 0.22;
      }
      if (ing.type === 'speed') {
        estimatedDurationMins += qty * 3;
        estimatedDistanceKm += qty * 0.8;
      }
      if (ing.type === 'recovery') {
        recoveryHoursNeeded = Math.max(4, recoveryHoursNeeded - qty * 3);
      }
    }
  });

  // Base warm-up & cool-down distance
  estimatedDistanceKm = Math.round((estimatedDistanceKm + 3) * 10) / 10;
  estimatedDurationMins = Math.round(estimatedDurationMins + estimatedDistanceKm * 5);
  totalStressTSS = Math.max(15, Math.round(totalStressTSS));
  predictedVo2MaxBoost = Math.round(predictedVo2MaxBoost * 100) / 100;
  recoveryHoursNeeded = Math.max(6, Math.round(recoveryHoursNeeded));

  // Determine Elixir Rank
  let elixirRank: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Forbidden' = 'Common';
  if (totalStressTSS > 120) elixirRank = 'Forbidden';
  else if (totalStressTSS > 90) elixirRank = 'Legendary';
  else if (totalStressTSS > 60) elixirRank = 'Epic';
  else if (totalStressTSS > 35) elixirRank = 'Rare';

  // ACWR impact check
  const new7dKm = athlete.acute7dKm + estimatedDistanceKm;
  const acwrAssessment = calculateACWR(new7dKm, athlete.chronic28dKm);

  // Primary Target Pace Zone determination
  let targetPaceZone = pacingZones[0]; // Easy default
  if (quantities.phoenix_surge > 0) targetPaceZone = pacingZones[3]; // Interval
  else if (quantities.lactate_buffer > 0) targetPaceZone = pacingZones[2]; // Threshold
  else if (quantities.glycogen_surge > 0) targetPaceZone = pacingZones[1]; // Marathon

  const handleTransmute = () => {
    setIsBrewing(true);
    playBrewBubblingSound();

    setTimeout(() => {
      playTransmutationSuccessSound();
      setIsBrewing(false);

      const title = customTitle.trim() || `${elixirRank} ${targetPaceZone.alchemicalAlias.replace(/[^a-zA-Z0-9 ]/g, '')} Elixir`;

      // Build ingredient summary list
      const ingredientSummary = INITIAL_INGREDIENTS.filter((ing) => (quantities[ing.id] || 0) > 0).map((ing) => ({
        name: ing.name,
        quantity: quantities[ing.id],
        unit: ing.unit,
      }));

      const instructionsList: string[] = [
        `Warm-up: 2.5 km Mithril Aerobic Pace (${pacingZones[0].paceRange}) + dynamic strides`,
      ];

      if (quantities.lactate_buffer > 0) {
        instructionsList.push(
          `Main Crucible: ${quantities.lactate_buffer} mins Lactate Threshold Tempo @ ${pacingZones[2].paceRange} (${pacingZones[2].hrRangePct})`
        );
      }
      if (quantities.phoenix_surge > 0) {
        instructionsList.push(
          `Speed Surge: ${quantities.phoenix_surge} x 800m Phoenix Reps @ ${pacingZones[3].paceRange} with 400m recovery jog`
        );
      }
      if (quantities.glycogen_surge > 0) {
        instructionsList.push(
          `Glycogen Block: ${quantities.glycogen_surge} km Dragon Marathon Rhythm @ ${pacingZones[1].paceRange}`
        );
      }
      if (quantities.cadence_crystal > 0) {
        instructionsList.push(`Biomechanics: ${quantities.cadence_crystal} x 20-sec high-cadence 180 BPM strides`);
      }

      instructionsList.push(`Cool-down: 1.5 km Moonlight Dew Recovery Flush Pace`);

      const newBrew: BrewedWorkout = {
        id: `brew_${Date.now()}`,
        title,
        elixirRank,
        athleteId: athlete.id,
        athleteName: athlete.name,
        craftedAt: new Date().toISOString().split('T')[0],
        ingredients: ingredientSummary,
        targetPace: targetPaceZone.paceRange,
        targetHrZone: targetPaceZone.hrRangePct,
        totalDistanceKm: estimatedDistanceKm,
        totalDurationMinutes: estimatedDurationMins,
        stressTSS: totalStressTSS,
        predictedVo2MaxBoost,
        recoveryHoursNeeded,
        injuryRiskLevel: acwrAssessment.ratio > 1.5 ? 'Hazardous' : acwrAssessment.ratio > 1.3 ? 'Caution' : 'Optimal',
        instructions: instructionsList,
      };

      setLatestElixir(newBrew);
      onSaveBrewedWorkout(newBrew);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Athlete Selector */}
      <div className="pixel-panel p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#16222F]">
        <div>
          <span className="font-silkscreen text-xs text-[#C9973E] uppercase tracking-wider">
            SECTION I: THE TRANSMUTATION FORGE
          </span>
          <h2 className="font-pixel text-lg text-[#E0E8F0] mt-1 flex items-center gap-2">
            <PixelFlaskIcon size={24} color="#38D9C4" />
            WORKOUT ALCHEMY FORGE
          </h2>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="font-silkscreen text-xs text-[#8A9EB2] whitespace-nowrap">TARGET ATHLETE:</label>
          <select
            value={selectedAthleteId}
            onChange={(e) => onSelectAthlete(e.target.value)}
            className="pixel-input text-sm text-[#38D9C4] font-tech flex-1 md:w-64"
          >
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} (VDOT: {a.vdot} / Level {a.level})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Left = Ingredient Workbench, Right = Live Alchemical Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ingredient Reagents (8 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="pixel-panel p-4">
            <h3 className="font-silkscreen text-sm text-[#C9973E] mb-3 border-b border-[#2A3A4A] pb-2 flex justify-between items-center">
              <span>🧪 REAGENT INVENTORY & DOSAGE</span>
              <span className="text-xs text-[#8A9EB2] font-tech">SELECT QUANTITIES</span>
            </h3>

            <div className="space-y-3">
              {INITIAL_INGREDIENTS.map((ing) => {
                const qty = quantities[ing.id] || 0;
                return (
                  <div
                    key={ing.id}
                    className={`p-3 border-2 transition-colors ${
                      qty > 0 
                        ? 'bg-[#1A2633] border-[#38D9C4]' 
                        : 'bg-[#101923] border-[#1E2D3B]'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        {ing.iconName === 'flask' && <PixelFlaskIcon color={ing.color} />}
                        {ing.iconName === 'vial' && <PixelVialIcon color={ing.color} />}
                        {ing.iconName === 'flame' && <PixelFlameIcon color={ing.color} />}
                        {ing.iconName === 'hourglass' && <PixelHourglassIcon color={ing.color} />}
                        {ing.iconName === 'compass' && <PixelCompassIcon color={ing.color} />}
                        {ing.iconName === 'potion' && <PixelVialIcon color={ing.color} />}

                        <div>
                          <h4 className="font-silkscreen text-xs text-[#E0E8F0]">{ing.name}</h4>
                          <span className="text-[10px] font-tech text-[#8A9EB2]">{ing.physiologicalEffect}</span>
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(ing.id, -1)}
                          disabled={qty === 0}
                          className="pixel-btn text-xs px-2 py-0.5 disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="font-tech text-sm font-bold text-[#38D9C4] w-12 text-center bg-[#070B0E] py-0.5 border border-[#1E2D3B]">
                          {qty} <span className="text-[10px] text-[#8A9EB2]">{ing.unit.slice(0, 3)}</span>
                        </span>
                        <button
                          onClick={() => handleQuantityChange(ing.id, 1)}
                          className="pixel-btn pixel-btn-amber text-xs px-2 py-0.5"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#A0B0C0] font-tech mt-2 italic bg-[#0B1015] p-1.5 border border-[#16222F]">
                      "{ing.description}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Alchemical Meter & Transmutation Cauldron (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="pixel-panel-amber p-4 relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-[#3D2D15] pb-2 mb-3">
              <h3 className="font-silkscreen text-sm text-[#C9973E] flex items-center gap-2">
                <PixelFlameIcon size={18} color="#C9973E" />
                CRUCIBLE PREVIEW
              </h3>
              <span className={`text-xs font-pixel px-2 py-0.5 border border-[#070B0E] ${
                elixirRank === 'Forbidden' ? 'bg-[#E2654B] text-[#0E151B]' :
                elixirRank === 'Legendary' ? 'bg-[#C9973E] text-[#0E151B]' :
                elixirRank === 'Epic' ? 'bg-[#38D9C4] text-[#0E151B]' : 'bg-[#243545] text-[#E0E8F0]'
              }`}>
                RANK: {elixirRank}
              </span>
            </div>

            {/* Cauldron Animation Box */}
            <div className="bg-[#0B1015] border-2 border-[#3D2D15] p-4 text-center my-3 relative dither-bg min-h-[140px] flex flex-col items-center justify-center">
              <div className={`transition-transform duration-300 ${isBrewing ? 'animate-bounce scale-110' : ''}`}>
                <PixelFlaskIcon size={56} color={isBrewing ? '#E2654B' : targetPaceZone.color} />
              </div>

              {isBrewing ? (
                <div className="mt-2 text-xs font-pixel text-[#E2654B] animate-pulse">
                  TRANSMUTING PHYSIOLOGICAL FORMULA...
                </div>
              ) : (
                <div className="mt-2 text-xs font-silkscreen text-[#38D9C4]">
                  PREDICTED TARGET: <span className="text-[#EBBF68] font-tech">{targetPaceZone.alchemicalAlias}</span>
                </div>
              )}
            </div>

            {/* Physiological Readouts */}
            <div className="space-y-2 font-tech text-xs">
              <div className="flex justify-between bg-[#121A22] p-2 border border-[#263646]">
                <span className="text-[#8A9EB2]">ESTIMATED DISTANCE:</span>
                <span className="text-[#38D9C4] font-bold">{estimatedDistanceKm} KM</span>
              </div>

              <div className="flex justify-between bg-[#121A22] p-2 border border-[#263646]">
                <span className="text-[#8A9EB2]">ESTIMATED DURATION:</span>
                <span className="text-[#38D9C4] font-bold">{estimatedDurationMins} MINS</span>
              </div>

              <div className="flex justify-between bg-[#121A22] p-2 border border-[#263646]">
                <span className="text-[#8A9EB2]">TRAINING STRESS (TSS):</span>
                <span className="text-[#EBBF68] font-bold">{totalStressTSS} POINTS</span>
              </div>

              <div className="flex justify-between bg-[#121A22] p-2 border border-[#263646]">
                <span className="text-[#8A9EB2]">EST. VO2 MAX ADAPTATION:</span>
                <span className="text-[#38D9C4] font-bold">+{predictedVo2MaxBoost}%</span>
              </div>

              <div className="flex justify-between bg-[#121A22] p-2 border border-[#263646]">
                <span className="text-[#8A9EB2]">RECOVERY TIME NEEDED:</span>
                <span className="text-[#E2654B] font-bold">{recoveryHoursNeeded} HOURS</span>
              </div>

              <div className="p-2 bg-[#121A22] border border-[#263646]">
                <div className="flex justify-between mb-1">
                  <span className="text-[#8A9EB2]">ACWR FATIGUE IMPACT:</span>
                  <span className="font-bold" style={{ color: acwrAssessment.color }}>
                    {acwrAssessment.ratio} ({acwrAssessment.status})
                  </span>
                </div>
                <div className="w-full h-2 bg-[#070B0E] border border-[#1E2D3B]">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (acwrAssessment.ratio / 1.8) * 100)}%`,
                      backgroundColor: acwrAssessment.color 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Custom Elixir Name Input */}
            <div className="mt-4">
              <label className="font-silkscreen text-[11px] text-[#C9973E] block mb-1">
                ELIXIR TITLE (OPTIONAL):
              </label>
              <input
                type="text"
                placeholder="e.g. Phoenix Sub-3 Marathon Elixir"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="pixel-input w-full text-xs"
              />
            </div>

            {/* Transmute Action Button */}
            <button
              onClick={handleTransmute}
              disabled={isBrewing || estimatedDistanceKm <= 3}
              className="pixel-btn pixel-btn-amber w-full mt-4 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <PixelFlameIcon size={20} color="#0E151B" />
              <span>{isBrewing ? 'TRANSMUTING...' : 'BREW IN CRUCIBLE'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Crafted Elixir Result Dialogue Modal / Card */}
      {latestElixir && (
        <div className="pixel-dialogue p-5 my-6 animate-fade-in relative">
          <div className="flex justify-between items-start gap-4 border-b-2 border-[#C9973E] pb-3 mb-4">
            <div>
              <span className="text-xs font-pixel text-[#38D9C4]">✨ TRANSMUTATION COMPLETED!</span>
              <h3 className="font-pixel text-lg text-[#EBBF68] mt-1">{latestElixir.title}</h3>
              <p className="font-tech text-xs text-[#8A9EB2]">
                Crafted for: <strong className="text-[#E0E8F0]">{latestElixir.athleteName}</strong> on {latestElixir.craftedAt}
              </p>
            </div>

            <button
              onClick={() => setLatestElixir(null)}
              className="pixel-btn text-xs px-2 py-1"
            >
              ✕ CLOSE
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-tech text-xs mb-4">
            <div className="bg-[#0B1015] p-3 border border-[#2A3A4A]">
              <span className="text-[#8A9EB2] block">TARGET PACING:</span>
              <strong className="text-[#38D9C4] text-sm">{latestElixir.targetPace}</strong>
            </div>

            <div className="bg-[#0B1015] p-3 border border-[#2A3A4A]">
              <span className="text-[#8A9EB2] block">TOTAL DISTANCE / TIME:</span>
              <strong className="text-[#EBBF68] text-sm">
                {latestElixir.totalDistanceKm} KM / ~{latestElixir.totalDurationMinutes} MINS
              </strong>
            </div>

            <div className="bg-[#0B1015] p-3 border border-[#2A3A4A]">
              <span className="text-[#8A9EB2] block">TRAINING STRESS & RECOVERY:</span>
              <strong className="text-[#E2654B] text-sm">
                {latestElixir.stressTSS} TSS / {latestElixir.recoveryHoursNeeded}H REST
              </strong>
            </div>
          </div>

          <div className="bg-[#0B1015] p-3 border border-[#2A3A4A] space-y-2">
            <span className="font-silkscreen text-xs text-[#C9973E] block">📜 TRANSMUTATION RUN INSTRUCTIONS:</span>
            <ol className="list-decimal list-inside font-tech text-xs text-[#E0E8F0] space-y-1">
              {latestElixir.instructions.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
