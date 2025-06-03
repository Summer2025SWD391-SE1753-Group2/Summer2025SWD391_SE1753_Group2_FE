import { useEffect } from "react";
import { useAuthStore } from "@/store/auth/authStore";
import { AppRouter } from "@/router/AppRouter";

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication status on app startup
    checkAuth();
  }, [checkAuth]);

  return <AppRouter />;
}

export default App;
