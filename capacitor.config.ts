import type { CapacitorConfig } from '@capacitor/cli';

const useDevServer = process.env.CAPACITOR_DEV_SERVER === '1';

const config: CapacitorConfig = {
  appId: 'com.retromanager.app',
  appName: 'Retro Manager',
  webDir: 'out',
  // Load from bundle only (no server.url). Set CAPACITOR_DEV_SERVER=1 to load from npm run dev.
  server: useDevServer
    ? { url: 'http://localhost:9002', cleartext: true }
    : { androidScheme: 'https' },
  ios: {
    backgroundColor: '#0f1419',
    contentInset: 'always',
  },
};

export default config;
