import { AuthProvider } from '@/contexts/AuthContext';
import { AppRouter } from '@/components/layout/AppRouter';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
