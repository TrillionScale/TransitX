// react-native-dotenv (@env) — .env 키 타입. 값은 빌드타임 치환, 누락 시 undefined (safe:false).
declare module '@env' {
  export const XRPL_SERVER: string | undefined;
  export const USD_ISSUER_ADDR: string | undefined;
  export const KRW_ISSUER_ADDR: string | undefined;
  export const DEMO_ADDR: string | undefined;
  export const DEMO_SEED: string | undefined;
  export const LP_ADDR: string | undefined;
  export const MERCHANT_ADDR: string | undefined;
}
