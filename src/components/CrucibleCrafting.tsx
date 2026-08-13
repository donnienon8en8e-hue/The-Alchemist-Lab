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
    easy_dust: 0,
    tempo_potion: 0,
    interval_elixir: 0,
    long_run_tonic: 0,
    cadence_crystal: 0,
    recovery_dew: 0,
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

  const handleDirectQuantitySet = (id: string, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setQuantities((prev) => ({ ...prev, [id]: num }));
  };

  // Calculate live alchemical metrics
  let totalStressTSS = 0;
  let predictedVo2MaxBoost = 0;
  let recoveryHoursNeeded = 0;
  let rawDistanceKm = 0;
  let rawDurationMins = 0;

  const totalItemsCount: number = Object.values(quantities).reduce<number>(
    (sum, val) => sum + (typeof val === 'number' ? val : 0),
    0
  );

  INITIAL_INGREDIENTS.forEach((ing) => {
    const qty = quantities[ing.id] || 0;
    if (qty > 0) {
      totalStressTSS += Math.round(ing.baseStress * qty * 3.5);
      predictedVo2MaxBoost += ing.baseVo2Gain * qty * 0.05;
      recoveryHoursNeeded += ing.baseRecoveryHours * qty * 1.2;

      if (ing.id === 'easy_dust') {
        rawDistanceKm += qty;
      } else if (ing.id === 'tempo_potion') {
        rawDurationMins += qty;
        rawDistanceKm += qty * 0.22;
      } else if (ing.id === 'interval_elixir') {
        rawDurationMins += qty * 3;
        rawDistanceKm += qty * 0.8;
      } else if (ing.id === 'long_run_tonic') {
        rawDistanceKm += qty;
      } else if (ing.id === 'cadence_crystal') {
        rawDurationMins += qty * 2;
      } else if (ing.id === 'recovery_dew') {
        recoveryHoursNeeded = Math.max(0, recoveryHoursNeeded - qty * 24);
      }
    }
  });

  // Base warm-up & cool-down distance (only if active ingredients selected)
  let estimatedDistanceKm = 0;
  let estimatedDurationMins = 0;
  if (totalItemsCount > 0) {
    estimatedDistanceKm = Math.round((rawDistanceKm + 3) * 10) / 10;
    estimatedDurationMins = Math.round(rawDurationMins + estimatedDistanceKm * 5);
    recoveryHoursNeeded = Math.max(8, Math.round(recoveryHoursNeeded));
  } else {
    estimatedDistanceKm = 0;
    estimatedDurationMins = 0;
    recoveryHoursNeeded = 0;
  }

  totalStressTSS = Math.max(0, Math.round(totalStressTSS));
  predictedVo2MaxBoost = Math.round(predictedVo2MaxBoost * 100) / 100;

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
  if ((quantities.interval_elixir || 0) > 0) targetPaceZone = pacingZones[3]; // Interval
  else if ((quantities.tempo_potion || 0) > 0) targetPaceZone = pacingZones[2]; // Threshold
  else if ((quantities.long_run_tonic || 0) > 0) targetPaceZone = pacingZones[1]; // Marathon

  const handleTransmute = () => {
    setIsBrewing(true);
    playBrewBubblingSound();

    setTimeout(() => {
      playTransmutationSuccessSound();
      setIsBrewing(false);

      const title = customTitle.trim() || `${elixirRank} ${targetPaceZone.alchemicalAlias.replace(/[^a-zA-Z0-9 ]/g, '')} Plan`;

      // Build ingredient summary list
      const ingredientSummary = INITIAL_INGREDIENTS.filter((ing) => (quantities[ing.id] || 0) > 0).map((ing) => ({
        name: ing.name,
        quantity: quantities[ing.id],
        unit: ing.unit,
      }));

      const instructionsList: string[] = [
        `Warm-up: 2.5 KM Easy Pace (${pacingZones[0].paceRange}) + Dynamic Stretching`,
      ];

      if (quantities.tempo_potion > 0) {
        instructionsList.push(
          `Tempo Block: ${quantities.tempo_potion} MIN TEMPO POTION @ ${pacingZones[2].paceRange} (${pacingZones[2].hrRangePct})`
        );
      }
      if (quantities.interval_elixir > 0) {
        instructionsList.push(
          `Interval Block: ${quantities.interval_elixir} REPS INTERVAL ELIXIR @ ${pacingZones[3].paceRange} with 400M recovery jog`
        );
      }
      if (quantities.long_run_tonic > 0) {
        instructionsList.push(
          `Long Run Block: ${quantities.long_run_tonic} KM LONG RUN TONIC @ ${pacingZones[1].paceRange}`
        );
      }
      if (quantities.cadence_crystal > 0) {
        instructionsList.push(`Cadence Drills: ${quantities.cadence_crystal} SETS CADENCE CRYSTAL 180+ BPM`);
      }
      if (quantities.recovery_dew > 0) {
        instructionsList.push(`Rest & Recovery: ${quantities.recovery_dew} DAYS RECOVERY DEW (Rest & Active Recovery)`);
      }

      instructionsList.push(`Cool-down: 1.5 KM Easy Jog`);

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
              <button
                onClick={() => {
                  playButtonClickSound();
                  setQuantities({
                    easy_dust: 0,
                    tempo_potion: 0,
                    interval_elixir: 0,
                    long_run_tonic: 0,
                    cadence_crystal: 0,
                    recovery_dew: 0,
                  });
                }}
                className="pixel-btn text-[10px] px-2.5 py-0.5 text-[#E2654B] border-[#E2654B]/40 hover:bg-[#E2654B]/20 font-silkscreen"
                title="Reset all quantities to 0"
              >
                RESET
              </button>
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
                    <div className="flex justify-between items-start gap-2 flex-wrap sm:flex-nowrap">
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

                      {/* Quantity Controller with Step & Direct Input */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(ing.id, -1)}
                          disabled={qty === 0}
                          className="pixel-btn text-xs px-2 py-0.5 disabled:opacity-30"
                          title="Decrease by 1"
                        >
                          -
                        </button>
                        <div className="flex items-center bg-[#070B0E] border border-[#1E2D3B] px-1 py-0.5">
                          <input
                            type="number"
                            min="0"
                            max="999"
                            value={qty}
                            onChange={(e) => handleDirectQuantitySet(ing.id, e.target.value)}
                            className="font-tech text-sm font-bold text-[#38D9C4] w-10 text-center bg-transparent focus:outline-none"
                          />
                          <span className="text-[10px] text-[#8A9EB2] font-silkscreen pr-1">{ing.unit.slice(0, 3)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(ing.id, 1)}
                          className="pixel-btn pixel-btn-amber text-xs px-2 py-0.5"
                          title="Increase by 1"
                        >
                          +
                        </button>
                        {/* Quick +5 shortcut for fast dosing */}
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(ing.id, 5)}
                          className="pixel-btn text-[10px] px-1.5 py-0.5 text-[#38D9C4] hover:border-[#38D9C4]"
                          title="Add 5 units"
                        >
                          +5
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playButtonClickSound();
                    setQuantities({
                      easy_dust: 0,
                      tempo_potion: 0,
                      interval_elixir: 0,
                      long_run_tonic: 0,
                      cadence_crystal: 0,
                      recovery_dew: 0,
                    });
                    setCustomTitle('');
                  }}
                  className="pixel-btn text-[10px] px-2 py-0.5 text-[#E2654B] border-[#E2654B]/40 hover:bg-[#E2654B]/20 font-silkscreen"
                  title="Reset all formula reagents"
                >
                  RESET
                </button>
                <span className={`text-xs font-pixel px-2 py-0.5 border border-[#070B0E] ${
                  elixirRank === 'Forbidden' ? 'bg-[#E2654B] text-[#0E151B]' :
                  elixirRank === 'Legendary' ? 'bg-[#C9973E] text-[#0E151B]' :
                  elixirRank === 'Epic' ? 'bg-[#38D9C4] text-[#0E151B]' : 'bg-[#243545] text-[#E0E8F0]'
                }`}>
                  RANK: {elixirRank}
                </span>
              </div>
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

            {/* Status Risk Gauge Bar */}
            <div className="bg-[#0B1015] p-3 border border-[#3D2D15] mb-3">
              <div className="flex justify-between items-center text-xs font-pixel mb-1.5">
                <span className={elixirRank === 'Forbidden' ? 'text-[#E2654B]' : elixirRank === 'Epic' || elixirRank === 'Legendary' ? 'text-[#EAB308]' : 'text-[#22C55E]'}>
                  STATUS RISK: {elixirRank === 'Forbidden' ? '🔴 [ OVERHEAT / HAZARDOUS ]' : elixirRank === 'Epic' || elixirRank === 'Legendary' ? '🟡 [ VOLATILE / CAUTION ]' : '🟢 [ SAFE / OPTIMAL ]'}
                </span>
                <span className="text-[#8A9EB2] text-[10px]">{Math.min(100, Math.round((totalStressTSS / 150) * 100))}% STRAIN</span>
              </div>
              <div className="pixel-bar-bg h-3.5 border border-[#1E2D3B] p-0.5">
                <div
                  className={`h-full transition-all duration-300 ${
                    elixirRank === 'Forbidden' ? 'bg-[#E2654B]' : elixirRank === 'Epic' || elixirRank === 'Legendary' ? 'bg-[#EAB308]' : 'bg-[#22C55E]'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((totalStressTSS / 150) * 100))}%` }}
                />
              </div>
            </div>

            {/* Physiological Readouts */}
            <div className="space-y-2 font-tech text-xs bg-[#0B1015] p-3 border border-[#3D2D15] divide-y divide-[#1E2D3B]">
              <div className="flex justify-between py-1">
                <span className="text-[#8A9EB2]">📏 Total Distance:</span>
                <strong className="text-[#38D9C4] text-sm">{estimatedDistanceKm} KM</strong>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-[#8A9EB2]">⏱️ Estimated Duration:</span>
                <strong className="text-[#EBBF68] text-sm">{estimatedDurationMins} Mins</strong>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-[#8A9EB2]">🔥 Training Stress Score (TSS):</span>
                <strong className={elixirRank === 'Forbidden' ? 'text-[#E2654B] text-sm font-bold' : 'text-[#38D9C4] text-sm font-bold'}>
                  {totalStressTSS} Points
                </strong>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-[#8A9EB2]">⚡ VO2 Max Adaptation Gain:</span>
                <strong className="text-[#38D9C4] text-sm">+{predictedVo2MaxBoost}%</strong>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-[#8A9EB2]">⏳ Recovery Required (Hours):</span>
                <strong className="text-[#EBBF68] text-sm">{recoveryHoursNeeded} Hours</strong>
              </div>

              <div className="pt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-[#8A9EB2]">⚠️ Injury Risk Level (ACWR):</span>
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
                WORKOUT PLAN TITLE (OPTIONAL):
              </label>
              <input
                type="text"
                placeholder="e.g. Easy + Tempo Mini Marathon Plan"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="pixel-input w-full text-xs"
              />
            </div>

            {/* Transmute Action Button */}
            <button
              onClick={handleTransmute}
              disabled={isBrewing || totalItemsCount === 0}
              className="pixel-btn pixel-btn-amber w-full mt-4 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-40 font-silkscreen transition-all"
            >
              <PixelFlameIcon size={20} color="#0E151B" />
              <span>{totalItemsCount === 0 ? '⚠️ SELECT REAGENTS TO FORGE' : '🧪 FORGE WORKOUT PLAN NOW!'}</span>
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playButtonClickSound();
                  setQuantities({
                    easy_dust: 0,
                    tempo_potion: 0,
                    interval_elixir: 0,
                    long_run_tonic: 0,
                    cadence_crystal: 0,
                    recovery_dew: 0,
                  });
                  setCustomTitle('');
                  setLatestElixir(null);
                }}
                className="pixel-btn text-[10px] px-2.5 py-1 text-[#E2654B] border-[#E2654B]/40 hover:bg-[#E2654B]/20 font-silkscreen"
                title="Reset crucible reagents and close result"
              >
                RESET
              </button>
              <button
                onClick={() => {
                  playButtonClickSound();
                  setLatestElixir(null);
                }}
                className="pixel-btn text-xs px-2 py-1"
                title="Close modal"
              >
                ✕ CLOSE
              </button>
            </div>
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

          <div className="bg-[#0B1015] p-3 border border-[#2A3A4A] space-y-2 mb-4">
            <span className="font-silkscreen text-xs text-[#C9973E] block">📜 TRANSMUTATION RUN INSTRUCTIONS:</span>
            <ol className="list-decimal list-inside font-tech text-xs text-[#E0E8F0] space-y-1">
              {latestElixir.instructions.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-[#2A3A4A]">
            <button
              type="button"
              onClick={() => {
                playButtonClickSound();
                setQuantities({
                  easy_dust: 0,
                  tempo_potion: 0,
                  interval_elixir: 0,
                  long_run_tonic: 0,
                  cadence_crystal: 0,
                  recovery_dew: 0,
                });
                setCustomTitle('');
                setLatestElixir(null);
              }}
              className="pixel-btn text-xs px-3 py-2 text-[#E2654B] border-[#E2654B]/40 hover:bg-[#E2654B]/20 font-silkscreen flex items-center justify-center gap-1.5"
            >
              <span>🔄</span>
              <span>RESET CRUCIBLE & CRAFT NEW</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playButtonClickSound();
                setLatestElixir(null);
              }}
              className="pixel-btn pixel-btn-amber text-xs px-3 py-2 font-silkscreen flex items-center justify-center gap-1.5"
            >
              <span>✓</span>
              <span>KEEP FORMULA & CLOSE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
