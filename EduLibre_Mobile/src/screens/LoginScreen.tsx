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
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginRequest } from '../services/auth';
import { useTheme } from '../contexts/ThemeContext';

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
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
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

      Alert.alert('Login realizado', `Bem-vinda, ${response.user.name}!`, [
        {
          text: 'Continuar',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        const responseData = requestError.response?.data as
          | { message?: string }
          | undefined;

        setError(
          responseData?.message ??
            'Não foi possível entrar. Confira seus dados.',
        );
      } else {
        setError('Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable onPress={navigation.goBack}>
        <Text style={[styles.backButton, { color: colors.text }]}>
          ← Voltar
        </Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Entrar</Text>

        <Text style={[styles.subtitle, { color: colors.mutedText }]}>
          Acesse sua conta EduLivre.
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
          placeholder="E-mail"
          placeholderTextColor={colors.mutedText}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Senha"
          placeholderTextColor={colors.mutedText}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <Pressable
          style={styles.showPasswordButton}
          onPress={() => setShowPassword((current) => !current)}
        >
          <Text style={[styles.showPasswordText, { color: colors.primary }]}>
            {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          </Text>
        </Pressable>

        {error ? (
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        ) : null}

        <Pressable
          style={[
            styles.primaryButton,
            { backgroundColor: colors.primary },
            loading && styles.disabledButton,
          ]}
          disabled={loading}
          onPress={() => {
            void handleLogin();
          }}
        >
          <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 32,
    fontSize: 17,
  },
  input: {
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 16,
  },
  showPasswordButton: {
  alignSelf: 'flex-end',
  marginTop: -8,
  marginBottom: 6,
},
showPasswordText: {
  fontSize: 14,
  fontWeight: '700',
},
  error: {
    marginBottom: 14,
    fontSize: 14,
  },
  primaryButton: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
});