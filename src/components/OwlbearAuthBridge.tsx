import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from '../premium/config/firebase';

/**
 * Página "auth bridge" para a extensão do Owlbear Rodeo.
 *
 * A extensão roda dentro de um iframe de terceiro no Owlbear, onde o login do
 * Firebase sofre com bloqueio de cookies de terceiros. Esta página é aberta pela
 * extensão num popup *first-party* (mesma origem do Firebase), faz o login e
 * devolve o ID token via postMessage.
 *
 * Protocolo (espelha extensions/owlbear/src/auth/bridge.ts):
 *  1. bridge → opener: { type: 'fdn-owlbear-auth:ready' }
 *  2. opener → bridge: { type: 'fdn-owlbear-auth:request', origin }
 *  3. bridge valida a origin e responde:
 *       { type: 'fdn-owlbear-auth:token', token, expiresAt }
 *     ou { type: 'fdn-owlbear-auth:error', message }
 */

const MSG = {
  ready: 'fdn-owlbear-auth:ready',
  request: 'fdn-owlbear-auth:request',
  token: 'fdn-owlbear-auth:token',
  error: 'fdn-owlbear-auth:error',
} as const;

// Origens autorizadas a receber o token. Inclui produção, dev local e túneis
// comuns usados para testar a extensão no Owlbear.
function isAllowedOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    const { hostname, protocol } = url;
    if (protocol !== 'https:' && hostname !== 'localhost') return false;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (hostname === 'fichasdenimb.com.br') return true;
    if (hostname.endsWith('.fichasdenimb.com.br')) return true;
    if (hostname.endsWith('.ngrok-free.app')) return true;
    if (hostname.endsWith('.ngrok.io')) return true;
    if (hostname.endsWith('.trycloudflare.com')) return true;
    return false;
  } catch {
    return false;
  }
}

type Status = 'waiting' | 'authenticating' | 'sent' | 'error';

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  minHeight: '100vh',
  padding: 24,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  background: '#16161f',
  color: '#e8e8f0',
  textAlign: 'center',
};

const buttonStyle: React.CSSProperties = {
  background: '#b3541e',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '10px 18px',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
};

export default function OwlbearAuthBridge(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>('waiting');
  const [message, setMessage] = useState<string>('');
  const requesterOriginRef = useRef<string | null>(null);
  const sentRef = useRef<boolean>(false);

  const sendToken = useCallback(async (currentUser: User, origin: string) => {
    try {
      const result = await currentUser.getIdTokenResult();
      const expiresAt = new Date(result.expirationTime).getTime();
      window.opener?.postMessage(
        { type: MSG.token, token: result.token, expiresAt },
        origin
      );
      sentRef.current = true;
      setStatus('sent');
    } catch (e) {
      const text = e instanceof Error ? e.message : 'Falha ao obter o token.';
      window.opener?.postMessage({ type: MSG.error, message: text }, origin);
      setStatus('error');
      setMessage(text);
    }
  }, []);

  // Acompanha a sessão Firebase (caso o usuário já esteja logado no app).
  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), []);

  // Handshake com a extensão e captura da origem solicitante.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string } | null;
      if (!data || data.type !== MSG.request) return;
      if (!isAllowedOrigin(event.origin)) {
        setStatus('error');
        setMessage(`Origem não autorizada: ${event.origin}`);
        return;
      }
      requesterOriginRef.current = event.origin;
      if (user && !sentRef.current) {
        sendToken(user, event.origin).catch(() => undefined);
      }
    };
    window.addEventListener('message', onMessage);
    // Sinaliza que está pronta para o opener (extensão) iniciar o handshake.
    window.opener?.postMessage({ type: MSG.ready }, '*');
    return () => window.removeEventListener('message', onMessage);
  }, [user, sendToken]);

  // Quando o usuário fica disponível e já temos a origem, envia o token.
  useEffect(() => {
    const origin = requesterOriginRef.current;
    if (user && origin && !sentRef.current) {
      sendToken(user, origin).catch(() => undefined);
    }
  }, [user, sendToken]);

  const handleLogin = useCallback(async () => {
    setStatus('authenticating');
    setMessage('');
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged atualiza `user` e dispara o envio do token.
    } catch (e) {
      setStatus('error');
      setMessage(e instanceof Error ? e.message : 'Falha no login.');
    }
  }, []);

  if (!window.opener) {
    return (
      <div style={pageStyle}>
        <h2>Fichas de Nimb · Owlbear</h2>
        <p>Esta página deve ser aberta pela extensão do Owlbear Rodeo.</p>
      </div>
    );
  }

  if (status === 'sent') {
    return (
      <div style={pageStyle}>
        <h2>Conectado! ✓</h2>
        <p>Você já pode fechar esta janela e voltar ao Owlbear.</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h2>Fichas de Nimb · Owlbear</h2>
      {status === 'error' && (
        <p style={{ color: '#ff6b6b' }}>{message || 'Ocorreu um erro.'}</p>
      )}
      {user ? (
        <p>Conectando como {user.email}…</p>
      ) : (
        <>
          <p>Entre com sua conta para conectar suas fichas ao Owlbear.</p>
          <button
            type='button'
            style={buttonStyle}
            onClick={handleLogin}
            disabled={status === 'authenticating'}
          >
            {status === 'authenticating' ? 'Entrando…' : 'Entrar com Google'}
          </button>
        </>
      )}
    </div>
  );
}
