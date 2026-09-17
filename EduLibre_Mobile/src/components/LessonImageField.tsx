import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LessonImage } from '../services/lessons';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  value: LessonImage | null;
  onChange: (image: LessonImage | null) => void;
};

export default function LessonImageField({ value, onChange }: Props) {
  const { colors } = useTheme();

  async function chooseFromGallery() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permissão necessária',
        'Permita o acesso às fotos para escolher uma imagem da aula.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      onChange(result.assets[0]);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permissão necessária',
        'Permita o uso da câmera para fotografar a aula.',
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      onChange(result.assets[0]);
    }
  }

  return (
    <View>
      <Text style={[styles.label, { color: colors.text }]}>
        Imagem da aula
      </Text>

      <View style={styles.actions}>
        <Pressable
          style={[styles.galleryButton, { borderColor: colors.primary }]}
          onPress={chooseFromGallery}
        >
          <Text style={[styles.galleryButtonText, { color: colors.primary }]}>
            Escolher foto
          </Text>
        </Pressable>

        <Pressable
          style={[styles.cameraButton, { backgroundColor: colors.text }]}
          onPress={takePhoto}
        >
          <Text style={[styles.cameraButtonText, { color: colors.background }]}>
            Usar câmera
          </Text>
        </Pressable>
      </View>

      {value ? (
        <View>
          <Image source={{ uri: value.uri }} style={styles.preview} />

          <Pressable style={styles.removeButton} onPress={() => onChange(null)}>
            <Text style={[styles.removeButtonText, { color: colors.danger }]}>
              Remover imagem
            </Text>
          </Pressable>
        </View>
      ) : (
        <Text style={[styles.helperText, { color: colors.mutedText }]}>
          A foto é opcional. Formatos aceitos: JPG, PNG ou WEBP.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  galleryButton: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
  },
  galleryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  cameraButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 12,
  },
  cameraButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  preview: {
    width: '100%',
    height: 190,
    borderRadius: 12,
    marginTop: 14,
  },
  removeButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
});