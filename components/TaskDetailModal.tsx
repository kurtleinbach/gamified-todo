import { useState } from 'react';
import {
  View, StyleSheet, ScrollView, Modal,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Text, TextInput, Button, Checkbox } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, PriorityMeta } from '@/constants/theme';
import { useTaskStore } from '@/store/taskStore';
import TaskFormModal from '@/components/TaskFormModal';
import type { Task } from '@/types';

interface Props {
  task: Task;
  onClose: () => void;
  onComplete?: (task: Task) => void;
}

export default function TaskDetailModal({ task, onClose, onComplete }: Props) {
  const updateSubtask = useTaskStore(s => s.updateSubtask);
  const addSubtask = useTaskStore(s => s.addSubtask);
  const deleteSubtask = useTaskStore(s => s.deleteSubtask);
  const updateTask = useTaskStore(s => s.updateTask);
  const deleteTask = useTaskStore(s => s.deleteTask);
  const tasks = useTaskStore(s => s.tasks);

  const [newSubtask, setNewSubtask] = useState('');
  const [showEdit, setShowEdit] = useState(false);

  const liveTask = tasks.find(t => t.id === task.id) ?? task;
  const meta = PriorityMeta[liveTask.priority];

  async function handleAddSubtask() {
    const text = newSubtask.trim();
    if (!text) return;
    setNewSubtask('');
    await addSubtask(liveTask.id, text);
  }

  function handleDelete() {
    Alert.alert('Delete Task', 'Permanently delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deleteTask(liveTask.id); onClose(); },
      },
    ]);
  }

  return (
    <>
      <Modal visible animationType="slide" transparent onRequestClose={onClose}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.priorityDot, { backgroundColor: meta.color }]} />
              <Text style={styles.headerTitle} numberOfLines={2}>{liveTask.title}</Text>
              <TouchableOpacity onPress={() => setShowEdit(true)} style={styles.iconBtn}>
                <MaterialCommunityIcons name="pencil-outline" size={20} color={Colors.purple400} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.error} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                <MaterialCommunityIcons name="close" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              {/* Meta */}
              <View style={styles.metaRow}>
                <View style={[styles.badge, { backgroundColor: meta.color + '22', borderColor: meta.color + '66' }]}>
                  <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
                </View>
                {liveTask.category ? (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>#{liveTask.category}</Text>
                  </View>
                ) : null}
                <Text style={styles.xpLabel}>+{meta.xp} XP</Text>
              </View>

              {liveTask.description ? (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Description</Text>
                  <Text style={styles.body}>{liveTask.description}</Text>
                </View>
              ) : null}

              {liveTask.dueDate ? (() => {
                const isPastDue = !liveTask.isCompleted && new Date(liveTask.dueDate) < new Date();
                return (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color={isPastDue ? Colors.error : Colors.success} />
                    <Text style={[styles.infoText, { color: isPastDue ? Colors.error : Colors.success }]}>
                      Due: {new Date(liveTask.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                );
              })() : null}

              {liveTask.isRecurring ? (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="refresh" size={14} color={Colors.blue400} />
                  <Text style={[styles.infoText, { color: Colors.blue400 }]}>
                    Recurring: {liveTask.recurPattern}
                  </Text>
                </View>
              ) : null}

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar-plus" size={14} color={Colors.textMuted} />
                <Text style={styles.infoText}>Created: {new Date(liveTask.createdAt).toLocaleDateString()}</Text>
              </View>

              {liveTask.notes ? (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Notes</Text>
                  <Text style={styles.body}>{liveTask.notes}</Text>
                </View>
              ) : null}

              {/* Subtasks */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  Subtasks ({liveTask.subtasks.filter(s => s.isCompleted).length}/{liveTask.subtasks.length})
                </Text>
                {liveTask.subtasks.map(sub => (
                  <View key={sub.id} style={styles.subtaskRow}>
                    <Checkbox.Android
                      status={sub.isCompleted ? 'checked' : 'unchecked'}
                      onPress={() => updateSubtask(sub.id, { isCompleted: !sub.isCompleted })}
                      color={Colors.purple400}
                      uncheckedColor={Colors.border}
                    />
                    <Text style={[styles.subtaskText, sub.isCompleted && styles.subtaskDone]}>
                      {sub.title}
                    </Text>
                    <TouchableOpacity onPress={() => deleteSubtask(sub.id)}>
                      <MaterialCommunityIcons name="close" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.addSubtaskRow}>
                  <TextInput
                    value={newSubtask}
                    onChangeText={setNewSubtask}
                    placeholder="Add subtask..."
                    placeholderTextColor={Colors.textMuted}
                    mode="outlined"
                    dense
                    outlineColor={Colors.border}
                    activeOutlineColor={Colors.purple500}
                    textColor={Colors.textPrimary}
                    theme={{ colors: { background: Colors.card } }}
                    style={styles.subtaskInput}
                    onSubmitEditing={handleAddSubtask}
                  />
                  <TouchableOpacity onPress={handleAddSubtask} style={styles.addBtn}>
                    <MaterialCommunityIcons name="plus" size={22} color={Colors.purple400} />
                  </TouchableOpacity>
                </View>
              </View>

              {onComplete && (
                <Button
                  mode="contained"
                  buttonColor={Colors.xp}
                  labelStyle={{ color: Colors.bg, fontWeight: '700' }}
                  style={styles.completeBtn}
                  onPress={() => { onComplete(liveTask); onClose(); }}
                  icon="check"
                >
                  Complete Task
                </Button>
              )}
            </ScrollView>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      <TaskFormModal
        visible={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={input => updateTask(liveTask.id, input as Parameters<typeof updateTask>[1])}
        initialValues={liveTask}
        title="Edit Task"
      />
    </>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%',
    borderTopWidth: 1, borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderColor: Colors.border, gap: 8,
  },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },
  headerTitle: { flex: 1, color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  iconBtn: { padding: 4 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  badge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  categoryBadge: { backgroundColor: Colors.blue900, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { color: Colors.blue300, fontSize: 12 },
  xpLabel: { color: Colors.xp, fontWeight: '700', fontSize: 13 },
  section: { gap: 6 },
  sectionLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  body: { color: Colors.textPrimary, fontSize: 14, lineHeight: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { color: Colors.textMuted, fontSize: 13 },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  subtaskText: { flex: 1, color: Colors.textPrimary, fontSize: 14 },
  subtaskDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  addSubtaskRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  subtaskInput: { flex: 1, backgroundColor: Colors.card },
  addBtn: { padding: 4 },
  completeBtn: { marginTop: 8, borderRadius: 10 },
});
