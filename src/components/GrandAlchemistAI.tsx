import React, { useState } from 'react';
import { Athlete } from '../types';
import { PixelWizardIcon, PixelFlameIcon } from './PixelIcons';
import { playButtonClickSound } from '../utils/audioSynth';

interface GrandAlchemistAIProps {
  athletes: Athlete[];
  selectedAthleteId: string;
}

export const GrandAlchemistAI: React.FC<GrandAlchemistAIProps> = ({
  athletes,
  selectedAthleteId,
}) => {
  const [selectedAthleteForAI, setSelectedAthleteForAI] = useState<string>(selectedAthleteId);
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>(
    `Greetings, Alchemist Coach! I am Master Aurelius, Grand Alchemist of Sports Science.\n\nSelect an athlete profile and consult me regarding periodization, lactate threshold transmutations, ACWR injury prevention, or peak race preparations!`
  );

  const activeAthlete = athletes.find((a) => a.id === selectedAthleteForAI) || athletes[0];

  const presetQueries = [
    '📜 Draft a 4-week marathon peak periodization plan for this athlete.',
    '⚠️ My athlete has an ACWR spike above 1.45. How do I safely lower load without fitness loss?',
    '🧪 What is the exact alchemical interval recipe to boost VO2 Max for a 5K race?',
    '🔮 Explain the sports science of lactate threshold clearance and how to structure T-Pace workouts.',
  ];

  const handleAskAI = async (queryToUse?: string) => {
    const promptText = queryToUse || userQuery;
    if (!promptText.trim()) return;

    playButtonClickSound();
    setIsLoading(true);

    try {
      const response = await fetch('/api/alchemist-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          athleteContext: activeAthlete
            ? {
                name: activeAthlete.name,
                title: activeAthlete.title,
                vdot: activeAthlete.vdot,
                vo2Max: activeAthlete.vo2Max,
                acwr: activeAthlete.acwr,
                acute7dKm: activeAthlete.acute7dKm,
                chronic28dKm: activeAthlete.chronic28dKm,
                primaryDistance: activeAthlete.primaryDistance,
                pbs: activeAthlete.pbs,
              }
            : null,
          goal: `Sports Science Alchemy Coaching for ${activeAthlete ? activeAthlete.name : 'General Runner'}`,
        }),
      });

      const data = await response.json();
      if (data.text) {
        setAiResponse(data.text);
      } else {
        setAiResponse(data.error || 'The crucible failed to generate a response. Please check API Key configuration.');
      }
    } catch (err: any) {
      setAiResponse(`Alchemical Disruption: ${err.message || 'Server connection error.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="pixel-panel p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-silkscreen text-xs text-[#C9973E] uppercase tracking-wider">
            SECTION IV: GRAND ALCHEMIST SPORTS SCIENCE AI
          </span>
          <h2 className="font-pixel text-lg text-[#E0E8F0] mt-1 flex items-center gap-2">
            <PixelWizardIcon size={24} color="#38D9C4" />
            MASTER AURELIUS — GEMINI SPORTS SCIENCE AI
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-tech text-xs text-[#8A9EB2]">ATHLETE CONTEXT:</span>
          <select
            value={selectedAthleteForAI}
            onChange={(e) => setSelectedAthleteForAI(e.target.value)}
            className="pixel-input text-xs text-[#38D9C4]"
          >
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} (VDOT {a.vdot})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main JRPG Dialogue Box UI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dialogue Box Area (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="pixel-dialogue p-5 relative min-h-[360px] flex flex-col justify-between">
            {/* Header / Avatar */}
            <div className="flex items-center gap-3 border-b-2 border-[#C9973E] pb-3 mb-3">
              <div className="w-12 h-12 bg-[#1A1610] border-2 border-[#C9973E] flex items-center justify-center">
                <PixelWizardIcon size={32} color="#C9973E" />
              </div>

              <div>
                <h3 className="font-pixel text-sm text-[#EBBF68]">MASTER AURELIUS</h3>
                <span className="font-tech text-xs text-[#38D9C4]">Grand Sports Science Alchemist & Periodization Mystic</span>
              </div>
            </div>

            {/* AI Text Display with Retro Styling */}
            <div className="bg-[#0B1015] p-4 border border-[#263646] font-tech text-xs text-[#E0E8F0] leading-relaxed overflow-y-auto max-h-[380px] whitespace-pre-wrap">
              {isLoading ? (
                <div className="flex items-center justify-center gap-3 py-12 text-[#C9973E] font-pixel animate-pulse">
                  <PixelFlameIcon size={24} color="#C9973E" />
                  <span>CONSULTING THE ANCIENT SPORTS SCIENCE GRIMOIRE...</span>
                </div>
              ) : (
                aiResponse
              )}
            </div>

            {/* Input Bar */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Ask Master Aurelius anything about running, periodization, or physiology..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                className="pixel-input flex-1 text-xs"
              />
              <button
                onClick={() => handleAskAI()}
                disabled={isLoading || !userQuery.trim()}
                className="pixel-btn pixel-btn-teal text-xs px-4 py-2 flex items-center gap-2"
              >
                <span>CONSULT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Presets Side Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="pixel-panel p-4">
            <h3 className="font-silkscreen text-xs text-[#C9973E] mb-3 border-b border-[#2A3A4A] pb-2">
              ⚡ QUICK ALCHEMICAL PRESETS
            </h3>

            <div className="space-y-2">
              {presetQueries.map((pq, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setUserQuery(pq);
                    handleAskAI(pq);
                  }}
                  className="w-full text-left bg-[#0B1015] hover:bg-[#1A2633] border border-[#1E2D3B] hover:border-[#38D9C4] p-2.5 font-tech text-xs text-[#E0E8F0] transition-colors"
                >
                  {pq}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
