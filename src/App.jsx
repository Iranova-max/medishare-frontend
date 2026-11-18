import { useState, createContext } from "react";
import Login from "./pages/login";
import SuperAdmin from "./pages/superadmin";
import Admin from "./pages/admin";
import Medecin from "./pages/medecins";
import Infirmier from "./pages/infirmier";
import { clearAuthToken, clearStoredUser, getStoredUser, setAuthToken, setStoredUser } from "./services/api";
import LoadingOverlay from "./components/LoadingOverlay";

export const AuthCtx = createContext(null);
const TRANSITION_DELAY_MS = 4000;

export default function App() {
  const [auth, setAuth] = useState(() => getStoredUser());
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogin = (user, token = null) => {
    if (token) setAuthToken(token);
    setStoredUser(user);
    setAuth(user);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await new Promise(resolve => window.setTimeout(resolve, TRANSITION_DELAY_MS));
    clearAuthToken();
    clearStoredUser();
    setAuth(null);
    setLoggingOut(false);
  };

  if (!auth) return <Login onLogin={handleLogin} />;

  const props = { user: auth, onLogout: handleLogout };

  return (
    <AuthCtx.Provider value={{ user: auth, logout: handleLogout }}>
      {auth.role === "super_admin" && <SuperAdmin {...props} />}
      {auth.role === "admin" && <Admin {...props} />}
      {auth.role === "medecin" && <Medecin {...props} />}
      {auth.role === "infirmier" && <Infirmier {...props} />}
      {loggingOut && <LoadingOverlay message="Déconnexion sécurisée en cours…" />}
    </AuthCtx.Provider>
  );
}