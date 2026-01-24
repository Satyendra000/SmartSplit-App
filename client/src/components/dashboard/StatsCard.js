import { TrendingUp, TrendingDown } from "lucide-react";

const StatsCard = ({ title, value, icon: Icon, trend, subtitle }) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/5 hover:border-orange-500/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-white/60 font-medium">{title}</span>
        <div className="p-2 rounded-lg bg-orange-500/10">
          <Icon className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
        </div>
      </div>

      <div className="space-y-2">
        <p
          className={`text-2xl font-bold tracking-tight ${
            value.startsWith("+")
              ? "text-green-500"
              : value.startsWith("-")
              ? "text-red-500"
              : "text-white"
          }`}
        >
          {value}
        </p>

        {trend && (
          <div className="flex items-center gap-1.5">
            {trend.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            )}
            <span
              className={`text-xs font-medium ${
                trend.isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend.value}
            </span>
            <span className="text-xs text-white/40">{trend.label}</span>
          </div>
        )}

        {subtitle && <p className="text-xs text-white/50">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
