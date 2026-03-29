import 'dotenv/config';
import express from 'express';
import sgMail from '@sendgrid/mail';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Configuration for Supabase (using project fallbacks for simplicity)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tomi-tomigastosnuevo.4ilna4.easypanel.host';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1cnVyYmZjb3RuZWJnYW1oZ2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTEzNDcsImV4cCI6MjA4MzAyNzM0N30.OTzen7ePLhG036uK4grHNsZoYfo2oq7RPUrTCSVr33k';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.use(cors());
app.use(express.json());

// Configure SendGrid (Keep existing logic)
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// --------------------------------------------------------------------------
// API ENDPOINT: BALANCE (FOR AUTOMATIONS)
// --------------------------------------------------------------------------
app.get('/api/balance', async (req, res) => {
    try {
        const { data: expenses, error } = await supabase
            .from('expenses')
            .select('*');

        if (error) throw error;

        // Same calculation logic as Dashboard.jsx
        const totalIngresos = expenses
            .filter(e => e.transaction_type === 'ingreso')
            .reduce((acc, curr) => acc + Number(curr.amount), 0);
            
        const totalGastos = expenses
            .filter(e => e.transaction_type === 'gasto' || !e.transaction_type)
            .reduce((acc, curr) => acc + Number(curr.amount), 0);
            
        const totalAhorros = expenses
            .filter(e => e.transaction_type === 'ahorro')
            .reduce((acc, curr) => acc + Number(curr.amount), 0);
            
        const balance = totalIngresos - totalGastos - totalAhorros;

        res.status(200).json({
            balance: balance,
            symbol: "$",
            formatted: `$ ${balance.toLocaleString('es-AR')}`,
            last_update: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error al obtener balance:", error);
        res.status(500).json({ error: 'Failed to calculate balance' });
    }
});

// Endpoint summary for N8N (With breakdown)
app.get('/api/summary', async (req, res) => {
    try {
        const { data: expenses, error } = await supabase.from('expenses').select('*');
        if (error) throw error;

        const ingresos = expenses.filter(e => e.transaction_type === 'ingreso').reduce((a, c) => a + Number(c.amount), 0);
        const gastos = expenses.filter(e => e.transaction_type === 'gasto' || !e.transaction_type).reduce((a, c) => a + Number(c.amount), 0);
        const ahorros = expenses.filter(e => e.transaction_type === 'ahorro').reduce((a, c) => a + Number(c.amount), 0);

        res.status(200).json({
            balance: ingresos - gastos - ahorros,
            total_ingresos: ingresos,
            total_gastos: gastos,
            total_ahorros: ahorros,
            last_movimiento: expenses[0]?.description || 'Sin movimientos'
        });
    } catch (error) {
        res.status(500).json({ error: 'Error general' });
    }
});

// Recover Password logic (Existing)
app.post('/api/recover', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    if (!process.env.SENDGRID_API_KEY) {
        console.error("Attempted to send email but SENDGRID_API_KEY is missing.");
        return res.status(500).json({ error: 'Server misconfiguration: API Key missing' });
    }

    const msg = {
        to: email,
        from: 'no-reply@tomi-gabi-gastos.com', // Change this to your verified sender
        subject: 'Recuperación de Contraseña - Gastos Tomi/Gabi',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #2563eb; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Gastos Tomi/Gabi</h1>
                </div>
                <div style="padding: 20px; color: #333;">
                    <p>Hola,</p>
                    <p>Has solicitado recuperar tu contraseña para la aplicación de <strong>Gastos Tomi/Gabi</strong>.</p>
                    <p>Para continuar con el proceso, utiliza el siguiente código de verificación (simulado):</p>
                    <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 6px; font-weight: bold; font-size: 24px; letter-spacing: 2px; margin: 20px 0;">
                        ${Math.floor(100000 + Math.random() * 900000)}
                    </div>
                    <p>Si no fuiste tú quien solicitó esto, por favor ignora este correo.</p>
                </div>
                <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
                    &copy; ${new Date().getFullYear()} Gastos Tomi/Gabi. Todos los derechos reservados.
                </div>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        console.log(`Email sent to ${email}`);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error(error);
        if (error.response) {
            console.error(error.response.body);
        }
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// --------------------------------------------------------------------------
// SERVE FRONTEND (STATIC FILES)
// --------------------------------------------------------------------------
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Handle SPA routing: All non-API requests serve index.html
app.get('*', (req, res) => {
    // If it starts with /api/, it's a 404 for the API
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Not Found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
});
