import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForceChangePasswordMutation } from '../redux/slices/api/authApiSlice';
import { setCredentials } from '../redux/slices/authSlice';

const ChangePasswordScreen = () => {
    const { user, mustChangePassword } = useSelector(state => state.auth);
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const [forceChangePassword, { isLoading }] = useForceChangePasswordMutation();

    if (user && !mustChangePassword) {
        navigate('/dashboard');
        return null;
    }
    
    if (!user) {
         navigate('/login');
         return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (newPassword.length < 6) { 
             setError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }
        
        try {
            const res = await forceChangePassword({ newPassword }).unwrap();

           
            dispatch(setCredentials({ 
                ...res.user, 
                mustChangePassword: false 
            })); 

            alert(res.message);
            navigate('/dashboard'); 

        } catch (err) {
            setError(err.data?.message || 'Erro ao alterar a senha.');
        }
    };

    return (
        <div>
            <h1>Defina Sua Nova Senha</h1>
            <p>Este é o seu primeiro acesso. Por favor, crie uma senha segura.</p>
            
            <form onSubmit={handleSubmit}>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                
                <input 
                    type="password"
                    placeholder="Nova Senha (mínimo 6 caracteres)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                
                <input 
                    type="password"
                    placeholder="Confirme a Nova Senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Salvando..." : "Alterar Senha"}
                </button>
            </form>
        </div>
    );
};

export default ChangePasswordScreen;