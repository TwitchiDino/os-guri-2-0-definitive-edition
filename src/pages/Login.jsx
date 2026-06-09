import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '../firebase/config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Tratando espaços e caixa alta para evitar erros de e-mail inválido
    const cleanedEmail = email.trim().toLowerCase();

    try {
      await signInWithEmailAndPassword(auth, cleanedEmail, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Por favor, insira um e-mail em formato válido.');
      } else {
        setError('Erro ao fazer login: ' + err.message);
      }
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // Tratando espaços e caixa alta para evitar erros de e-mail inválido
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail) {
      setError('Por favor, insira seu e-mail.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, cleanedEmail, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Por favor, insira um e-mail em formato válido.');
      } else {
        setError('Erro ao criar conta: ' + err.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err) {
      setError('Erro com login Google: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%', padding: '20px', boxSizing: 'border-box' }}>
      <div className="game-menu-container">
        <h2>ENCURTADOR DE LINKS</h2>
        <form onSubmit={handleEmailLogin}>
          <div style={{ textAlign: 'left', marginBottom: '5px' }}>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div style={{ textAlign: 'left', marginBottom: '5px' }}>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="primary-button">Entrar</button>
          <button
            type="button"
            onClick={handleEmailSignUp}
            className="signup-button"
          >
            Criar Conta
          </button>
        </form>
        <p className="separator">- OU -</p>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="google-button"
        >
          Google Login
        </button>
      </div>
    </div>
  );
};

export default Login;
