/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, NoteInfo } from './types';
import { INITIAL_ACHIEVEMENTS, INITIAL_BALLOON_SKINS } from './data/notes';
import { audioManager } from './utils/audio';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeView } from './components/HomeView';
import { FingeringView } from './components/FingeringView';
import { PracticeView } from './components/PracticeView';
import { GameView } from './components/GameView';
import { SongsView } from './components/SongsView';
import { ShopView } from './components/ShopView';
import { AchievementsView } from './components/AchievementsView';
import { AccountMode, AccountView } from './components/AccountView';
import { accountApi, AccountUser } from './utils/accountApi';

const LOCAL_STORAGE_KEY = 'furulya_magus_profile_v1';

const defaultProfile: UserProfile = {
  coins: 50,
  xp: 0,
  level: 1,
  streak: 1,
  lastActiveDate: new Date().toDateString(),
  activeSkin: 'classic_red',
  unlockedSkins: ['classic_red'],
  achievements: INITIAL_ACHIEVEMENTS,
  completedSongs: [],
  totalBalloonsPopped: 0,
};

function mergeProfile(profile?: Partial<UserProfile>): UserProfile {
  const savedAchievements = Array.isArray(profile?.achievements)
    ? profile.achievements
    : [];
  const achievements = INITIAL_ACHIEVEMENTS.map((initial) => {
    const saved = savedAchievements.find((achievement) => achievement.id === initial.id);
    return saved ? { ...initial, ...saved } : initial;
  });
  return { ...defaultProfile, ...profile, achievements };
}

