import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

export function useColorScheme() {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();

  useEffect(() => {
    AsyncStorage.getItem('theme').then((savedTheme) => {
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setColorScheme(savedTheme);
      } else {
        // No saved preference — default to dark on first launch
        setColorScheme('dark');
        AsyncStorage.setItem('theme', 'dark');
      }
    });
  }, [setColorScheme]);

  return colorScheme;
}

export function useThemeToggle() {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();

  const toggleTheme = async () => {
    const nextTheme = colorScheme === 'dark' ? 'light' : 'dark';
    await AsyncStorage.setItem('theme', nextTheme);
    setColorScheme(nextTheme);
  };

  return { colorScheme, toggleTheme, setColorScheme };
}
