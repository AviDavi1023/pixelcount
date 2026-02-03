"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navigation() {
  const { data: session } = useSession();
  const [showNav, setShowNav] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:opacity-80 transition">
          PixelCount
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/gallery" className="text-slate-300 hover:text-white transition font-medium">
            Gallery
          </Link>
          {session ? (
            <>
              <Link href="/leaderboard" className="text-slate-300 hover:text-white transition font-medium">
                Leaderboard
              </Link>
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition font-medium">
                Dashboard
              </Link>
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {session.user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <span className="text-slate-300 text-sm">{session.user?.name || "User"}</span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2">
                    <button
                      onClick={() => {
                        signOut({ redirect: true, callbackUrl: "/" });
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700/50 transition"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-300 hover:text-white transition font-medium">
                Sign In
              </Link>
              <Link href="/create" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-medium">
                Create Timer
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition"
          onClick={() => setShowNav(!showNav)}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {showNav && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur px-4 py-4 space-y-2">
          <Link href="/gallery" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition">
            Gallery
          </Link>
          {session ? (
            <>
              <Link href="/leaderboard" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition">
                Leaderboard
              </Link>
              <Link href="/dashboard" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition">
                Dashboard
              </Link>
              <button
                onClick={() => {
                  signOut({ redirect: true, callbackUrl: "/" });
                  setShowNav(false);
                }}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700/50 rounded-lg transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition">
                Sign In
              </Link>
              <Link href="/create" className="block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-center font-medium">
                Create Timer
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
