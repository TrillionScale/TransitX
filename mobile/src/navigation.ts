// 모든 화면의 라우트 + params 단일 정의
export type RootStackParamList = {
  CardList: undefined;
  CardDetail: { cardId: string };
  Pay: { cardId: string };
  Workspace: { initialCardId?: string };
  MemberDetail: { groupId: string; memberAddr: string };
};
