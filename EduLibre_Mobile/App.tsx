import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import HomeScreen from './src/screens/HomeScreen';
import LessonsScreen from './src/screens/LessonsScreen';
import CreateLessonScreen from './src/screens/CreateLessonScreen';
  import MyLessonsScreen from './src/screens/MyLessonsScreen';
  import EditLessonScreen from './src/screens/EditLessonScreen';
  import { ThemeProvider } from './src/contexts/ThemeContext';
  import RegisterScreen from './src/screens/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
  <ThemeProvider>
    <NavigationContainer>
      <StatusBar style="auto" />

      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Lessons" component={LessonsScreen} />
        <Stack.Screen name="CreateLesson" component={CreateLessonScreen} />
        <Stack.Screen name="MyLessons" component={MyLessonsScreen} />
        <Stack.Screen name="EditLesson" component={EditLessonScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
        </NavigationContainer>
  </ThemeProvider>
);
  
}