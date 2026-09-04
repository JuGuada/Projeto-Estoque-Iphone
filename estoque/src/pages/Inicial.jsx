import { useAuth } from "../contexts/authContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Carrinho() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <div>
            <h1>Inicial</h1>
            <button onClick={handleLogout}>Sair</button>
        </div>
    )
}