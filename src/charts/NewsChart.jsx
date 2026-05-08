import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#f97316', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(4,17,40,0.95)',
      border: '1px solid rgba(99,102,241,0.3)',
      borderRadius: 10,
      padding: '8px 14px',
    }}>
      <p style={{ color: '#f1f5f9', fontWeight: 600 }}>{payload[0].name}</p>
      <p style={{ color: '#818cf8' }}>{payload[0].value} articles</p>
    </div>
  );
};

export default function NewsChart({ data }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: '#475569' }}>
        <div className="text-center">
          <div className="text-3xl mb-2">📰</div>
          <p>No news data loaded</p>
        </div>
      </div>
    );
  }

  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          onMouseEnter={(_, idx) => setActiveIndex(idx)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
              stroke={activeIndex === index ? 'white' : 'transparent'}
              strokeWidth={activeIndex === index ? 2 : 0}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
