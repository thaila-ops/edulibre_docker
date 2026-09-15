import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AuthUser } from '../types/auth';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

export default function HomeScreen({ navigation }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const { colors } = useTheme();
  const canManageLessons =
  user?.isSuperAdmin === true ||
  user?.roles?.includes('professor') === true;

  useEffect(() => {
    async function loadUser() {
      const storedUser = await SecureStore.getItemAsync('edulivre_user');

      if (storedUser) {
        setUser(JSON.parse(storedUser) as AuthUser);
      }
    }

    void loadUser();
  }, []);

  async function handleLogout() {
    await SecureStore.deleteItemAsync('edulivre_token');
    await SecureStore.deleteItemAsync('edulivre_user');

    navigation.navigate('Welcome');
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      

      <Text style={[styles.greeting, { color: colors.text }]}>
        Olá, {user?.name ?? 'usuária'}!
      </Text>

      <Text style={[styles.subtitle, { color: colors.mutedText }]}>
        O que você deseja fazer hoje?
      </Text>

      <Pressable
        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Lessons')}
      >
        <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
          Ver aulas
        </Text>
      </Pressable>

     {canManageLessons ? (
  <>
    <Pressable
      style={[styles.primaryButton, { backgroundColor: colors.primary }]}
      onPress={() => navigation.navigate('CreateLesson')}
    >
      <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
        Publicar aula
      </Text>
    </Pressable>

    <Pressable
      style={[styles.secondaryButton, { borderColor: colors.primary }]}
      onPress={() => navigation.navigate('MyLessons')}
    >
      <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
        Minhas aulas
      </Text>
    </Pressable>
  </>
) : null}

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={[styles.logoutButtonText, { color: colors.danger }]}>
          Sair
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
 
  greeting: {
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 36,
    fontSize: 17,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButton: {
    marginTop: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderRadius: 14,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 42,
    alignSelf: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});