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
import { createLesson } from '../services/lessons';
import { AuthUser } from '../types/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      });

      Alert.alert('Aula publicada!', 'Sua aula foi criada com sucesso.', [
        {
          text: 'Ver minhas aulas',
          onPress: () => navigation.navigate('Lessons'),
        },
      ]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        'Não foi possível publicar a aula. Tente novamente.';

      Alert.alert('Erro ao publicar', message);
    } finally {
      setLoading(false);
    }
  }

  return (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={navigation.goBack}>
        <Text style={styles.back}>← Voltar</Text>
      </Pressable>

      <Text style={styles.title}>Publicar aula</Text>
      <Text style={styles.subtitle}>
        Preencha os dados para disponibilizar sua aula.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Matéria</Text>
        <TextInput
          style={styles.input}
          value={materia}
          onChangeText={setMateria}
          placeholder="Ex.: Matemática"
        />

        <Text style={styles.label}>Valor da aula (R$)</Text>
        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={setValor}
          placeholder="Ex.: 50,00"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Explique sobre a aula, público e conteúdo."
          multiline
          textAlignVertical="top"
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreateLesson}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
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
  backgroundColor: '#fffaf4',
 },
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fffaf4',
  },
  back: {
    color: '#8a4d18',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 28,
  },
  title: {
    color: '#1f2a44',
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: '#5f6572',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    marginBottom: 32,
  },
  form: {
    gap: 10,
  },
  label: {
    color: '#1f2a44',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#dbcdbd',
    borderRadius: 12,
    backgroundColor: '#ffffff',
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
    backgroundColor: '#b75c29',
    marginTop: 24,
    paddingVertical: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});