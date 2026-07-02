import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from 'next/headers';
import { logoutAction } from './actions';
import { LogOut } from 'lucide-react';
import { decrypt } from '@/lib/auth.js';
import prisma from '@/lib/prisma.js';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Digital Sanctuary | Rest & Reflect",
  description: "A weightless, peaceful place for reflection, encouragement, and healing.",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sanctuary_session')?.value;
  
  let isLoggedIn = false;
  let isAdmin = false;

  if (sessionToken) {
    const decoded = await decrypt(sessionToken);
    if (decoded && decoded.userId) {
      isLoggedIn = true;
      try {
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (user && user.role === 'admin') {
          isAdmin = true;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-100 selection:text-amber-900">
        {/* Anti-Gravity Floating Energy Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-radial from-amber-100/30 to-transparent blur-[120px] pointer-events-none -z-10 animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-radial from-emerald-50/20 to-transparent blur-[150px] pointer-events-none -z-10 animate-pulse duration-[10000ms]" />
        <div className="absolute top-[30%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-radial from-peach-100/10 to-transparent blur-[120px] pointer-events-none -z-10 animate-pulse duration-[12000ms]" />
        
        {/* Navigation Bar */}
        <header className="w-full max-w-6xl mx-auto px-6 py-8 flex justify-between items-center z-10">
          <a href="/" className="font-serif text-xl font-medium tracking-wide text-stone-700/80 hover:text-stone-800 transition-colors">
            Sanctuary
          </a>
          <nav className="flex items-center gap-6">
            {isLoggedIn ? (
              <>
                <a href="/journal" className="text-sm font-medium text-stone-500/80 hover:text-stone-800 transition-colors">
                  Write
                </a>
                <a href="/journal/history" className="text-sm font-medium text-stone-500/80 hover:text-stone-800 transition-colors">
                  History
                </a>
                <a href="/bookshelf" className="text-sm font-medium text-stone-500/80 hover:text-stone-800 transition-colors">
                  Bookshelf
                </a>
                {isAdmin && (
                  <a href="/admin" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                    Admin
                  </a>
                )}
                <form action={logoutAction} className="inline">
                  <button type="submit" className="text-sm font-medium text-stone-400 hover:text-red-550 transition-colors flex items-center gap-1 cursor-pointer">
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <a href="/login" className="text-sm font-medium text-stone-500/80 hover:text-stone-800 transition-colors">
                Login
              </a>
            )}
          </nav>
        </header>

        <main className="flex-grow flex flex-col z-10">
          {children}
        </main>
        
        <footer className="w-full text-center py-12 text-xs tracking-widest text-stone-400 font-light z-10">
          HEAL • REST • REFLECT
        </footer>
      </body>
    </html>
  );
}
