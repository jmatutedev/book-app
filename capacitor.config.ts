import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'book-app',
  webDir: 'www',

  plugins: {
    CapacitorSQLite: {
      iosIsEncryption: false,
      iosKeychainPrefix: 'book-app',
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      androidIsEncryption: false,
      electronIsEncryption: false,
      electronWindowsLocation: 'C:\\ProgramData\\CapacitorDatabases',
    },
  },
};

export default config;
