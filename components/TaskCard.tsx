import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Checkbox } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, PriorityMeta } from '@/constants/theme';
import type { Task } from '@/types';

interface Props {
  task: Task;
  onComplete?: (task: Task) => void;
  onPress?: (task: Task) => void;
  readonly?: boolean;
}

export default function TaskCard({ task, onComplete, onPress, readonly = false }: Props) {
  const meta = PriorityMeta[task.priority];
  const completedSubtasks = task.subtasks.filter(s => s.isCompleted).length;
  const totalSubtasks = task.subtasks.length;
  const isOverdue = task.dueDate && !task.isCompleted && new Date(task.dueDate) < new Date();

  return (
    <TouchableOpacity
      style={[styles.card, readonly && styles.cardReadonly]}
      onPress={() => onPress?.(task)}
      activeOpacity={0.7}
    >
      <View style={[styles.priorityBar, { backgroundColor: meta.color }]} />

      <View style={styles.content}>
        <View style={styles.row}>
          {!readonly && (
            <Checkbox.Android
              status="unchecked"
              onPress={() => onComplete?.(task)}
              color={Colors.purple400}
              uncheckedColor={Colors.border}
            />
          )}
          <View style={styles.titleContainer}>
            <Text
              style={[styles.title, readonly && styles.titleCompleted]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            {task.description ? (
              <Text style={styles.description} numberOfLines={1}>{task.description}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={[styles.priorityBadge, { backgroundColor: meta.color + '22', borderColor: meta.color + '66' }]}>
            <Text style={[styles.priorityLabel, { color: meta.color }]}>{meta.label}</Text>
          </View>

          {task.category ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryLabel}>#{task.category}</Text>
            </View>
          ) : null}

          {totalSubtasks > 0 && (
            <View style={styles.subtaskBadge}>
              <MaterialCommunityIcons name="format-list-checks" size={12} color={Colors.textMuted} />
              <Text style={styles.subtaskLabel}>{completedSubtasks}/{totalSubtasks}</Text>
            </View>
          )}

          {task.isRecurring && (
            <MaterialCommunityIcons name="refresh" size={14} color={Colors.blue400} />
          )}

          {task.dueDate && (
            <View style={styles.dueBadge}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={12}
                color={isOverdue ? Colors.error : Colors.success}
              />
              <Text style={[styles.dueLabel, isOverdue ? styles.overdue : styles.dueSoon]}>
                {new Date(task.dueDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          <View style={styles.xpBadge}>
            <Text style={styles.xpLabel}>+{meta.xp} XP</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardReadonly: {
    opacity: 0.85,
  },
  priorityBar: { width: 4 },
  content: { flex: 1, padding: 12, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  titleContainer: { flex: 1, gap: 2 },
  title: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  titleCompleted: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  description: { color: Colors.textMuted, fontSize: 12 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  priorityBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6, borderWidth: 1,
  },
  priorityLabel: { fontSize: 11, fontWeight: '700' },
  categoryBadge: {
    backgroundColor: Colors.blue900,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6,
  },
  categoryLabel: { color: Colors.blue300, fontSize: 11 },
  subtaskBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  subtaskLabel: { color: Colors.textMuted, fontSize: 11 },
  dueBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dueLabel: { color: Colors.textMuted, fontSize: 11 },
  overdue: { color: Colors.error },
  dueSoon: { color: Colors.success },
  xpBadge: {},
  xpLabel: { color: Colors.xp, fontSize: 11, fontWeight: '700' },
});
