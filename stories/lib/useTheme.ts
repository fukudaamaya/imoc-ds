import { useEffect, useState } from 'react';

export type Theme = 'clinic' | 'supplement';

/** Tracks the `data-theme` attribute the Storybook Theme toolbar sets on <html>. No attribute = Clinic. */
export function useTheme(): Theme {
  const read = () => (document.documentElement.getAttribute('data-theme') as Theme | null) ?? 'clinic';
  const [theme, setTheme] = useState<Theme>(read);

  useEffect(() => {
    const target = document.documentElement;
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(target, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return theme;
}
