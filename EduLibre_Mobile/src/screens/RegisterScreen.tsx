import { useState } from 'react';
import axios from 'axios';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerRequest } from '../services/auth';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
};
function formatDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function toApiDate(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) return null;

  const [, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}T12:00:00`);

  const isValidDate =
    !Number.isNaN(date.getTime()) &&
    date.getDate() === Number(day) &&
    date.getMonth() === Number(month) - 1 &&
    date.getFullYear() === Number(year);

  return isValidDate ? `${year}-${month}-${day}` : null;
}
function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}
export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  async function handleRegister() {
    Keyboard.dismiss();

    if (!name.trim() || !email.trim() || !cpf.trim() || !dataNascimento.trim() || !password) {
      setError('Preencha todos os campos.');
      return;
    }

    const cleanCpf = cpf.replace(/\D/g, '');

    if (cleanCpf.length !== 11) {
      setError('Informe um CPF com 11 dígitos.');
      return;
    }
const apiBirthDate = toApiDate(dataNascimento);

if (!apiBirthDate) {
  setError('Use uma data válida no formato DD/MM/AAAA.');
  return;
}

    try {
      setError('');
      setLoading(true);

      await registerRequest({
        name: name.trim(),
        email: email.trim(),
        cpf: cleanCpf,
        dataNascimento: apiBirthDate,
        password,
      });

      Alert.alert(
        'Conta criada!',
        'Agora entre com seu e-mail e senha para acessar a EduLivre.',
        [
          {
            text: 'Ir para o login',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        const responseData = requestError.response?.data as
          | { message?: string }
          | undefined;

        setError(
          responseData?.message ??
            'Não foi possível criar a conta. Tente novamente.',
        );
      } else {
        setError('Não foi possível criar a conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={navigation.goBack}>
          <Text style={[styles.back, { color: colors.text }]}>← Voltar</Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.text }]}>Criar conta</Text>

        <Text style={[styles.subtitle, { color: colors.mutedText }]}>
          Cadastre-se para encontrar e agendar aulas.
        </Text>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>Nome completo</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            placeholderTextColor={colors.mutedText}
          />

          <Text style={[styles.label, { color: colors.text }]}>E-mail</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="voce@email.com"
            placeholderTextColor={colors.mutedText}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <Text style={[styles.label, { color: colors.text }]}>CPF</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={cpf}
            onChangeText={(value) => setCpf(formatCpf(value))}
             placeholder="000.000.000-00"
            placeholderTextColor={colors.mutedText}
            keyboardType="numeric"
          />

          <Text style={[styles.label, { color: colors.text }]}>
            Data de nascimento
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
            value={dataNascimento}
           onChangeText={(value) => setDataNascimento(formatDate(value))}
                placeholder="DD/MM/AAAA"
            placeholderTextColor={colors.mutedText}
            keyboardType="numeric"
          />

          <Text style={[styles.label, { color: colors.text }]}>Senha</Text>
          <TextInput
          
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={password}
            onChangeText={setPassword}
            placeholder="8+ caracteres, letra, número e símbolo"
            placeholderTextColor={colors.mutedText}
          secureTextEntry={!showPassword}
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
              styles.button,
              { backgroundColor: colors.primary },
              loading && styles.buttonDisabled,
            ]}
            disabled={loading}
            onPress={() => {
              void handleRegister();
            }}
          >
            <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
              {loading ? 'Criando conta...' : 'Criar conta'}
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
    marginBottom: 24,
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
  error: {
    fontSize: 14,
    marginTop: 8,
  },
  showPasswordButton: {
  alignSelf: 'flex-end',
  marginTop: -6,
  marginBottom: 4,
},
showPasswordText: {
  fontSize: 14,
  fontWeight: '700',
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