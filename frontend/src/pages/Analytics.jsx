import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import api from '../services/api'
import CopyButton from '../components/CopyButton'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function Analytics() {
  const { urlId } = useParams()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState('line')

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

  const chartData = analytics
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
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
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          stepSize: 1,
        },
      },
    },
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
      <div className="max-w-4xl mx-auto">
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

        {/* Chart */}
        <div className="bg-white border-2 border-gray-100 rounded-xl p-5">
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
            {chartData && (
              chartType === 'line' ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <Bar data={chartData} options={chartOptions} />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
