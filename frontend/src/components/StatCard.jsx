const StatCard = ({ icon, label, value, change, trend }) => {
  const isPositive = trend === 'up';

  return (
    <div className="glass-card p-6 rounded-2xl hover-scale animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{label}</p>
          <p className="font-heading font-bold text-3xl mt-2 text-primary dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <p className={`text-sm mt-2 ${isPositive ? 'text-accent' : 'text-danger'}`}>
              {isPositive ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;