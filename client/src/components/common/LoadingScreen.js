import { useState, useEffect } from "react";
import { Wallet, TrendingUp, Users, DollarSign } from "lucide-react";

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [currentIcon, setCurrentIcon] = useState(0);

  const icons = [
    { Icon: Wallet, label: "Connecting" },
    { Icon: Users, label: "Loading Groups" },
    { Icon: TrendingUp, label: "Syncing Data" },
    { Icon: DollarSign, label: "Ready" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 2;

        if (newProgress >= 75) setCurrentIcon(3);
        else if (newProgress >= 50) setCurrentIcon(2);
        else if (newProgress >= 25) setCurrentIcon(1);
        else setCurrentIcon(0);

        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 15);

    return () => clearInterval(interval);
  }, []);

  const CurrentIconComponent = icons[currentIcon].Icon;

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-50">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px),
                           linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Orange Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Icon Container */}
        <div className="relative mb-12">
          <div className="absolute -inset-8">
            <div className="w-full h-full rounded-full border border-orange-500/20 animate-[spin_6s_linear_infinite]"></div>
          </div>

          <div className="relative w-28 h-28 rounded-full bg-white/5 backdrop-blur-xl shadow-2xl border border-white/10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/10 to-orange-600/10"></div>
            <CurrentIconComponent
              className="w-14 h-14 text-orange-500 relative z-10 transition-all duration-500"
              strokeWidth={1.5}
            />
          </div>

          <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50"></div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            <span className="text-white">Smart</span>
            <span className="text-orange-500">Split</span>
          </h1>
          <p className="text-white/50 text-sm tracking-wide">
            {icons[currentIcon].label}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-72 space-y-4">
          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full relative transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-white/40 font-medium">{progress}%</span>
            <div className="flex gap-1.5">
              {icons.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= currentIcon ? "bg-orange-500" : "bg-white/10"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 text-white/30 text-xs tracking-wider uppercase font-medium">
          Split expenses with ease
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
