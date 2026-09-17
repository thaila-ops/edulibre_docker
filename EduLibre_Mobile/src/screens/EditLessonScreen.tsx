import { useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useRoute } from '@react-navigation/native';
import {
  LessonImage,
  updateLesson,
} from '../services/lessons';
import { AuthUser } from '../types/auth';
import { Lesson } from '../types/lesson';
import LessonImageField from '../components/LessonImageField';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
};

export default function EditLessonScreen({ navigation }: Props) {
  const route = useRoute();
  const { lesson } = route.params as { lesson: Lesson };

  const [materia, setMateria] = useState(lesson.materia);
  const [valor, setValor] = useState(String(lesson.valor));
  const [descricao, setDescricao] = useState(lesson.descricao ?? '');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<LessonImage | null>(null);
  const { colors } = useTheme();

  async function handleUpdateLesson() {
    Keyboard.dismiss();

    if (!materia.trim() || !valor.trim() || !descricao.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha matéria, valor e descrição.');
      return;
    }

    const numericValue = Number(valor.replace(',', '.'));

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      Alert.alert('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }

    const storedUser = await SecureStore.getItemAsync('edulivre_user');

    if (!storedUser) {
      Alert.alert('Sessão expirada', 'Faça login novamente.');
      navigation.navigate('Login');
      return;
    }

    const user = JSON.parse(storedUser) as AuthUser;

    try {
      setLoading(true);

      await updateLesson(lesson.id, {
        materia: materia.trim(),
        valor: numericValue,
        descricao: descricao.trim(),
        professorId: user.id,
        image,
      });

      Alert.alert('Aula atualizada!', 'As alterações foram salvas.', [
        {
          text: 'Voltar para minhas aulas',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (requestError: any) {
      const message =
        requestError?.response?.data?.message ??
        'Não foi possível atualizar a aula. Tente novamente.';

      Alert.alert('Erro ao atualizar', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Pressable onPress={navigation.goBack}>
          <Text style={[styles.back, { color: colors.text }]}>← Voltar</Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.text }]}>Editar aula</Text>

        <Text style={[styles.subtitle, { color: colors.mutedText }]}>
          Atualize os dados da sua aula.
        </Text>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>Matéria</Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={materia}
            onChangeText={setMateria}
          />

          <Text style={[styles.label, { color: colors.text }]}>
            Valor da aula (R$)
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={valor}
            onChangeText={setValor}
            keyboardType="decimal-pad"
          />

          <Text style={[styles.label, { color: colors.text }]}>Descrição</Text>

          <TextInput
            style={[
              styles.input,
              styles.textarea,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={descricao}
            onChangeText={setDescricao}
            multiline
            textAlignVertical="top"
          />

          <LessonImageField value={image} onChange={setImage} />

          <Pressable
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleUpdateLesson}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 24,
  },
  back: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    marginBottom: 32,
  },
  form: {
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  textarea: {
    minHeight: 130,
    paddingTop: 14,
  },
  button: {
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 24,
    paddingVertical: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});