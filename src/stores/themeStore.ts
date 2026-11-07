import { create } from 'zustand';
import type { ThemePreference } from '../types';
const stored = (localStorage.getItem('pycourse:theme') as ThemePreference | null) ?? 'system';
const effective = (preference: ThemePreference) => preference === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : preference;
interface ThemeState { preference: ThemePreference; setPreference: (preference: ThemePreference) => void; }
export const useTheme = create<ThemeState>((set) => ({ preference: stored, setPreference: (preference) => { localStorage.setItem('pycourse:theme', preference); document.documentElement.dataset.theme = effective(preference); set({ preference }); } }));
const media = window.matchMedia('(prefers-color-scheme: dark)');
media.addEventListener('change', () => {
  const preference = useTheme.getState().preference;
  if (preference === 'system') document.documentElement.dataset.theme = media.matches ? 'dark' : 'light';
});
