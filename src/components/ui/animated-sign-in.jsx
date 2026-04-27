import React, { useState, useEffect, useMemo } from "react";
import {
  Eye,
  EyeOff,
  Github,
  Twitter,
  Linkedin,
  Sun,
  Moon,
  Loader2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "../../index.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // Email validation
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // Handle email change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (e.target.value) {
      setIsEmailValid(validateEmail(e.target.value));
    } else {
      setIsEmailValid(true);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsFormSubmitted(true);

    if (email && password && (isRegistering ? validateEmail(email) : true)) {
      setLoading(true);
      
      // Creamos un formato de email ficticio si el usuario no pone @
      const emailFormat = email.includes('@') ? email : `${email}@familia.com`;

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
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark-mode");
    document.documentElement.classList.toggle("dark");
  };

  // Initialize theme
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add("dark-mode");
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Create particles
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
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = isDarkMode
          ? `rgba(255, 255, 255, ${Math.random() * 0.2})`
          : `rgba(0, 0, 100, ${Math.random() * 0.1})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles = [];
    const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000));

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const particle of particles) {
        particle.update();
        particle.draw();
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, [isDarkMode]);

  return (
    <div className={`login-container ${isDarkMode ? "dark" : "light"}`}>
      <canvas id="particles" className="particles-canvas"></canvas>

      <div className="theme-toggle" onClick={toggleDarkMode}>
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </div>

      <div className="login-card">
        <div className="login-card-inner">
          <div className="login-header">
            <h1>{isRegistering ? "Crear Cuenta" : "Welcome"}</h1>
            <p>{isRegistering ? "Únete a nosotros" : "Please sign in to continue"}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div
              className={`form-field ${
                isEmailFocused || email ? "active" : ""
              } ${!isEmailValid && email ? "invalid" : ""}`}
            >
              <input
                type="text"
                id="email"
                value={email}
                onChange={handleEmailChange}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                placeholder="Email Address"
                required
              />
              {!isEmailValid && email && (
                <span className="error-message">
                  Please enter a valid email
                </span>
              )}
            </div>

            <div
              className={`form-field ${
                isPasswordFocused || password ? "active" : ""
              }`}
            >
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                placeholder="Password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <span className="checkmark"></span>
                Remember me
              </label>

              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading || (isFormSubmitted && (!email || !password || !isEmailValid))}
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : (isRegistering ? "Sign Up" : "Sign In")}
            </button>
          </form>

          <div className="separator">
            <span>or continue with</span>
          </div>

          <div className="social-login">
            <button className="social-button github">
              <Github size={18} />
            </button>
            <button className="social-button twitter">
              <Twitter size={18} />
            </button>
            <button className="social-button linkedin">
              <Linkedin size={18} />
            </button>
          </div>

          <p className="signup-prompt">
            {isRegistering ? "¿Ya tienes cuenta?" : "Don't have an account?"}{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(!isRegistering); }}>
              {isRegistering ? "Sign in" : "Sign up"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
