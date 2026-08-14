import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_ATHLETES as athletes } from '../data/initialData';
import { LoggedWorkout } from '../types';
import { playButtonClickSound, playTransmutationSuccessSound } from '../utils/audioSynth';
import {
  ParsedGmailWorkout,
  fetchGmailWorkouts,
  parseWorkoutFromEmail,
} from '../utils/gmailWorkoutParser';

interface GmailWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportWorkouts: (workouts: LoggedWorkout[]) => void;
}

const SAMPLE_GMAIL_WORKOUTS: ParsedGmailWorkout[] = [
  {
    id: 'sample-gmail-1',
    emailId: 'mail-001',
    subject: 'Strava: Morning Tempo Run - 10.42 km',
    from: 'no-reply@strava.com',
    date: new Date().toISOString().split('T')[0],
    snippet: 'Great job on your morning tempo session! Distance: 10.42 km, Elapsed Time: 46:32, Average Pace: 4:28 /km, Max HR: 168 bpm, Estimated Energy: 680 kcal.',
    workoutTitle: 'Morning Tempo Run (Strava Sync)',
    distanceKm: '10.4',
    timeMins: '46',
    avgPace: '4:28 /km',
    avgHr: '164',
    rpeMana: 8,
    notes: 'Imported from Strava notification email. Aerobic threshold tempo loop.',
    source: 'Strava',
    selected: true,
  },
  {
    id: 'sample-gmail-2',
    emailId: 'mail-002',
    subject: 'Garmin Connect: Track 800m Repeats Completed',
    from: 'notifications@garmin.com',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    snippet: 'Activity recorded on Forerunner 965. Total Distance: 8.2 km, Moving Time: 35:10, Avg Pace: 4:17 min/km, Avg Heart Rate: 172 bpm. VO2 Max Training Effect: 4.2',
    workoutTitle: 'Track 800m Repeats (Garmin Connect)',
    distanceKm: '8.2',
    timeMins: '35',
    avgPace: '4:17 /km',
    avgHr: '172',
    rpeMana: 9,
    notes: 'Garmin Connect Track workout: High lactate tolerance workout with 5x800m intervals.',
    source: 'Garmin',
    selected: true,
  },
  {
    id: 'sample-gmail-3',
    emailId: 'mail-003',
    subject: 'Nike Run Club: Sunday Long Run in the Forest',
    from: 'support@nike.com',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    snippet: 'You crushed your long run! Distance: 18.5 km, Time: 1:28:40, Average Pace: 4:47 /km, Elevation Gain: 140m.',
    workoutTitle: 'Sunday Long Run (Nike Run Club)',
    distanceKm: '18.5',
    timeMins: '88',
    avgPace: '4:47 /km',
    avgHr: '148',
    rpeMana: 6,
    notes: 'Nike Run Club Forest endurance build. Zone 2 aerobic base building.',
    source: 'Nike',
    selected: true,
  },
];

