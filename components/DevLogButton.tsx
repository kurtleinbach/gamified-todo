import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useDevLogStore } from '@/store/devLogStore';

export default function DevLogButton() {
  const openLog = useDevLogStore(s => s.openLog);
  return (
    <TouchableOpacity style={styles.btn} onPress={openLog}>
      <MaterialCommunityIcons name="wrench" size={22} color={Colors.purple300} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { marginRight: 16, padding: 4 },
});
