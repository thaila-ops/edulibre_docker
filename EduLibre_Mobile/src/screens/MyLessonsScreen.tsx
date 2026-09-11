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
import {
  deleteLesson,
  fetchLessonsByProfessor,
} from '../services/lessons';
import { AuthUser } from '../types/auth';
import { Lesson } from '../types/lesson';
import { SafeAreaView } from 'react-native-safe-area-context';

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
              currentLessons.filter((currentLesson) => currentLesson.id !== lesson.id),
            );

            Alert.alert('Aula excluída', 'A aula foi removida com sucesso.');
          } catch (error: any) {
            const message =
              error?.response?.data?.message ??
              'Não foi possível excluir a aula. Tente novamente.';

            Alert.alert('Erro ao excluir', message);
          }
        },
      },
    ],
  );
}

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={navigation.goBack}>
        <Text style={styles.back}>← Voltar</Text>
      </Pressable>

      <Text style={styles.title}>Minhas aulas</Text>
      <Text style={styles.subtitle}>
        Gerencie as aulas que você publicou.
      </Text>

      <Pressable
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateLesson')}
      >
        <Text style={styles.createButtonText}>+ Publicar nova aula</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator size="large" color="#b75c29" style={styles.loader} />
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && !error && lessons.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Você ainda não publicou aulas.</Text>
          <Text style={styles.emptyText}>
            Use o botão acima para publicar sua primeira aula.
          </Text>
        </View>
      ) : null}

      {lessons.map((lesson) => (
        <View key={lesson.id} style={styles.lessonCard}>
          <Text style={styles.lessonTitle}>{lesson.materia}</Text>
          <Text style={styles.lessonPrice}>
            R$ {Number(lesson.valor).toFixed(2).replace('.', ',')}
          </Text>
          <Text style={styles.lessonDescription}>
            {lesson.descricao || 'Sem descrição.'}
          </Text>
          <View style={styles.actions}>
  <Pressable
    style={styles.editButton}
    onPress={() => navigation.navigate('EditLesson', { lesson })}
  >
    <Text style={styles.editButtonText}>Editar</Text>
  </Pressable>

  <Pressable
    style={styles.deleteButton}
    onPress={() => handleDeleteLesson(lesson)}
  >
    <Text style={styles.deleteButtonText}>Excluir</Text>
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
    marginBottom: 20,
  },
  createButton: {
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#b75c29',
    paddingVertical: 15,
    marginBottom: 24,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  loader: {
    marginTop: 32,
  },
  error: {
    color: '#b42318',
    fontSize: 16,
    marginTop: 16,
  },
  emptyCard: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  emptyTitle: {
    color: '#1f2a44',
    fontSize: 17,
    fontWeight: '700',
  },
  emptyText: {
    color: '#5f6572',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  lessonCard: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 18,
    marginBottom: 14,
  },
  lessonTitle: {
    color: '#1f2a44',
    fontSize: 19,
    fontWeight: '700',
  },
  lessonPrice: {
    color: '#b75c29',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
  },
  lessonDescription: {
    color: '#5f6572',
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
  borderColor: '#b75c29',
  borderRadius: 10,
  paddingVertical: 11,
},
editButtonText: {
  color: '#b75c29',
  fontSize: 15,
  fontWeight: '700',
},
deleteButton: {
  flex: 1,
  alignItems: 'center',
  borderRadius: 10,
  backgroundColor: '#b42318',
  paddingVertical: 11,
},
deleteButtonText: {
  color: '#ffffff',
  fontSize: 15,
  fontWeight: '700',
},
});