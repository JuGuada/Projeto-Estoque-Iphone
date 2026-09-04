import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from '../contexts/authContext.jsx';

export default function RotasPublicas() {
    const { estaLogado, carregando, usuario } = useAuth();
    if (carregando) {
        return <p>Carregando....</p>
    }
    if (estaLogado) {
        // redireciona conforme o tipo do usuário
        if (usuario && usuario.tipo === 'usuario') {
            return <Navigate to="/" />
        }
        return <Navigate to="/dashboard" />
    }
    return <Outlet />
}