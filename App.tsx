import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import EmptyState from './src/components/EmptyState';
import Toast from './src/components/Toast';
import { BooksProvider, useBooks } from './src/hooks/useBooks';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';

// Chờ đọc xong AsyncStorage rồi mới hiển thị danh sách -> tránh nhấp nháy danh sách rỗng
// và tránh ghi đè dữ liệu bằng state ban đầu.
function Gate() {
  const { status, loadError, reload } = useBooks();

  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (status === 'error') {
    return (
      <View style={styles.center}>
        <EmptyState
          title="Không đọc được dữ liệu"
          message={loadError ?? undefined}
          actionLabel="Thử lại"
          onAction={reload}
        />
      </View>
    );
  }
  return (
    <>
      <AppNavigator />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
      <BooksProvider>
        <Gate />
      </BooksProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
