import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import '@styles/pages/kpi-dashboard.css';

// --- MOCK DATA ---
const HERO_METRICS = [
  { id: 1, title: 'Total Revenue Today', value: '₱15,400', trend: '+12% vs yesterday', isPositive: true },
  { id: 2, title: 'Fleet Utilization', value: '85%', trend: '+5% vs average', isPositive: true },
  { id: 3, title: 'Total Trips Completed', value: '142', trend: '-2% vs yesterday', isPositive: false },
  { id: 4, title: 'Avg Passenger Wait', value: '8 mins', trend: '-1 min vs average', isPositive: true },
];

const REVENUE_DATA = [
  { day: 'Mon', revenue: 12000 },
  { day: 'Tue', revenue: 14500 },
  { day: 'Wed', revenue: 13200 },
  { day: 'Thu', revenue: 15400 },
  { day: 'Fri', revenue: 18900 },
  { day: 'Sat', revenue: 21000 },
  { day: 'Sun', revenue: 19500 },
];

const PAYMENT_DATA = [
  { name: 'Cash', value: 60 },
  { name: 'GCash', value: 30 },
  { name: 'Maya', value: 10 },
];

const PIE_COLORS = ['#c43335', '#2c7be5', '#74c476'];

function KPIAnalysisDashboard() {
  return (
    <div className="kpi-dashboard-container">
      
      {/* TOP ROW: HERO CARDS */}
      <div className="kpi-hero-grid">
        {HERO_METRICS.map((metric) => (
          <div key={metric.id} className="kpi-hero-card">
            <div className="kpi-card-title">{metric.title}</div>
            <div className="kpi-card-value">{metric.value}</div>
            <div className={`kpi-card-trend ${metric.isPositive ? 'positive' : 'negative'}`}>
              {metric.trend}
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM ROW: CHARTS */}
      <div className="kpi-charts-grid">
        
        {/* CHART 1: REVENUE TREND */}
        <div className="kpi-chart-card">
          <div className="kpi-chart-header">Revenue by Day (Past 7 Days)</div>
          <div className="kpi-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
                <RechartsTooltip 
                  cursor={{ fill: 'var(--color-primary-pale)', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="var(--color-primary-soft)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: PAYMENT DISTRIBUTION */}
        <div className="kpi-chart-card">
          <div className="kpi-chart-header">Payment Distribution</div>
          <div className="kpi-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PAYMENT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {PAYMENT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  formatter={(value) => `${value}%`}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
      
    </div>
  );
}

export default KPIAnalysisDashboard;
