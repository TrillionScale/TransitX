import NfcManager, { NfcTech } from 'react-native-nfc-manager';

let started = false;

const ensureStarted = async () => {
  if (started) return;
  await NfcManager.start();
  started = true;
};

/**
 * NFC 태그를 한 번 감지하고 즉시 세션 종료.
 * 태그 payload는 무시 — 감지됐다는 사실만 사용 (데모 트리거용).
 *
 * 실패 시 throw — 호출자가 catch하여 mock fallback 가능.
 */
export const waitForNfcTap = async (): Promise<void> => {
  await ensureStarted();
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
  } finally {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch {
      // ignored
    }
  }
};

export const cancelNfc = () => {
  NfcManager.cancelTechnologyRequest().catch(() => {});
};
