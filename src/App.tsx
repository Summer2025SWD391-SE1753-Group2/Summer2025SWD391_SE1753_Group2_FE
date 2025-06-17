import { Toaster } from "@/components/ui/sonner";
import { AppRouter } from "@/router/AppRouter";

import { useAuthStore } from "@/stores/auth";
import { useEffect } from "react";



function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth(); // Gọi khi app khởi động
  }, [checkAuth]);

  return (
    <>

      <Toaster position="top-right" />
      <AppRouter />
    </>
  );
}

export default App;
