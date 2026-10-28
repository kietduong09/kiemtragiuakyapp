import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookDetailScreen from '../screens/BookDetailScreen';
import BookFormScreen from '../screens/BookFormScreen';
import BookListScreen from '../screens/BookListScreen';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="BookList"
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.textOnPrimary,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="BookList" component={BookListScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="BookForm"
          component={BookFormScreen}
          options={({ route }) => ({ title: route.params?.bookId ? 'Sửa sách' : 'Thêm sách' })}
        />
        <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: 'Chi tiết sách' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
