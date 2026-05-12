import { Client } from 'xrpl';

// XRPL Testnet 단일 엔드포인트. (.env XRPL_SERVER 로 override 가능 — 호출자가 setServer로 주입)
let serverUrl = 'wss://s.altnet.rippletest.net:51233';
let client: Client | null = null;

export function setServer(url: string): void {
  if (url && url !== serverUrl) {
    serverUrl = url;
    client = null; // 다음 getClient에서 새 서버로 연결
  }
}

/** 연결된 Client 싱글톤. 끊겨 있으면 재연결. */
export async function getClient(): Promise<Client> {
  if (client && client.isConnected()) return client;
  if (!client) client = new Client(serverUrl);
  if (!client.isConnected()) await client.connect();
  return client;
}

export async function disconnect(): Promise<void> {
  if (client && client.isConnected()) await client.disconnect();
  client = null;
}
