import { Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Logo = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
      <div className="relative">
        <div className="absolute inset-0 bg-orange-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all"></div>
        <div className="relative w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
          <Wallet className="w-5 h-5 text-white" strokeWidth={1.5} />
        </div>
      </div>
      <span className="text-xl font-bold text-white tracking-tight">
        Smart<span className="text-orange-500">Split</span>
      </span>
    </div>
  );
};

export default Logo;
