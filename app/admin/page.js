import prisma from '@/lib/prisma.js';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth.js';
import { redirect } from 'next/navigation';
import { Users, PenTool, BookOpen, Heart, Activity, Brain, Lock, Globe, Trash2 } from 'lucide-react';
import { deleteQuote } from '../actions';

export const revalidate = 0; // Fetch fresh updates

async function getAdminUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sanctuary_session')?.value;
  if (!sessionToken) return null;
  const decoded = await decrypt(sessionToken);
  if (!decoded || !decoded.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    if (user && user.role === 'admin') {
      return user;
    }
  } catch (err) {
    console.error("Admin verification error", err);
  }
  return null;
}

export default async function AdminDashboardPage() {
  const admin = await getAdminUser();
  if (!admin) {
    redirect('/'); // Block non-admins
  }

  // Gather stats
  let usersCount = 0;
  let entriesCount = 0;
  let quotesCount = 0;
  let recentUsers = [];
  let recentEntries = [];
  let recentQuotes = [];

  try {
    usersCount = await prisma.user.count();
    entriesCount = await prisma.entry.count();
    quotesCount = await prisma.quote.count();

    recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { entries: true, quotes: true }
        }
      }
    });

    recentEntries = await prisma.entry.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    // Fetch all quotes (both public and private) for admin preview
    recentQuotes = await prisma.quote.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true }
        }
      }
    });
  } catch (error) {
    console.error("Failed to load admin stats", error);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex-grow w-full flex flex-col justify-start space-y-12">
      <div className="space-y-2 text-center sm:text-left">
        <span className="text-xs uppercase tracking-widest text-emerald-600/80 font-medium">Control Room</span>
        <h1 className="text-3xl font-serif text-stone-850">Admin Dashboard</h1>
        <p className="text-stone-400 text-sm font-light">Monitor application activity, users, and overall sanctuary interactions.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-md border border-white/40 shadow-md rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Total Members</span>
            <span className="text-3xl font-serif text-stone-800 block">{usersCount}</span>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-white/40 shadow-md rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Journal Entries</span>
            <span className="text-3xl font-serif text-stone-800 block">{entriesCount}</span>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl text-amber-600">
            <PenTool className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-white/40 shadow-md rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Bookshelf Quotes</span>
            <span className="text-3xl font-serif text-stone-800 block">{quotesCount}</span>
          </div>
          <div className="p-4 bg-peach-50 rounded-xl text-stone-550">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent users */}
        <div className="bg-white/70 backdrop-blur-md border border-white/40 shadow-lg rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="font-serif text-xl text-stone-800 border-b border-stone-100 pb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-stone-500" /> Recent Members
          </h3>
          <div className="divide-y divide-stone-100/60">
            {recentUsers.map((u) => (
              <div key={u.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-stone-700 block">{u.email}</span>
                  <span className="text-[10px] text-stone-400">Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-lg text-stone-500">
                    {u._count.entries} Logs
                  </span>
                  <span className="bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-lg text-stone-500">
                    {u._count.quotes} Quotes
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-semibold uppercase text-[9px] tracking-wider">
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent entries */}
        <div className="bg-white/70 backdrop-blur-md border border-white/40 shadow-lg rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="font-serif text-xl text-stone-800 border-b border-stone-100 pb-3 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-stone-500" /> Recent Logs
          </h3>
          <div className="divide-y divide-stone-100/60">
            {recentEntries.map((e) => (
              <div key={e.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-stone-600">{e.user.email}</span>
                  <span className="text-stone-400">{new Date(e.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-stone-550 text-xs italic line-clamp-2 leading-relaxed">
                  &ldquo;{e.content}&rdquo;
                </p>
                <div className="flex gap-4 pt-1">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> Physical: {e.physicalEnergy}/5
                  </span>
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5" /> Mental: {e.mentalEnergy}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bookshelf Management (Admin Overview) */}
      <div className="bg-white/70 backdrop-blur-md border border-white/40 shadow-lg rounded-3xl p-6 sm:p-8 space-y-6 w-full">
        <h3 className="font-serif text-xl text-stone-800 border-b border-stone-100 pb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-stone-500" /> Bookshelf Management
        </h3>
        {recentQuotes.length === 0 ? (
          <p className="text-xs text-stone-400">No quotes recorded in the library yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Source Book</th>
                  <th className="py-3 px-4">Quote Details</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-stone-50/40 transition-colors">
                    <td className="py-4 px-4 font-medium text-stone-700">{q.user.email}</td>
                    <td className="py-4 px-4 text-stone-500 font-serif italic">{q.bookTitle} by {q.author}</td>
                    <td className="py-4 px-4 text-stone-600 font-serif max-w-xs truncate">&ldquo;{q.quoteText}&rdquo;</td>
                    <td className="py-4 px-4">
                      {q.isPrivate ? (
                        <span className="inline-flex items-center gap-1 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-lg text-stone-400 font-semibold uppercase text-[9px] tracking-wider">
                          <Lock className="w-2.5 h-2.5" /> Private
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg text-emerald-700 font-semibold uppercase text-[9px] tracking-wider">
                          <Globe className="w-2.5 h-2.5" /> Public
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {!q.isPrivate ? (
                        <form action={deleteQuote} className="inline">
                          <input type="hidden" name="quoteId" value={q.id} />
                          <button 
                            type="submit"
                            className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-750 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium hover:shadow-sm"
                            title="Delete public quote"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Delete
                          </button>
                        </form>
                      ) : (
                        <span className="text-[10px] text-stone-400 font-light italic">Cannot delete private</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
