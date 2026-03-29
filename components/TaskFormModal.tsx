import { useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, Modal, TouchableOpacity,
} from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, PriorityMeta } from '@/constants/theme';
import type { Task, Priority, RecurPattern } from '@/types';
import type { CreateTaskInput } from '@/store/taskStore';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (input: CreateTaskInput) => void;
  initialValues?: Partial<Task>;
  title?: string;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'epic'];
const RECUR_PATTERNS: Array<{ value: RecurPattern; label: string }> = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function TaskFormModal({ visible, onClose, onSave, initialValues, title = 'New Task' }: Props) {
  const [taskTitle, setTaskTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurPattern, setRecurPattern] = useState<RecurPattern>('daily');

  useEffect(() => {
    if (initialValues) {
      setTaskTitle(initialValues.title ?? '');
      setDescription(initialValues.description ?? '');
      setPriority(initialValues.priority ?? 'medium');
      setCategory(initialValues.category ?? '');
      setDueDate(initialValues.dueDate ?? '');
      setNotes(initialValues.notes ?? '');
      setIsRecurring(initialValues.isRecurring ?? false);
      setRecurPattern(initialValues.recurPattern ?? 'daily');
    } else {
      setTaskTitle(''); setDescription(''); setPriority('medium');
      setCategory(''); setDueDate(''); setNotes('');
      setIsRecurring(false); setRecurPattern('daily');
    }
  }, [visible, initialValues]);

  function handleSave() {
    if (!taskTitle.trim()) return;
    onSave({
      title: taskTitle.trim(),
      description: description.trim(),
      priority,
      category: category.trim(),
      dueDate: dueDate.trim() || null,
      notes: notes.trim(),
      isRecurring,
      recurPattern: isRecurring ? recurPattern : null,
    });
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
            <TextInput
              label="Title *"
              value={taskTitle}
              onChangeText={setTaskTitle}
              mode="outlined"
              outlineColor={Colors.border}
              activeOutlineColor={Colors.purple500}
              textColor={Colors.textPrimary}
              theme={{ colors: { background: Colors.card } }}
              style={styles.input}
            />

            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.purple500}
              textColor={Colors.textPrimary}
              theme={{ colors: { background: Colors.card } }}
              style={styles.input}
            />

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map(p => {
                const meta = PriorityMeta[p];
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityBtn,
                      { borderColor: meta.color + '66' },
                      priority === p && { backgroundColor: meta.color + '33', borderColor: meta.color },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={[styles.priorityBtnLabel, { color: priority === p ? meta.color : Colors.textMuted }]}>
                      {meta.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              label="Category / Tag"
              value={category}
              onChangeText={setCategory}
              mode="outlined"
              outlineColor={Colors.border}
              activeOutlineColor={Colors.purple500}
              textColor={Colors.textPrimary}
              theme={{ colors: { background: Colors.card } }}
              style={styles.input}
              placeholder="work, personal, health..."
              placeholderTextColor={Colors.textMuted}
            />

            <TextInput
              label="Due Date (YYYY-MM-DD)"
              value={dueDate}
              onChangeText={setDueDate}
              mode="outlined"
              outlineColor={Colors.border}
              activeOutlineColor={Colors.purple500}
              textColor={Colors.textPrimary}
              theme={{ colors: { background: Colors.card } }}
              style={styles.input}
              placeholder="2026-04-01"
              placeholderTextColor={Colors.textMuted}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Recurring Task</Text>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                color={Colors.purple500}
              />
            </View>

            {isRecurring && (
              <View style={styles.recurRow}>
                {RECUR_PATTERNS.map(r => (
                  <TouchableOpacity
                    key={r.value}
                    style={[
                      styles.recurBtn,
                      recurPattern === r.value && styles.recurBtnActive,
                    ]}
                    onPress={() => setRecurPattern(r.value)}
                  >
                    <Text style={[styles.recurLabel, recurPattern === r.value && styles.recurLabelActive]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TextInput
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={3}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.purple500}
              textColor={Colors.textPrimary}
              theme={{ colors: { background: Colors.card } }}
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleSave}
              disabled={!taskTitle.trim()}
              buttonColor={Colors.purple500}
              style={styles.saveBtn}
            >
              Save Task
            </Button>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '92%',
    borderTopWidth: 1, borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 17, fontWeight: '700' },
  scroll: {},
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  input: { backgroundColor: Colors.card },
  label: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, alignItems: 'center',
  },
  priorityBtnLabel: { fontSize: 13, fontWeight: '700' },
  switchRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 4,
  },
  switchLabel: { color: Colors.textPrimary, fontSize: 14 },
  recurRow: { flexDirection: 'row', gap: 8 },
  recurBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  recurBtnActive: {
    backgroundColor: Colors.blue500 + '33', borderColor: Colors.blue500,
  },
  recurLabel: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  recurLabelActive: { color: Colors.blue400 },
  saveBtn: { marginTop: 8, borderRadius: 10 },
});
