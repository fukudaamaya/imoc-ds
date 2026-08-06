import { useEffect, useState } from 'react';

export type Platform = 'web' | 'mobile';

/** Tracks the `data-platform` attribute the Storybook toolbar toggle sets on <html>. */
export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>(
    () => (document.documentElement.getAttribute('data-platform') as Platform) ?? 'web',
  );

  useEffect(() => {
    const target = document.documentElement;
    const observer = new MutationObserver(() => {
      setPlatform((target.getAttribute('data-platform') as Platform) ?? 'web');
    });
    observer.observe(target, { attributes: true, attributeFilter: ['data-platform'] });
    return () => observer.disconnect();
  }, []);

  return platform;
}
