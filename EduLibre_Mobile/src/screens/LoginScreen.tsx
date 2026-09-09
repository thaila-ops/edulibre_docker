import { useState } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { loginRequest } from '../services/auth';

type Props = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const response = await loginRequest(email.trim(), password);

      await SecureStore.setItemAsync('edulivre_token', response.token);
      await SecureStore.setItemAsync(
        'edulivre_user',
        JSON.stringify(response.user),
      );

      Alert.alert(
  'Login realizado',
  `Bem-vinda, ${response.user.name}!`,
  [
    {
      text: 'Continuar',
      onPress: () => navigation.navigate('Home'),
    },
  ],
);
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        const responseData = requestError.response?.data as
          | { message?: string }
          | undefined;

        setError(
          responseData?.message
            ?? 'Não foi possível entrar. Confira seus dados.',
        );
      } else {
        setError('Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={navigation.goBack}>
        <Text style={styles.backButton}>← Voltar</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>Entrar</Text>

        <Text style={styles.subtitle}>
          Acesse sua conta EduLivre.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={styles.primaryButton}
          disabled={loading}
          onPress={() => {
            void handleLogin();
          }}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fcf7ef',
  },
  backButton: {
    marginTop: 24,
    color: '#0f3557',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#0f3557',
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 32,
    color: '#5e5145',
    fontSize: 17,
  },
  input: {
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#ded1c1',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    color: '#30251e',
    fontSize: 16,
  },
  error: {
    marginBottom: 14,
    color: '#a63122',
    fontSize: 14,
  },
  primaryButton: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#bd6338',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
});