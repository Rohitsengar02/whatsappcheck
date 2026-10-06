import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Download,
  Calendar,
  CheckCircle2,
  Users,
  Eye,
  MousePointerClick,
  Sparkles,
  PieChart
} from 'lucide-react';

export const AnalyticsReportsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Heatmap hours 0..23 with simulated open rates
  const hoursData = [
    { hour: '12 AM', rate: 12 },
    { hour: '2 AM', rate: 4 },
    { hour: '4 AM', rate: 2 },
    { hour: '6 AM', rate: 18 },
    { hour: '8 AM', rate: 64 },
    { hour: '10 AM', rate: 94 }, // Peak
    { hour: '12 PM', rate: 88 },
    { hour: '2 PM', rate: 76 },
    { hour: '4 PM', rate: 82 },
    { hour: '6 PM', rate: 92 }, // Peak
    { hour: '8 PM', rate: 85 },
    { hour: '10 PM', rate: 48 },
  ];

  const handleExport = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Metric,Value\nTotal Sent,1840\nDelivered,1812\nRead,1640\nClicked,584\nDelivery Rate,98.5%\nRead Rate,89.1%';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `whatsapp_sengar_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Executive WhatsApp Analytics & Engagement Heatmap
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover peak customer response hours, delivery funnels, and campaign conversion benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
            {['24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg font-bold transition uppercase ${
                  timeRange === range
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Funnel Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Messages Dispatched</div>
          <div className="text-2xl font-black text-slate-900 font-mono">1,840</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14.2% vs previous period
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Delivered to Handsets</div>
          <div className="text-2xl font-black text-blue-600 font-mono">1,812</div>
          <div className="text-[11px] text-slate-500 mt-1">
            98.5% delivery reliability
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Read / Opened (Blue Check)</div>
          <div className="text-2xl font-black text-emerald-600 font-mono">1,640</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            89.1% open rate (7x email)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Customer Responses / Clicks</div>
          <div className="text-2xl font-black text-purple-600 font-mono">584</div>
          <div className="text-[11px] text-purple-700 font-semibold mt-1">
            31.7% high engagement
          </div>
        </div>
      </div>

      {/* Peak Engagement Heatmap */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Optimal Send Times & Response Heatmap
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies the best hours to schedule broadcasts for maximum customer open rates.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              🔥 Prime Hours: 10:00 AM & 6:00 PM
            </span>
          </div>
        </div>

        {/* Heatmap Bar Columns */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-4 items-end h-48">
          {hoursData.map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
              <div className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-emerald-700 transition">
                {item.rate}%
              </div>
              <div
                className={`w-full rounded-t-xl transition-all duration-300 ${
                  item.rate >= 90
                    ? 'bg-emerald-600'
                    : item.rate >= 70
                    ? 'bg-emerald-400'
                    : item.rate >= 40
                    ? 'bg-emerald-200'
                    : 'bg-slate-200'
                }`}
                style={{ height: `${item.rate}%` }}
              />
              <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">
                {item.hour}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span> High (&gt;90%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span> Good (70-89%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-200"></span> Low (&lt;40%)
            </span>
          </div>

          <span className="text-[11px]">Timezone: Local User Standard Time</span>
        </div>
      </div>
    </div>
  );
};
