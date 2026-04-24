import { useStats } from "../hooks/use-scans";
import { useLanguage } from "../lib/i18n";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2 } from "lucide-react";

const COLORS = ['#00ff41', '#ff003c', '#00bfff', '#ffbf00'];

export function StatsCharts() {
  const { data: stats, isLoading } = useStats();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center cyber-card">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const pieData = Object.entries(stats.vulnerabilitiesByType).map(([name, value]) => ({ name, value }));
  const areaData = stats.scansOverTime.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString()
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Chart 1: Vulnerabilities by Type */}
      <div className="cyber-card p-6">
        <h3 className="text-xl font-display mb-6 border-l-4 border-primary pl-4">{t('stats.title')}</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#00ff41', color: '#fff' }}
                itemStyle={{ color: '#00ff41' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Scan History */}
      <div className="cyber-card p-6">
        <h3 className="text-xl font-display mb-6 border-l-4 border-primary pl-4">Scan Activity</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff41" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00ff41" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" style={{ fontSize: '12px', fontFamily: 'monospace' }} />
              <YAxis stroke="#666" style={{ fontSize: '12px', fontFamily: 'monospace' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#00ff41', color: '#fff' }}
                cursor={{ stroke: '#00ff41', strokeWidth: 1 }}
              />
              <Area type="monotone" dataKey="count" stroke="#00ff41" fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
