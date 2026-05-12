import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ArrowDownToLine, Copy, Share2, X } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';

import { useWallet } from '../state/useWallet';
import { useDynamicColors } from '../state/useThemeMode';
import { colors, radius, space } from '../theme';
import { formatAmount } from '../format';
import { BackgroundCanvas, DarkGlass, Button, IconButton } from './ui';

export const WalletPanel: React.FC = () => {
  const { wallet, loading } = useWallet();
  const [showDeposit, setShowDeposit] = useState(false);
  const dyn = useDynamicColors();

  if (loading || !wallet) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const handleCopy = async () => {
    await Clipboard.setStringAsync(wallet.address);
    Alert.alert('복사됨', '지갑 주소가 클립보드에 복사되었습니다');
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* 잔고 hero */}
      <View style={styles.hero}>
        <Text style={[styles.heroLabel, { color: dyn.textOnLightMuted }]}>원화 잔고</Text>
        <Text style={[styles.heroValue, { color: dyn.textOnLight }]}>
          {formatAmount(wallet.balanceUsd, 'KRW')}
        </Text>
        <Text style={[styles.heroSub, { color: dyn.textOnLightFaint }]}>
          XRPL Testnet · XRP 실시간 환산
        </Text>
      </View>

      {/* 입금 받기 큰 버튼 */}
      <Button
        label="입금 받기"
        icon={ArrowDownToLine}
        variant="success"
        fullWidth
        size="lg"
        onPress={() => setShowDeposit(true)}
        style={{ marginBottom: space.lg }}
      />

      {/* 지갑 주소 카드 — 다크 글라스 */}
      <DarkGlass radius="lg" style={styles.addrCard}>
        <Text style={styles.addrLabel}>내 지갑 주소</Text>
        <Text style={styles.addrValue} selectable>
          {wallet.address}
        </Text>
        <View style={styles.addrActions}>
          <Pressable
            onPress={handleCopy}
            style={({ pressed }) => [styles.smallBtn, pressed && { opacity: 0.6 }]}
          >
            <Copy size={14} color="#ffffff" strokeWidth={1.8} />
            <Text style={styles.smallBtnText}>복사</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowDeposit(true)}
            style={({ pressed }) => [styles.smallBtn, pressed && { opacity: 0.6 }]}
          >
            <Share2 size={14} color="#ffffff" strokeWidth={1.8} />
            <Text style={styles.smallBtnText}>QR</Text>
          </Pressable>
        </View>
      </DarkGlass>

      <Text style={[styles.footer, { color: dyn.textOnLightMuted }]}>
        이 주소로 XRP를 받으면 잔고에 자동으로 추가됩니다. (XRPL Testnet)
      </Text>

      <DepositModal
        visible={showDeposit}
        address={wallet.address}
        onClose={() => setShowDeposit(false)}
      />
    </ScrollView>
  );
};

// ─── Deposit Modal ───────────────────────────────────────────────

const DepositModal: React.FC<{
  visible: boolean;
  address: string;
  onClose: () => void;
}> = ({ visible, address, onClose }) => {
  const dyn = useDynamicColors();
  const handleCopy = async () => {
    await Clipboard.setStringAsync(address);
    Alert.alert('복사됨', '지갑 주소가 클립보드에 복사되었습니다');
  };
  const handleShare = async () => {
    try {
      await Share.share({ message: address, title: 'TransitX 지갑 주소' });
    } catch {
      // ignored
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={modalStyles.container}>
        <BackgroundCanvas />
        <View style={modalStyles.header}>
          <IconButton icon={X} onPress={onClose} />
          <Text style={[modalStyles.title, { color: dyn.textOnLight }]}>입금 받기</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={modalStyles.body}>
          <Text style={[modalStyles.hint, { color: dyn.textOnLightMuted }]}>
            상대방에게 이 QR 또는 주소를 공유하세요.
          </Text>

          <View style={modalStyles.qrFrame}>
            <QRCode value={address} size={220} color="#0A0E1A" backgroundColor="#FFFFFF" />
          </View>

          <DarkGlass radius="lg" style={modalStyles.addrBlock}>
            <Text style={modalStyles.addrLabel}>지갑 주소</Text>
            <Text style={modalStyles.addrValue} selectable>
              {address}
            </Text>
          </DarkGlass>

          <View style={modalStyles.actions}>
            <Button
              label="주소 복사"
              icon={Copy}
              variant="glass"
              onPress={handleCopy}
              style={{ flex: 1 }}
            />
            <Button
              label="공유"
              icon={Share2}
              variant="glass"
              onPress={handleShare}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.xxl * 2,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  hero: {
    paddingVertical: space.xl,
    alignItems: 'flex-start',
  },
  heroLabel: {
    color: colors.textOnLightMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: space.xs,
  },
  heroValue: {
    color: colors.textOnLight,
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 50,
  },
  heroSub: {
    color: colors.textOnLightFaint,
    fontSize: 12,
    fontWeight: '500',
    marginTop: space.xs,
  },

  addrCard: {
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
  },
  addrLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },
  addrValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Menlo',
    letterSpacing: 0.4,
    lineHeight: 18,
    marginBottom: space.md,
  },
  addrActions: {
    flexDirection: 'row',
    gap: space.sm,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  smallBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  footer: {
    color: colors.textOnLightMuted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: space.lg,
    paddingHorizontal: space.md,
  },
});

const modalStyles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.lg,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  body: {
    flex: 1,
    paddingHorizontal: space.xl,
    alignItems: 'center',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: space.xl,
  },
  qrFrame: {
    padding: space.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    marginBottom: space.xl,
  },
  addrBlock: {
    width: '100%',
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
    marginBottom: space.lg,
  },
  addrLabel: {
    color: colors.textOnGlassFaint,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },
  addrValue: {
    color: colors.textOnGlass,
    fontSize: 13,
    fontFamily: 'Menlo',
    letterSpacing: 0.4,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: space.sm,
    width: '100%',
  },
});
