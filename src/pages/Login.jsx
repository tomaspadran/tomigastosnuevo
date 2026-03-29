import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Wallet, LogIn, UserPlus, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Creamos un formato de email ficticio para Supabase basado en el usuario
        const emailFormat = identifier.includes('@') ? identifier : `${identifier}@familia.com`;

        try {
            if (isRegistering) {
                // Proceso de Registro
                await signup(emailFormat, password);
                setRegistrationSuccess(true);
                toast.success('¡Registro casi completo!');
            } else {
                // Proceso de Login
                await login(emailFormat, password);
                toast.success('¡Bienvenido!');
                navigate('/dashboard');
            }
        } catch (error) {
            // Muestra el error real de Supabase (ej: "Password should be at least 6 characters")
            console.error("Detalle del error:", error);
            toast.error(error.message || 'Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-foreground transition-colors duration-300">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <div className="bg-primary p-4 rounded-2xl shadow-lg shadow-primary/20">
                        <Wallet className="h-10 w-10 text-primary-foreground" />
                    </div>
                </div>
                
                <Card className="bg-card border-border shadow-2xl overflow-hidden">
                    {registrationSuccess ? (
                        <div className="animate-in fade-in zoom-in duration-500">
                            <CardHeader className="space-y-4 text-center pb-2">
                                <div className="flex justify-center">
                                    <div className="bg-emerald-500/10 p-4 rounded-full ring-8 ring-emerald-500/5">
                                        <Mail className="h-12 w-12 text-emerald-500" />
                                    </div>
                                </div>
                                <CardTitle className="text-3xl font-black tracking-tighter text-foreground uppercase">
                                    ¡Casi listo!
                                </CardTitle>
                                <CardDescription className="text-foreground font-medium text-base px-4">
                                    Revisa tu email para activar tu cuenta y empezar a controlar tus gastos
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 pb-8 text-center">
                                <div className="flex flex-col gap-4">
                                    <div className="p-4 bg-muted/30 rounded-xl border border-border/50 text-sm text-muted-foreground flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                        <span>Te enviamos un enlace de confirmación a tu correo.</span>
                                    </div>
                                    <Button 
                                        onClick={() => {
                                            setRegistrationSuccess(false);
                                            setIsRegistering(false);
                                            setIdentifier('');
                                            setPassword('');
                                        }}
                                        className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                                    >
                                        IR AL LOGIN
                                    </Button>
                                </div>
                            </CardContent>
                        </div>
                    ) : (
                        <>
                            <CardHeader className="space-y-1 text-center">
                                <CardTitle className="text-3xl font-black tracking-tighter text-foreground uppercase">
                                    GASTOS TOMI-GABI
                                </CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    {isRegistering ? 'Crea tu nuevo usuario' : 'Ingresa para gestionar tus finanzas'}
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="text-foreground">Usuario</Label>
                                        <Input 
                                            id="username" 
                                            type="text"
                                            placeholder="Ej: tomi" 
                                            value={identifier} 
                                            onChange={(e) => setIdentifier(e.target.value)} 
                                            required 
                                            className="bg-background border-border text-foreground h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Contraseña (mín. 6 caracteres)</Label>
                                        <Input 
                                            id="password" 
                                            type="password" 
                                            placeholder="••••••••"
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            required 
                                            className="bg-background border-border text-foreground h-12"
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-4">
                                    <Button 
                                        type="submit" 
                                        className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-all" 
                                        disabled={loading}
                                    >
                                        {loading ? 'Procesando...' : isRegistering ? 'REGISTRARSE' : 'ENTRAR'}
                                        {!loading && (isRegistering ? <UserPlus className="ml-2 h-5 w-5" /> : <LogIn className="ml-2 h-5 w-5" />)}
                                    </Button>
                                    
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setIsRegistering(!isRegistering);
                                            setPassword('');
                                        }}
                                        className="text-sm text-primary hover:underline transition-colors"
                                    >
                                        {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
                                    </button>
                                </CardFooter>
                            </form>
                        </>
                    )}
                </Card>
                
                <p className="text-center mt-8 text-slate-500 text-xs uppercase tracking-widest font-bold">
                    Tomi & Gabi • 2026
                </p>
            </div>
        </div>
    );
};

export default Login;

