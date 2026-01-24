import ToastItem from "./ToastItem";

const Toast = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toast-slide-down {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes toast-fade-out {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }
      `}</style>

      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md pointer-events-none">
        <div className="pointer-events-auto space-y-3">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={removeToast} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Toast;