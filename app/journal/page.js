import { saveJournalEntry } from '../actions';
import { Sparkles, Activity, BrainCircuit } from 'lucide-react';

const JOURNAL_PROMPTS = [
  "What is one thing that brought you quiet joy today?",
  "Describe the feeling of resting your physical body right now.",
  "Write down a prayer or thought of release for something out of your control.",
  "How did God show His grace to you in the small moments today?",
  "What does your soul need most in this very moment?"
];

export default function JournalPage() {
  // Select a random prompt on each render
  const selectedPrompt = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center w-full">
      <div className="mb-10 text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-emerald-600/80 font-medium">Daily Reflection</span>
        <h1 className="text-3xl font-serif text-stone-850">Gentle Journal</h1>
        <p className="text-stone-400 text-sm font-light">Let go of what is heavy. Write it down here.</p>
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_20px_50px_rgba(230,225,215,0.5)] rounded-3xl p-8 sm:p-10 transition-all duration-500 hover:-translate-y-0.5">
        <form action={saveJournalEntry} className="space-y-8">
          <input type="hidden" name="promptUsed" value={selectedPrompt} />

          {/* Inspirational Prompt Indicator */}
          <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-2xl p-4 flex gap-3 items-start">
            <Sparkles className="w-5 h-5 text-emerald-600/70 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700/70">Reflection Prompt</span>
              <p className="text-stone-600 text-sm font-serif italic">{selectedPrompt}</p>
            </div>
          </div>

          {/* Distraction-free textarea */}
          <div className="space-y-2">
            <label htmlFor="content" className="sr-only">Your thoughts</label>
            <textarea
              id="content"
              name="content"
              rows={8}
              required
              placeholder="Start typing your heart here..."
              className="w-full bg-transparent border-0 outline-none focus:ring-0 text-stone-700 placeholder-stone-300 font-serif text-lg leading-relaxed resize-none p-2 focus:placeholder-stone-200"
            />
          </div>

          <hr className="border-stone-100" />

          {/* Energy Rating Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Physical Energy */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-stone-500 uppercase">
                <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-stone-400" /> Physical Energy</span>
                <span className="text-emerald-600">Gentle</span>
              </div>
              <input
                type="range"
                name="physicalEnergy"
                min="1"
                max="5"
                defaultValue="3"
                className="w-full h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-stone-400 tracking-wide">
                <span>Exhausted</span>
                <span>Restored</span>
              </div>
            </div>

            {/* Mental Energy */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-stone-500 uppercase">
                <span className="flex items-center gap-1.5"><BrainCircuit className="w-4 h-4 text-stone-400" /> Mental Energy</span>
                <span className="text-emerald-600">Peaceful</span>
              </div>
              <input
                type="range"
                name="mentalEnergy"
                min="1"
                max="5"
                defaultValue="3"
                className="w-full h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-stone-400 tracking-wide">
                <span>Burnout</span>
                <span>Clear</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="bg-emerald-600/90 hover:bg-emerald-600 text-white font-medium text-sm px-6 py-3 rounded-xl transition-all duration-300 transform shadow-md shadow-emerald-600/10 hover:shadow-lg hover:shadow-emerald-600/20 hover:-translate-y-0.5 cursor-pointer"
            >
              Save to Sanctuary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
