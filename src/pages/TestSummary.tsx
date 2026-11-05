import React, { useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';

export const TestSummary: React.FC = () => {
    const { currentUser } = useAuth();
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleTest = async () => {
        if (!currentUser) {
            setResult('No hay un usuario autenticado.');
            return;
        }

        setLoading(true);
        setResult('');

        try {
            // Obtener el token de Firebase
            const token = await currentUser.getIdToken();

            // Enviar solicitud al backend
            const response = await fetch('/api/send-summary', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            setResult(JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(error);
            setResult('Error al comunicarse con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Prueba de autenticación del backend</h2>

            <p>Usuario: {currentUser?.email}</p>

            <button onClick={handleTest} disabled={loading}>
                {loading ? 'Verificando...' : 'Probar conexión'}
            </button>

            {result && <pre>{result}</pre>}
        </div>
    );
};