import { useState } from "react";
import { useConfirm } from "../common/ConfirmModal";

const CategoryBreakdown = ({ toast }) => {
  const { confirm, ConfirmModal } = useConfirm();
  const [data, setData] = useState([
    { name: "Food", value: 40, color: "#f97316", amount: 920 },
    { name: "Rent", value: 35, color: "#fb923c", amount: 805 },
    { name: "Transport", value: 25, color: "#fdba74", amount: 575 },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/5">
      <h3 className="text-lg font-semibold text-white mb-4">
        Category Breakdown
      </h3>

      <div className="relative h-48 flex items-center justify-center mb-4">
        <svg className="w-40 h-40 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="20"
          />

          {/* Data segments */}
          {data.map((item, index) => {
            const segmentLength = (item.value / 100) * circumference;
            const segment = (
              <circle
                key={index}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="20"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - segmentLength}
                transform={`rotate(${
                  (currentOffset / circumference) * 360
                } 80 80)`}
                className="transition-all duration-300"
              />
            );
            currentOffset += segmentLength;
            return segment;
          })}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-2xl font-bold text-white">
            ₹{(total / 1000).toFixed(1)}k
          </span>
          <span className="text-xs text-white/50">Spent</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
            onClick={() => handleCategoryClick(item)}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-white/60">
                {item.name} ({item.value}%)
              </span>
            </div>
            <span className="text-sm font-semibold text-white">
              ₹{item.amount}
            </span>
          </div>
        ))}
      </div>

      <ConfirmModal />
    </div>
  );
};

export default CategoryBreakdown;