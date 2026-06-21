import { useCallback, useEffect, useRef, useState } from 'react';

let toastId = 0;

export default function useToasts() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete timers.current[id];
    }, 3000);
  }, []);

  useEffect(() => {
    return () => Object.values(timers.current).forEach(clearTimeout);
  }, []);

  const ToastContainer = () => (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' && '✅'}
          {t.type === 'error' && '❌'}
          {t.type === 'info' && 'ℹ️'}
          {t.message}
        </div>
      ))}
    </div>
  );

  return { addToast, ToastContainer };
}
