import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.content}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>E</Text>
      </View>

      <Text style={styles.title}>EduLivre</Text>

      <Text style={styles.subtitle}>
        Aprenda, ensine e evolua em um só lugar.
      </Text>

      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.primaryButtonText}>Entrar</Text>
      </Pressable>

      <Text style={styles.footer}>
        Plataforma de aulas particulares.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#fcf7ef',
  },
  logo: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 46,
    backgroundColor: '#0f3557',
    borderWidth: 4,
    borderColor: '#c68a2c',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 46,
    fontWeight: '800',
  },
  title: {
    color: '#0f3557',
    fontSize: 36,
    fontWeight: '800',
  },
  subtitle: {
    maxWidth: 280,
    marginTop: 12,
    color: '#5e5145',
    fontSize: 18,
    lineHeight: 27,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    marginTop: 40,
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
  footer: {
    position: 'absolute',
    bottom: 40,
    color: '#74685d',
    fontSize: 13,
  },
});