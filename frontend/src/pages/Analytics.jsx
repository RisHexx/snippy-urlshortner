import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import api from '../services/api'
import CopyButton from '../components/CopyButton'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const CHART_COLORS = [
  '#f97316', '#f59e0b', '#0ea5e9', '#22c55e',
  '#6366f1', '#ec4899', '#14b8a6', '#ef4444',
]

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const startTimeRef = useRef(null)

  useEffect(() => {
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const progress = timestamp - startTimeRef.current
      const percentage = Math.min(progress / duration, 1)

      const nextCount = Math.floor(value * percentage)
      if (nextCount !== countRef.current) {
        countRef.current = nextCount
        setCount(nextCount)
      }

      if (percentage < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(value)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return <span className="stat-number">{typeof value === 'number' ? count : value}</span>
}

function Analytics() {
  const { urlId } = useParams()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState('line')
  const [insights, setInsights] = useState(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsError, setInsightsError] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [urlId])

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/api/analytics/${urlId}`)
      setAnalytics(response.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInsights = async () => {
    setInsightsLoading(true)
    setInsightsError(null)
    try {
      const response = await api.get(`/api/insights/${urlId}`)
      setInsights(response.data)
    } catch (error) {
      console.error('Failed to fetch insights:', error)
      setInsightsError(error.response?.data?.message || 'Failed to generate insights. Please try again.')
    } finally {
      setInsightsLoading(false)
    }
  }

  // Common Chart Options for Light Theme
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#64748b',
          font: { size: 12, family: 'Space Grotesk', weight: '500' },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#0f172a',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        titleFont: { size: 14, weight: '600', family: 'Space Grotesk' },
        bodyFont: { size: 13, family: 'Space Grotesk' },
        displayColors: true,
        boxPadding: 6,
        shadowColor: 'rgba(0,0,0,0.1)',
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11, family: 'Space Grotesk' } },
      },
      y: {
        grid: { color: '#f1f5f9', drawBorder: false },
        ticks: { color: '#94a3b8', font: { size: 11, family: 'Space Grotesk' }, padding: 8 },
      },
    },
  }

  // ── Click Trend Chart ──
  const clickTrendData = analytics
    ? {
      labels: analytics.clicksByDay.map((d) => {
        const date = new Date(d.date)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }),
      datasets: [
        {
          label: 'Clicks',
          data: analytics.clicksByDay.map((d) => d.clicks),
          borderColor: '#f97316',
          backgroundColor: (context) => {
            const ctx = context.chart.ctx
            const gradient = ctx.createLinearGradient(0, 0, 0, 400)
            gradient.addColorStop(0, 'rgba(249, 115, 22, 0.15)')
            gradient.addColorStop(1, 'rgba(249, 115, 22, 0)')
            return gradient
          },
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#f97316',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#f97316',
          pointHoverBorderColor: '#fff',
          borderWidth: 3,
        },
      ],
    }
    : null

  // ── Referrer Doughnut ──
  const referrerData = analytics?.referrerBreakdown
    ? {
      labels: analytics.referrerBreakdown.map((r) => r._id),
      datasets: [
        {
          data: analytics.referrerBreakdown.map((r) => r.count),
          backgroundColor: CHART_COLORS,
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 12,
        },
      ],
    }
    : null

  // ── Device Doughnut ──
  const deviceData = analytics?.deviceBreakdown
    ? {
      labels: Object.keys(analytics.deviceBreakdown),
      datasets: [
        {
          data: Object.values(analytics.deviceBreakdown),
          backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6'],
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 12,
        },
      ],
    }
    : null

  // ── Hourly Bar ──
  const hourlyData = analytics?.hourlyDistribution
    ? {
      labels: analytics.hourlyDistribution.map((h) => `${h.hour.toString().padStart(2, '0')}:00`),
      datasets: [
        {
          label: 'Clicks',
          data: analytics.hourlyDistribution.map((h) => h.clicks),
          backgroundColor: '#f97316',
          borderRadius: 6,
          hoverBackgroundColor: '#ea580c',
        },
      ],
    }
    : null

  // ── Weekly Comparison ──
  const weeklyData = analytics?.weeklyComparison
    ? {
      labels: analytics.weeklyComparison.map((w) => w.day),
      datasets: [
        {
          label: 'This Week',
          data: analytics.weeklyComparison.map((w) => w.thisWeek),
          backgroundColor: '#f97316',
          borderRadius: 6,
        },
        {
          label: 'Last Week',
          data: analytics.weeklyComparison.map((w) => w.lastWeek),
          backgroundColor: '#e2e8f0',
          borderRadius: 6,
        },
      ],
    }
    : null

  const parseInsightSections = (text) => {
    if (!text) return []
    const lines = text.split('\n')
    const sections = []
    let currentSection = null
    const headingMap = new Map([
      ['performance summary', 'Performance Summary'],
      ['traffic trends', 'Traffic Trends'],
      ['traffic sources', 'Traffic Sources'],
      ['device split', 'Device Split'],
      ['best times', 'Best Times'],
    ])

    for (const line of lines) {
      const trimmedLine = line.trim()
      const emojiMatch = trimmedLine.match(/^(📊|📈|🌐|📱|⏰|🎯)\s+(.+)/)
      const plainHeading = headingMap.get(trimmedLine.toLowerCase())

      if (emojiMatch || plainHeading) {
        if (currentSection) sections.push(currentSection)
        currentSection = {
          icon: emojiMatch?.[1] || '•',
          title: (emojiMatch?.[2] || plainHeading).trim(),
          content: '',
        }
      } else if (currentSection && trimmedLine) {
        currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine
      }
    }
    if (currentSection) sections.push(currentSection)
    return sections.length > 0 ? sections : [{ icon: '•', title: 'Analysis', content: text }]
  }

  if (loading) {
    return (
      <div className="min-h-screen app-shell flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen app-shell flex items-center justify-center p-4 text-center">
        <div>
          <p className="text-slate-500 mb-6 text-lg">Analytics not found</p>
          <Link to="/library" className="inline-flex px-6 py-3 bg-white border border-sand-200 text-ink-900 font-semibold rounded-xl hover:border-primary-300 transition-all">
            ← Back to Library
          </Link>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-[calc(100vh-64px)] pt-4 sm:pt-20 px-4 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="animate-fadeIn">
            <Link to="/library" className="text-slate-400 hover:text-primary-600 flex items-center gap-1.5 mb-3 text-sm transition-colors group">
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Library
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">Performance Insights</h1>
            <p className="text-slate-500 mt-1.5 font-medium">Real-time data for your shortened link</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="bg-white border border-sand-200 rounded-2xl p-4 shadow-sm flex flex-col min-w-[240px]">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Short Link</span>
              <div className="flex items-center justify-between gap-3">
                <a href={analytics.urlInfo.shortUrl} target="_blank" rel="noreferrer" className="text-primary-600 font-semibold hover:underline truncate text-sm">
                  {analytics.urlInfo.shortUrl.replace(/^https?:\/\//, '')}
                </a>
                <CopyButton text={analytics.urlInfo.shortUrl} className="!p-1.5 !bg-sand-50 hover:!bg-sand-100" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="stat-icon bg-orange-50 text-orange-500 mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Clicks</p>
            <div className="text-2xl sm:text-3xl font-bold text-ink-900"><AnimatedCounter value={analytics.totalClicks} /></div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bg-blue-50 text-blue-500 mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Daily Avg</p>
            <div className="text-2xl sm:text-3xl font-bold text-ink-900">
              <AnimatedCounter value={Number((analytics.totalClicks / Math.max(analytics.clicksByDay.length, 1)).toFixed(1))} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bg-emerald-50 text-emerald-500 mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Peak Hour</p>
            <div className="text-2xl sm:text-3xl font-bold text-ink-900">
              {analytics.hourlyDistribution.reduce((a, b) => a.clicks > b.clicks ? a : b).hour}:00
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bg-purple-50 text-purple-500 mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Created</p>
            <div className="text-xl sm:text-2xl font-bold text-ink-900 mt-1">
              {new Date(analytics.urlInfo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Engagement and Device Breakdown */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <div className="analytics-card p-6 sm:p-8 chart-container chart-delay-2">
            <h3 className="text-xl font-bold text-ink-900 mb-8">Device Distribution</h3>
            <div className="h-[300px]">
              {deviceData && deviceData.datasets[0].data.some(v => v > 0) ? (
                <Doughnut
                  data={deviceData}
                  options={{
                    ...commonOptions,
                    cutout: '75%',
                    plugins: {
                      ...commonOptions.plugins,
                      legend: {
                        position: 'right',
                        labels: {
                          ...commonOptions.plugins.legend.labels,
                          boxWidth: 8,
                          padding: 15,
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300 italic text-sm">No device data yet</div>
              )}
            </div>
          </div>

          <div className="analytics-card p-6 sm:p-8 chart-container chart-delay-3">
            <h3 className="text-xl font-bold text-ink-900 mb-8">Engagement Overview</h3>
            <div className="h-[300px]">
              {clickTrendData && (
                chartType === 'line'
                  ? <Line data={clickTrendData} options={{ ...commonOptions, plugins: { ...commonOptions.plugins, legend: { display: false } } }} />
                  : <Bar data={clickTrendData} options={{ ...commonOptions, plugins: { ...commonOptions.plugins, legend: { display: false } } }} />
              )}
            </div>
          </div>
        </div>

        {/* Time-based Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="analytics-card p-6 sm:p-8 chart-container chart-delay-4">
            <h3 className="text-xl font-bold text-ink-900 mb-8">Hourly Traffic (UTC)</h3>
            <div className="h-[250px]">
              {hourlyData && <Bar data={hourlyData} options={{ ...commonOptions, plugins: { ...commonOptions.plugins, legend: { display: false } } }} />}
            </div>
          </div>
          <div className="analytics-card p-6 sm:p-8 chart-container chart-delay-5">
            <h3 className="text-xl font-bold text-ink-900 mb-8">Weekly Momentum</h3>
            <div className="h-[250px]">
              {weeklyData && <Bar data={weeklyData} options={commonOptions} />}
            </div>
          </div>
        </div>

        {/* AI Insights - Premium Light Card */}
        <div className="insights-premium-card p-6 sm:p-10 chart-container chart-delay-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-2xl shadow-inner border border-primary-500/20">✦</div>
              <div>
                <h2 className="text-2xl font-bold text-ink-900">Insights Report</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <p className="text-slate-500 text-sm font-semibold">Real-time analysis by Groq</p>
                </div>
              </div>
            </div>

            {!insights && !insightsLoading && (
              <button onClick={fetchInsights} className="px-7 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-2xl shadow-[0_14px_30px_-18px_rgba(249,115,22,0.8)] transition-all hover:-translate-y-0.5 active:scale-95">
                Generate Analysis
              </button>
            )}

            {insights && !insightsLoading && (
              <button onClick={fetchInsights} className="text-primary-600 font-semibold flex items-center gap-2 hover:text-primary-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Regenerate Report
              </button>
            )}
          </div>

          <div className="min-h-[200px]">
            {insightsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="insight-item animate-pulse">
                    <div className="h-6 bg-sand-100 rounded-lg w-1/2 mb-4"></div>
                    <div className="h-3 bg-sand-50 rounded-lg w-full mb-2.5"></div>
                    <div className="h-3 bg-sand-50 rounded-lg w-4/5"></div>
                  </div>
                ))}
              </div>
            ) : insights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {parseInsightSections(insights.insights).map((section, idx) => (
                  <div key={idx} className="insight-item group">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{section.icon}</span>
                      <h4 className="font-bold text-ink-900">{section.title}</h4>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
                  </div>
                ))}
              </div>
            ) : insightsError ? (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
                <p className="text-red-600 font-medium mb-4">{insightsError}</p>
                <button onClick={fetchInsights} className="text-red-500 font-semibold underline text-sm">Retry Analysis</button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-sand-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <p className="text-slate-400 font-medium max-w-sm">Generate focused insights about your link performance with one click.</p>
              </div>
            )}
          </div>

          {/* AI Metadata Footer */}
          {insights && !insightsLoading && insights.metadata && (
            <div className="mt-12 pt-8 border-t border-sand-200 flex flex-wrap gap-3">
              <div className="px-4 py-2 bg-sand-50 rounded-full border border-sand-200 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Top Referrer: <span className="text-ink-900 ml-1">{insights.metadata.topReferrer}</span>
              </div>
              <div className="px-4 py-2 bg-sand-50 rounded-full border border-sand-200 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Primary Device: <span className="text-ink-900 ml-1">{insights.metadata.dominantDevice}</span>
              </div>
              <div className="px-4 py-2 bg-sand-50 rounded-full border border-sand-200 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Daily Reach: <span className="text-ink-900 ml-1">{insights.metadata.avgClicksPerDay} Clicks</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analytics
