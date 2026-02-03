'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/app/components/Navigation';

interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  createdAt: string;
  timers: any[];
  timerCount: number;
  likeCount: number;
}

export default function UserProfile() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/user/${username}`);
        if (!response.ok) {
          throw new Error('User not found');
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-slate-400">Loading...</div>
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-400 mb-4">User not found</p>
            <Link href="/gallery" className="text-purple-400 hover:text-purple-300">
              Back to Gallery
            </Link>
          </div>
        </div>
      </>
    );
  }

  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="bg-slate-900 rounded-lg p-8 mb-8 border border-slate-800">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
              {profile.image && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                  <Image
                    src={profile.image}
                    alt={profile.name || 'User'}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profile.name || profile.username}
                </h1>
                {profile.name && (
                  <p className="text-slate-400 mb-2">@{profile.username}</p>
                )}
                <p className="text-slate-400">Joined {joinDate}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800 rounded p-4">
                <p className="text-slate-400 text-sm">Timers Created</p>
                <p className="text-2xl font-bold text-purple-400">
                  {profile.timerCount}
                </p>
              </div>
              <div className="bg-slate-800 rounded p-4">
                <p className="text-slate-400 text-sm">Likes Received</p>
                <p className="text-2xl font-bold text-purple-400">
                  {profile.likeCount}
                </p>
              </div>
              <div className="bg-slate-800 rounded p-4">
                <p className="text-slate-400 text-sm">Member Since</p>
                <p className="text-sm font-bold text-purple-400">
                  {joinDate.split(' ')[0]}
                </p>
              </div>
            </div>
          </div>

          {/* Timers Grid */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Public Timers</h2>
            {profile.timers.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                No public timers yet
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.timers.map((timer) => (
                  <Link
                    key={timer.id}
                    href={`/timer/${timer.shareToken}`}
                    className="group bg-slate-900 rounded-lg p-6 hover:bg-slate-800 transition border border-slate-800 hover:border-purple-500"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white group-hover:text-purple-400 transition flex-1">
                        {timer.title}
                      </h3>
                      {timer.category && (
                        <span className="text-xs bg-purple-900 text-purple-300 rounded px-2 py-1 ml-2">
                          {timer.category}
                        </span>
                      )}
                    </div>
                    {timer.description && (
                      <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                        {timer.description}
                      </p>
                    )}
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{timer.viewCount} views</span>
                      <span>{timer._count.likes} likes</span>
                      <span>{timer.remixCount} remixes</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
