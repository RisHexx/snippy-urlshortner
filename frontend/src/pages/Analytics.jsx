import { useState, useEffect } from 'react'
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
  '#f97316', '#3b82f6', '#10b981', '#8b5cf6',
  '#ec4899', '#f59e0b', '#06b6d4', '#ef4444',
]

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
            backgroundColor: chartType === 'line' ? 'rgba(249, 115, 22, 0.08)' : 'rgba(249, 115, 22, 0.6)',
            fill: chartType === 'line',
            tension: 0.3,
            pointBackgroundColor: '#f97316',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 2,
          },
        ],
      }
    : null

  const clickTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1e293b',
        bodyColor: '#64748b',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        cornerRadius: 8,
        callbacks: {
          title: (items) => items[0].label,
          label: (item) => `${item.raw} clicks`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 11 }, maxRotation: 45, minRotation: 45 },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: { color: '#9ca3af', font: { size: 11 }, stepSize: 1 },
      },
    },
  }

  // ── Referrer Doughnut ──
  const referrerData = analytics?.referrerBreakdown
    ? {
        labels: analytics.referrerBreakdown.map((r) => r._id),
        datasets: [
          {
            data: analytics.referrerBreakdown.map((r) => r.count),
            backgroundColor: CHART_COLORS.slice(0, analytics.referrerBreakdown.length),
            borderWidth: 0,
            hoverOffset: 6,
          },
        ],
      }
    : null

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    layout: {
      padding: { right: 8 },
    },
    plugins: {
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          color: '#374151',
          font: { size: 12, weight: '500' },
          padding: 14,
          usePointStyle: true,
          pointStyleWidth: 10,
          generateLabels: (chart) => {
            const data = chart.data
            const total = data.datasets[0].data.reduce((sum, v) => sum + v, 0)
            return data.labels.map((label, i) => {
              const value = data.datasets[0].data[i]
              const pct = total > 0 ? ((value / total) * 100).toFixed(0) : 0
              return {
                text: `${label}  ${pct}%`,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: 'transparent',
                pointStyle: 'circle',
                index: i,
              }
            })
          },
        },
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1e293b',
        bodyColor: '#64748b',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((sum, v) => sum + v, 0)
            const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0
            return `${ctx.label}: ${ctx.raw} (${pct}%)`
          },
        },
      },
    },
  }

  // ── Device Pie ──
  const deviceData = analytics?.deviceBreakdown
    ? {
        labels: Object.keys(analytics.deviceBreakdown),
        datasets: [
          {
            data: Object.values(analytics.deviceBreakdown),
            backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6'],
            borderWidth: 0,
            hoverOffset: 6,
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
            backgroundColor: analytics.hourlyDistribution.map((h) => {
              const max = Math.max(...analytics.hourlyDistribution.map((x) => x.clicks))
              const intensity = max > 0 ? h.clicks / max : 0
              return `rgba(249, 115, 22, ${0.2 + intensity * 0.6})`
            }),
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      }
    : null

  const hourlyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1e293b',
        bodyColor: '#64748b',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (item) => `${item.raw} clicks`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 10 }, maxRotation: 45, minRotation: 45 },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: { color: '#9ca3af', font: { size: 11 }, stepSize: 1 },
      },
    },
  }

  // ── Weekly Comparison ──
  const weeklyData = analytics?.weeklyComparison
    ? {
        labels: analytics.weeklyComparison.map((w) => w.day),
        datasets: [
          {
            label: 'This Week',
            data: analytics.weeklyComparison.map((w) => w.thisWeek),
            backgroundColor: 'rgba(249, 115, 22, 0.7)',
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: 'Last Week',
            data: analytics.weeklyComparison.map((w) => w.lastWeek),
            backgroundColor: 'rgba(203, 213, 225, 0.6)',
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      }
    : null

  const weeklyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { color: '#6b7280', font: { size: 11 }, usePointStyle: true, pointStyleWidth: 8, padding: 16 },
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1e293b',
        bodyColor: '#64748b',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: { color: '#9ca3af', font: { size: 11 }, stepSize: 1 },
      },
    },
  }

  // ── Parse insight sections ──
  const parseInsightSections = (text) => {
    if (!text) return []
    // Split by emoji headers (📊 📈 🌐 📱 ⏰ 🎯)
    const lines = text.split('\n')
    const sections = []
    let currentSection = null

    for (const line of lines) {
      const emojiMatch = line.match(/^(📊|📈|🌐|📱|⏰|🎯)\s+(.+)/)
      if (emojiMatch) {
        if (currentSection) sections.push(currentSection)
        currentSection = { icon: emojiMatch[1], title: emojiMatch[2].trim(), content: '' }
      } else if (currentSection && line.trim()) {
        currentSection.content += (currentSection.content ? '\n' : '') + line.trim()
      }
    }
    if (currentSection) sections.push(currentSection)

    if (sections.length === 0) {
      return [{ icon: '📊', title: 'Analysis', content: text }]
    }
    return sections
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-3">Analytics not found</p>
          <Link to="/library" className="text-primary-500 hover:underline text-sm font-medium">
            ← Back to Library
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] pt-8 sm:pt-12 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          to="/library"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-primary-500 mb-6 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 tracking-tight mb-6">
          Link Analytics
        </h1>

        {/* Link Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="bg-white border-2 border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">Short Link</p>
            <div className="flex items-center gap-2">
              <a
                href={analytics.urlInfo.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 font-medium hover:underline truncate flex-1 text-sm"
              >
                {analytics.urlInfo.shortUrl}
              </a>
              <CopyButton text={analytics.urlInfo.shortUrl} className="!py-1 !px-2 text-xs shrink-0" />
            </div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">Redirects To</p>
            <a
              href={analytics.urlInfo.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary-500 truncate block text-sm transition-colors"
            >
              {analytics.urlInfo.originalUrl}
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="bg-white border-2 border-gray-100 rounded-xl p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Total Clicks</p>
            <p className="text-2xl sm:text-3xl font-semibold text-gray-800">{analytics.totalClicks}</p>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-xl p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Avg / Day</p>
            <p className="text-2xl sm:text-3xl font-semibold text-gray-800">
              {analytics.clicksByDay.length > 0
                ? (analytics.totalClicks / analytics.clicksByDay.length).toFixed(1)
                : '0'}
            </p>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-xl p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Created</p>
            <p className="text-lg sm:text-xl font-semibold text-gray-800">
              {new Date(analytics.urlInfo.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Click Trend Chart – Full Width */}
        <div className="bg-white border-2 border-gray-100 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-medium text-gray-600">Clicks (Last 30 Days)</p>
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  chartType === 'line'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  chartType === 'bar'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Bar
              </button>
            </div>
          </div>
          <div className="h-64 sm:h-72">
            {clickTrendData &&
              (chartType === 'line' ? (
                <Line data={clickTrendData} options={clickTrendOptions} />
              ) : (
                <Bar data={clickTrendData} options={clickTrendOptions} />
              ))}
          </div>
        </div>

        {/* Two-Column Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Referrer Sources – Doughnut */}
          <div className="bg-white border-2 border-gray-100 rounded-xl p-5">
            <p className="text-sm font-medium text-gray-600 mb-4">Traffic Sources</p>
            <div className="h-56">
              {referrerData && referrerData.datasets[0].data.some(v => v > 0) ? (
                <Doughnut data={referrerData} options={doughnutOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No referrer data yet
                </div>
              )}
            </div>
          </div>

          {/* Device Breakdown – Doughnut */}
          <div className="bg-white border-2 border-gray-100 rounded-xl p-5">
            <p className="text-sm font-medium text-gray-600 mb-4">Device Breakdown</p>
            <div className="h-56">
              {deviceData && deviceData.datasets[0].data.some(v => v > 0) ? (
                <Doughnut data={deviceData} options={{
                  ...doughnutOptions,
                  cutout: '55%',
                }} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No device data yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hourly Traffic – Full Width */}
        <div className="bg-white border-2 border-gray-100 rounded-xl p-5 mb-6">
          <p className="text-sm font-medium text-gray-600 mb-4">Hourly Traffic Distribution (UTC)</p>
          <div className="h-52">
            {hourlyData && hourlyData.datasets[0].data.some(v => v > 0) ? (
              <Bar data={hourlyData} options={hourlyOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No hourly data yet
              </div>
            )}
          </div>
        </div>

        {/* Weekly Comparison */}
        <div className="bg-white border-2 border-gray-100 rounded-xl p-5 mb-6">
          <p className="text-sm font-medium text-gray-600 mb-1">Weekly Comparison</p>
          <p className="text-xs text-gray-400 mb-4">This week vs last week</p>
          <div className="h-52">
            {weeklyData ? (
              <Bar data={weeklyData} options={weeklyOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No weekly data yet
              </div>
            )}
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="bg-gradient-to-br from-white to-primary-50 border-2 border-primary-100 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <h2 className="text-lg font-semibold text-gray-800">AI Insights</h2>
              <span className="px-2 py-0.5 bg-primary-100 text-primary-600 text-[10px] font-semibold rounded-full uppercase tracking-wider">
                Powered by Groq
              </span>
            </div>
            {!insights && !insightsLoading && (
              <button
                onClick={fetchInsights}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-all hover:shadow-md active:scale-[0.98]"
              >
                Generate Insights
              </button>
            )}
            {insights && !insightsLoading && (
              <button
                onClick={fetchInsights}
                className="px-3 py-1.5 text-primary-500 hover:bg-primary-100 text-xs font-medium rounded-lg transition-colors"
              >
                ↻ Regenerate
              </button>
            )}
          </div>

          {/* Loading State */}
          {insightsLoading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-primary-100 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-full mb-1.5"></div>
                  <div className="h-3 bg-gray-100 rounded w-4/5"></div>
                </div>
              ))}
              <p className="text-xs text-gray-400 text-center mt-3">
                Analyzing your data with AI...
              </p>
            </div>
          )}

          {/* Error State */}
          {insightsError && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
              <p className="text-sm text-red-600 mb-2">{insightsError}</p>
              <button
                onClick={fetchInsights}
                className="text-xs text-red-500 hover:text-red-700 font-medium underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Insights Content */}
          {insights && !insightsLoading && (
            <div className="space-y-4">
              {parseInsightSections(insights.insights).map((section, index) => (
                <div
                  key={index}
                  className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg flex-shrink-0">{section.icon}</span>
                    <div className="flex-1 min-w-0">
                      {section.title && (
                        <p className="text-sm font-semibold text-gray-800 mb-1">{section.title}</p>
                      )}
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Quick metadata */}
              {insights.metadata && (
                <div className="flex flex-wrap gap-3 pt-2 border-t border-primary-100/50">
                  <span className="px-2.5 py-1 bg-white/80 rounded-full text-[11px] text-gray-500">
                    🔗 Top Source: {insights.metadata.topReferrer}
                  </span>
                  <span className="px-2.5 py-1 bg-white/80 rounded-full text-[11px] text-gray-500">
                    📱 Top Device: {insights.metadata.dominantDevice}
                  </span>
                  <span className="px-2.5 py-1 bg-white/80 rounded-full text-[11px] text-gray-500">
                    📊 {insights.metadata.avgClicksPerDay} clicks/day avg
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Default state */}
          {!insights && !insightsLoading && !insightsError && (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm mb-1">
                Get AI-powered insights about your link performance
              </p>
              <p className="text-gray-300 text-xs">
                Traffic patterns, recommendations, and optimization tips
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analytics
