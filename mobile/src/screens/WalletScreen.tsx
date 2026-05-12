import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';

import { WalletPanel } from '../components/WalletPanel';
import { Screen, ScreenHeader, IconButton } from '../components/ui';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Wallet'>;

export const WalletScreen: React.FC<Props> = ({ navigation }) => (
  <Screen>
    <ScreenHeader
      title="내 지갑"
      left={<IconButton icon={ChevronLeft} onPress={() => navigation.goBack()} />}
    />
    <WalletPanel />
  </Screen>
);