export const GmailWorkoutModal: React.FC<GmailWorkoutModalProps> = ({
  isOpen,
  onClose,
  onImportWorkouts,
}) => {
  const { user, googleAccessToken, signInWithGoogle } = useAuth();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(athletes[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedWorkouts, setParsedWorkouts] = useState<ParsedGmailWorkout[]>([]);
  const [activeTab, setActiveTab] = useState<'inbox' | 'paste' | 'demo'>('inbox');
  const [rawEmailText, setRawEmailText] = useState('');
  const [rawSubject, setRawSubject] = useState('My Running Workout');

  // Load workouts from Gmail API
  const handleScanGmail = async () => {
    playButtonClickSound();
    setLoading(true);
    setErrorMsg(null);

    try {
      let token = googleAccessToken;
      if (!token || !user) {
        const authRes = await signInWithGoogle();
        token = authRes.accessToken;
      }

      if (!token) {
        throw new Error('Google OAuth token not available. Please authorize Google sign-in.');
      }

      const results = await fetchGmailWorkouts(token);
      if (results.length === 0) {
        setParsedWorkouts(SAMPLE_GMAIL_WORKOUTS);
        setErrorMsg('No recent fitness emails detected in live inbox query. Loaded sample running emails from Strava & Garmin for you to preview!');
      } else {
        setParsedWorkouts(results);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err?.message ||
          'Failed to scan Gmail inbox. You can still import demo runs or paste raw email text below!'
      );
      // fallback to sample workouts so user can test seamlessly
      if (parsedWorkouts.length === 0) {
        setParsedWorkouts(SAMPLE_GMAIL_WORKOUTS);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load sample demo workouts
  const handleLoadDemo = () => {
    playButtonClickSound();
    setParsedWorkouts(SAMPLE_GMAIL_WORKOUTS);
    setErrorMsg(null);
  };

  // Parse manually pasted email text
  const handleParseRawEmail = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonClickSound();
    if (!rawEmailText.trim()) return;

    const parsed = parseWorkoutFromEmail(
      `pasted-${Date.now()}`,
      rawSubject || 'Custom Pasted Workout',
      user?.email || 'my-email@gmail.com',
      new Date().toISOString(),
      rawEmailText
    );

    setParsedWorkouts([parsed, ...parsedWorkouts]);
    setRawEmailText('');
    setActiveTab('inbox');
  };

  const handleToggleSelect = (id: string) => {
    setParsedWorkouts((prev) =>
      prev.map((w) => (w.id === id ? { ...w, selected: !w.selected } : w))
    );
  };

  const handleUpdateWorkoutField = (
    id: string,
    field: keyof ParsedGmailWorkout,
    value: any
  ) => {
    setParsedWorkouts((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  const handleImportSelected = () => {
    const selected = parsedWorkouts.filter((w) => w.selected);
    if (selected.length === 0) return;

    const targetAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];

    const logsToAdd: LoggedWorkout[] = selected.map((w) => ({
      id: `logged-gmail-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      athleteId: targetAthlete.id,
      athleteName: targetAthlete.name,
      date: w.date,
      workoutTitle: w.workoutTitle,
      distanceKm: parseFloat(w.distanceKm) || 10.0,
      timeMins: parseInt(w.timeMins, 10) || 45,
      avgPace: w.avgPace,
      avgHr: parseInt(w.avgHr, 10) || 155,
      rpeMana: w.rpeMana,
      notes: `[Gmail Sync: ${w.source}] ${w.notes}`,
    }));

    playTransmutationSuccessSound();
    onImportWorkouts(logsToAdd);
    onClose();
  };

  if (!isOpen) return null;

  const selectedCount = parsedWorkouts.filter((w) => w.selected).length;
  const currentAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-tech">
      <div className="pixel-panel-teal max-w-3xl w-full max-h-[90vh] flex flex-col bg-[#0E151B] border-2 border-[#38D9C4] shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#1E2D3B] flex justify-between items-center bg-[#091117]">
          <div className="flex items-center gap-2">
            <span className="text-xl">📩</span>
            <div>
              <h2 className="font-pixel text-base text-[#38D9C4]">GMAIL RUNNING TRANSMUTER</h2>
              <p className="text-xs text-[#8A9EB2]">
                Sync &amp; extract workout logs directly from athletes' Gmail inboxes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="pixel-btn text-xs px-2.5 py-1 text-[#E2654B] font-silkscreen"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Sub Navigation Bar */}
        <div className="p-3 border-b border-[#1E2D3B] bg-[#0B141C] flex flex-wrap justify-between items-center gap-2 text-xs">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`pixel-btn text-xs px-3 py-1 ${
                activeTab === 'inbox' ? 'pixel-btn-teal' : ''
              }`}
            >
              📥 GMAIL INBOX SCAN
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`pixel-btn text-xs px-3 py-1 ${
                activeTab === 'paste' ? 'pixel-btn-amber' : ''
              }`}
            >
              📝 PASTE EMAIL TEXT
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#C9973E] font-silkscreen">ASSIGN TO ATHLETE:</span>
            <select
              value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              className="pixel-input text-xs text-[#38D9C4] bg-[#0E151B] py-1"
            >
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.title} - {a.primaryDistance})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'inbox' && (
            <div className="space-y-4">
              {/* Account Status / Scan Action */}
              <div className="pixel-panel p-3 flex flex-wrap justify-between items-center gap-3 bg-[#0B1015]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-silkscreen text-[#38D9C4] text-xs">
                      CONNECTED GMAIL ACCOUNT:
                    </span>
                    <span className="text-[#E0E8F0] font-mono bg-[#1E2D3B] px-2 py-0.5 border border-[#2A3A4A]">
                      {user?.email || 'donnienon8en8e@gmail.com'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8A9EB2]">
                    Scans for workout summaries from Strava, Garmin Connect, Nike Run Club, Apple Fitness, and running logs.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleScanGmail}
                    disabled={loading}
                    className="pixel-btn pixel-btn-teal text-xs px-3 py-2 font-silkscreen flex items-center gap-1.5 shadow-md"
                  >
                    {loading ? (
                      <span>⏳ SCANNING INBOX...</span>
                    ) : (
                      <>
                        <span>🔍</span>
                        <span>SCAN MY GMAIL</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleLoadDemo}
                    className="pixel-btn text-xs px-3 py-2 text-[#EBBF68] border-[#EBBF68]/40 hover:bg-[#EBBF68]/10 font-silkscreen"
                    title="Load sample Strava & Garmin training emails"
                  >
                    LOAD DEMO RUNS
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-[#E2654B]/10 border border-[#E2654B] text-[#E2654B] text-xs font-mono">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Parsed Workouts List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-silkscreen text-[#EBBF68] text-xs">
                    DETECTED WORKOUT ACTIVITIES ({parsedWorkouts.length})
                  </span>
                  {parsedWorkouts.length > 0 && (
                    <button
                      onClick={() => {
                        const allSelected = parsedWorkouts.every((w) => w.selected);
                        setParsedWorkouts((prev) =>
                          prev.map((w) => ({ ...w, selected: !allSelected }))
                        );
                      }}
                      className="text-[10px] text-[#38D9C4] underline font-tech"
                    >
                      {parsedWorkouts.every((w) => w.selected)
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  )}
                </div>

                {parsedWorkouts.length === 0 ? (
                  <div className="pixel-panel p-8 text-center text-[#8A9EB2] space-y-3">
                    <p>No workout emails scanned yet.</p>
                    <button
                      onClick={handleScanGmail}
                      className="pixel-btn pixel-btn-teal text-xs px-4 py-2 font-silkscreen inline-flex items-center gap-2"
                    >
                      <span>🔍</span>
                      <span>SCAN GMAIL FOR WORKOUTS</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {parsedWorkouts.map((w) => (
                      <div
                        key={w.id}
                        className={`pixel-panel p-3 transition-all border ${
                          w.selected
                            ? 'border-[#38D9C4] bg-[#0E1B24]'
                            : 'border-[#1E2D3B] opacity-75 bg-[#090D11]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={w.selected}
                            onChange={() => handleToggleSelect(w.id)}
                            className="mt-1 cursor-pointer accent-[#38D9C4]"
                          />

                          <div className="flex-1 space-y-2">
                            {/* Card Top Info */}
                            <div className="flex flex-wrap justify-between items-center gap-2">
                              <div className="flex items-center gap-2">
                                <span className="bg-[#38D9C4] text-[#0E151B] font-pixel text-[10px] px-1.5 py-0.5">
                                  {w.source}
                                </span>
                                <input
                                  type="text"
                                  value={w.workoutTitle}
                                  onChange={(e) =>
                                    handleUpdateWorkoutField(w.id, 'workoutTitle', e.target.value)
                                  }
                                  className="pixel-input text-xs font-bold text-[#E0E8F0] px-2 py-0.5 flex-1 min-w-[200px]"
                                />
                              </div>
                              <span className="text-[11px] text-[#8A9EB2] font-mono">
                                Date: {w.date}
                              </span>
                            </div>

                            {/* Editable Metrics Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
                              <div className="bg-[#0B1015] p-1.5 border border-[#1E2D3B]">
                                <span className="text-[9px] text-[#8A9EB2] block font-silkscreen">
                                  DISTANCE (KM)
                                </span>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={w.distanceKm}
                                  onChange={(e) =>
                                    handleUpdateWorkoutField(w.id, 'distanceKm', e.target.value)
                                  }
                                  className="w-full bg-transparent text-[#38D9C4] font-bold outline-none"
                                />
                              </div>

                              <div className="bg-[#0B1015] p-1.5 border border-[#1E2D3B]">
                                <span className="text-[9px] text-[#8A9EB2] block font-silkscreen">
                                  TIME (MINS)
                                </span>
                                <input
                                  type="number"
                                  value={w.timeMins}
                                  onChange={(e) =>
                                    handleUpdateWorkoutField(w.id, 'timeMins', e.target.value)
                                  }
                                  className="w-full bg-transparent text-[#EBBF68] font-bold outline-none"
                                />
                              </div>

                              <div className="bg-[#0B1015] p-1.5 border border-[#1E2D3B]">
                                <span className="text-[9px] text-[#8A9EB2] block font-silkscreen">
                                  AVG PACE
                                </span>
                                <input
                                  type="text"
                                  value={w.avgPace}
                                  onChange={(e) =>
                                    handleUpdateWorkoutField(w.id, 'avgPace', e.target.value)
                                  }
                                  className="w-full bg-transparent text-[#38D9C4] font-bold outline-none"
                                />
                              </div>

                              <div className="bg-[#0B1015] p-1.5 border border-[#1E2D3B]">
                                <span className="text-[9px] text-[#8A9EB2] block font-silkscreen">
                                  AVG HR (BPM)
                                </span>
                                <input
                                  type="number"
                                  value={w.avgHr}
                                  onChange={(e) =>
                                    handleUpdateWorkoutField(w.id, 'avgHr', e.target.value)
                                  }
                                  className="w-full bg-transparent text-[#E2654B] font-bold outline-none"
                                />
                              </div>

                              <div className="bg-[#0B1015] p-1.5 border border-[#1E2D3B]">
                                <span className="text-[9px] text-[#8A9EB2] block font-silkscreen">
                                  MANA RPE (1-10)
                                </span>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={w.rpeMana}
                                  onChange={(e) =>
                                    handleUpdateWorkoutField(
                                      w.id,
                                      'rpeMana',
                                      parseInt(e.target.value, 10) || 7
                                    )
                                  }
                                  className="w-full bg-transparent text-[#C9973E] font-bold outline-none"
                                />
                              </div>
                            </div>

                            {/* Email snippet preview */}
                            <p className="text-[10px] text-[#6A7E90] italic truncate">
                              "{w.snippet}"
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <form onSubmit={handleParseRawEmail} className="space-y-3">
              <div>
                <label className="font-silkscreen text-[11px] text-[#C9973E] block mb-1">
                  WORKOUT TITLE / SUBJECT:
                </label>
                <input
                  type="text"
                  value={rawSubject}
                  onChange={(e) => setRawSubject(e.target.value)}
                  placeholder="e.g. Strava Morning 12km Run"
                  className="pixel-input w-full text-xs"
                />
              </div>

              <div>
                <label className="font-silkscreen text-[11px] text-[#38D9C4] block mb-1">
                  PASTE EMAIL BODY TEXT OR ACTIVITY LOG:
                </label>
                <textarea
                  value={rawEmailText}
                  onChange={(e) => setRawEmailText(e.target.value)}
                  rows={6}
                  placeholder={`Paste your email summary here, for example:
"Activity: Sunday Long Run
Distance: 15.2 km
Time: 1:12:30
Pace: 4:46 /km
Avg Heart Rate: 156 bpm
Notes: Felt strong in zone 2 aerobic state."`}
                  className="pixel-input w-full text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRawSubject('Strava Morning Tempo');
                    setRawEmailText('Distance: 12.0 km\nTime: 52:30\nAvg Pace: 4:22 /km\nHeart Rate: 164 bpm');
                  }}
                  className="pixel-btn text-xs px-3 py-1.5 text-[#8A9EB2]"
                >
                  Insert Sample Text
                </button>
                <button
                  type="submit"
                  className="pixel-btn pixel-btn-amber text-xs px-4 py-1.5 font-silkscreen"
                >
                  ⚡ TRANSMUTE &amp; PARSE EMAIL
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1E2D3B] bg-[#091117] flex flex-wrap justify-between items-center gap-3">
          <div className="text-xs text-[#8A9EB2]">
            Ready to log for:{' '}
            <span className="text-[#38D9C4] font-bold">{currentAthlete.name}</span> (
            <span className="text-[#EBBF68] font-bold">{selectedCount}</span> runs selected)
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="pixel-btn text-xs px-4 py-2 text-[#8A9EB2]"
            >
              CANCEL
            </button>
            <button
              onClick={handleImportSelected}
              disabled={selectedCount === 0}
              className={`pixel-btn text-xs px-5 py-2 font-silkscreen flex items-center gap-2 ${
                selectedCount > 0
                  ? 'pixel-btn-teal cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <span>📜</span>
              <span>IMPORT {selectedCount} RUNS TO CODEX</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
