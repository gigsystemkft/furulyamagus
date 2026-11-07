import React, { FormEvent, useState } from 'react';
import { Music } from 'lucide-react';

export type AccountMode = 'login' | 'register';

interface AccountViewProps {
  mode: AccountMode;
  pending: boolean;
  error: string | null;
  onModeChange: (mode: AccountMode) => void;
  onSubmit: (nickname: string, password: string) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  mode,
  pending,
  error,
  onModeChange,
  onSubmit,
}) => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(nickname.trim(), password);
  };

  return (
    <main className="mx-auto mt-10 w-full max-w-md px-4">
      <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
            <Music className="h-8 w-8 text-violet-600" />
          </div>
          <h2 className="text-2xl font-black text-violet-900">
            {mode === 'login' ? 'Üdv újra, Mágus!' : 'Új mágus regisztrációja'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'login'
              ? 'Lépj be a beceneveddel és jelszavaddal!'
              : 'Csak egy becenév és egy jelszó szükséges.'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <label className="block text-sm font-bold text-gray-700">
            Becenév
            <input
              autoComplete="username"
              className="mt-1 w-full rounded-xl border border-violet-200 px-4 py-3 font-normal outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
              maxLength={24}
              minLength={3}
              onChange={(event) => setNickname(event.target.value)}
              pattern="[\p{L}\p{N}_ -]{3,24}"
              placeholder="Például: FurulyaMágus"
              required
              title="3–24 karakter: betű, szám, szóköz, kötőjel vagy aláhúzás."
              value={nickname}
            />
          </label>

          <label className="block text-sm font-bold text-gray-700">
            Jelszó
            <input
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="mt-1 w-full rounded-xl border border-violet-200 px-4 py-3 font-normal outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
              maxLength={72}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === 'login' ? 'Jelszó' : 'Legalább 8 karakter (max. 72 bájt)'}
              required
              type="password"
              value={password}
            />
          </label>

          {mode === 'register' && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              E-mail-cím nélküli fióknál az elfelejtett jelszó nem állítható vissza.
            </p>
          )}

          {error && (
            <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">
              {error}
            </p>
          )}

          <button
            className="w-full rounded-xl bg-violet-600 px-4 py-3 font-bold text-white transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending
              ? 'Egy pillanat...'
              : mode === 'login'
                ? 'Belépés'
                : 'Fiók létrehozása'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          {mode === 'login' ? 'Még nincs fiókod?' : 'Már van fiókod?'}{' '}
          <button
            className="font-bold text-violet-700 underline underline-offset-2"
            disabled={pending}
            onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
            type="button"
          >
            {mode === 'login' ? 'Regisztráció' : 'Belépés'}
          </button>
        </p>
      </section>
    </main>
  );
};
