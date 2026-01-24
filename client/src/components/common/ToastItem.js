import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastItem = ({ toast, onClose }) => {
  if (!toast) return null;

  const configs = {
    success: {
      icon: CheckCircle,
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-400",
    },
    error: {
      icon: XCircle,
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      text: "text-yellow-400",
    },
    info: {
      icon: Info,
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-400",
    },
  };

  const config = configs[toast.type] || configs.info;
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.border} border backdrop-blur-sm rounded-xl p-4 shadow-2xl flex items-start gap-3 w-full animate-toast-slide-down`}
      style={{
        animation: "toast-slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <Icon className={`w-5 h-5 ${config.text} flex-shrink-0`} />
      <p className={`flex-1 text-sm ${config.text} font-medium`}>
        {toast.message}
      </p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-white/40 hover:text-white/80 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ToastItem;