function loadLocalProfile(): UserProfile {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? mergeProfile(JSON.parse(saved) as Partial<UserProfile>) : defaultProfile;
  } catch (error) {
    console.error('Nem sikerült betölteni a helyi játékhaladást.', error);
    return defaultProfile;
  }
}

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(loadLocalProfile);
  const [authState, setAuthState] = useState<'checking' | 'guest' | 'authenticated' | 'error'>('checking');
  const [user, setUser] = useState<AccountUser | null>(null);
  const [accountMode, setAccountMode] = useState<AccountMode>('login');
  const [accountPending, setAccountPending] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [authCheckError, setAuthCheckError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [logoutPending, setLogoutPending] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [detectedNote, setDetectedNote] = useState<NoteInfo | null>(null);
  const [detectedFreq, setDetectedFreq] = useState<number>(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    accountApi.current()
      .then((result) => {
        if (!active) return;
        if (result.authenticated && result.user && result.profile) {
          setUser(result.user);
          setProfile(mergeProfile(result.profile));
          setAuthState('authenticated');
        } else {
          setAuthState('guest');
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        setAuthCheckError(error instanceof Error ? error.message : 'Nem sikerült kapcsolódni a fiókrendszerhez.');
        setAuthState('error');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (authState !== 'authenticated' || !user) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Nem sikerült helyben elmenteni a játékhaladást.', error);
    }
    setSyncError(null);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const save = saveQueue.current.then(() => accountApi.saveProfile(profile));
      saveQueue.current = save.catch(() => undefined);
      void save
        .then(() => setSyncError(null))
        .catch((error: unknown) => {
          setSyncError(error instanceof Error ? error.message : 'Nem sikerült szinkronizálni a játékhaladást.');
        });
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [profile, authState, user]);

  const updateProfile = (updater: (prev: UserProfile) => UserProfile) => {
    setProfile(updater);
  };

  const handleAccountSubmit = async (nickname: string, password: string) => {
    setAccountPending(true);
    setAccountError(null);
    try {
      const result = accountMode === 'register'
        ? await accountApi.register(nickname, password, profile)
        : await accountApi.login(nickname, password);
      if (!result.user || !result.profile) {
        throw new Error('A szerver nem küldte vissza a fiók adatait.');
      }
      setUser(result.user);
      setProfile(mergeProfile(result.profile));
      setAuthState('authenticated');
      setActiveTab('home');
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : 'Nem sikerült a művelet.');
    } finally {
      setAccountPending(false);
    }
  };

  const retryProfileSave = async () => {
    setSyncError(null);
    const save = saveQueue.current.then(() => accountApi.saveProfile(profile));
    saveQueue.current = save.catch(() => undefined);
    try {
      await save;
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Nem sikerült szinkronizálni a játékhaladást.');
    }
  };

  const handleLogout = async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setLogoutPending(true);
    setSyncError(null);
    try {
      await saveQueue.current;
      const save = saveQueue.current.then(() => accountApi.saveProfile(profile));
      saveQueue.current = save.catch(() => undefined);
      await save;
      await accountApi.logout();
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (error) {
        console.error('Nem sikerült törölni a helyi játékhaladás gyorsítótárát.', error);
      }
      setUser(null);
      setProfile(defaultProfile);
      setAuthState('guest');
      setActiveTab('home');
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Nem sikerült biztonságosan kilépni.');
    } finally {
      setLogoutPending(false);
    }
  };

  const toggleMic = async () => {
    if (isMicActive) {
      audioManager.stopMicrophone();
      setIsMicActive(false);
      setDetectedNote(null);
      setDetectedFreq(0);
    } else {
      const success = await audioManager.initMicrophone((note, freq, cents) => {
        setDetectedNote(note);
        setDetectedFreq(freq);
      });
      if (success) {
        setIsMicActive(true);
      } else {
        alert('Nem sikerült elérni a mikrofont. Kérlek engedélyezd a böngésződben!');
      }
    }
  };

  // Cleanup mic on unmount
  useEffect(() => {
    return () => {
      audioManager.stopMicrophone();
    };
  }, []);

  if (authState === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-violet-50 text-violet-900">
        Fiók ellenőrzése...
      </div>
    );
  }

  if (authState === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-violet-50 px-4 text-center">
        <p className="max-w-md text-rose-700" role="alert">{authCheckError}</p>
        <button
          className="rounded-xl bg-violet-600 px-5 py-3 font-bold text-white"
          onClick={() => window.location.reload()}
          type="button"
        >
          Újrapróbálás
        </button>
      </div>
    );
  }

  if (authState === 'guest') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 py-8">
        <AccountView
          mode={accountMode}
          pending={accountPending}
          error={accountError}
          onModeChange={(mode) => {
            setAccountMode(mode);
            setAccountError(null);
          }}
          onSubmit={handleAccountSubmit}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 text-gray-800 font-sans pb-12 selection:bg-purple-300">
      {/* Top Header */}
      <Header
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMicActive={isMicActive}
        toggleMic={toggleMic}
        nickname={user?.nickname ?? ''}
        onLogout={handleLogout}
        logoutPending={logoutPending}
      />
      {syncError && (
        <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between gap-3 rounded-xl bg-rose-100 px-4 py-3 text-sm text-rose-800">
          <p role="alert">A haladás mentése nem sikerült: {syncError}</p>
          <button
            className="shrink-0 rounded-lg bg-rose-700 px-3 py-2 font-bold text-white"
            onClick={retryProfileSave}
            type="button"
          >
            Újrapróbálás
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="mt-6">
        {activeTab === 'home' && (
          <HomeView
            profile={profile}
            setActiveTab={setActiveTab}
            isMicActive={isMicActive}
            toggleMic={toggleMic}
          />
        )}
        {activeTab === 'fingering' && <FingeringView />}
        {activeTab === 'practice' && (
          <PracticeView
            profile={profile}
            updateProfile={updateProfile}
            isMicActive={isMicActive}
            toggleMic={toggleMic}
            detectedNote={detectedNote}
            detectedFreq={detectedFreq}
          />
        )}
        {activeTab === 'game' && (
          <GameView
            profile={profile}
            updateProfile={updateProfile}
            isMicActive={isMicActive}
            toggleMic={toggleMic}
            detectedNote={detectedNote}
          />
        )}
        {activeTab === 'songs' && (
          <SongsView
            profile={profile}
            updateProfile={updateProfile}
            detectedNote={detectedNote}
          />
        )}
        {activeTab === 'shop' && (
          <ShopView profile={profile} updateProfile={updateProfile} />
        )}
        {activeTab === 'achievements' && (
          <AchievementsView profile={profile} />
        )}
      </main>
    </div>
  );
}
