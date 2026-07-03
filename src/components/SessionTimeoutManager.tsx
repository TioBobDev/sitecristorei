'use client';

import { useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';

const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutos em milissegundos
const CHECK_INTERVAL = 10 * 1000; // Checar a cada 10 segundos
const THROTTLE_DELAY = 5 * 1000; // Registrar atividade no máximo a cada 5 segundos

export function SessionTimeoutManager() {
  const { data: session, status } = useSession();
  const lastActivityRef = useRef<number>(Date.now());
  const lastThrottleRef = useRef<number>(Date.now());

  useEffect(() => {
    // Só monitora se o usuário estiver de fato autenticado no NextAuth
    if (status !== 'authenticated' || !session) return;

    // Inicializar timestamp
    lastActivityRef.current = Date.now();
    lastThrottleRef.current = Date.now();

    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle para evitar escritas excessivas em eventos frequentes como mousemove
      if (now - lastThrottleRef.current > THROTTLE_DELAY) {
        lastActivityRef.current = now;
        lastThrottleRef.current = now;
      }
    };

    // Eventos globais de atividade física do usuário
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('mousedown', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    // Intervalo de verificação periódica
    const interval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      
      if (timeSinceLastActivity >= TIMEOUT_DURATION) {
        clearInterval(interval);
        // Efetua logout e redireciona indicando o motivo
        signOut({ callbackUrl: '/login?reason=inactive' });
      }
    }, CHECK_INTERVAL);

    // Limpeza ao desmontar componente ou re-executar useEffect
    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('mousedown', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      clearInterval(interval);
    };
  }, [session, status]);

  return null;
}
