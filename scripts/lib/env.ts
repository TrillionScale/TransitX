// 셋업 스크립트 공용: .env 로드/추가. 루트 .env 한 파일에 모든 키를 누적한다.
import { existsSync, readFileSync, appendFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

const ENV_PATH = resolve(__dirname, '../../.env');

if (existsSync(ENV_PATH)) dotenv.config({ path: ENV_PATH });

export function getEnv(key: string): string | undefined {
  return process.env[key];
}

export function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`MISSING_ENV: ${key} — 이전 셋업 스크립트를 먼저 실행하세요`);
  return v;
}

/** key=value 들을 .env 에 추가(이미 있으면 덮어씀). process.env 에도 즉시 반영. */
export function setEnv(entries: Record<string, string>): void {
  let lines: string[] = existsSync(ENV_PATH)
    ? readFileSync(ENV_PATH, 'utf8').split('\n')
    : [];
  for (const [k, v] of Object.entries(entries)) {
    process.env[k] = v;
    const idx = lines.findIndex((l) => l.startsWith(`${k}=`));
    if (idx >= 0) lines[idx] = `${k}=${v}`;
    else lines.push(`${k}=${v}`);
  }
  // 마지막 빈 줄 정리
  writeFileSync(ENV_PATH, lines.filter((l, i) => !(l === '' && i === lines.length - 1)).join('\n') + '\n');
  console.log(`  → .env 갱신: ${Object.keys(entries).join(', ')}`);
}

export const XRPL_SERVER = process.env.XRPL_SERVER || 'wss://s.altnet.rippletest.net:51233';

// 통화 코드 (3글자 표준 ASCII)
export const USD = 'USD';
export const KRW = 'KRW';
