import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';

const Redirect = () => {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5); // 5 segundos de espera
  const [originalUrl, setOriginalUrl] = useState('');

  useEffect(() => {
    const fetchLinkAndIncrement = async () => {
      if (!code) {
        setError('Código de redirecionamento inválido.');
        setLoading(false);
        return;
      }

      try {
        const linkDocRef = doc(db, 'links', code);
        const linkDocSnap = await getDoc(linkDocRef);

        if (linkDocSnap.exists()) {
          const linkData = linkDocSnap.data();
          setOriginalUrl(linkData.originalUrl);

          // Define loading como false ANTES de tentar incrementar
          // para que o redirecionamento não seja bloqueado caso o increment falhe
          setLoading(false);

          // Incrementa cliques de forma assíncrona (fire-and-forget)
          // Não usa await para não bloquear o redirecionamento
          updateDoc(linkDocRef, {
            clicks: increment(1),
          }).catch((err) => {
            // Ignora erros de permissão no increment — o redirect ainda ocorre
            console.warn('Aviso: não foi possível incrementar cliques:', err.message);
          });

        } else {
          setError('Link não encontrado.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Erro ao buscar link:', err);
        setError('Ocorreu um erro ao processar seu link.');
        setLoading(false);
      }
    };

    fetchLinkAndIncrement();
  }, [code]);

  // Efeito do Timer Regressivo e Redirecionamento
  useEffect(() => {
    if (loading || error || !originalUrl) return;

    if (countdown === 0) {
      console.log('Tentando redirecionar para:', originalUrl);
      
      let targetUrl = originalUrl.trim();
      
      // Verifica se a URL já começa com um esquema/protocolo válido (ex: http://, https://, data:, ftp://, mailto:)
      // Um esquema válido começa com uma letra seguida por letras, números, +, - ou . e depois dois pontos (:)
      const hasProtocol = /^[a-z][a-z0-9+.-]*:/i.test(targetUrl);
      
      if (!hasProtocol) {
        targetUrl = 'https://' + targetUrl;
      }
      
      try {
        window.location.replace(targetUrl);
      } catch (err) {
        console.error('Falha ao usar window.location.replace:', err);
        window.location.href = targetUrl;
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, loading, error, originalUrl]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%', padding: '20px', boxSizing: 'border-box' }}>
      <div className="game-menu-container">
        <h2>REDIRECIONANDO</h2>
        
        {loading && <p style={{ color: '#00ff66', fontWeight: 'bold' }}>Buscando endereço seguro...</p>}
        {error && <p className="error-message">{error}</p>}
        
        {!loading && !error && originalUrl && (
          <div>
            <p style={{ margin: '10px 0', fontSize: '0.95em', color: '#a0aec0', wordBreak: 'break-all' }}>
              Destino: {originalUrl}
            </p>
            
            {/* Barra de progressão baseada no timer */}
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${(countdown / 5) * 100}%` }}
              ></div>
            </div>
            
            {/* Timer localizado abaixo da barra */}
            <p className="timer-text">
              Redirecionando em {countdown} segundo{countdown !== 1 ? 's' : ''}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Redirect;
