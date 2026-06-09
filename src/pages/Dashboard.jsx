import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { generateCode } from '../utils/generateCode';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [originalUrl, setOriginalUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const neonStyles = {
    container: {
      minHeight: '100vh',
      backgroundColor: 'transparent',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      boxSizing: 'border-box',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 0',
      borderBottom: '2px solid #00ff66',
      marginBottom: '30px',
    },
    h1: {
      color: '#00ff66',
      margin: 0,
      fontSize: '1.6em',
      fontWeight: '800',
      textShadow: '0 0 8px rgba(0, 255, 102, 0.8)',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
    },
    emailText: {
      color: '#a0aec0',
      fontSize: '0.95em',
      fontWeight: '600',
    },
    logoutButton: {
      backgroundColor: '#dc4e41',
      color: 'white',
      padding: '8px 15px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.9em',
      fontWeight: '700',
      transition: 'all 0.2s ease',
    },
    section: {
      marginBottom: '30px',
      backgroundColor: 'rgba(5, 10, 5, 0.95)',
      border: '3px solid #00ff66',
      boxShadow: '0 0 15px rgba(0, 255, 102, 0.4)',
      padding: '25px',
      borderRadius: '12px',
    },
    h2: {
      color: '#00ff66',
      marginBottom: '20px',
      fontSize: '1.3em',
      fontWeight: '700',
      textShadow: '0 0 6px rgba(0, 255, 102, 0.6)',
    },
    form: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
    },
    input: {
      flexGrow: 1,
      padding: '12px 15px',
      borderRadius: '6px',
      border: '2px solid #008833',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      color: '#e2e8f0',
      fontSize: '1em',
      minWidth: '250px',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    shortenButton: {
      backgroundColor: '#00ff66',
      color: '#000000',
      padding: '12px 25px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1em',
      fontWeight: '700',
      textTransform: 'uppercase',
      boxShadow: '0 4px 0 #00aa44, 0 0 10px rgba(0, 255, 102, 0.3)',
      transition: 'all 0.2s ease',
    },
    message: {
      marginTop: '15px',
      padding: '12px',
      borderRadius: '6px',
      fontWeight: '700',
      textAlign: 'center',
    },
    errorMessage: {
      backgroundColor: 'rgba(255, 51, 51, 0.2)',
      border: '1px solid #ff3333',
      color: '#ffdddd',
    },
    successMessage: {
      backgroundColor: 'rgba(0, 255, 102, 0.15)',
      border: '1px solid #00ff66',
      color: '#ddffdd',
    },
    linksList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    linkItem: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid #008833',
      borderRadius: '8px',
      marginBottom: '15px',
      padding: '15px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      boxShadow: '0 0 8px rgba(0, 255, 102, 0.1)',
    },
    linkInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    },
    originalUrl: {
      fontSize: '0.85em',
      color: '#a0aec0',
      wordBreak: 'break-all',
    },
    shortUrl: {
      fontSize: '1.15em',
      fontWeight: 'bold',
      color: '#00ff66',
      wordBreak: 'break-all',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      textShadow: '0 0 5px rgba(0, 255, 102, 0.3)',
    },
    clicks: {
      fontSize: '0.85em',
      color: '#cbd5e0',
    },
    actionButtons: {
      display: 'flex',
      gap: '10px',
      marginTop: '5px',
    },
    copyButton: {
      backgroundColor: '#00ff66',
      color: '#000000',
      padding: '8px 15px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.85em',
      fontWeight: '700',
      transition: 'all 0.2s ease',
    },
    deleteButton: {
      backgroundColor: '#dc4e41',
      color: 'white',
      padding: '8px 15px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.85em',
      fontWeight: '700',
      transition: 'all 0.2s ease',
    },
    emptyMessage: {
      textAlign: 'center',
      color: '#a0aec0',
      padding: '20px 0',
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    // Criando a query sem ordenar por data no banco de dados para evitar a necessidade de criar um Índice Composto manual no Console
    const q = query(
      collection(db, 'links'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userLinks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Ordenamos os links na memória pelo campo createdAt descendente
        userLinks.sort((a, b) => {
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeB - timeA;
        });

        setLinks(userLinks);
        setLoadingLinks(false);
      },
      (err) => {
        console.error('Error fetching links:', err);
        setError('Erro ao carregar seus links.');
        setLoadingLinks(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Erro ao sair.');
    }
  };

  const handleShortenLink = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!originalUrl.trim()) {
      setError('Por favor, insira uma URL válida.');
      return;
    }

    if (!currentUser) {
      setError('Você precisa estar logado para encurtar links.');
      return;
    }

    try {
      const code = generateCode();
      await setDoc(doc(db, 'links', code), {
        code,
        originalUrl,
        userId: currentUser.uid,
        clicks: 0,
        createdAt: Timestamp.now(),
      });
      setSuccessMessage(`Seu link foi encurtado com sucesso!`);
      setOriginalUrl('');
    } catch (err) {
      console.error('Error adding document:', err);
      setError('Erro ao encurtar o link.');
    }
  };

  const handleDeleteLink = async (id) => {
    setError('');
    setSuccessMessage('');
    try {
      await deleteDoc(doc(db, 'links', id));
      setSuccessMessage('Link excluído com sucesso!');
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Erro ao excluir o link.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccessMessage('Link copiado para a área de transferência!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      setError('Erro ao copiar o link.');
    });
  };

  if (!currentUser) {
    return (
      <div style={neonStyles.container}>
        <p style={{...neonStyles.errorMessage, ...neonStyles.message}}>Você não está logado. Redirecionando...</p>
      </div>
    );
  }

  return (
    <div style={neonStyles.container}>
      <header style={neonStyles.header}>
        <h1 style={neonStyles.h1}>Encurtador de Links</h1>
        <div style={neonStyles.userInfo}>
          <span style={neonStyles.emailText}>{currentUser.email}</span>
          <button onClick={handleLogout} style={neonStyles.logoutButton}>Sair</button>
        </div>
      </header>

      <section style={neonStyles.section}>
        <h2 style={neonStyles.h2}>Encurtar Nova URL</h2>
        <form onSubmit={handleShortenLink} style={neonStyles.form}>
          <input
            type="url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="Cole sua URL longa aqui, ex: https://exemplo.com/minha-url"
            required
            style={neonStyles.input}
          />
          <button type="submit" style={neonStyles.shortenButton}>ENCURTAR</button>
        </form>
        {error && <p style={{ ...neonStyles.message, ...neonStyles.errorMessage }}>{error}</p>}
        {successMessage && <p style={{ ...neonStyles.message, ...neonStyles.successMessage }}>{successMessage}</p>}
      </section>

      <section style={neonStyles.section}>
        <h2 style={neonStyles.h2}>Meus Links Encurtados</h2>
        {loadingLinks ? (
          <p style={neonStyles.emptyMessage}>Carregando seus links...</p>
        ) : links.length === 0 ? (
          <p style={neonStyles.emptyMessage}>Você ainda não tem links encurtados. Comece criando um acima!</p>
        ) : (
          <ul style={neonStyles.linksList}>
            {links.map((link) => (
              <li key={link.id} style={neonStyles.linkItem}>
                <div style={neonStyles.linkInfo}>
                  <span style={neonStyles.originalUrl}>Original: {link.originalUrl}</span>
                  <span style={neonStyles.shortUrl}>
                    Curto: <a href={`${window.location.origin}/r/${link.code}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>{window.location.origin}/r/{link.code}</a>
                  </span>
                  <span style={neonStyles.clicks}>Cliques: {link.clicks}</span>
                </div>
                <div style={neonStyles.actionButtons}>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/r/${link.code}`)}
                    style={neonStyles.copyButton}
                  >
                    Copiar
                  </button>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    style={neonStyles.deleteButton}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
