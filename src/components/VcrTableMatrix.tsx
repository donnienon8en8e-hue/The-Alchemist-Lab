import React, { useState } from 'react';
import { VCR_TABLE_DATA, VcrRow, findVcrByTest, findVcrByVelocity } from '../data/vcrData';
import { playButtonClickSound } from '../utils/audioSynth';
import { PixelBarChartIcon, PixelFlameIcon, PixelCompassIcon } from './PixelIcons';

export const VcrTableMatrix: React.FC = () => {
  const [testType, setTestType] = useState<'30min' | '45min' | '60min' | 'velocity'>('60min');
  const [inputValue, setInputValue] = useState<number>(14400); // 14,400 meters for 60min = 4.0 m/s
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleResetVcr = () => {
    playButtonClickSound();
    setTestType('60min');
    setInputValue(14400);
    setSearchQuery('');
  };

  // Find active matched row
  let activeRow: VcrRow;
  if (testType === 'velocity') {
    activeRow = findVcrByVelocity(inputValue);
  } else {
    activeRow = findVcrByTest(inputValue, testType);
  }

  // Filter table rows
  const filteredRows = VCR_TABLE_DATA.filter((row) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      row.velocityMs.toString().includes(query) ||
      row.timePerKm.includes(query) ||
      row.test60min.toString().includes(query) ||
      (row.test30min && row.test30min.toString().includes(query)) ||
      (row.test45min && row.test45min.toString().includes(query))
    );
  });

  return (
    <div className="space-y-6 font-tech">
      {/* Top Banner */}
      <div className="pixel-panel p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#16222F]">
        <div>
          <span className="font-silkscreen text-xs text-[#C9973E] uppercase tracking-wider">
            GERMAN BASIC ENDURANCE SYSTEM (LANGE & PÖHLITZ 1995/2022)
          </span>
          <h2 className="font-pixel text-lg text-[#E0E8F0] mt-1 flex items-center gap-2">
            <PixelBarChartIcon size={24} color="#38D9C4" />
            CRITICAL VELOCITY (VCr) TRAINING TABLE & CALCULATOR
          </h2>
        </div>

        <div className="text-right text-xs text-[#8A9EB2]">
          <span className="font-silkscreen text-[#38D9C4]">DETERMINATION OF PRESCRIBED VELOCITIES</span>
          <p className="text-[10px] text-[#A0B0C0] mt-0.5">© Lange, G.; Pöhlitz, L. 1995 updated 2022</p>
        </div>
      </div>

      {/* Interactive VCr Quick Lookup Card */}
      <div className="pixel-panel p-5 bg-[#101923]">
        <h3 className="font-silkscreen text-sm text-[#C9973E] mb-4 border-b border-[#2A3A4A] pb-2 flex justify-between items-center">
          <span>🎯 VCr CALCULATOR & PACING INTERPRETER</span>
          <div className="flex items-center gap-2">
            <span className="font-pixel text-xs text-[#38D9C4]">
              ACTIVE VCr: {activeRow.velocityMs} m/s ({activeRow.timePerKm} /km)
            </span>
            <button
              type="button"
              onClick={handleResetVcr}
              className="pixel-btn text-[10px] px-2 py-0.5 text-[#E2654B] border-[#E2654B]/40 hover:bg-[#E2654B]/20 font-silkscreen"
              title="Reset VCr test input to default 60min / 14,400m"
            >
              RESET
            </button>
          </div>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Controls (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <label className="text-[#8A9EB2] text-xs block mb-1 font-silkscreen">1. SELECT TEST TYPE / INPUT:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    playButtonClickSound();
                    setTestType('30min');
                    setInputValue(7200);
                  }}
                  className={`pixel-btn py-1.5 text-xs ${testType === '30min' ? 'pixel-btn-amber' : ''}`}
                >
                  30 MIN TEST (m)
                </button>
                <button
                  onClick={() => {
                    playButtonClickSound();
                    setTestType('45min');
                    setInputValue(10800);
                  }}
                  className={`pixel-btn py-1.5 text-xs ${testType === '45min' ? 'pixel-btn-amber' : ''}`}
                >
                  45 MIN TEST (m)
                </button>
                <button
                  onClick={() => {
                    playButtonClickSound();
                    setTestType('60min');
                    setInputValue(14400);
                  }}
                  className={`pixel-btn py-1.5 text-xs ${testType === '60min' ? 'pixel-btn-amber' : ''}`}
                >
                  60 MIN TEST (m)
                </button>
                <button
                  onClick={() => {
                    playButtonClickSound();
                    setTestType('velocity');
                    setInputValue(4.0);
                  }}
                  className={`pixel-btn py-1.5 text-xs ${testType === 'velocity' ? 'pixel-btn-teal' : ''}`}
                >
                  VELOCITY (m/s)
                </button>
              </div>
            </div>

            <div>
              <label className="text-[#8A9EB2] text-xs block mb-1">
                {testType === 'velocity' ? 'ENTER VELOCITY (m/sec):' : `ENTER DISTANCE IN ${testType.toUpperCase()} (METERS):`}
              </label>
              <input
                type="number"
                step={testType === 'velocity' ? '0.1' : '100'}
                value={inputValue}
                onChange={(e) => setInputValue(Number(e.target.value))}
                className="pixel-input w-full text-center text-lg text-[#38D9C4] font-bold"
              />
            </div>

            <div className="bg-[#0B1015] p-3 border border-[#1E2D3B] space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8A9EB2]">VCr Speed:</span>
                <strong className="text-[#38D9C4]">{activeRow.velocityMs} m/sec</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A9EB2]">Base 1 Km Pace:</span>
                <strong className="text-[#EBBF68]">{activeRow.timePerKm} /km</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A9EB2]">Base 400m Track Time:</span>
                <strong className="text-[#E0E8F0]">{activeRow.timePer400m} /400m</strong>
              </div>
            </div>
          </div>

          {/* Training Zones Readout (7 cols) */}
          <div className="md:col-span-7 space-y-2">
            <h4 className="font-silkscreen text-xs text-[#38D9C4] mb-2">⚡ PRESCRIBED TRAINING METHOD PACES</h4>

            <div className="space-y-2 text-xs">
              {/* Zone 1: Regeneration 70% */}
              <div className="bg-[#0B1015] p-2.5 border-l-4 border-[#3A7DA8] flex justify-between items-center">
                <div>
                  <span className="font-silkscreen text-[#3A7DA8] block">ENDURANCE REGENERATION (70% VCr)</span>
                  <span className="text-[10px] text-[#8A9EB2]">Target Pulse: ~130 PR/min</span>
                </div>
                <div className="text-right font-bold text-[#38D9C4] text-sm">
                  {activeRow.regen70pct} /km
                </div>
              </div>

              {/* Zone 2: 85% Endurance / Tempo */}
              <div className="bg-[#0B1015] p-2.5 border-l-4 border-[#2E8B57] flex justify-between items-center">
                <div>
                  <span className="font-silkscreen text-[#38D9C4] block">30-90 MIN ENDURANCE RUN (85% VCr)</span>
                  <span className="text-[10px] text-[#8A9EB2]">Target Pulse: ~150 PR/min</span>
                </div>
                <div className="text-right font-bold text-[#EBBF68] text-sm">
                  {activeRow.tempo85pct} /km
                </div>
              </div>

              {/* Zone 3: 90% Aerobic Tempo */}
              <div className="bg-[#0B1015] p-2.5 border-l-4 border-[#32CD32] flex justify-between items-center">
                <div>
                  <span className="font-silkscreen text-[#7AC93E] block">30-60 MIN TEMPO RUN (90% VCr)</span>
                  <span className="text-[10px] text-[#8A9EB2]">Target Pulse: ~150 PR/min</span>
                </div>
                <div className="text-right font-bold text-[#EBBF68] text-sm">
                  {activeRow.tempo90pct} /km
                </div>
              </div>

              {/* Zone 4: 97% Fast Tempo */}
              <div className="bg-[#0B1015] p-2.5 border-l-4 border-[#C9973E] flex justify-between items-center">
                <div>
                  <span className="font-silkscreen text-[#C9973E] block">FAST TEMPO / THRESHOLD (97% VCr)</span>
                  <span className="text-[10px] text-[#8A9EB2]">Target Pulse: ~168 PR/min</span>
                </div>
                <div className="text-right font-bold text-[#E29A3E] text-sm">
                  {activeRow.tempo97pct} /km
                </div>
              </div>

              {/* Zone 5: >100% Extensive Interval */}
              <div className="bg-[#0B1015] p-2.5 border-l-4 border-[#E2654B] flex justify-between items-center">
                <div>
                  <span className="font-silkscreen text-[#E2654B] block">EXTENSIVE INTERVAL (&gt;100% VCr)</span>
                  <span className="text-[10px] text-[#8A9EB2]">Target Pulse: Not Applicable (Max Exertion)</span>
                </div>
                <div className="text-right font-bold text-[#E2654B] text-sm">
                  {activeRow.interval100pct} /km
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Digital VCr Table (ตาราง VCR สมบูรณ์แบบ) */}
      <div className="pixel-panel p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b border-[#2A3A4A] pb-3">
          <div>
            <h3 className="font-silkscreen text-sm text-[#C9973E] flex items-center gap-2">
              <PixelCompassIcon size={18} color="#C9973E" />
              FULL DIGITAL VCR REFERENCE MATRIX
            </h3>
            <span className="text-xs text-[#8A9EB2]">Click any row to select &amp; highlight corresponding training velocities</span>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search velocity / distance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pixel-input text-xs w-full sm:w-56"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="pixel-btn text-[10px] px-2 py-1.5 text-[#E2654B] font-silkscreen"
                title="Clear search filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="overflow-x-auto border-2 border-[#1E2D3B]">
          <table className="w-full text-center text-xs font-tech border-collapse min-w-[760px]">
            {/* Table Header 1 */}
            <thead>
              <tr className="bg-[#121B24] text-[#E0E8F0] font-silkscreen border-b border-[#2A3A4A]">
                <th colSpan={3} className="py-2 border-r border-[#2A3A4A] text-[#EBBF68]">
                  TEST DISTANCES (m)
                </th>
                <th colSpan={3} className="py-2 border-r border-[#2A3A4A] text-[#38D9C4]">
                  VCr CALCULATIONS
                </th>
                <th colSpan={5} className="py-2 text-[#7AC93E]">
                  TRAINING METHODS (Pace /1km)
                </th>
              </tr>

              {/* Table Header 2 */}
              <tr className="bg-[#0B1015] text-[#8A9EB2] border-b-2 border-[#1E2D3B] text-[11px]">
                <th className="p-1.5 border-r border-[#1E2D3B] w-16">30 Min</th>
                <th className="p-1.5 border-r border-[#1E2D3B] w-16">45 Min</th>
                <th className="p-1.5 border-r border-[#2A3A4A] w-16 text-[#EBBF68]">60 Min</th>
                <th className="p-1.5 border-r border-[#1E2D3B] text-[#38D9C4]">Velocity</th>
                <th className="p-1.5 border-r border-[#1E2D3B]">Pace /1km</th>
                <th className="p-1.5 border-r border-[#2A3A4A]">Pace /400m</th>
                <th className="p-1.5 border-r border-[#1E2D3B] bg-[#102436] text-[#3A7DA8]">
                  70% Regen
                </th>
                <th className="p-1.5 border-r border-[#1E2D3B] bg-[#0E2C22] text-[#38D9C4]">
                  85% Endur
                </th>
                <th className="p-1.5 border-r border-[#1E2D3B] bg-[#0E2C22] text-[#38D9C4]">
                  90% Tempo
                </th>
                <th className="p-1.5 border-r border-[#1E2D3B] bg-[#102436] text-[#C9973E]">
                  97% Tempo
                </th>
                <th className="p-1.5 bg-[#311414] text-[#E2654B]">
                  &gt;100% Interval
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredRows.map((row, idx) => {
                const isSelected = activeRow.velocityMs === row.velocityMs;

                return (
                  <tr
                    key={idx}
                    onClick={() => {
                      playButtonClickSound();
                      setTestType('velocity');
                      setInputValue(row.velocityMs);
                    }}
                    className={`cursor-pointer transition-colors border-b border-[#16222F] hover:bg-[#1C2C3C] ${
                      isSelected ? 'bg-[#183842] ring-2 ring-[#38D9C4]' : idx % 2 === 0 ? 'bg-[#0E151B]' : 'bg-[#0B1015]'
                    }`}
                  >
                    <td className="p-1.5 border-r border-[#16222F] text-[#8A9EB2]">
                      {row.test30min || '-'}
                    </td>
                    <td className="p-1.5 border-r border-[#16222F] text-[#8A9EB2]">
                      {row.test45min || '-'}
                    </td>
                    <td className="p-1.5 border-r border-[#2A3A4A] font-bold text-[#EBBF68] bg-[#1A1610]/40">
                      {row.test60min}
                    </td>
                    <td className="p-1.5 border-r border-[#16222F] font-bold text-[#38D9C4]">
                      {row.velocityMs} m/s
                    </td>
                    <td className="p-1.5 border-r border-[#16222F] text-[#E0E8F0]">
                      {row.timePerKm}
                    </td>
                    <td className="p-1.5 border-r border-[#2A3A4A] text-[#8A9EB2]">
                      {row.timePer400m}
                    </td>
                    <td className="p-1.5 border-r border-[#16222F] font-semibold text-[#3A7DA8] bg-[#0C1A28]/50">
                      {row.regen70pct}
                    </td>
                    <td className="p-1.5 border-r border-[#16222F] font-semibold text-[#38D9C4] bg-[#0A221A]/50">
                      {row.tempo85pct}
                    </td>
                    <td className="p-1.5 border-r border-[#16222F] font-semibold text-[#7AC93E] bg-[#0A221A]/50">
                      {row.tempo90pct}
                    </td>
                    <td className="p-1.5 border-r border-[#16222F] font-semibold text-[#C9973E] bg-[#0C1A28]/50">
                      {row.tempo97pct}
                    </td>
                    <td className="p-1.5 font-bold text-[#E2654B] bg-[#220E0E]/50">
                      {row.interval100pct}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer: Pulse Rate Bar (matching original bottom row) */}
            <tfoot>
              <tr className="bg-[#C9973E] text-[#0E151B] font-silkscreen text-[11px] font-bold">
                <td colSpan={6} className="py-2 text-right px-4 border-r border-[#0E151B]">
                  EXPECTED PULSE RATE PER MINUTE (Internal Load):
                </td>
                <td className="py-2 border-r border-[#0E151B]">130 PR/1'</td>
                <td className="py-2 border-r border-[#0E151B]">150 PR/1'</td>
                <td className="py-2 border-r border-[#0E151B]">150 PR/1'</td>
                <td className="py-2 border-r border-[#0E151B]">168 PR/1'</td>
                <td className="py-2 bg-[#E2654B] text-[#0E151B]">Not applicable</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
