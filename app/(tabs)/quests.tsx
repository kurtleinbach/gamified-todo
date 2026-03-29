import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useQuestStore } from '@/store/questStore';
import { useProfileStore } from '@/store/profileStore';
import AchievementToast from '@/components/AchievementToast';
import type { Quest } from '@/types';

export default function QuestsScreen() {
  const quests = useQuestStore(s => s.quests);
  const profile = useProfileStore(s => s.profile);

  const completed = quests.filter(q => q.isCompleted);
  const active = quests.filter(q => !q.isCompleted);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={styles.container}>
      <AchievementToast />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daily Quests</Text>
          <Text style={styles.headerDate}>{today}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <MaterialCommunityIcons name="map-marker-check" size={14} color={Colors.success} />
              <Text style={styles.statText}>{completed.length}/{quests.length} completed</Text>
            </View>
            <View style={styles.statChip}>
              <MaterialCommunityIcons name="star" size={14} color={Colors.xp} />
              <Text style={styles.statText}>{profile.questsCompleted} total done</Text>
            </View>
          </View>
        </View>

        {active.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Active</Text>
            {active.map(q => <QuestCard key={q.id} quest={q} />)}
          </>
        )}

        {completed.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Completed</Text>
            {completed.map(q => <QuestCard key={q.id} quest={q} />)}
          </>
        )}

        {quests.length === 0 && (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="map-marker-path" size={56} color={Colors.border} />
            <Text style={styles.emptyTitle}>No quests today</Text>
            <Text style={styles.emptySubtext}>Complete tasks to generate daily quests</Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information-outline" size={16} color={Colors.blue400} />
          <Text style={styles.infoText}>
            Quests refresh daily at midnight. Complete tasks to make progress.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function QuestCard({ quest }: { quest: Quest }) {
  const progress = quest.target > 0 ? quest.progress / quest.target : 0;

  return (
    <View style={[styles.card, quest.isCompleted && styles.cardDone]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <MaterialCommunityIcons
            name={quest.isCompleted ? 'check-circle' : 'circle-outline'}
            size={22}
            color={quest.isCompleted ? Colors.success : Colors.purple400}
          />
          <View style={styles.cardTitleContainer}>
            <Text style={[styles.cardTitle, quest.isCompleted && styles.cardTitleDone]}>
              {quest.title}
            </Text>
            <Text style={styles.cardDesc}>{quest.description}</Text>
          </View>
        </View>
        <View style={styles.rewardColumn}>
          <Text style={styles.rewardXP}>+{quest.xpReward} XP</Text>
          <Text style={styles.rewardCoins}>+{quest.coinsReward} 🪙</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <ProgressBar
          progress={progress}
          color={quest.isCompleted ? Colors.success : Colors.purple500}
          style={styles.progressBar}
        />
        <Text style={styles.progressLabel}>
          {quest.progress} / {quest.target}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  header: {
    backgroundColor: Colors.card, borderRadius: 16,
    padding: 16, marginBottom: 16, gap: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  headerDate: { color: Colors.textMuted, fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { color: Colors.textMuted, fontSize: 12 },
  sectionTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 4 },
  card: {
    backgroundColor: Colors.card, borderRadius: 14,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  cardDone: { borderColor: Colors.success + '44', backgroundColor: Colors.success + '0A' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitleRow: { flexDirection: 'row', gap: 10, flex: 1 },
  cardTitleContainer: { flex: 1, gap: 2 },
  cardTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  cardTitleDone: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  cardDesc: { color: Colors.textMuted, fontSize: 12 },
  rewardColumn: { alignItems: 'flex-end', gap: 2 },
  rewardXP: { color: Colors.xp, fontSize: 12, fontWeight: '700' },
  rewardCoins: { color: Colors.coins, fontSize: 12, fontWeight: '600' },
  progressSection: { gap: 4 },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: Colors.border },
  progressLabel: { color: Colors.textMuted, fontSize: 11, textAlign: 'right' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: Colors.textMuted, fontSize: 13, textAlign: 'center' },
  infoCard: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: Colors.blue900 + '66', borderRadius: 12,
    padding: 12, marginTop: 8,
    borderWidth: 1, borderColor: Colors.blue700 + '44',
  },
  infoText: { color: Colors.blue300, fontSize: 12, flex: 1 },
});
