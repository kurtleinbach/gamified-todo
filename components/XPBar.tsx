import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { Colors } from '@/constants/theme';
import { getXPForNextLevel, LEVEL_TITLES } from '@/constants/xp';

interface Props {
  xp: number;
  level: number;
  compact?: boolean;
}

export default function XPBar({ xp, level, compact = false }: Props) {
  const { current, required } = getXPForNextLevel(xp);
  const progress = required > 0 ? current / required : 1;
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 800 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.barBg}>
          <Animated.View style={[styles.barFill, animatedStyle]} />
        </View>
        <Text style={styles.compactLabel}>{current}/{required} XP</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Level {level} — {LEVEL_TITLES[level] ?? 'Hero'}</Text>
        <Text style={styles.xpText}>{current} / {required} XP</Text>
      </View>
      <View style={styles.barBg}>
        <Animated.View style={[styles.barFill, animatedStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  compactContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  levelText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  xpText: { color: Colors.xp, fontSize: 12, fontWeight: '600' },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.purple500,
  },
  compactLabel: { color: Colors.xp, fontSize: 11, fontWeight: '600', minWidth: 70 },
});
