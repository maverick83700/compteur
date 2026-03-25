import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.compteur.app',
  appName: 'compteur',
  webDir: 'dist/compteur/browser',
  // AJOUTE CETTE SECTION :
  plugins: {
    StatusBar: {
      overlaysWebView: false, // <-- C'EST CETTE LIGNE QUI FIXE TON PROBLÈME
      backgroundColor: '#2c3e50', // Tu peux mettre la couleur de ta sidebar ici
      style: 'LIGHT' // 'LIGHT' pour icônes blanches, 'DARK' pour icônes noires
    }
  }
};

export default config;