import React, { useState } from 'react';
import { Athlete, BrewedWorkout, LoggedWorkout } from '../types';
import { PixelScrollIcon, PixelPlusIcon, PixelFlameIcon } from './PixelIcons';
import { playButtonClickSound } from '../utils/audioSynth';

interface GrimoireLogbookProps {
  athletes: Athlete[];
  brewedWorkouts: BrewedWorkout[];
  loggedWorkouts: LoggedWorkout[];
  onAddLoggedWorkout: (log: LoggedWorkout) => void;
}

export const GrimoireLogbook: React.FC<GrimoireLogbookProps> = ({
  athletes,
  brewedWorkouts,
  loggedWorkouts,
  onAddLoggedWorkout,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'logged' | 'recipes'>('logged');
  const [showLogModal, setShowLogModal] = useState(false);
  const [filterAthleteId, setFilterAthleteId] = useState<string>('all');

  // Form states for new logged run
  const [athleteId, setAthleteId] = useState(athletes[0]?.id || '');
  const [title, setTitle] = useState('');
  const [distanceKm, setDistanceKm] = useState('10.0');
  const [timeMins, setTimeMins] = useState('45');
  const [avgPace, setAvgPace] = useState('4:30 /km');
  const [avgHr, setAvgHr] = useState('155');
  const [rpeMana, setRpeMana] = useState('7');
  const [notes, setNotes] = useState('');

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonClickSound();

    const selectedAthlete = athletes.find((a) => a.id === athleteId);
    if (!selectedAthlete) return;

    const newLog: LoggedWorkout = {
      id: `log_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      athleteId,
      athleteName: selectedAthlete.name,
      workoutTitle: title.trim() || 'Unchanted Run',
      distanceKm: parseFloat(distanceKm) || 0,
      timeMinutes: parseFloat(timeMins) || 0,
      avgPace: avgPace.trim() || '--:-- /km',
      avgHr: parseInt(avgHr, 10) || 150,
      rpeMana: parseInt(rpeMana, 10) || 5,
      notes: notes.trim(),
    };

    onAddLoggedWorkout(newLog);
    setShowLogModal(false);
    setTitle('');
    setNotes('');
  };

  const filteredLogged = loggedWorkouts.filter(
    (l) => filterAthleteId === 'all' || l.athleteId === filterAthleteId
  );

  const filteredBrewed = brewedWorkouts.filter(
    (b) => filterAthleteId === 'all' || b.athleteId === filterAthleteId
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="pixel-panel p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-silkscreen text-xs text-[#C9973E] uppercase tracking-wider">
            SECTION V: ALCHEMICAL GRIMOIRE LOGBOOK
          </span>
          <h2 className="font-pixel text-lg text-[#E0E8F0] mt-1 flex items-center gap-2">
            <PixelScrollIcon size={24} color="#EBBF68" />
            WORKOUT & RECIPE HISTORY
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterAthleteId}
            onChange={(e) => setFilterAthleteId(e.target.value)}
            className="pixel-input text-xs text-[#38D9C4]"
          >
            <option value="all">ALL ATHLETES</option>
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              playButtonClickSound();
              setShowLogModal(true);
            }}
            className="pixel-btn pixel-btn-amber text-xs px-3 py-2 flex items-center gap-2"
          >
            <PixelPlusIcon size={16} />
            LOG COMPLETED RUN
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            playButtonClickSound();
            setActiveSubTab('logged');
          }}
          className={`pixel-btn text-xs px-4 py-2 ${
            activeSubTab === 'logged' ? 'pixel-btn-amber' : ''
          }`}
        >
          📜 LOGGED WORKOUTS ({filteredLogged.length})
        </button>

        <button
          onClick={() => {
            playButtonClickSound();
            setActiveSubTab('recipes');
          }}
          className={`pixel-btn text-xs px-4 py-2 ${
            activeSubTab === 'recipes' ? 'pixel-btn-teal' : ''
          }`}
        >
          🧪 BREWED ELIXIRS ARCHIVE ({filteredBrewed.length})
        </button>
      </div>

      {/* Sub-tab Content 1: Logged Workouts */}
      {activeSubTab === 'logged' && (
        <div className="space-y-3">
          {filteredLogged.length === 0 ? (
            <div className="pixel-panel p-8 text-center text-[#8A9EB2] font-tech">
              No runs logged for this filter yet. Use "LOG COMPLETED RUN" above to add one!
            </div>
          ) : (
            filteredLogged.map((log) => (
              <div key={log.id} className="pixel-panel p-4 font-tech text-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#2A3A4A] pb-2 mb-2">
                  <div>
                    <span className="text-[10px] text-[#38D9C4] font-pixel block">{log.date}</span>
                    <h3 className="font-silkscreen text-sm text-[#EBBF68]">{log.workoutTitle}</h3>
                    <span className="text-[11px] text-[#8A9EB2]">Athlete: {log.athleteName}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-[#0B1015] px-2 py-1 border border-[#1E2D3B] text-[#38D9C4] font-bold">
                      {log.distanceKm} KM
                    </span>
                    <span className="bg-[#0B1015] px-2 py-1 border border-[#1E2D3B] text-[#EBBF68] font-bold">
                      {log.avgPace}
                    </span>
                    <span className="bg-[#0B1015] px-2 py-1 border border-[#1E2D3B] text-[#E2654B] font-bold">
                      MANA RPE {log.rpeMana}/10
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#A0B0C0] bg-[#0B1015] p-2 border border-[#16222F]">
                  <span>AVG HR: <strong className="text-[#E2654B]">{log.avgHr} BPM</strong></span>
                  <span>DURATION: <strong className="text-[#38D9C4]">{log.timeMinutes} MINS</strong></span>
                </div>

                {log.notes && (
                  <p className="mt-2 text-[11px] text-[#A0B0C0] italic bg-[#0B1015] p-2 border border-[#16222F]">
                    "{log.notes}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Sub-tab Content 2: Brewed Elixirs Archive */}
      {activeSubTab === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBrewed.map((b) => (
            <div key={b.id} className="pixel-panel-amber p-4 font-tech text-xs">
              <div className="flex justify-between items-start mb-2 border-b border-[#3D2D15] pb-2">
                <div>
                  <span className="text-[10px] font-pixel text-[#38D9C4]">{b.craftedAt}</span>
                  <h3 className="font-silkscreen text-sm text-[#EBBF68]">{b.title}</h3>
                  <span className="text-[10px] text-[#8A9EB2]">Athlete: {b.athleteName}</span>
                </div>
                <span className="bg-[#C9973E] text-[#0E151B] font-pixel text-[10px] px-2 py-0.5">
                  {b.elixirRank}
                </span>
              </div>

              <div className="space-y-1 mb-3 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#8A9EB2]">TARGET PACE:</span>
                  <span className="text-[#38D9C4] font-bold">{b.targetPace}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A9EB2]">EST. DISTANCE:</span>
                  <span className="text-[#EBBF68] font-bold">{b.totalDistanceKm} KM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A9EB2]">TRAINING STRESS:</span>
                  <span className="text-[#E2654B] font-bold">{b.stressTSS} TSS</span>
                </div>
              </div>

              <div className="bg-[#0B1015] p-2 border border-[#2A3A4A] space-y-1">
                <span className="font-silkscreen text-[10px] text-[#C9973E] block">INSTRUCTIONS:</span>
                <ul className="list-disc list-inside text-[10px] text-[#E0E8F0] space-y-0.5">
                  {b.instructions.slice(0, 3).map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Run Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="pixel-dialogue p-6 max-w-lg w-full">
            <h3 className="font-pixel text-base text-[#C9973E] mb-4 flex justify-between items-center">
              <span>📜 RECORD COMPLETED TRANSMUTATION RUN</span>
              <button
                onClick={() => setShowLogModal(false)}
                className="pixel-btn text-xs px-2 py-1"
              >
                ✕
              </button>
            </h3>

            <form onSubmit={handleLogSubmit} className="space-y-3 font-tech text-xs">
              <div>
                <label className="text-[#8A9EB2] block mb-1">SELECT ATHLETE:</label>
                <select
                  value={athleteId}
                  onChange={(e) => setAthleteId(e.target.value)}
                  className="pixel-input w-full"
                >
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#8A9EB2] block mb-1">WORKOUT TITLE / ELIXIR TYPE:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12k Threshold Transmutation Run"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="pixel-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8A9EB2] block mb-1">DISTANCE (KM):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    className="pixel-input w-full"
                  />
                </div>

                <div>
                  <label className="text-[#8A9EB2] block mb-1">DURATION (MINS):</label>
                  <input
                    type="number"
                    value={timeMins}
                    onChange={(e) => setTimeMins(e.target.value)}
                    className="pixel-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[#8A9EB2] block mb-1">AVG PACE:</label>
                  <input
                    type="text"
                    value={avgPace}
                    onChange={(e) => setAvgPace(e.target.value)}
                    className="pixel-input w-full"
                  />
                </div>

                <div>
                  <label className="text-[#8A9EB2] block mb-1">AVG HR (BPM):</label>
                  <input
                    type="number"
                    value={avgHr}
                    onChange={(e) => setAvgHr(e.target.value)}
                    className="pixel-input w-full"
                  />
                </div>

                <div>
                  <label className="text-[#8A9EB2] block mb-1">MANA RPE (1-10):</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={rpeMana}
                    onChange={(e) => setRpeMana(e.target.value)}
                    className="pixel-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8A9EB2] block mb-1">ATHLETE NOTES / FEELINGS:</label>
                <textarea
                  rows={2}
                  placeholder="How felt, legs, weather, heart rate drift..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="pixel-input w-full"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="pixel-btn text-xs px-4 py-2"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="pixel-btn pixel-btn-amber text-xs px-4 py-2"
                >
                  RECORD ENTRY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
