import { useCallback } from 'react';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export const useToast = () => {
  const show = useCallback((options: ToastOptions | string) => {
    const message = typeof options === 'string' ? options : options.description || options.title || 'Toast';
    console.log('Toast:', message);
  }, []);

  return {
    show,
  };
};

export default useToast;
