import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import toast from 'react-hot-toast'
import api from '../services/api'
import QRCode from '../components/QRCode'
import CopyButton from '../components/CopyButton'

function Dashboard() {
  const [formData, setFormData] = useState({
    originalUrl: '',
    customAlias: '',
    expiresAt: null,
  })
  const [showAlias, setShowAlias] = useState(false)
  const [showExpiry, setShowExpiry] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await api.post('/api/urls', {
        originalUrl: formData.originalUrl,
        customAlias: formData.customAlias || undefined,
        expiresAt: formData.expiresAt ? formData.expiresAt.toISOString() : undefined,
      })
      setResult(response.data)
      setFormData({ originalUrl: '', customAlias: '', expiresAt: null })
      setShowAlias(false)
      setShowExpiry(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create short URL')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Custom toggle component
  const Toggle = ({ checked, onChange, label }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border-2 transition-all ${
        checked 
          ? 'bg-primary-50 border-primary-300 text-primary-700' 
          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
      }`}
    >
      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
        checked ? 'bg-primary-500 border-primary-500' : 'border-gray-300'
      }`}>
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  )

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center pt-16 sm:pt-20 px-4 pb-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800 tracking-tight mb-2">
          Shorten Your Links
        </h1>
        <p className="text-gray-500">
          Paste a long URL and get a short link instantly
        </p>
      </div>

      {/* Main Input Section */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        {/* URL Input + Button Row */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
          <input
            type="url"
            name="originalUrl"
            value={formData.originalUrl}
            onChange={handleChange}
            placeholder="Paste your long URL here..."
            required
            className="flex-1 px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors bg-white placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={loading || !formData.originalUrl}
            className="px-6 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Shortening
              </span>
            ) : (
              'Shorten'
            )}
          </button>
        </div>

        {/* Option Toggles */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Toggle 
            checked={showAlias} 
            onChange={setShowAlias} 
            label="Custom alias" 
          />
          <Toggle 
            checked={showExpiry} 
            onChange={setShowExpiry} 
            label="Set expiration" 
          />
        </div>

        {/* Custom Alias Input */}
        {showAlias && (
          <div className="mb-3">
            <div className="flex">
              <span className="inline-flex items-center px-3.5 bg-gray-50 border-2 border-r-0 border-gray-200 rounded-l-xl text-gray-400 text-sm">
                snippy.co/
              </span>
              <input
                type="text"
                name="customAlias"
                value={formData.customAlias}
                onChange={handleChange}
                placeholder="my-link"
                pattern="[a-zA-Z0-9_-]+"
                minLength={3}
                maxLength={20}
                className="flex-1 min-w-0 px-3.5 py-2.5 border-2 border-gray-200 rounded-r-xl focus:border-primary-400 outline-none transition-colors text-sm"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400 pl-1">3-20 characters: letters, numbers, hyphens</p>
          </div>
        )}

        {/* Expiration Date Input */}
        {showExpiry && (
          <div className="mb-3">
            <div className="relative">
              <DatePicker
                selected={formData.expiresAt}
                onChange={(date) => setFormData((prev) => ({ ...prev, expiresAt: date }))}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMM d, yyyy h:mm aa"
                minDate={new Date()}
                placeholderText="Select expiration date & time"
                className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors text-sm text-gray-600 bg-white"
                calendarClassName="shadow-lg border-0 rounded-xl"
                wrapperClassName="w-full"
                popperClassName="react-datepicker-popper"
                popperPlacement="bottom-start"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="mt-1.5 text-xs text-gray-400 pl-1">Link will expire after this date</p>
          </div>
        )}
      </form>

      {/* Result */}
      {result && (
        <div className="w-full max-w-2xl mt-6 p-5 border-2 border-gray-100 rounded-2xl bg-white">
          <p className="text-sm font-medium text-gray-500 mb-4">Link created</p>

          {/* Short URL Display */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3.5 bg-gray-50 rounded-xl mb-4">
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-primary-600 font-medium hover:underline break-all"
            >
              {result.shortUrl}
            </a>
            <CopyButton text={result.shortUrl} />
          </div>

          {/* Original URL */}
          <p className="text-sm text-gray-400 mb-4 break-all truncate">
            {result.originalUrl}
          </p>

          {/* QR Code */}
          <div className="flex justify-center pt-4 border-t border-gray-100">
            <QRCode url={result.shortUrl} size={120} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
