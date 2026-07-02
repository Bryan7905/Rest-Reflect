import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from 'next/headers';
import { logoutAction } from './actions';
import { LogOut, Menu, X } from 'lucide-react';
import { decrypt } from '@/lib/auth.js';
import prisma from '@/lib/prisma.js';
import DarkModeToggle from './components/DarkModeToggle';

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
      <head>
        {/* Simple inline script to prevent dark mode layout flash on load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('sanctuary_theme') === 'dark' || 
                    (!localStorage.getItem('sanctuary_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-100 selection:text-amber-900 bg-background text-foreground">
        {/* Anti-Gravity Floating Energy Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[80vw] sm:w-[50vw] h-[80vw] sm:h-[50vw] rounded-full bg-radial from-amber-100/30 to-transparent blur-[80px] sm:blur-[120px] pointer-events-none -z-10 animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[90vw] sm:w-[60vw] h-[90vw] sm:h-[60vw] rounded-full bg-radial from-emerald-50/20 to-transparent blur-[100px] sm:blur-[150px] pointer-events-none -z-10 animate-pulse duration-[10000ms]" />
        
        {/* Responsive Navigation Bar */}
        <header className="w-full max-w-6xl mx-auto px-6 py-6 sm:py-8 flex justify-between items-center z-20">
          <a href="/" className="font-serif text-xl font-medium tracking-wide text-stone-700/80 hover:text-stone-800 transition-colors">
            Sanctuary
          </a>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden sm:flex items-center gap-6">
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

            {/* Dark Mode button triggers dynamically inside the main header row */}
            <DarkModeToggle />

            {/* Mobile Navigation Trigger using CSS state parameters targets */}
            <a 
              href="#mobile-menu" 
              className="sm:hidden p-2.5 rounded-xl bg-white/40 border border-white/20 text-stone-500 hover:text-stone-800 transition-colors"
              title="Open menu"
            >
              <Menu className="w-4 h-4" />
            </a>
          </div>
        </header>

        {/* Pure CSS Mobile Navigation Menu overlay */}
        <div 
          id="mobile-menu" 
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 pointer-events-none opacity-0 target:opacity-100 target:pointer-events-auto transition-opacity duration-300 sm:hidden"
        >
          <div className="bg-background border-b border-white/10 w-full p-6 space-y-6 shadow-xl relative animate-slide-down">
            <div className="flex justify-between items-center">
              <span className="font-serif text-lg text-stone-700">Sanctuary Menu</span>
              <a href="#" className="p-2.5 rounded-xl bg-white/10 text-stone-500 hover:text-stone-800" title="Close menu">
                <X className="w-4 h-4" />
              </a>
            </div>

            <nav className="flex flex-col gap-4 py-4">
              {isLoggedIn ? (
                <>
                  <a href="/journal" className="text-base font-medium text-stone-600 hover:text-stone-800 py-2 border-b border-stone-100 dark:border-zinc-800">
                    Write Journal
                  </a>
                  <a href="/journal/history" className="text-base font-medium text-stone-600 hover:text-stone-800 py-2 border-b border-stone-100 dark:border-zinc-800">
                    Journal History
                  </a>
                  <a href="/bookshelf" className="text-base font-medium text-stone-600 hover:text-stone-800 py-2 border-b border-stone-100 dark:border-zinc-800">
                    Encouraging Bookshelf
                  </a>
                  {isAdmin && (
                    <a href="/admin" className="text-base font-semibold text-emerald-600 hover:text-emerald-700 py-2 border-b border-stone-100 dark:border-zinc-800">
                      Admin Control Room
                    </a>
                  )}
                  <form action={logoutAction} className="pt-2">
                    <button type="submit" className="text-base font-medium text-red-550 flex items-center gap-2 cursor-pointer py-2">
                      <LogOut className="w-4 h-4" /> Logout from Sanctuary
                    </button>
                  </form>
                </>
              ) : (
                <a href="/login" className="text-base font-medium text-stone-600 hover:text-stone-800 py-2">
                  Login
                </a>
              )}
            </nav>
          </div>
        </div>

        <main className="flex-grow flex flex-col z-10 px-4 sm:px-6">
          {children}
        </main>
        
        <footer className="w-full text-center py-12 text-xs tracking-widest text-stone-400 font-light z-10">
          HEAL • REST • REFLECT
        </footer>
      </body>
    </html>
  );
}
