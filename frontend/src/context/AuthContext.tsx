import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../api/axios";

interface AuthContextType {
  accessToken: string | null;
  userId: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken"),
  );

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken) {
      api.get("/auth/me").then((res) => {
        setUserId(res.data.id);
      });
    } else {
      setUserId(null);
    }
  }, [accessToken]);

  const login = (token: string) => {
    localStorage.setItem("accessToken", token);
    setAccessToken(token);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
