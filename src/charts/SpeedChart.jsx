import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Area, AreaChart } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(4,17,40,0.95)',
      border: '1px solid rgba(99,102,241,0.3)',
      borderRadius: 10,
      padding: '8px 14px',
      backdropFilter: 'blur(10px)',
    }}>
      <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#818cf8', fontWeight: 700, fontSize: 14 }}>
        {payload[0].value?.toLocaleString()} km/h
      </p>
    </div>
  );
};

export function SpeedChart({ data }) {
  const { isDark } = useTheme();

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: '#475569' }}>
        <div className="text-center">
          <div className="text-3xl mb-2">📊</div>
          <p>Collecting speed data...</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10, fill: '#64748b' }}
          interval="preserveStartEnd"
          stroke="rgba(99,102,241,0.15)"
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#64748b' }}
          stroke="rgba(99,102,241,0.15)"
          domain={['auto', 'auto']}
          tickFormatter={v => `${(v / 1000).toFixed(1)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="speed"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#speedGradient)"
          dot={false}
          activeDot={{ r: 5, fill: '#818cf8', stroke: '#6366f1', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}


