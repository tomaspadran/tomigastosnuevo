import React, { useState, useEffect, useMemo } from "react";
import {
  Eye,
  EyeOff,
  Github,
  Twitter,
  Linkedin,
  Sun,
  Moon,
  Wallet,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "../../index.css";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsFormSubmitted(true);
    setLoading(true);

    // Creamos un formato de email ficticio para Supabase si es solo un usuario
    const emailFormat = identifier.includes('@') ? identifier : `${identifier}@familia.com`;

    try {
      if (isRegistering) {
        await signup(emailFormat, password);
        toast.success('¡Registro casi completo! Revisa tu email.');
      } else {
        await login(emailFormat, password);
        toast.success('¡Bienvenido!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Detalle del error:", error);
      toast.error(error.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Initialize theme
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  // Create particles background
  useEffect(() => {
    const canvas = document.getElementById("particles");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.color = isDarkMode
          ? `rgba(255, 255, 255, ${Math.random() * 0.15})`
          : `rgba(44, 75, 218, ${Math.random() * 0.15})`;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0 || this.y > canvas.height || this.y < 0) {
          this.reset();
        }
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles = [];
    const particleCount = 80;
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, [isDarkMode]);

  return (
    <div className={`login-container-new ${isDarkMode ? "dark" : ""}`}>
      <canvas id="particles" className="particles-canvas"></canvas>

      <div className="theme-toggle-new" onClick={toggleDarkMode}>
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </div>

      <div className="login-card-new animate-reveal">
        <div className="login-card-inner-new">
          <div className="login-header-new">
            <div className="login-logo-new">
                <Wallet size={32} className="text-white" />
            </div>
            <h1>{isRegistering ? "Crear Cuenta" : "Bienvenido"}</h1>
            <p>{isRegistering ? "Únete a la Familia Viera" : "Ingresa para continuar"}</p>
          </div>

          <form className="login-form-new" onSubmit={handleSubmit}>
            <div className="form-field-new">
              <input
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder=" "
                required
              />
              <label htmlFor="identifier">Usuario o Email</label>
            </div>

            <div className="form-field-new">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
              />
              <label htmlFor="password">Contraseña</label>
              <button
                type="button"
                className="toggle-password-new"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="form-options-new">
              <label className="remember-me-new">
                <input type="checkbox" />
                <span className="checkmark-new"></span>
                Recordarme
              </label>
              <a href="#" className="forgot-password-new">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              className="login-button-new"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" size={24} />
              ) : (
                isRegistering ? "Registrarse" : "Entrar"
              )}
            </button>
          </form>

          <div className="separator-new">
            <span>o continuar con</span>
          </div>

          <div className="social-login-new">
            <button className="social-button-new github">
              <Github size={18} />
            </button>
            <button className="social-button-new twitter">
              <Twitter size={18} />
            </button>
            <button className="social-button-new linkedin">
              <Linkedin size={18} />
            </button>
          </div>

          <p className="signup-prompt-new">
            {isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(!isRegistering); }}>
              {isRegistering ? "Inicia sesión" : "Regístrate aquí"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
