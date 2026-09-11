import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AuthUser } from '../types/auth';

type Props = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

export default function HomeScreen({ navigation }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);

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
    <View style={styles.container}>
      <Text style={styles.greeting}>
        Olá, {user?.name ?? 'usuária'}!
      </Text>

      <Text style={styles.subtitle}>
        O que você deseja fazer hoje?
      </Text>

      <Pressable
  style={styles.primaryButton}
  onPress={() => navigation.navigate('Lessons')}
>
        <Text style={styles.primaryButtonText}>Ver aulas</Text>
      </Pressable>
      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('CreateLesson')}
        >
        <Text style={styles.primaryButtonText}>Publicar aula</Text>
        </Pressable>

      <Pressable
  style={styles.secondaryButton}
  onPress={() => navigation.navigate('MyLessons')}
>
  <Text style={styles.secondaryButtonText}>Minhas aulas</Text>
</Pressable>

<Pressable style={styles.logoutButton} onPress={handleLogout}>
  <Text style={styles.logoutButtonText}>Sair</Text>
</Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fcf7ef',
  },
  greeting: {
    color: '#0f3557',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 36,
    color: '#5e5145',
    fontSize: 17,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 14,
    backgroundColor: '#bd6338',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButton: {
    marginTop: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#bd6338',
    borderRadius: 14,
  },
  secondaryButtonText: {
    color: '#bd6338',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 42,
    alignSelf: 'center',
  },
  logoutButtonText: {
    color: '#8a4731',
    fontSize: 16,
    fontWeight: '700',
  },
});