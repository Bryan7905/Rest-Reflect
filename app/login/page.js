'use client';

import { loginAction } from '../actions';
import { useActionState } from 'react';
import { Heart, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <div className="max-w-md mx-auto px-6 py-20 flex-1 flex flex-col justify-center w-full">
      <div className="text-center mb-10 space-y-3 animate-fade-in">
        <div className="mx-auto w-12 h-12 bg-white/70 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/40 shadow-sm text-emerald-600/80 mb-4">
          <Heart className="w-6 h-6 animate-pulse" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-serif text-stone-850">Enter the Sanctuary</h1>
        <p className="text-stone-400 text-sm font-light">
          A soft, quiet space built for healing and peace.
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_20px_50px_rgba(230,225,215,0.6)] rounded-3xl p-8 sm:p-10 transition-all duration-500 hover:-translate-y-0.5">
        
        {/* Error Alert Display */}
        {state?.error && (
          <div className="mb-6 p-4 bg-red-50/60 border border-red-100/50 rounded-2xl flex gap-3 items-start text-red-800 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-red-650 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="font-medium leading-relaxed">{state.error}</p>
          </div>
        )}

        <form action={action} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
              Your Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="e.g. yourname@domain.com"
              className="w-full bg-stone-50 border border-stone-150 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
              Your Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="Enter your password"
              className="w-full bg-stone-50 border border-stone-150 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-emerald-600/90 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium text-sm py-3.5 rounded-xl transition-all duration-300 transform shadow-md shadow-emerald-600/10 hover:shadow-lg hover:shadow-emerald-600/20 hover:-translate-y-0.5 cursor-pointer text-center"
          >
            {pending ? 'Entering...' : 'Enter Quiet Space'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-xs text-stone-400">Don't have an account? </span>
          <a href="/register" className="text-xs text-emerald-600 font-semibold hover:underline">
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
