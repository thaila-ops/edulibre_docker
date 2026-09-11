import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

export default function WelcomeScreen({ navigation }: Props) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View
          style={[
            styles.logo,
            {
              backgroundColor: colors.primary,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.logoText, { color: colors.onPrimary }]}>E</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>EduLivre</Text>

        <Text style={[styles.subtitle, { color: colors.mutedText }]}>
          Aprenda, ensine e evolua em um só lugar.
        </Text>

        <Pressable
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
            Entrar
          </Text>
        </Pressable>

        <Text style={[styles.footer, { color: colors.mutedText }]}>
          Plataforma de aulas particulares.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  logo: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 46,
    borderWidth: 4,
  },
  logoText: {
    fontSize: 46,
    fontWeight: '800',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
  },
  subtitle: {
    maxWidth: 280,
    marginTop: 12,
    fontSize: 18,
    lineHeight: 27,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    marginTop: 40,
    paddingVertical: 16,
    borderRadius: 14,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontSize: 13,
  },
});