import React, { useState } from 'react';
import { Athlete, BrewedWorkout, LoggedWorkout } from '../types';
import { PixelScrollIcon, PixelPlusIcon, PixelFlameIcon } from './PixelIcons';
import { playButtonClickSound } from '../utils/audioSynth';
import { GmailWorkoutModal } from './GmailWorkoutModal';

interface GrimoireLogbookProps {
  athletes: Athlete[];
  brewedWorkouts: BrewedWorkout[];
  loggedWorkouts: LoggedWorkout[];
  onAddLoggedWorkout: (log: LoggedWorkout) => void;
  onResetLogbook?: () => void;
  onClearAllLogs?: () => void;
  onClearAllBrewed?: () => void;
  onDeleteLoggedWorkout?: (id: string) => void;
  onDeleteBrewedWorkout?: (id: string) => void;
}

export const GrimoireLogbook: React.FC<GrimoireLogbookProps> = ({
  athletes,
  brewedWorkouts,
  loggedWorkouts,
  onAddLoggedWorkout,
  onResetLogbook,
  onClearAllLogs,
  onClearAllBrewed,
  onDeleteLoggedWorkout,
  onDeleteBrewedWorkout,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'logged' | 'recipes'>('logged');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [filterAthleteId, setFilterAthleteId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Default Form values
  const DEFAULT_ATHLETE_ID = athletes[0]?.id || '';
  const DEFAULT_TITLE = '';
  const DEFAULT_DIST = '10.0';
  const DEFAULT_TIME = '45';
  const DEFAULT_PACE = '4:30 /km';
  const DEFAULT_HR = '155';
  const DEFAULT_RPE = '7';
  const DEFAULT_NOTES = '';

  // Form states for new logged run
  const [athleteId, setAthleteId] = useState(DEFAULT_ATHLETE_ID);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [distanceKm, setDistanceKm] = useState(DEFAULT_DIST);
  const [timeMins, setTimeMins] = useState(DEFAULT_TIME);
  const [avgPace, setAvgPace] = useState(DEFAULT_PACE);
  const [avgHr, setAvgHr] = useState(DEFAULT_HR);
  const [rpeMana, setRpeMana] = useState(DEFAULT_RPE);
  const [notes, setNotes] = useState(DEFAULT_NOTES);

  const handleResetForm = () => {
    playButtonClickSound();
    setAthleteId(DEFAULT_ATHLETE_ID);
    setTitle(DEFAULT_TITLE);
    setDistanceKm(DEFAULT_DIST);
    setTimeMins(DEFAULT_TIME);
    setAvgPace(DEFAULT_PACE);
    setAvgHr(DEFAULT_HR);
    setRpeMana(DEFAULT_RPE);
    setNotes(DEFAULT_NOTES);
  };

  const handleResetCodexFilters = () => {
    playButtonClickSound();
    setFilterAthleteId('all');
    setSearchQuery('');
  };

  const handleResetToSamples = () => {
    playButtonClickSound();
    if (onResetLogbook) {
      onResetLogbook();
    }
    setFilterAthleteId('all');
    setSearchQuery('');
  };

  const handleClearLogs = () => {
    playButtonClickSound();
    if (onClearAllLogs) {
      onClearAllLogs();
    }
  };

  const handleClearBrewed = () => {
    playButtonClickSound();
    if (onClearAllBrewed) {
      onClearAllBrewed();
    }
  };

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
    handleResetForm();
  };

  const q = searchQuery.toLowerCase().trim();

  const filteredLogged = loggedWorkouts.filter((l) => {
    const matchesAthlete = filterAthleteId === 'all' || l.athleteId === filterAthleteId;
    const matchesQuery =
      !q ||
      l.workoutTitle.toLowerCase().includes(q) ||
      l.athleteName.toLowerCase().includes(q) ||
      (l.notes && l.notes.toLowerCase().includes(q));
    return matchesAthlete && matchesQuery;
  });

  const filteredBrewed = brewedWorkouts.filter((b) => {
    const matchesAthlete = filterAthleteId === 'all' || b.athleteId === filterAthleteId;
    const matchesQuery =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.athleteName.toLowerCase().includes(q) ||
      b.instructions.some((inst) => inst.toLowerCase().includes(q));
    return matchesAthlete && matchesQuery;
  });

  const handleImportGmailWorkouts = (workouts: LoggedWorkout[]) => {
    workouts.forEach((w) => onAddLoggedWorkout(w));
    setShowGmailModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="pixel-panel p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-silkscreen text-xs text-[#C9973E] uppercase tracking-wider">
            SECTION V: ALCHEMIST CODEX LOGBOOK
          </span>
          <h2 className="font-pixel text-lg text-[#E0E8F0] mt-1 flex items-center gap-2">
            <PixelScrollIcon size={24} color="#EBBF68" />
            WORKOUT &amp; RECIPE HISTORY
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Gmail Import Button */}
          <button
            type="button"
            onClick={() => {
              playButtonClickSound();
              setShowGmailModal(true);
            }}
            className="pixel-btn pixel-btn-teal text-xs px-3 py-2 flex items-center gap-1.5 font-silkscreen shadow-sm"
            title="Import workouts directly from your Gmail inbox (Strava, Garmin, Nike, etc.)"
          >
            <span>📩</span>
            <span>IMPORT FROM GMAIL</span>
          </button>

          {/* Master Reset Button for Codex */}
          <button
            type="button"
            onClick={handleResetCodexFilters}
            className="pixel-btn text-xs px-3 py-2 text-[#E2654B] border-[#E2654B]/50 hover:bg-[#E2654B]/20 font-silkscreen flex items-center gap-1.5"
            title="Reset filters and view all entries"
          >
            <span>🔄</span>
            <span>RESET CODEX</span>
          </button>

          <div className="flex items-center gap-1">
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

            {filterAthleteId !== 'all' && (
              <button
                type="button"
                onClick={() => {
                  playButtonClickSound();
                  setFilterAthleteId('all');
                }}
                className="pixel-btn text-[10px] px-2 py-1.5 text-[#E2654B] font-silkscreen"
                title="Reset to all athletes"
              >
                RESET
              </button>
            )}
          </div>

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

      {/* Filter and Quick Action Bar */}
      <div className="pixel-panel p-3 flex flex-wrap items-center justify-between gap-3 font-tech text-xs">
        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              playButtonClickSound();
              setActiveSubTab('logged');
            }}
            className={`pixel-btn text-xs px-3 py-1.5 flex items-center gap-1.5 ${
              activeSubTab === 'logged' ? 'pixel-btn-amber' : ''
            }`}
          >
            <span>📜 LOGGED WORKOUTS ({filteredLogged.length})</span>
          </button>

          <button
            onClick={() => {
              playButtonClickSound();
              setActiveSubTab('recipes');
            }}
            className={`pixel-btn text-xs px-3 py-1.5 flex items-center gap-1.5 ${
              activeSubTab === 'recipes' ? 'pixel-btn-teal' : ''
            }`}
          >
            <span>🧪 BREWED ELIXIRS ARCHIVE ({filteredBrewed.length})</span>
          </button>
        </div>

        {/* Search and Secondary Resets */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search title, athlete, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pixel-input text-xs w-full sm:w-48"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="pixel-btn text-[10px] px-2 py-1 text-[#E2654B] font-silkscreen"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {onResetLogbook && (
            <button
              type="button"
              onClick={handleResetToSamples}
              className="pixel-btn text-[10px] px-2.5 py-1.5 text-[#38D9C4] border-[#38D9C4]/40 hover:bg-[#38D9C4]/20 font-silkscreen flex items-center gap-1"
              title="Reset logbook back to initial sample training records"
            >
              <span>🔄</span>
              <span>RESTORE SAMPLES</span>
            </button>
          )}

          {activeSubTab === 'logged' && onClearAllLogs && loggedWorkouts.length > 0 && (
            <button
              type="button"
              onClick={handleClearLogs}
              className="pixel-btn text-[10px] px-2.5 py-1.5 text-[#E2654B] border-[#E2654B]/40 hover:bg-[#E2654B]/20 font-silkscreen"
              title="Clear all logged runs"
            >
              CLEAR RUNS
            </button>
          )}

          {activeSubTab === 'recipes' && onClearAllBrewed && brewedWorkouts.length > 0 && (
            <button
              type="button"
              onClick={handleClearBrewed}
              className="pixel-btn text-[10px] px-2.5 py-1.5 text-[#E2654B] border-[#E2654B]/40 hover:bg-[#E2654B]/20 font-silkscreen"
              title="Clear all brewed elixir formulas"
            >
              CLEAR ARCHIVE
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab Content 1: Logged Workouts */}
      {activeSubTab === 'logged' && (
        <div className="space-y-3">
          {filteredLogged.length === 0 ? (
            <div className="pixel-panel p-8 text-center text-[#8A9EB2] font-tech space-y-3">
              <p>No runs logged for this filter yet.</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playButtonClickSound();
                    setShowGmailModal(true);
                  }}
                  className="pixel-btn pixel-btn-teal text-xs px-3 py-1.5 font-silkscreen flex items-center gap-1.5"
                >
                  <span>📩</span>
                  <span>IMPORT FROM GMAIL</span>
                </button>
                {(filterAthleteId !== 'all' || searchQuery) && (
                  <button
                    type="button"
                    onClick={handleResetCodexFilters}
                    className="pixel-btn text-xs px-3 py-1.5 text-[#E2654B] font-silkscreen"
                  >
                    RESET FILTERS
                  </button>
                )}
                {onResetLogbook && (
                  <button
                    type="button"
                    onClick={handleResetToSamples}
                    className="pixel-btn text-xs px-3 py-1.5 text-[#38D9C4] font-silkscreen"
                  >
                    RESTORE SAMPLE RUNS
                  </button>
                )}
              </div>
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

                  <div className="flex items-center gap-2">
                    <span className="bg-[#0B1015] px-2 py-1 border border-[#1E2D3B] text-[#38D9C4] font-bold">
                      {log.distanceKm} KM
                    </span>
                    <span className="bg-[#0B1015] px-2 py-1 border border-[#1E2D3B] text-[#EBBF68] font-bold">
                      {log.avgPace}
                    </span>
                    <span className="bg-[#0B1015] px-2 py-1 border border-[#1E2D3B] text-[#E2654B] font-bold">
                      MANA {log.rpeMana}/10
                    </span>
                    {onDeleteLoggedWorkout && (
                      <button
                        type="button"
                        onClick={() => {
                          playButtonClickSound();
                          onDeleteLoggedWorkout(log.id);
                        }}
                        className="pixel-btn text-[10px] px-2 py-1 text-[#E2654B] hover:bg-[#E2654B]/20 font-silkscreen ml-1"
                        title="Delete this logged entry"
                      >
                        ✕
                      </button>
                    )}
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
        <div className="space-y-4">
          {filteredBrewed.length === 0 ? (
            <div className="pixel-panel p-8 text-center text-[#8A9EB2] font-tech space-y-3">
              <p>No brewed elixir recipes found for this filter.</p>
              <div className="flex justify-center gap-2">
                {(filterAthleteId !== 'all' || searchQuery) && (
                  <button
                    type="button"
                    onClick={handleResetCodexFilters}
                    className="pixel-btn text-xs px-3 py-1.5 text-[#E2654B] font-silkscreen"
                  >
                    RESET FILTERS
                  </button>
                )}
                {onResetLogbook && (
                  <button
                    type="button"
                    onClick={handleResetToSamples}
                    className="pixel-btn text-xs px-3 py-1.5 text-[#38D9C4] font-silkscreen"
                  >
                    RESTORE SAMPLE ELIXIRS
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBrewed.map((b) => (
                <div key={b.id} className="pixel-panel-amber p-4 font-tech text-xs">
                  <div className="flex justify-between items-start mb-2 border-b border-[#3D2D15] pb-2">
                    <div>
                      <span className="text-[10px] font-pixel text-[#38D9C4]">{b.craftedAt}</span>
                      <h3 className="font-silkscreen text-sm text-[#EBBF68]">{b.title}</h3>
                      <span className="text-[10px] text-[#8A9EB2]">Athlete: {b.athleteName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-[#C9973E] text-[#0E151B] font-pixel text-[10px] px-2 py-0.5">
                        {b.elixirRank}
                      </span>
                      {onDeleteBrewedWorkout && (
                        <button
                          type="button"
                          onClick={() => {
                            playButtonClickSound();
                            onDeleteBrewedWorkout(b.id);
                          }}
                          className="pixel-btn text-[10px] px-1.5 py-0.5 text-[#E2654B] hover:bg-[#E2654B]/20 font-silkscreen"
                          title="Remove recipe from archive"
                        >
                          ✕
                        </button>
                      )}
                    </div>
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
        </div>
      )}

      {/* Log Run Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="pixel-dialogue p-6 max-w-lg w-full">
            <h3 className="font-pixel text-base text-[#C9973E] mb-4 flex justify-between items-center">
              <span>📜 RECORD COMPLETED TRANSMUTATION RUN</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLogModal(false);
                    setShowGmailModal(true);
                  }}
                  className="pixel-btn text-[10px] px-2 py-1 text-[#38D9C4] border-[#38D9C4]/40 font-silkscreen flex items-center gap-1"
                  title="Import from Gmail instead"
                >
                  <span>📩</span>
                  <span>FROM GMAIL</span>
                </button>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="pixel-btn text-xs px-2 py-1"
                >
                  ✕
                </button>
              </div>
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

              <div className="pt-2 flex flex-wrap justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="pixel-btn text-xs px-3 py-2 text-[#E2654B] border-[#E2654B]/40 hover:bg-[#E2654B]/20 font-silkscreen"
                  title="Reset form fields to defaults"
                >
                  🔄 RESET FORM
                </button>

                <div className="flex gap-2">
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gmail Workout Importer Modal */}
      <GmailWorkoutModal
        isOpen={showGmailModal}
        onClose={() => setShowGmailModal(false)}
        onImportWorkouts={handleImportGmailWorkouts}
      />
    </div>
  );
};
