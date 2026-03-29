import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Camera, User, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const Profiles = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(null);
    const navigate = useNavigate();

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .order('name');
            if (error) throw error;
            setMembers(data);
        } catch (error) {
            console.error('Error fetching members:', error);
            toast.error('Error al cargar perfiles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleUpload = async (memberId, name, event) => {
        try {
            const file = event.target.files[0];
            if (!file) return;

            setUploading(memberId);

            // 1. Crear nombre de archivo unico
            const fileExt = file.name.split('.').pop();
            const fileName = `${name.toLowerCase()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // 2. Subir a Storage
            // Nota: El bucket 'avatars' debe ser publico en Supabase
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                // Si el error es que el bucket no existe, avisar al usuario
                if (uploadError.message.includes('bucket not found')) {
                    throw new Error('Primero debes crear un bucket público llamado "avatars" en Supabase Storage.');
                }
                throw uploadError;
            }

            // 3. Obtener URL Publica
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 4. Actualizar tabla members
            const { error: updateError } = await supabase
                .from('members')
                .update({ avatar_url: publicUrl })
                .eq('id', memberId);

            if (updateError) throw updateError;

            toast.success(`Foto de ${name} actualizada`);
            fetchMembers();
        } catch (error) {
            console.error('Error uploading:', error);
            toast.error(error.message || 'Error al subir la imagen');
        } finally {
            setUploading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Volver al Dashboard
                </Button>

                <div className="flex flex-col gap-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-foreground">
                            Perfiles de Usuario
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg">
                            Personaliza las fotos de Tomi y Gabi
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {members.map((member) => (
                            <Card key={member.id} className="overflow-hidden border-border bg-card/50 backdrop-blur shadow-xl hover:shadow-2xl transition-all duration-300">
                                <CardHeader className="p-0 h-48 bg-gradient-to-br from-primary/20 to-primary/5 relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {member.avatar_url ? (
                                            <img 
                                                src={member.avatar_url} 
                                                alt={member.name} 
                                                className="w-32 h-32 rounded-full object-cover border-4 border-card shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-card flex items-center justify-center border-4 border-slate-100 dark:border-slate-800 shadow-sm text-muted-foreground italic font-bold text-3xl uppercase tracking-tighter">
                                                {member.name.charAt(0)}
                                            </div>
                                        )}
                                        <label className="absolute bottom-6 right-1/4 translate-x-12 cursor-pointer bg-primary p-2.5 rounded-full text-white shadow-lg hover:scale-110 active:scale-95 transition-all">
                                            <Camera className="w-5 h-5" />
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={(e) => handleUpload(member.id, member.name, e)}
                                                disabled={uploading === member.id}
                                            />
                                        </label>
                                    </div>
                                    {member.avatar_url && (
                                        <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-600 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Foto Activa
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="p-6 text-center">
                                    <CardTitle className="text-2xl font-black uppercase italic tracking-tight mb-2">
                                        {member.name}
                                    </CardTitle>
                                    <CardDescription className="text-sm font-medium mb-6">
                                        Socio de la cuenta compartida
                                    </CardDescription>

                                    {uploading === member.id && (
                                        <div className="flex items-center justify-center gap-2 text-primary font-bold animate-pulse py-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Actualizando...
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profiles;
