import prisma from '@/lib/prisma.js';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth.js';
import { redirect } from 'next/navigation';
import { Activity, BrainCircuit, Calendar, PenTool, Sparkles } from 'lucide-react';

export const revalidate = 0; // Fetch fresh updates

async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sanctuary_session')?.value;
  if (!sessionToken) return null;
  const decoded = await decrypt(sessionToken);
  if (!decoded || !decoded.userId) return null;
  return decoded;
}

export default async function JournalHistoryPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect('/login');
  }

  let entries = [];
  try {
    entries = await prisma.entry.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Failed to load journal entries", error);
  }

  // Calculate average energies to show overall progress
  const totalEntries = entries.length;
  const avgPhysical = totalEntries 
    ? (entries.reduce((sum, e) => sum + e.physicalEnergy, 0) / totalEntries).toFixed(1) 
    : 0;
  const avgMental = totalEntries 
    ? (entries.reduce((sum, e) => sum + e.mentalEnergy, 0) / totalEntries).toFixed(1) 
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex-grow w-full flex flex-col justify-start">
      {/* Header and Summary stats */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 text-center md:text-left">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-emerald-600/80 font-medium">Reflections History</span>
          <h1 className="text-3xl font-serif text-stone-850">Your Journal Journey</h1>
          <p className="text-stone-400 text-sm font-light">Look back on where you were, and appreciate how far you've come.</p>
        </div>

        {/* Stats Panel */}
        {totalEntries > 0 && (
          <div className="flex gap-6 bg-white/60 backdrop-blur-md border border-white/40 shadow-md rounded-2xl p-4 sm:p-5">
            <div className="text-center px-4">
              <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">Total Entries</span>
              <span className="text-2xl font-serif text-stone-800 dark:text-zinc-100">{totalEntries}</span>
            </div>
            <div className="w-[1px] bg-stone-200/60 dark:bg-zinc-800" />
            <div className="text-center px-4">
              <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">Avg Physical</span>
              <span className="text-2xl font-serif text-emerald-600 dark:text-emerald-400">{avgPhysical} <span className="text-xs text-stone-400 dark:text-zinc-500">/ 5</span></span>
            </div>
            <div className="w-[1px] bg-stone-200/60 dark:bg-zinc-800" />
            <div className="text-center px-4">
              <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">Avg Mental</span>
              <span className="text-2xl font-serif text-emerald-600 dark:text-emerald-400">{avgMental} <span className="text-xs text-stone-400 dark:text-zinc-500">/ 5</span></span>
            </div>
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20 bg-white/40 border border-white/20 rounded-3xl backdrop-blur-sm max-w-lg mx-auto w-full">
          <PenTool className="w-12 h-12 text-stone-300 mx-auto mb-4" strokeWidth={1} />
          <p className="text-stone-500 font-serif italic text-lg">Your journal is quiet.</p>
          <p className="text-stone-400 text-xs mt-1">Write your first reflection to start tracking your energy.</p>
          <a
            href="/journal"
            className="inline-block mt-6 bg-emerald-600/95 hover:bg-emerald-600 text-white font-medium text-xs tracking-wider uppercase px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer"
          >
            Start Journaling
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {entries.map((entry) => {
            const formattedDate = new Date(entry.createdAt).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <div 
                key={entry.id}
                className="bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_15px_40px_rgba(230,225,215,0.4)] hover:shadow-[0_20px_45px_rgba(220,215,200,0.5)] rounded-3xl p-6 sm:p-8 transform transition-all duration-500 hover:-translate-y-0.5"
              >
                {/* Date & Prompt Metadata */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 pb-4 border-b border-stone-100/60">
                  <div className="flex items-center gap-2 text-stone-400 text-xs font-light">
                    <Calendar className="w-4 h-4" />
                    <span>{formattedDate}</span>
                  </div>
                  {entry.promptUsed && (
                    <div className="flex items-center gap-1.5 bg-emerald-50/50 border border-emerald-100/40 rounded-xl px-3 py-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600/70" strokeWidth={1.5} />
                      <span className="text-[10px] text-stone-550 italic font-serif leading-none">
                        &ldquo;{entry.promptUsed}&rdquo;
                      </span>
                    </div>
                  )}
                </div>

                {/* Journal Content */}
                <p className="font-serif text-stone-700 text-base sm:text-lg leading-relaxed whitespace-pre-line mb-6">
                  {entry.content}
                </p>

                {/* Energy Indicator Metrics */}
                <div className="flex flex-wrap gap-6 pt-4 border-t border-stone-100/60">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-stone-400" />
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Physical:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div 
                          key={star} 
                          className={`w-2.5 h-2.5 rounded-full ${star <= entry.physicalEnergy ? 'bg-emerald-500' : 'bg-stone-250'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-stone-400" />
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Mental:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div 
                          key={star} 
                          className={`w-2.5 h-2.5 rounded-full ${star <= entry.mentalEnergy ? 'bg-emerald-500' : 'bg-stone-250'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
