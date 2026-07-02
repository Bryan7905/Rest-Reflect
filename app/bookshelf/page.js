import prisma from '@/lib/prisma.js';
import { saveQuote, deleteQuote } from '../actions';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth.js';
import { BookOpen, Quote as QuoteIcon, Feather, Plus, Globe, Lock, Trash2 } from 'lucide-react';
import { redirect } from 'next/navigation';

export const revalidate = 0; // Fetch fresh updates

async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sanctuary_session')?.value;
  if (!sessionToken) return null;
  const decoded = await decrypt(sessionToken);
  if (!decoded || !decoded.userId) return null;
  return decoded;
}

export default async function BookshelfPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect('/login');
  }

  let quotes = [];
  try {
    quotes = await prisma.quote.findMany({
      where: {
        OR: [
          { isPrivate: false },
          { 
            AND: [
              { isPrivate: true },
              { userId: session.userId }
            ]
          }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Failed to retrieve bookshelf quotes", error);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 flex-grow w-full flex flex-col justify-start">
      {/* Header and Trigger for Adding */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6 text-center sm:text-left">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-amber-600/80 font-medium">Encouraging Library</span>
          <h1 className="text-3xl font-serif text-stone-850">Quiet Bookshelf</h1>
          <p className="text-stone-400 text-sm font-light">
            A collective space of encouragements. Quotes marked as public are shared with other sanctuary members.
          </p>
        </div>
        
        <a 
          href="#add-quote-modal"
          className="bg-amber-700/80 hover:bg-amber-700 text-white font-medium text-xs tracking-wider uppercase px-5 py-3.5 rounded-xl shadow-md shadow-amber-700/10 hover:shadow-lg hover:shadow-amber-700/20 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Favorite Quote
        </a>
      </div>

      {/* Index Cards Grid Layout */}
      {quotes.length === 0 ? (
        <div className="text-center py-20 bg-white/40 border border-white/20 dark:bg-zinc-800/20 dark:border-zinc-800/40 rounded-3xl backdrop-blur-sm max-w-lg mx-auto w-full">
          <BookOpen className="w-12 h-12 text-stone-300 dark:text-zinc-600 mx-auto mb-4" strokeWidth={1} />
          <p className="text-stone-550 dark:text-zinc-200 font-serif italic text-lg">Your bookshelf is empty.</p>
          <p className="text-stone-400 dark:text-zinc-400 text-xs mt-1">Add a quote above to begin filling your library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quotes.map((q) => (
            <div 
              key={q.id} 
              className="bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_15px_40px_rgba(230,225,215,0.5)] hover:shadow-[0_20px_45px_rgba(220,215,200,0.6)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between transform transition-all duration-500 hover:-translate-y-1 group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <QuoteIcon className="w-6 h-6 text-amber-500/30 group-hover:text-amber-500/50 transition-colors" />
                  <div className="flex items-center gap-3">
                    {q.isPrivate ? (
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-stone-400 flex items-center gap-1 bg-stone-50/50 border border-stone-100/50 px-2 py-0.5 rounded-lg">
                        <Lock className="w-2.5 h-2.5" /> Private
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50/50 border border-emerald-100/50 px-2 py-0.5 rounded-lg">
                        <Globe className="w-2.5 h-2.5" /> Public
                      </span>
                    )}

                    {/* Show delete trash button ONLY if the quote belongs to the active user */}
                    {q.userId === session.userId && (
                      <form action={deleteQuote} className="inline">
                        <input type="hidden" name="quoteId" value={q.id} />
                        <button 
                          type="submit" 
                          className="text-stone-300 hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete quote"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
                <p className="font-serif text-stone-700 leading-relaxed text-sm sm:text-base italic">
                  &ldquo;{q.quoteText}&rdquo;
                </p>
              </div>
              
              <div className="mt-6 pt-6 border-t border-stone-100/60 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-semibold text-stone-600 uppercase tracking-widest">
                      {q.author}
                    </span>
                    <span className="block text-[10px] text-stone-400 font-serif italic">
                      {q.bookTitle}
                    </span>
                  </div>
                  <Feather className="w-4 h-4 text-stone-300" />
                </div>
                {q.personalNote && (
                  <p className="text-xs text-stone-500 font-light bg-stone-50/50 rounded-lg p-2.5 border border-stone-100/40">
                    <span className="font-semibold block text-[9px] uppercase tracking-wider text-stone-400 mb-0.5">Reflection</span>
                    {q.personalNote}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Fully styled utilizing pure CSS target routing for weightlessness */}
      <div 
        id="add-quote-modal" 
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none opacity-0 target:opacity-100 target:pointer-events-auto transition-opacity duration-300"
      >
        <div className="bg-white/95 border border-white/50 shadow-[0_25px_60px_rgba(0,0,0,0.15)] rounded-3xl w-full max-w-lg p-8 m-6 relative">
          <a 
            href="#" 
            className="absolute top-6 right-6 text-stone-400 hover:text-stone-700 text-lg font-medium transition-colors"
          >
            &times;
          </a>
          
          <h3 className="font-serif text-xl text-stone-850 mb-2">Record Encouragement</h3>
          <p className="text-stone-400 text-xs mb-6 font-light">Add faith-based quotes or encouragement that spoke to you.</p>

          <form action={saveQuote} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="bookTitle" className="block text-xs font-semibold uppercase tracking-wider text-stone-500">Book Title</label>
              <input
                type="text"
                id="bookTitle"
                name="bookTitle"
                required
                placeholder="e.g. Quiet Moments"
                className="w-full bg-stone-50 border border-stone-150 rounded-xl px-4 py-2.5 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="author" className="block text-xs font-semibold uppercase tracking-wider text-stone-500">Author</label>
              <input
                type="text"
                id="author"
                name="author"
                defaultValue="Joena San Diego"
                placeholder="Joena San Diego"
                className="w-full bg-stone-50 border border-stone-150 rounded-xl px-4 py-2.5 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="quoteText" className="block text-xs font-semibold uppercase tracking-wider text-stone-500">Quote Text</label>
              <textarea
                id="quoteText"
                name="quoteText"
                required
                rows={4}
                placeholder="Enter the quote text..."
                className="w-full bg-stone-50 border border-stone-150 rounded-xl px-4 py-2.5 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-amber-500/50 transition-colors resize-none font-serif italic"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="personalNote" className="block text-xs font-semibold uppercase tracking-wider text-stone-500">Personal Note (Optional)</label>
              <textarea
                id="personalNote"
                name="personalNote"
                rows={2}
                placeholder="How did this quote make you feel?"
                className="w-full bg-stone-50 border border-stone-150 rounded-xl px-4 py-2.5 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Visibility Settings</span>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                  <input type="radio" name="isPrivate" value="true" defaultChecked className="accent-amber-700" />
                  <span>Private (Only you can view it)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                  <input type="radio" name="isPrivate" value="false" className="accent-amber-700" />
                  <span>Public (Shared with others)</span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <a
                href="#"
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-500 hover:bg-stone-50 transition-all text-center"
              >
                Cancel
              </a>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-700/80 hover:bg-amber-700 text-white text-xs font-medium tracking-wider uppercase shadow-md shadow-amber-700/10 hover:shadow-lg transition-all text-center cursor-pointer"
              >
                Add Quote
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
