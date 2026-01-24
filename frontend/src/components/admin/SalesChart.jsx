import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import adminService from '../../services/admin.service';

const SalesChart = ({ initialData }) => {
    const [range, setRange] = useState('7d');
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter labels map
    const rangeLabels = {
        '7d': '7 วันล่าสุด',
        '1m': '1 เดือนล่าสุด',
        '1y': '1 ปีล่าสุด'
    };

    const fetchChartData = async (selectedRange) => {
        setLoading(true);
        try {
            const res = await adminService.getSalesChart(selectedRange);
            processData(res, selectedRange);
        } catch (error) {
            console.error("Failed to fetch chart data", error);
        } finally {
            setLoading(false);
        }
    };

    const processData = (rawData, selectedRange) => {
        let items = [];
        if (selectedRange === '1y') {
            // Last 12 months
            const today = new Date();
            for (let i = 11; i >= 0; i--) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const key = `${year}-${month}`;

                const found = rawData.find(item => item._id === key);
                items.push({
                    date: key,
                    value: found ? found.total : 0,
                    label: d.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' })
                });
            }
        } else {
            // Days (7d or 1m)
            const days = selectedRange === '1m' ? 30 : 7;
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const key = `${year}-${month}-${day}`;

                const found = rawData.find(item => item._id === key);
                items.push({
                    date: key,
                    value: found ? found.total : 0,
                    label: d.toLocaleDateString('th-TH', selectedRange === '1m' ? { day: 'numeric', month: 'short' } : { weekday: 'short' })
                });
            }
        }
        setChartData(items);
    };

    // Initial load
    useEffect(() => {
        if (initialData && range === '7d') {
            processData(initialData, '7d');
        } else {
            fetchChartData(range);
        }
    }, [range]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col relative overflow-hidden">
            {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-sea-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-lg font-bold text-sea-text flex items-center gap-2">
                    <Icon icon="ic:round-bar-chart" className="text-sea-primary" />
                    ยอดขาย {rangeLabels[range]}
                </h2>
                <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                    <button
                        onClick={() => setRange('7d')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${range === '7d' ? 'bg-white text-sea-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        7 วัน
                    </button>
                    <button
                        onClick={() => setRange('1m')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${range === '1m' ? 'bg-white text-sea-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        1 เดือน
                    </button>
                    <button
                        onClick={() => setRange('1y')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${range === '1y' ? 'bg-white text-sea-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        1 ปี
                    </button>
                </div>
            </div>

            <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dy={10}
                            interval={range === '1m' ? 3 : 0} // Skip ticks for month view to fit
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickFormatter={(value) => `฿${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl z-50">
                                            <p className="font-medium mb-1">{label}</p>
                                            <p className="text-sea-soft-teal font-bold text-sm">
                                                ฿{payload[0].value.toLocaleString()}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="value"
                            fill="#0EA5E9"
                            radius={[4, 4, 0, 0]}
                            barSize={range === '1m' ? 8 : (range === '1y' ? 16 : 24)}
                            animationDuration={500}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;
