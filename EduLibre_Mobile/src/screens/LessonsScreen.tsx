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
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../services/api';
import { fetchLessons } from '../services/lessons';
import { Lesson } from '../types/lesson';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

function getImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;

  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:image')) {
    return imageUrl;
  }

  return `${API_URL}${imageUrl}`;
}

export default function LessonsScreen({ navigation }: Props) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const { colors } = useTheme();

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
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedText }]}>
            Carregando aulas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Pressable onPress={navigation.goBack}>
          <Text style={[styles.backButton, { color: colors.text }]}>
            ← Voltar
          </Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.text }]}>
          Aulas disponíveis
        </Text>

        {error ? (
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        ) : null}

        <FlatList
          data={lessons}
          keyExtractor={(lesson) => String(lesson.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor={colors.primary}
              onRefresh={() => {
                void loadLessons(true);
              }}
            />
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.mutedText }]}>
              Nenhuma aula disponível no momento.
            </Text>
          }
          renderItem={({ item }) => {
            const imageUrl = getImageUrl(item.imageUrl);

            return (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.image} />
                ) : (
                  <View
                    style={[
                      styles.imagePlaceholder,
                      { backgroundColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.imagePlaceholderText,
                        { color: colors.text },
                      ]}
                    >
                      EduLivre
                    </Text>
                  </View>
                )}

                <Text style={[styles.subject, { color: colors.text }]}>
                  {item.materia}
                </Text>

                <Text style={[styles.teacher, { color: colors.mutedText }]}>
                  Professor: {item.professor?.name ?? 'Não informado'}
                </Text>

                {item.descricao ? (
                  <Text
                    style={[styles.description, { color: colors.mutedText }]}
                    numberOfLines={2}
                  >
                    {item.descricao}
                  </Text>
                ) : null}

                <Text style={[styles.price, { color: colors.primary }]}>
                  R$ {Number(item.valor).toFixed(2).replace('.', ',')}
                </Text>
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    marginTop: 24,
    marginBottom: 18,
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
    borderRadius: 16,
  },
  image: {
    width: '100%',
    height: 150,
  },
  imagePlaceholder: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 20,
    fontWeight: '800',
  },
  subject: {
    marginTop: 14,
    marginHorizontal: 14,
    fontSize: 20,
    fontWeight: '800',
  },
  teacher: {
    marginTop: 6,
    marginHorizontal: 14,
  },
  description: {
    marginTop: 10,
    marginHorizontal: 14,
    lineHeight: 20,
  },
  price: {
    margin: 14,
    fontSize: 18,
    fontWeight: '800',
  },
  empty: {
    marginTop: 48,
    textAlign: 'center',
  },
  error: {
    marginBottom: 14,
  },
});