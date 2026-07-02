import prisma from '@/lib/prisma.js';
import Link from 'next/link';
import { Heart, Compass, PenTool, BookOpen } from 'lucide-react';

export const revalidate = 86400; // Cache quote for 24 hours (86400 seconds) so it changes daily

export default async function Home() {
  let selectedQuote = {
    quoteText: "Rest is not a waste of time. It is an act of trust.",
    author: "Joena San Diego",
    bookTitle: "Quiet Moments"
  };

  try {
    // Fetch a random quote from the Prayush Adhikari Quotes API
    const response = await fetch('https://quotesapi.prayushadhikari.com.np/api/quotes/random?limit=1', {
      next: { revalidate: 86400 } // Fetch cache parameters verification
    });

    if (response.ok) {
      const data = await response.json();
      // Inspect payload array mapping structure
      if (Array.isArray(data) && data.length > 0) {
        selectedQuote = {
          quoteText: data[0].quote || data[0].text || data[0].quoteText,
          author: data[0].author || "Unknown",
          bookTitle: data[0].book || "Literature Library"
        };
      } else if (data && data.quote) {
        selectedQuote = {
          quoteText: data.quote,
          author: data.author || "Unknown",
          bookTitle: data.book || "Literature Library"
        };
      }
    }
  } catch (error) {
    console.error("Failed to load quote from Prayush Adhikari API, trying DB fallback...", error);
    
    // DB Fallback
    try {
      const user = await prisma.user.findFirst({
        where: { email: 'gf@sanctuary.com' }
      });

      if (user) {
        const quotes = await prisma.quote.findMany({
          where: { userId: user.id }
        });

        if (quotes.length > 0) {
          const randomIndex = Math.floor(Math.random() * quotes.length);
          selectedQuote = {
            quoteText: quotes[randomIndex].quoteText,
            author: quotes[randomIndex].author,
            bookTitle: quotes[randomIndex].bookTitle
          };
        }
      }
    } catch (dbError) {
      console.error("Fallback quote retrieve failed", dbError);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center flex-1">
      {/* Peace Greeting Header */}
      <div className="text-center mb-16 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-serif text-stone-800 tracking-wide">
          Welcome back to your quiet space.
        </h1>
        <p className="text-stone-500 max-w-md mx-auto text-sm sm:text-base font-light">
          Take a deep breath. This is a sanctuary built just for you, to rest, reflect, and gather strength.
        </p>
      </div>

      {/* Centerpiece Quote Card */}
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_20px_50px_rgba(230,225,215,0.6)] rounded-3xl p-8 sm:p-12 mb-16 transform transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(230,225,215,0.7)] group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
          <Heart className="w-16 h-16 text-emerald-600" strokeWidth={1} />
        </div>
        
        <blockquote className="space-y-6">
          <p className="font-serif text-stone-700 text-xl sm:text-2xl leading-relaxed text-center italic">
            &ldquo;{selectedQuote.quoteText}&rdquo;
          </p>
          <footer className="text-center">
            <cite className="not-italic block text-sm font-medium text-stone-500 uppercase tracking-widest">
              — {selectedQuote.author}
            </cite>
            {selectedQuote.bookTitle && (
              <span className="text-xs text-stone-400 font-serif italic mt-1 block">
                from {selectedQuote.bookTitle}
              </span>
            )}
          </footer>
        </blockquote>
      </div>

      {/* Core Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl">
        <Link href="/journal" className="group">
          <div className="h-full bg-white/50 backdrop-blur-sm hover:bg-white/80 border border-white/40 hover:border-emerald-100/50 shadow-[0_15px_35px_rgba(230,225,215,0.4)] rounded-2xl p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(220,215,205,0.5)] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl w-fit text-emerald-600/80 group-hover:scale-110 transition-transform">
                <PenTool className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg text-stone-800">Gentle Journal</h3>
              <p className="text-stone-500 text-sm font-light leading-relaxed">
                Release your thoughts. Note down your physical and mental energy levels without judgment.
              </p>
            </div>
            <div className="text-xs font-semibold tracking-wider text-emerald-600/80 uppercase group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Begin Writing &rarr;
            </div>
          </div>
        </Link>

        <Link href="/bookshelf" className="group">
          <div className="h-full bg-white/50 backdrop-blur-sm hover:bg-white/80 border border-white/40 hover:border-amber-100/50 shadow-[0_15px_35px_rgba(230,225,215,0.4)] rounded-2xl p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(220,215,205,0.5)] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl w-fit text-amber-600/80 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg text-stone-800">Quiet Bookshelf</h3>
              <p className="text-stone-500 text-sm font-light leading-relaxed">
                Gather encouraging, faith-based quotes. A collection of beautiful thoughts to return to.
              </p>
            </div>
            <div className="text-xs font-semibold tracking-wider text-amber-600/80 uppercase group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Browse Books &rarr;
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
