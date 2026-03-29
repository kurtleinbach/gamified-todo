import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
  withSequence, withDelay, Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { ACHIEVEMENT_MAP } from '@/constants/achievements';
import { useProfileStore } from '@/store/profileStore';
import type { AchievementId } from '@/constants/achievements';

export default function AchievementToast() {
  const pendingAchievement = useProfileStore(s => s.pendingAchievement);
  const clearPending = useProfileStore(s => s.clearPendingAchievement);
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!pendingAchievement) return;
    translateY.value = withSequence(
      withTiming(0, { duration: 400, easing: Easing.out(Easing.back(1.5)) }),
      withDelay(2200, withTiming(-120, { duration: 400 }))
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(2200, withTiming(0, { duration: 400 }))
    );
    const timer = setTimeout(() => clearPending(), 3000);
    return () => clearTimeout(timer);
  }, [pendingAchievement]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!pendingAchievement) return null;
  const achievement = ACHIEVEMENT_MAP[pendingAchievement as AchievementId];
  if (!achievement) return null;

  return (
    <Animated.View style={[styles.toast, animStyle]} pointerEvents="none">
      <Text style={styles.icon}>{achievement.icon}</Text>
      <View>
        <Text style={styles.label}>Achievement Unlocked!</Text>
        <Text style={styles.title}>{achievement.title}</Text>
        <Text style={styles.desc}>{achievement.description}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: Colors.purple800,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.purple500,
    zIndex: 1000,
    shadowColor: Colors.purple500,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  icon: { fontSize: 32 },
  label: { color: Colors.purple300, fontSize: 11, fontWeight: '600' },
  title: { color: Colors.textPrimary, fontSize: 15, fontWeight: '800' },
  desc: { color: Colors.textSecondary, fontSize: 12 },
});
