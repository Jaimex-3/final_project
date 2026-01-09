import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ToastStack from "./components/ToastStack";
import Router from "./router";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
        <ToastStack />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
