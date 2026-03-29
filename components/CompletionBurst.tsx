import { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
  withSequence, withDelay, Easing, runOnJS,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface Props {
  xp: number;
  coins: number;
  leveledUp: boolean;
  onDone: () => void;
}

const PARTICLES = Array.from({ length: 12 }, (_, i) => i);

export default function CompletionBurst({ xp, coins, leveledUp, onDone }: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(1200, withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) }))
    );
    scale.value = withSequence(
      withTiming(1.2, { duration: 200, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 100 })
    );
    translateY.value = withSequence(
      withTiming(-20, { duration: 400 }),
      withDelay(800, withTiming(-60, { duration: 400, easing: Easing.in(Easing.ease) }))
    );
    setTimeout(() => runOnJS(onDone)(), 1800);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[styles.burst, containerStyle]}>
        <Text style={styles.xpText}>+{xp} XP</Text>
        <Text style={styles.coinsText}>+{coins} 🪙</Text>
        {leveledUp && <Text style={styles.levelUpText}>LEVEL UP! ✨</Text>}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    pointerEvents: 'none',
  },
  burst: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: Colors.purple500,
    gap: 4,
    shadowColor: Colors.purple500,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  xpText: {
    color: Colors.xp,
    fontSize: 28,
    fontWeight: '900',
  },
  coinsText: {
    color: Colors.coins,
    fontSize: 18,
    fontWeight: '700',
  },
  levelUpText: {
    color: Colors.purple300,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
});
