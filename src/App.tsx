// src/App.tsx
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { InstallPrompt } from "./components/InstallPrompt";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <InstallPrompt />
    </BrowserRouter>
  );
}

export default App;
