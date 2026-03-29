import { ScrollView, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useProfileStore } from '@/store/profileStore';
import { ACHIEVEMENTS, ACHIEVEMENT_MAP } from '@/constants/achievements';
import { getLevelFromXP, LEVEL_TITLES, getXPForNextLevel } from '@/constants/xp';
import XPBar from '@/components/XPBar';
import AchievementToast from '@/components/AchievementToast';

export default function ProfileScreen() {
  const profile = useProfileStore(s => s.profile);
  const unlockedAchievements = useProfileStore(s => s.unlockedAchievements);
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id));

  return (
    <View style={styles.container}>
      <AchievementToast />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.avatarCircle}>
            <MaterialCommunityIcons name="shield-star" size={48} color={Colors.purple400} />
          </View>
          <Text style={styles.levelTitle}>{LEVEL_TITLES[profile.level] ?? 'Hero'}</Text>
          <Text style={styles.levelSubtitle}>Level {profile.level}</Text>
          <View style={styles.xpBarContainer}>
            <XPBar xp={profile.xp} level={profile.level} />
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.grid}>
          <StatCard icon="lightning-bolt" label="Total XP" value={profile.xp.toLocaleString()} color={Colors.xp} />
          <StatCard icon="fire" label="Current Streak" value={`${profile.streak} days`} color={Colors.warning} />
          <StatCard icon="trophy" label="Best Streak" value={`${profile.longestStreak} days`} color={Colors.purple400} />
          <StatCard icon="coin" label="Coins" value={profile.coins.toLocaleString()} color={Colors.coins} />
          <StatCard icon="checkbox-marked-circle" label="Tasks Done" value={profile.tasksCompleted.toString()} color={Colors.success} />
          <StatCard icon="sword-cross" label="Epic Tasks" value={profile.epicTasksCompleted.toString()} color={Colors.priorityEpic} />
          <StatCard icon="map-marker-check" label="Quests Done" value={profile.questsCompleted.toString()} color={Colors.blue400} />
          <StatCard icon="star-circle" label="Achievements" value={`${unlockedIds.size}/${ACHIEVEMENTS.length}`} color={Colors.purple300} />
        </View>

        {/* Archive link */}
        <TouchableOpacity style={styles.archiveBtn} onPress={() => router.push('/archive')}>
          <MaterialCommunityIcons name="archive-outline" size={20} color={Colors.purple300} />
          <Text style={styles.archiveBtnText}>View Completed Archive</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Achievements */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementGrid}>
          {ACHIEVEMENTS.map(a => {
            const unlocked = unlockedIds.has(a.id);
            const unlockedEntry = unlockedAchievements.find(u => u.id === a.id);
            return (
              <View
                key={a.id}
                style={[styles.achievementCard, !unlocked && styles.achievementLocked]}
              >
                <Text style={[styles.achievementIcon, !unlocked && styles.lockedIcon]}>
                  {unlocked ? a.icon : '🔒'}
                </Text>
                <Text style={[styles.achievementTitle, !unlocked && styles.lockedText]} numberOfLines={2}>
                  {unlocked ? a.title : '???'}
                </Text>
                {unlocked ? (
                  <Text style={styles.unlockedDate}>
                    {new Date(unlockedEntry!.unlockedAt).toLocaleDateString()}
                  </Text>
                ) : (
                  <Text style={styles.achievementHint} numberOfLines={2}>{a.description}</Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <MaterialCommunityIcons name={icon as any} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  hero: {
    backgroundColor: Colors.card, borderRadius: 20,
    padding: 20, alignItems: 'center', gap: 6, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.purple900,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.purple500,
    marginBottom: 4,
  },
  levelTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: '900' },
  levelSubtitle: { color: Colors.purple400, fontSize: 14, fontWeight: '600' },
  xpBarContainer: { width: '100%', marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard: {
    width: '47%', backgroundColor: Colors.card, borderRadius: 14,
    padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { color: Colors.textMuted, fontSize: 11, textAlign: 'center' },
  archiveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 16,
  },
  archiveBtnText: { flex: 1, color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  sectionTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 10 },
  achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievementCard: {
    width: '30%', backgroundColor: Colors.card, borderRadius: 14,
    padding: 10, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.purple700,
    flexGrow: 1,
  },
  achievementLocked: { borderColor: Colors.border, opacity: 0.55 },
  achievementIcon: { fontSize: 28 },
  lockedIcon: { opacity: 0.4 },
  achievementTitle: { color: Colors.textPrimary, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  lockedText: { color: Colors.textMuted },
  achievementHint: { color: Colors.textMuted, fontSize: 9, textAlign: 'center' },
  unlockedDate: { color: Colors.purple300, fontSize: 9 },
});
