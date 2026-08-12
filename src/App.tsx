import React, { useState } from 'react';
import { TabType, Athlete, BrewedWorkout, LoggedWorkout } from './types';
import { INITIAL_ATHLETES, INITIAL_BREWED_WORKOUTS, INITIAL_LOGGED_WORKOUTS } from './data/initialData';
import { AlchemicalHeader } from './components/AlchemicalHeader';
import { CrucibleCrafting } from './components/CrucibleCrafting';
import { AthletesRoster } from './components/AthletesRoster';
import { FormulaCalculator } from './components/FormulaCalculator';
import { GrandAlchemistAI } from './components/GrandAlchemistAI';
import { GrimoireLogbook } from './components/GrimoireLogbook';
import { CelestialLogo } from './components/CelestialLogo';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('crucible');
  const [athletes, setAthletes] = useState<Athlete[]>(INITIAL_ATHLETES);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(INITIAL_ATHLETES[0].id);
  const [brewedWorkouts, setBrewedWorkouts] = useState<BrewedWorkout[]>(INITIAL_BREWED_WORKOUTS);
  const [loggedWorkouts, setLoggedWorkouts] = useState<LoggedWorkout[]>(INITIAL_LOGGED_WORKOUTS);
  const [scanlinesOn, setScanlinesOn] = useState(true);

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];

  const handleAddAthlete = (newAthlete: Athlete) => {
    setAthletes((prev) => [newAthlete, ...prev]);
  };

  const handleUpdateAthlete = (updated: Athlete) => {
    setAthletes((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleSaveBrewedWorkout = (workout: BrewedWorkout) => {
    setBrewedWorkouts((prev) => [workout, ...prev]);

    // Update athlete's acute workload km
    if (workout.athleteId) {
      setAthletes((prev) =>
        prev.map((a) => {
          if (a.id === workout.athleteId) {
            const newAcute = a.acute7dKm + workout.totalDistanceKm;
            return {
              ...a,
              acute7dKm: newAcute,
              exp: Math.min(a.maxExp, a.exp + 150),
            };
          }
          return a;
        })
      );
    }
  };

  const handleAddLoggedWorkout = (log: LoggedWorkout) => {
    setLoggedWorkouts((prev) => [log, ...prev]);

    // Give EXP to athlete
    if (log.athleteId) {
      setAthletes((prev) =>
        prev.map((a) => {
          if (a.id === log.athleteId) {
            const expGained = Math.round(log.distanceKm * 25);
            let newExp = a.exp + expGained;
            let newLevel = a.level;
            let maxExp = a.maxExp;

            if (newExp >= maxExp) {
              newLevel += 1;
              newExp -= maxExp;
              maxExp = Math.round(maxExp * 1.2);
            }

            return {
              ...a,
              level: newLevel,
              exp: newExp,
              maxExp,
              acute7dKm: a.acute7dKm + log.distanceKm,
            };
          }
          return a;
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0E151B] text-[#E0E8F0] relative flex flex-col font-tech dither-bg">
      {/* Optional CRT Scanlines Effect */}
      {scanlinesOn && <div className="fixed inset-0 scanlines z-30 pointer-events-none opacity-40" />}

      {/* Alchemical Top Navigation Header */}
      <AlchemicalHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedAthleteName={selectedAthlete?.name}
      />

      {/* Main Body Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 z-10 space-y-6">
        {activeTab === 'crucible' && (
          <CrucibleCrafting
            athletes={athletes}
            selectedAthleteId={selectedAthleteId}
            onSelectAthlete={setSelectedAthleteId}
            onSaveBrewedWorkout={handleSaveBrewedWorkout}
          />
        )}

        {activeTab === 'roster' && (
          <AthletesRoster
            athletes={athletes}
            selectedAthleteId={selectedAthleteId}
            onSelectAthlete={setSelectedAthleteId}
            onAddAthlete={handleAddAthlete}
            onUpdateAthlete={handleUpdateAthlete}
          />
        )}

        {activeTab === 'calculator' && <FormulaCalculator />}

        {activeTab === 'coach_ai' && (
          <GrandAlchemistAI
            athletes={athletes}
            selectedAthleteId={selectedAthleteId}
          />
        )}

        {activeTab === 'grimoire' && (
          <GrimoireLogbook
            athletes={athletes}
            brewedWorkouts={brewedWorkouts}
            loggedWorkouts={loggedWorkouts}
            onAddLoggedWorkout={handleAddLoggedWorkout}
          />
        )}
      </main>

      {/* Retro Pixel Footer */}
      <footer className="bg-[#101923] border-t-4 border-[#070B0E] py-4 px-4 mt-auto relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#8A9EB2] font-tech">
          <div className="flex items-center gap-2">
            <CelestialLogo size={24} />
            <span className="font-silkscreen text-[#C9973E]">THE ALCHEMIST LAB © 2026</span>
            <span className="hidden sm:inline text-[#2A3A4A]">|</span>
            <span className="hidden sm:inline">32-Bit Sports Science Transmutation Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setScanlinesOn(!scanlinesOn)}
              className="hover:text-[#38D9C4] underline"
            >
              CRT SCANLINES: {scanlinesOn ? 'ON' : 'OFF'}
            </button>
            <span>PRESS START TO TRANSMUTE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
