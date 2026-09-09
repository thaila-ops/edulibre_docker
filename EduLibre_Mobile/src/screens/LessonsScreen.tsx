import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { API_URL } from '../services/api';
import { fetchLessons } from '../services/lessons';
import { Lesson } from '../types/lesson';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

function getImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;

  if (
    imageUrl.startsWith('http')
    || imageUrl.startsWith('data:image')
  ) {
    return imageUrl;
  }

  return `${API_URL}${imageUrl}`;
}

export default function LessonsScreen({ navigation }: Props) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function loadLessons(isRefreshing = false) {
    try {
      setError('');

      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetchLessons();
      setLessons(response.data);
    } catch {
      setError('Não foi possível carregar as aulas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadLessons();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#bd6338" />
        <Text style={styles.loadingText}>Carregando aulas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={navigation.goBack}>
        <Text style={styles.backButton}>← Voltar</Text>
      </Pressable>

      <Text style={styles.title}>Aulas disponíveis</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={lessons}
        keyExtractor={(lesson) => String(lesson.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void loadLessons(true);
            }}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nenhuma aula disponível no momento.
          </Text>
        }
        renderItem={({ item }) => {
          const imageUrl = getImageUrl(item.imageUrl);

          return (
            <View style={styles.card}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>EduLivre</Text>
                </View>
              )}

              <Text style={styles.subject}>{item.materia}</Text>

              <Text style={styles.teacher}>
                Professor: {item.professor?.name ?? 'Não informado'}
              </Text>

              {item.descricao ? (
                <Text style={styles.description} numberOfLines={2}>
                  {item.descricao}
                </Text>
              ) : null}

              <Text style={styles.price}>
                R$ {Number(item.valor).toFixed(2).replace('.', ',')}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 52,
    backgroundColor: '#fcf7ef',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fcf7ef',
  },
  loadingText: {
    marginTop: 12,
    color: '#5e5145',
  },
  backButton: {
    color: '#0f3557',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    marginTop: 24,
    marginBottom: 18,
    color: '#0f3557',
    fontSize: 28,
    fontWeight: '800',
  },
  list: {
    paddingBottom: 32,
    gap: 14,
  },
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eadfce',
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  image: {
    width: '100%',
    height: 150,
  },
  imagePlaceholder: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eadfce',
  },
  imagePlaceholderText: {
    color: '#0f3557',
    fontSize: 20,
    fontWeight: '800',
  },
  subject: {
    marginTop: 14,
    marginHorizontal: 14,
    color: '#0f3557',
    fontSize: 20,
    fontWeight: '800',
  },
  teacher: {
    marginTop: 6,
    marginHorizontal: 14,
    color: '#5e5145',
  },
  description: {
    marginTop: 10,
    marginHorizontal: 14,
    color: '#5e5145',
    lineHeight: 20,
  },
  price: {
    margin: 14,
    color: '#bd6338',
    fontSize: 18,
    fontWeight: '800',
  },
  empty: {
    marginTop: 48,
    color: '#5e5145',
    textAlign: 'center',
  },
  error: {
    marginBottom: 14,
    color: '#a63122',
  },
});