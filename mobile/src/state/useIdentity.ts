import { Platform } from 'react-native';

const KEY = 'tx_identity_verified_v1';

export async function isIdentityVerified(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(KEY) === '1';
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SecureStore = require('expo-secure-store');
    const val = await SecureStore.getItemAsync(KEY);
    return val === '1';
  } catch {
    return false;
  }
}

export async function markIdentityVerified(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(KEY, '1');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SecureStore = require('expo-secure-store');
    await SecureStore.setItemAsync(KEY, '1');
  } catch {}
}

export async function clearIdentityVerification(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(KEY);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SecureStore = require('expo-secure-store');
    await SecureStore.deleteItemAsync(KEY);
  } catch {}
}
