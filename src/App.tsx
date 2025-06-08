import { Toaster } from "@/components/ui/sonner";
import { AppRouter } from "@/router/AppRouter";


function App() {
  
  return (
  <>
  <Toaster position="top-right" />
  <AppRouter />
  </>
  );
}

export default App;
