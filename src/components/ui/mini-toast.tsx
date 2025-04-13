
import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface MiniToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const MiniToast = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  position = 'top-right' 
}: MiniToastProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  const typeConfig = {
    success: {
      icon: CheckCircle,
      className: 'bg-green-50 border-green-200 text-green-800',
    },
    error: {
      icon: AlertCircle,
      className: 'bg-red-50 border-red-200 text-red-800',
    },
    info: {
      icon: Info,
      className: 'bg-blue-50 border-blue-200 text-blue-800',
    },
    warning: {
      icon: AlertTriangle,
      className: 'bg-amber-50 border-amber-200 text-amber-800',
    },
  };

  const Icon = typeConfig[type].icon;

  const closeToast = useCallback(() => {
    setIsExiting(true);
    const animationTimeout = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
      clearTimeout(animationTimeout);
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (duration !== Infinity) {
      timeoutRef.current = window.setTimeout(() => {
        closeToast();
      }, duration);
    }

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [duration, closeToast]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed z-50 max-w-sm transform transition-all duration-300 ease-in-out',
        isExiting ? 'opacity-0 translate-y-[-10px]' : 'opacity-100',
        positionClasses[position]
      )}
      role="alert"
    >
      <div
        className={cn(
          'flex items-start gap-3 rounded-md border px-4 py-3 shadow-lg',
          typeConfig[type].className
        )}
      >
        <Icon className="h-5 w-5" />
        <div className="flex-1">{message}</div>
        <button
          onClick={closeToast}
          type="button"
          className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none"
        >
          <span className="sr-only">Close</span>
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

interface MiniToastOptions {
  type?: ToastType;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

type ToastElement = {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
};

// Store toast elements
let toasts: ToastElement[] = [];
let listeners: Set<(toasts: ToastElement[]) => void> = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener([...toasts]));
};

// Toast container component
export const MiniToastContainer = () => {
  const [toastElements, setToastElements] = useState<ToastElement[]>([]);

  useEffect(() => {
    const handleToastsChange = (newToasts: ToastElement[]) => {
      setToastElements(newToasts);
    };

    listeners.add(handleToastsChange);
    return () => {
      listeners.delete(handleToastsChange);
    };
  }, []);

  return (
    <>
      {toastElements.map(toast => (
        <MiniToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position={toast.position}
          onClose={() => {
            toasts = toasts.filter(t => t.id !== toast.id);
            notifyListeners();
          }}
        />
      ))}
    </>
  );
};

// Toast function to show toasts
export const miniToast = {
  show: (message: string, options: MiniToastOptions = {}) => {
    const id = Date.now().toString();
    const toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration === undefined ? 3000 : options.duration,
      position: options.position || 'top-right',
    };
    
    toasts = [...toasts, toast];
    notifyListeners();
    
    return id;
  },
  success: (message: string, options: Omit<MiniToastOptions, 'type'> = {}) => {
    return miniToast.show(message, { ...options, type: 'success' });
  },
  error: (message: string, options: Omit<MiniToastOptions, 'type'> = {}) => {
    return miniToast.show(message, { ...options, type: 'error' });
  },
  info: (message: string, options: Omit<MiniToastOptions, 'type'> = {}) => {
    return miniToast.show(message, { ...options, type: 'info' });
  },
  warning: (message: string, options: Omit<MiniToastOptions, 'type'> = {}) => {
    return miniToast.show(message, { ...options, type: 'warning' });
  },
  dismiss: (id?: string) => {
    if (id) {
      toasts = toasts.filter(t => t.id !== id);
    } else {
      toasts = [];
    }
    notifyListeners();
  },
};
