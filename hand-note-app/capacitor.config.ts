import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.handnote.app',
  appName: 'HandNote手账',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
