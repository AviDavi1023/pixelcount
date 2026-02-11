"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navigation() {
  const { data: session } = useSession();
  const [showNav, setShowNav] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav>
      <div>
        <Link href="/">
          PixelCount
        </Link>

        <div>
          <Link href="/gallery">Gallery</Link>
          {session ? (
            <>
              <Link href="/leaderboard">Leaderboard</Link>
              <Link href="/dashboard">Dashboard</Link>
              <div>
                <button onClick={() => setShowUserMenu(!showUserMenu)}>
                  <span>{session.user?.name || "User"}</span>
                </button>

                {showUserMenu && (
                  <div>
                    <button
                      onClick={() => {
                        signOut({ redirect: true, callbackUrl: "/" });
                        setShowUserMenu(false);
                      }}
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
              <Link href="/create">Create Timer</Link>
            </>
          )}
        </div>

        <button onClick={() => setShowNav(!showNav)}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {showNav && (
        <div>
          <Link href="/gallery">Gallery</Link>
          {session ? (
            <>
              <Link href="/leaderboard">Leaderboard</Link>
              <Link href="/dashboard">Dashboard</Link>
              <button
                onClick={() => {
                  signOut({ redirect: true, callbackUrl: "/" });
                  setShowNav(false);
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Sign In</Link>
              <Link href="/create">Create Timer</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

