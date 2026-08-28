import React, { useState } from 'react';
import { calculateVDOT, getPacingZonesFromVDOT, predictRaceTime, formatTimeSeconds, calculateACWR } from '../utils/sportsScience';
import { VcrTableMatrix } from './VcrTableMatrix';
import { playButtonClickSound, playTransmutationSuccessSound } from '../utils/audioSynth';
import { PixelBarChartIcon, PixelCompassIcon, PixelFlameIcon, PixelPlusIcon } from './PixelIcons';
import { useAuth } from '../context/AuthContext';

export const FormulaCalculator: React.FC = () => {
  const { user, saveTest, athleteTests, athleteProfile } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'vcr' | 'vdot'>('vdot');
  const [savingTest, setSavingTest] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Calculator 1: VDOT & Pacing Transmuter Defaults
  const DEFAULT_RACE_DIST = 5000;
  const DEFAULT_HOURS = 0;
  const DEFAULT_MINUTES = 20;
  const DEFAULT_SECONDS = 0;

  const [raceDistMeters, setRaceDistMeters] = useState(DEFAULT_RACE_DIST); // 5K
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const [seconds, setSeconds] = useState(DEFAULT_SECONDS);

  const totalRaceSeconds = hours * 3600 + minutes * 60 + seconds;
  const calculatedVdot = calculateVDOT(raceDistMeters, totalRaceSeconds);
  const pacingZones = getPacingZonesFromVDOT(calculatedVdot || 45);

  // Calculator 2: Riegel Race Time Predictor Predictions
  const predictions = [
    { name: '1500m', meters: 1500 },
    { name: '5K', meters: 5000 },
    { name: '10K', meters: 10000 },
    { name: 'Half Marathon', meters: 21097 },
    { name: 'Marathon', meters: 42195 },
  ];

  // Calculator 3: ACWR Workload Fatigue Defaults
  const DEFAULT_ACUTE_7D = 65;
  const DEFAULT_CHRONIC_28D = 220;
  const [acute7d, setAcute7d] = useState(DEFAULT_ACUTE_7D);
  const [chronic28d, setChronic28d] = useState(DEFAULT_CHRONIC_28D);
  const acwrResult = calculateACWR(acute7d, chronic28d);

  // Calculator 4: Heart Rate Karvonen Zones Defaults
  const DEFAULT_MAX_HR = 190;
  const DEFAULT_RESTING_HR = 50;
  const [maxHr, setMaxHr] = useState(DEFAULT_MAX_HR);
  const [restingHr, setRestingHr] = useState(DEFAULT_RESTING_HR);
  const hrr = maxHr - restingHr;

  // Handle Save VDOT Test
  const handleSaveVdotTest = async () => {
    if (!user) {
      alert('Please connect / log in with Google to save tests to your Cloud Athlete profile.');
      return;
    }
    try {
      setSavingTest(true);
      playButtonClickSound();
      const testId = `vdot_${Date.now()}`;
      const testData = {
        id: testId,
        testId,
        testType: 'vdot' as const,
        testName: `VDOT Benchmark (${raceDistMeters >= 1000 ? `${raceDistMeters / 1000}K` : `${raceDistMeters}m`})`,
        testedAt: new Date().toISOString(),
        vdotResult: calculatedVdot,
        metrics: {
          raceDistMeters,
          timeSeconds: totalRaceSeconds,
          timeFormatted: `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`,
          thresholdPace: pacingZones.find((z) => z.zone.includes('Zone 4'))?.paceRange || '',
          vo2MaxPace: pacingZones.find((z) => z.zone.includes('Zone 5'))?.paceRange || '',
        },
      };

      // บันทึกผลทดสอบ: await setDoc(doc(db, "athletes", user.uid, "tests", testId), testData);
      await saveTest(testId, testData);
      playTransmutationSuccessSound();
      setSaveSuccessMsg(`Test saved to athletes/${user.uid}/tests/${testId}!`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (e: any) {
      console.error('Failed to save test:', e);
      alert(`Error saving test to Firestore: ${e.message}`);
    } finally {
      setSavingTest(false);
    }
  };

  // Handle Save ACWR Test
  const handleSaveAcwrTest = async () => {
    if (!user) {
      alert('Please connect / log in with Google to save tests to your Cloud Athlete profile.');
      return;
    }
    try {
      setSavingTest(true);
      playButtonClickSound();
      const testId = `acwr_${Date.now()}`;
      const testData = {
        id: testId,
        testId,
        testType: 'acwr' as const,
        testName: `ACWR Workload Ratio Assessment`,
        testedAt: new Date().toISOString(),
        acwrResult: acwrResult.ratio,
        metrics: {
          acute7dKm: acute7d,
          chronic28dKm: chronic28d,
          status: acwrResult.status,
          risk: acwrResult.description,
        },
      };

      // บันทึกผลทดสอบ: await setDoc(doc(db, "athletes", user.uid, "tests", testId), testData);
      await saveTest(testId, testData);
      playTransmutationSuccessSound();
      setSaveSuccessMsg(`ACWR Assessment saved to athletes/${user.uid}/tests/${testId}!`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (e: any) {
      console.error('Failed to save ACWR test:', e);
      alert(`Error saving test: ${e.message}`);
    } finally {
      setSavingTest(false);
    }
  };

  // Reset Handlers
  const resetVdotCalculator = () => {
    playButtonClickSound();
    setRaceDistMeters(DEFAULT_RACE_DIST);
    setHours(DEFAULT_HOURS);
    setMinutes(DEFAULT_MINUTES);
    setSeconds(DEFAULT_SECONDS);
  };

  const resetAcwrCalculator = () => {
    playButtonClickSound();
    setAcute7d(DEFAULT_ACUTE_7D);
    setChronic28d(DEFAULT_CHRONIC_28D);
  };

  const resetHrCalculator = () => {
    playButtonClickSound();
    setMaxHr(DEFAULT_MAX_HR);
    setRestingHr(DEFAULT_RESTING_HR);
  };

  const resetCalculator = () => {
    playButtonClickSound();
    resetVdotCalculator();
    resetAcwrCalculator();
    resetHrCalculator();
  };

  const hrZones = [
    { zone: 'Zone 1 (Recovery)', pct: '50-60%', bpm: `${Math.round(restingHr + hrr * 0.50)} - ${Math.round(restingHr + hrr * 0.60)} BPM` },
    { zone: 'Zone 2 (Aerobic Base)', pct: '60-70%', bpm: `${Math.round(restingHr + hrr * 0.60)} - ${Math.round(restingHr + hrr * 0.70)} BPM` },
    { zone: 'Zone 3 (Tempo)', pct: '70-80%', bpm: `${Math.round(restingHr + hrr * 0.70)} - ${Math.round(restingHr + hrr * 0.80)} BPM` },
    { zone: 'Zone 4 (Threshold)', pct: '80-90%', bpm: `${Math.round(restingHr + hrr * 0.80)} - ${Math.round(restingHr + hrr * 0.90)} BPM` },
    { zone: 'Zone 5 (VO2 Max)', pct: '90-100%', bpm: `${Math.round(restingHr + hrr * 0.90)} - ${maxHr} BPM` },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="pixel-panel p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="font-silkscreen text-xs text-[#C9973E] uppercase tracking-wider">
            SECTION III: SPORTS SCIENCE CALCULATORS &amp; VCR MATRIX
          </span>
          <h2 className="font-pixel text-lg text-[#E0E8F0] mt-1 flex items-center gap-2">
            <PixelBarChartIcon size={24} color="#E2654B" />
            SPORTS SCIENCE MATRIX &amp; VCR SYSTEM
          </h2>
        </div>

        {/* Sub-tab Navigation Buttons & Global Reset */}
        <div className="flex flex-wrap items-center gap-2 font-tech text-xs">
          <button
            type="button"
            onClick={resetCalculator}
            className="pixel-btn text-xs px-3 py-2 text-[#E2654B] border-[#E2654B]/50 hover:bg-[#E2654B]/20 font-silkscreen flex items-center gap-1.5"
            title="Reset all calculators to standard baseline metrics"
          >
            <span>🔄</span>
            <span>RESET CALCULATOR</span>
          </button>

          <button
            onClick={() => {
              playButtonClickSound();
              setActiveSubTab('vcr');
            }}
            className={`pixel-btn px-4 py-2 flex items-center gap-2 ${
              activeSubTab === 'vcr' ? 'pixel-btn-amber' : ''
            }`}
          >
            <PixelCompassIcon size={16} />
            🇩🇪 VCR TABLE MATRIX (LANGE &amp; PÖHLITZ)
          </button>

          <button
            onClick={() => {
              playButtonClickSound();
              setActiveSubTab('vdot');
            }}
            className={`pixel-btn px-4 py-2 flex items-center gap-2 ${
              activeSubTab === 'vdot' ? 'pixel-btn-teal' : ''
            }`}
          >
            🔮 VDOT &amp; ACWR CALCULATORS
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeSubTab === 'vcr' ? (
        <VcrTableMatrix />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: VDOT & Pacing Transmuter (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* VDOT & Pacing Card */}
            <div className="pixel-panel p-5">
              <h3 className="font-silkscreen text-sm text-[#C9973E] mb-3 border-b border-[#2A3A4A] pb-2 flex justify-between items-center">
                <span>🔮 VDOT SCORE &amp; PACING CALCULATOR</span>
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-xs text-[#38D9C4]">
                    VDOT: {calculatedVdot || '--'}
                  </span>
                  <button
                    type="button"
                    onClick={resetVdotCalculator}
                    className="pixel-btn text-[10px] px-2 py-0.5 text-[#E2654B] border-[#E2654B]/40 hover:bg-[#E2654B]/20 font-silkscreen"
                    title="Reset VDOT & race inputs to default"
                  >
                    RESET
                  </button>
                </div>
              </h3>

              {/* Race Distance & Time Input */}
              <div className="space-y-3 font-tech text-xs mb-4">
                <div>
                  <label className="text-[#8A9EB2] block mb-1">BENCHMARK RACE DISTANCE:</label>
                  <select
                    value={raceDistMeters}
                    onChange={(e) => {
                      playButtonClickSound();
                      setRaceDistMeters(Number(e.target.value));
                    }}
                    className="pixel-input w-full"
                  >
                    <option value={1500}>1500m Track</option>
                    <option value={5000}>5K Road / Track</option>
                    <option value={10000}>10K Road</option>
                    <option value={21097}>Half Marathon (21.1 km)</option>
                    <option value={42195}>Full Marathon (42.2 km)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#8A9EB2] block mb-1">RACE TIME (HOURS : MINUTES : SECONDS):</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-[#8A9EB2]">HOURS</span>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        className="pixel-input w-full text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8A9EB2]">MINUTES</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={minutes}
                        onChange={(e) => setMinutes(Number(e.target.value))}
                        className="pixel-input w-full text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8A9EB2]">SECONDS</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={seconds}
                        onChange={(e) => setSeconds(Number(e.target.value))}
                        className="pixel-input w-full text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculated Pacing Table */}
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-silkscreen text-xs text-[#38D9C4]">⏱️ CALCULATED PACING MATRIX</h4>
                <button
                  type="button"
                  disabled={savingTest}
                  onClick={handleSaveVdotTest}
                  className="pixel-btn text-xs px-3 py-1.5 pixel-btn-teal font-silkscreen flex items-center gap-1.5 shadow-md"
                  title="Save VDOT test results to Firestore: athletes/{uid}/tests/{testId}"
                >
                  <PixelPlusIcon size={14} />
                  <span>{savingTest ? 'SAVING...' : 'SAVE TEST TO FIRESTORE'}</span>
                </button>
              </div>
              <div className="space-y-2 font-tech text-xs">
                {pacingZones.map((pz, idx) => (
                  <div key={idx} className="bg-[#0B1015] p-2.5 border border-[#1E2D3B] flex justify-between items-center">
                    <div>
                      <span className="font-silkscreen block" style={{ color: pz.color }}>
                        {pz.zone} ({pz.name})
                      </span>
                      <span className="text-[10px] text-[#8A9EB2]">{pz.purpose}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-[#38D9C4] text-sm block">{pz.paceRange}</span>
                      <span className="text-[10px] text-[#EBBF68]">{pz.hrRangePct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Riegel Race Time Predictor */}
            <div className="pixel-panel p-5">
              <h3 className="font-silkscreen text-sm text-[#C9973E] mb-3 border-b border-[#2A3A4A] pb-2">
                📜 RIEGEL RACE TIME PREDICTOR MATRIX
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-tech text-xs">
                {predictions.map((p, idx) => {
                  const predictedSec = predictRaceTime(raceDistMeters, totalRaceSeconds, p.meters);
                  const formattedTime = formatTimeSeconds(predictedSec);

                  return (
                    <div key={idx} className="bg-[#0B1015] p-3 border border-[#1E2D3B] text-center">
                      <span className="text-[#8A9EB2] text-[10px] block">{p.name}</span>
                      <strong className="text-[#EBBF68] text-base block mt-1">{formattedTime}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: ACWR & HR Reserve Calculator (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* ACWR Calculator */}
            <div className="pixel-panel p-5">
              <h3 className="font-silkscreen text-sm text-[#C9973E] mb-3 border-b border-[#2A3A4A] pb-2 flex justify-between items-center">
                <span>⚖️ ACWR WORKLOAD RATIO CALCULATOR</span>
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-xs" style={{ color: acwrResult.color }}>
                    {acwrResult.ratio}
                  </span>
                  <button
                    type="button"
                    onClick={resetAcwrCalculator}
                    className="pixel-btn text-[10px] px-2 py-0.5 text-[#E2654B] border-[#E2654B]/40 hover:bg-[#E2654B]/20 font-silkscreen"
                    title="Reset ACWR parameters"
                  >
                    RESET
                  </button>
                </div>
              </h3>

              <div className="space-y-3 font-tech text-xs">
                <div>
                  <label className="text-[#8A9EB2] block mb-1">ACUTE WORKLOAD (LAST 7 DAYS KM):</label>
                  <input
                    type="number"
                    value={acute7d}
                    onChange={(e) => setAcute7d(Number(e.target.value))}
                    className="pixel-input w-full text-center"
                  />
                </div>

                <div>
                  <label className="text-[#8A9EB2] block mb-1">CHRONIC WORKLOAD (28 DAYS TOTAL KM):</label>
                  <input
                    type="number"
                    value={chronic28d}
                    onChange={(e) => setChronic28d(Number(e.target.value))}
                    className="pixel-input w-full text-center"
                  />
                </div>

                <div className="p-3 bg-[#0B1015] border-2 border-[#1E2D3B] mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-silkscreen text-xs" style={{ color: acwrResult.color }}>
                      STATUS: {acwrResult.status}
                    </span>
                    <button
                      type="button"
                      disabled={savingTest}
                      onClick={handleSaveAcwrTest}
                      className="pixel-btn text-[10px] px-2 py-1 text-[#EBBF68] font-silkscreen border-[#EBBF68]/40"
                    >
                      SAVE ACWR
                    </button>
                  </div>
                  <p className="text-[11px] text-[#A0B0C0] italic">{acwrResult.description}</p>
                </div>
              </div>
            </div>

            {/* Karvonen HR Reserve Calculator */}
            <div className="pixel-panel p-5">
              <h3 className="font-silkscreen text-sm text-[#C9973E] mb-3 border-b border-[#2A3A4A] pb-2 flex justify-between items-center">
                <span>❤️ KARVONEN HEART RATE ZONE MATRIX</span>
                <button
                  type="button"
                  onClick={resetHrCalculator}
                  className="pixel-btn text-[10px] px-2 py-0.5 text-[#E2654B] border-[#E2654B]/40 hover:bg-[#E2654B]/20 font-silkscreen"
                  title="Reset HR parameters to baseline"
                >
                  RESET
                </button>
              </h3>

              <div className="grid grid-cols-2 gap-3 font-tech text-xs mb-4">
                <div>
                  <label className="text-[#8A9EB2] block mb-1">MAX HR (BPM):</label>
                  <input
                    type="number"
                    value={maxHr}
                    onChange={(e) => setMaxHr(Number(e.target.value))}
                    className="pixel-input w-full text-center"
                  />
                </div>

                <div>
                  <label className="text-[#8A9EB2] block mb-1">RESTING HR (BPM):</label>
                  <input
                    type="number"
                    value={restingHr}
                    onChange={(e) => setRestingHr(Number(e.target.value))}
                    className="pixel-input w-full text-center"
                  />
                </div>
              </div>

              <div className="space-y-2 font-tech text-xs">
                {hrZones.map((hz, idx) => (
                  <div key={idx} className="bg-[#0B1015] p-2 border border-[#1E2D3B] flex justify-between items-center">
                    <span className="text-[#E0E8F0] font-bold">{hz.zone}</span>
                    <span className="text-[#38D9C4]">{hz.bpm}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cloud Firestore Test Assessments Log */}
            <div className="pixel-panel p-5">
              <h3 className="font-silkscreen text-sm text-[#38D9C4] mb-3 border-b border-[#2A3A4A] pb-2 flex justify-between items-center">
                <span>🧪 ATHLETE TEST HISTORY (FIRESTORE)</span>
                <span className="text-[10px] text-[#8A9EB2] font-mono">
                  {athleteTests.length} SAVED
                </span>
              </h3>

              {saveSuccessMsg && (
                <div className="p-2 bg-[#38D9C4]/15 border border-[#38D9C4] text-[#38D9C4] text-xs font-silkscreen mb-3 animate-pulse">
                  ✓ {saveSuccessMsg}
                </div>
              )}

              {athleteTests.length === 0 ? (
                <p className="text-xs text-[#8A9EB2] italic">
                  {user
                    ? 'No tests saved yet in athletes/' + user.uid + '/tests. Click "SAVE TEST TO FIRESTORE" above to record one!'
                    : 'Connect / Log in with Google to view and sync your personal athlete test history.'}
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {athleteTests.map((t) => (
                    <div
                      key={t.id}
                      className="bg-[#0B1015] p-2.5 border border-[#1E2D3B] flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="text-[#E0E8F0] font-bold block">{t.testName}</span>
                        <span className="text-[10px] text-[#8A9EB2] font-mono">
                          {t.testedAt ? new Date(t.testedAt).toLocaleDateString() : ''} • ID: {t.id}
                        </span>
                      </div>
                      <div className="text-right">
                        {t.vdotResult && (
                          <span className="text-xs font-silkscreen text-[#38D9C4] block">
                            VDOT: {t.vdotResult}
                          </span>
                        )}
                        {t.acwrResult && (
                          <span className="text-xs font-silkscreen text-[#EBBF68] block">
                            ACWR: {t.acwrResult}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

