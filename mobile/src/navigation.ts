// 모든 화면의 라우트 + params 단일 정의
export type RootStackParamList = {
  FaceVerify: { force?: boolean } | undefined;
  CardList: undefined;
  CardDetail: { cardId: string };
  Pay: { cardId: string };
  Send: undefined;
  Wallet: undefined;
  Workspace: { initialCardId?: string };
  MemberDetail: { groupId: string; memberAddr: string };
  Profile: undefined;
};
