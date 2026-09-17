import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  deleteLesson,
  fetchLessonsByProfessor,
} from '../services/lessons';
import { AuthUser } from '../types/auth';
import { Lesson } from '../types/lesson';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: { lesson?: Lesson }) => void;
  };
};

export default function MyLessonsScreen({ navigation }: Props) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { colors } = useTheme();

  const loadMyLessons = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const storedUser = await SecureStore.getItemAsync('edulivre_user');

      if (!storedUser) {
        navigation.navigate('Login');
        return;
      }

      const user = JSON.parse(storedUser) as AuthUser;
      const response = await fetchLessonsByProfessor(user.id);

      setLessons(response.data);
    } catch {
      setError('Não foi possível carregar suas aulas.');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      void loadMyLessons();
    }, [loadMyLessons]),
  );

  function handleDeleteLesson(lesson: Lesson) {
    Alert.alert(
      'Excluir aula',
      `Deseja excluir a aula "${lesson.materia}"? Essa ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLesson(lesson.id);

              setLessons((currentLessons) =>
                currentLessons.filter(
                  (currentLesson) => currentLesson.id !== lesson.id,
                ),
              );

              Alert.alert('Aula excluída', 'A aula foi removida com sucesso.');
            } catch (requestError: any) {
              const message =
                requestError?.response?.data?.message ??
                'Não foi possível excluir a aula. Tente novamente.';

              Alert.alert('Erro ao excluir', message);
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={navigation.goBack}>
          <Text style={[styles.back, { color: colors.text }]}>← Voltar</Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.text }]}>Minhas aulas</Text>

        <Text style={[styles.subtitle, { color: colors.mutedText }]}>
          Gerencie as aulas que você publicou.
        </Text>

        <Pressable
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('CreateLesson')}
        >
          <Text style={[styles.createButtonText, { color: colors.onPrimary }]}>
            + Publicar nova aula
          </Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : null}

        {error ? (
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        ) : null}

        {!loading && !error && lessons.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Você ainda não publicou aulas.
            </Text>

            <Text style={[styles.emptyText, { color: colors.mutedText }]}>
              Use o botão acima para publicar sua primeira aula.
            </Text>
          </View>
        ) : null}

        {lessons.map((lesson) => (
          <View
            key={lesson.id}
            style={[styles.lessonCard, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.lessonTitle, { color: colors.text }]}>
              {lesson.materia}
            </Text>

            <Text style={[styles.lessonPrice, { color: colors.primary }]}>
              R$ {Number(lesson.valor).toFixed(2).replace('.', ',')}
            </Text>

            <Text style={[styles.lessonDescription, { color: colors.mutedText }]}>
              {lesson.descricao || 'Sem descrição.'}
            </Text>

            <View style={styles.actions}>
              <Pressable
                style={[styles.editButton, { borderColor: colors.primary }]}
                onPress={() => navigation.navigate('EditLesson', { lesson })}
              >
                <Text style={[styles.editButtonText, { color: colors.primary }]}>
                  Editar
                </Text>
              </Pressable>

              <Pressable
                style={[styles.deleteButton, { backgroundColor: colors.danger }]}
                onPress={() => handleDeleteLesson(lesson)}
              >
                <Text style={[styles.deleteButtonText, { color: colors.onPrimary }]}>
                  Excluir
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
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
    marginBottom: 20,
  },
  createButton: {
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  loader: {
    marginTop: 32,
  },
  error: {
    fontSize: 16,
    marginTop: 16,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  lessonCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  lessonTitle: {
    fontSize: 19,
    fontWeight: '700',
  },
  lessonPrice: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
  },
  lessonDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  editButton: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 11,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});