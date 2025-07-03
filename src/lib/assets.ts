// Utility to get correct asset paths for GitHub Pages
export function getAssetPath(path: string): string {
  const basePath = process.env.NODE_ENV === 'production' ? '/community-fee-management' : '';
  return `${basePath}${path}`;
}

export const LOGO_PATH = getAssetPath('/logo.png');
export const FAVICON_PATH = getAssetPath('/favicon.ico');
export const DEFAULT_AVATAR_PATH = getAssetPath('/default-avatar.svg');
