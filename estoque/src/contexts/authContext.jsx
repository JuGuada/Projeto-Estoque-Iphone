import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => {
        try {
            const storedUser = localStorage.getItem("usuario");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });

    const [estaLogado, setEstaLogado] = useState(() => {
        return localStorage.getItem("estaLogado") === "true";
    });

    const [carregando, setCarregando] = useState(false);
    const [token, setToken] = useState(() => {
        try {
            return localStorage.getItem("token") || null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        if (estaLogado && usuario) {
            localStorage.setItem("usuario", JSON.stringify(usuario));
            localStorage.setItem("estaLogado", "true");
            if (token) {
                localStorage.setItem("token", token);
            }
        } else {
            localStorage.removeItem("usuario");
            localStorage.removeItem("estaLogado");
            localStorage.removeItem("token");
        }
    }, [estaLogado, usuario, token]);

    async function login(email, senha) {
        setCarregando(true);

        try {
            const data = await apiRequest("/usuarios/login", {
                method: "POST",
                body: JSON.stringify({ email, senha }),
            });

            // resposta esperada: { mensagem, token, usuario }
            setUsuario(data.usuario || null);
            setToken(data.token || null);
            setEstaLogado(true);

            if (data.usuario?.tipo === "usuario") {
                sessionStorage.setItem("home-hero-login", String(Date.now()));
            }

            return { sucesso: true, usuario: data.usuario || null };
        } catch (error) {
            console.error(error);
            return {
                sucesso: false,
                mensagem: error.message || 'Erro de comunicaÃ§Ã£o com o servidor.'
            };
        } finally {
            setCarregando(false);
        }
    }

   function logout() {
  setUsuario(null);
  setEstaLogado(false);
  setToken(null);

  localStorage.removeItem("usuario");
  localStorage.removeItem("estaLogado");
  localStorage.removeItem("token");
}

    function getAuthHeaders() {
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    return (
        <AuthContext.Provider
            value={{
                usuario,
                estaLogado,
                carregando,
                login,
                logout,
                token,
                getAuthHeaders,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

