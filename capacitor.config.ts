import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.retromanager.app',
  appName: 'Retro Manager',
  webDir: 'out',
  // Start at root so WebView loads index.html; tap "Play Game" to open /game
  // server: { appStartPath: '/game' } can cause blank screen with static export
};

export default config;
