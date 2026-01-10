import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 9999,
                pointerEvents: 'none',
            }}>
                {toasts.map((t) => (
                    <div key={t.id} style={{
                        background: 'white',
                        color: '#1F2937',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '14px',
                        fontWeight: 500,
                        animation: 'slideIn 0.3s cubic-bezier(0.2, 0, 0.2, 1)',
                        borderLeft: `4px solid ${t.type === 'success' ? '#10B981' :
                            t.type === 'error' ? '#EF4444' : '#3B82F6'
                            }`,
                        pointerEvents: 'auto',
                    }}>
                        <span>{t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}</span>
                        {t.message}
                    </div>
                ))}
            </div>
            <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
