import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Wallet, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [identifier, setIdentifier] = useState(''); // Cambiado de email a identifier
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Si el usuario no ingresó un @, le agregamos uno ficticio para que Supabase lo acepte
        const emailFormat = identifier.includes('@') ? identifier : `${identifier}@familia.com`;

        try {
            if (isRegistering) {
                await signup(emailFormat, password);
                toast.success('Cuenta creada. ¡Ya puedes ingresar!');
                setIsRegistering(false);
            } else {
                await login(emailFormat, password);
                toast.success('¡Hola de nuevo!');
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error('Error: Revisa tu usuario o contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 text-slate-200">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <div className="bg-blue-600 p-4 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                        <Wallet className="h-10 w-10 text-white" />
                    </div>
                </div>
                
                <Card className="bg-[#1e293b] border-slate-700 shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-3xl font-black tracking-tighter text-white">
                            GASTOS TOMI-GABI
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            {isRegistering ? 'Crea tu cuenta de usuario' : 'Ingresa para gestionar tus finanzas'}
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-slate-300">Usuario</Label>
                                <Input 
                                    id="username" 
                                    type="text" 
                                    placeholder="Tu nombre de usuario" 
                                    value={identifier} 
                                    onChange={(e) => setIdentifier(e.target.value)} 
                                    required 
                                    className="bg-[#0f172a] border-slate-700 text-white h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    className="bg-[#0f172a] border-slate-700 text-white h-12"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button 
                                type="submit" 
                                className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700" 
                                disabled={loading}
                            >
                                {loading ? 'Procesando...' : isRegistering ? 'Registrarse' : 'Entrar'}
                                {isRegistering ? <UserPlus className="ml-2 h-5 w-5" /> : <LogIn className="ml-2 h-5 w-5" />}
                            </Button>
                            
                            <button 
                                type="button"
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                {isRegistering ? '¿Ya tienes usuario? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
                            </button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Login;



