import { useState } from "react";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      button:
        "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/20 hover:shadow-red-500/30",
      icon: "text-red-400",
      iconBg: "bg-red-500/10 border-red-500/20",
      Icon: AlertTriangle,
    },
    warning: {
      button:
        "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/20 hover:shadow-orange-500/30",
      icon: "text-orange-400",
      iconBg: "bg-orange-500/10 border-orange-500/20",
      Icon: AlertTriangle,
    },
    info: {
      button:
        "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/20 hover:shadow-blue-500/30",
      icon: "text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      Icon: Info,
    },
    success: {
      button:
        "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/20 hover:shadow-green-500/30",
      icon: "text-green-400",
      iconBg: "bg-green-500/10 border-green-500/20",
      Icon: CheckCircle,
    },
  };

  const style = typeStyles[type] || typeStyles.danger;
  const IconComponent = style.Icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      style={{ animation: "fadeIn 0.2s ease-out" }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div
        className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "scaleIn 0.2s ease-out" }}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`${style.iconBg} border rounded-xl p-3 flex-shrink-0`}
            >
              <IconComponent className={`w-6 h-6 ${style.icon}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 ${style.button} text-white font-semibold rounded-lg transition-all shadow-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for using confirmation modal
export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "Confirm",
    cancelText: "Cancel",
    type: "danger",
  });

  const confirm = ({
    title,
    message,
    onConfirm,
    confirmText,
    cancelText,
    type,
  }) => {
    setConfirmState({
      isOpen: true,
      title: title || "Confirm Action",
      message: message || "Are you sure you want to proceed?",
      onConfirm: onConfirm || (() => {}),
      confirmText: confirmText || "Confirm",
      cancelText: cancelText || "Cancel",
      type: type || "danger",
    });
  };

  const closeConfirm = () => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  const ConfirmModal = () => (
    <ConfirmationModal
      isOpen={confirmState.isOpen}
      onClose={closeConfirm}
      onConfirm={confirmState.onConfirm}
      title={confirmState.title}
      message={confirmState.message}
      confirmText={confirmState.confirmText}
      cancelText={confirmState.cancelText}
      type={confirmState.type}
    />
  );

  return { confirm, ConfirmModal };
};

export default ConfirmationModal;