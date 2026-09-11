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
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createLesson,
  LessonImage,
} from '../services/lessons';
import { AuthUser } from '../types/auth';
import LessonImageField from '../components/LessonImageField';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
};

export default function CreateLessonScreen({ navigation }: Props) {
  const [materia, setMateria] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<LessonImage | null>(null);
  const { colors } = useTheme();

  async function handleCreateLesson() {
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

      await createLesson({
        materia: materia.trim(),
        valor: numericValue,
        descricao: descricao.trim(),
        professorId: user.id,
        image,
      });

      Alert.alert('Aula publicada!', 'Sua aula foi criada com sucesso.', [
        {
          text: 'Voltar',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (requestError: any) {
      const message =
        requestError?.response?.data?.message ??
        'Não foi possível publicar a aula. Tente novamente.';

      Alert.alert('Erro ao publicar', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={navigation.goBack}>
          <Text style={[styles.back, { color: colors.text }]}>← Voltar</Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.text }]}>
          Publicar aula
        </Text>

        <Text style={[styles.subtitle, { color: colors.mutedText }]}>
          Preencha os dados para disponibilizar sua aula.
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
            placeholder="Ex.: Matemática"
            placeholderTextColor={colors.mutedText}
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
            placeholder="Ex.: 50,00"
            placeholderTextColor={colors.mutedText}
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
            placeholder="Explique sobre a aula, público e conteúdo."
            placeholderTextColor={colors.mutedText}
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
            onPress={handleCreateLesson}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
              {loading ? 'Publicando...' : 'Publicar aula'}
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