"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Button from "./Button";

export default function Navigation() {
  const { data: session } = useSession();
  const [showNav, setShowNav] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-neon-cyan/20 bg-dark-bg/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo with Pixel Animation */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-neon-cyan rounded-sm animate-pulse-glow" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-neon-magenta rounded-sm animate-pulse-glow" style={{ animationDelay: '200ms' }}></div>
            <div className="w-2 h-2 bg-neon-purple rounded-sm animate-pulse-glow" style={{ animationDelay: '400ms' }}></div>
          </div>
          <span className="text-2xl font-display font-bold text-neon-cyan group-hover:glow-cyan transition-all">
            PixelCount
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/gallery" className="text-gray-300 hover:text-neon-cyan transition-all font-medium">
            Gallery
          </Link>
          {session ? (
            <>
              <Link href="/leaderboard" className="text-gray-300 hover:text-neon-cyan transition-all font-medium">
                Leaderboard
              </Link>
              <Link href="/dashboard" className="text-gray-300 hover:text-neon-cyan transition-all font-medium">
                Dashboard
              </Link>
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-lighter border border-transparent hover:border-neon-cyan/30 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-full flex items-center justify-center glow-cyan">
                    <span className="text-dark-bg text-sm font-bold">
                      {session.user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <span className="text-gray-300 text-sm font-medium">{session.user?.name || "User"}</span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-dark-lighter border border-neon-cyan/30 rounded-lg shadow-2xl glow-cyan py-2">
                    <button
                      onClick={() => {
                        signOut({ redirect: true, callbackUrl: "/" });
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-neon-magenta hover:bg-dark-card/50 transition-all font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-300 hover:text-neon-cyan transition-all font-medium">
                Sign In
              </Link>
              <Button href="/create" glow>
                Create Timer
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-dark-lighter border border-transparent hover:border-neon-cyan/30 rounded-lg transition-all"
          onClick={() => setShowNav(!showNav)}
        >
          <svg className="w-6 h-6 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {showNav && (
        <div className="md:hidden border-t border-neon-cyan/20 bg-dark-card/95 backdrop-blur-xl px-4 py-4 space-y-2">
          <Link href="/gallery" className="block px-4 py-2 text-gray-300 hover:text-neon-cyan hover:bg-dark-lighter border border-transparent hover:border-neon-cyan/30 rounded-lg transition-all">
            Gallery
          </Link>
          {session ? (
            <>
              <Link href="/leaderboard" className="block px-4 py-2 text-gray-300 hover:text-neon-cyan hover:bg-dark-lighter border border-transparent hover:border-neon-cyan/30 rounded-lg transition-all">
                Leaderboard
              </Link>
              <Link href="/dashboard" className="block px-4 py-2 text-gray-300 hover:text-neon-cyan hover:bg-dark-lighter border border-transparent hover:border-neon-cyan/30 rounded-lg transition-all">
                Dashboard
              </Link>
              <button
                onClick={() => {
                  signOut({ redirect: true, callbackUrl: "/" });
                  setShowNav(false);
                }}
                className="w-full text-left px-4 py-2 text-neon-magenta hover:bg-dark-lighter/50 border border-transparent hover:border-neon-magenta/30 rounded-lg transition-all font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block px-4 py-2 text-gray-300 hover:text-neon-cyan hover:bg-dark-lighter border border-transparent hover:border-neon-cyan/30 rounded-lg transition-all">
                Sign In
              </Link>
              <Button href="/create" className="w-full" glow>
                Create Timer
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
