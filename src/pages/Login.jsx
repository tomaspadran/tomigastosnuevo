import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Wallet, LogIn } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('¡Bienvenido de nuevo!');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Error al iniciar sesión. Revisa tus datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <div className="bg-primary p-4 rounded-2xl shadow-lg">
                        <Wallet className="h-10 w-10 text-white" />
                    </div>
                </div>
                
                <Card className="shadow-xl border-none">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-black italic text-primary">
                            GASTOS COMPARTIDOS
                        </CardTitle>
                        <CardDescription>
                            Sincronización en la nube activa
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="ejemplo@correo.com" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    className="h-12 border-slate-200"
                                    style={{ fontSize: '16px' }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    className="h-12 border-slate-200"
                                    style={{ fontSize: '16px' }}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                type="submit" 
                                className="w-full h-12 text-lg font-bold shadow-md hover:shadow-lg transition-all" 
                                disabled={loading}
                            >
                                {loading ? 'Cargando...' : 'Entrar'}
                                <LogIn className="ml-2 h-5 w-5" />
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
                <div className="text-center mt-8 space-y-2">
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                        Tomi & Gabi • 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;


