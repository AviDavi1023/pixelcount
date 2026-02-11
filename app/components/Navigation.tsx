"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navigation() {
  const { data: session } = useSession();
  const [showNav, setShowNav] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="border-b p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          PixelCount
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/gallery">Gallery</Link>
          {session ? (
            <>
              <Link href="/leaderboard">Leaderboard</Link>
              <Link href="/dashboard">Dashboard</Link>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2"
                >
                  <span>{session.user?.name || "User"}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 border bg-white shadow-lg">
                    <button
                      onClick={() => {
                        signOut({ redirect: true, callbackUrl: "/" });
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login">Sign In</Link>
              <Link href="/create" className="px-4 py-2 border">
                Create Timer
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setShowNav(!showNav)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {showNav && (
        <div className="md:hidden border-t mt-4 pt-4">
          <Link href="/gallery" className="block py-2">Gallery</Link>
          {session ? (
            <>
              <Link href="/leaderboard" className="block py-2">Leaderboard</Link>
              <Link href="/dashboard" className="block py-2">Dashboard</Link>
              <button
                onClick={() => {
                  signOut({ redirect: true, callbackUrl: "/" });
                  setShowNav(false);
                }}
                className="w-full text-left py-2"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2">Sign In</Link>
              <Link href="/create" className="block py-2 px-4 border">Create Timer</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

