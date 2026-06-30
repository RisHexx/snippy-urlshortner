import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import CopyButton from '../components/CopyButton'

function Library() {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null })

  useEffect(() => {
    fetchUrls()
  }, [])

  const fetchUrls = async () => {
    try {
      const response = await api.get('/api/urls')
      setUrls(response.data)
    } catch (error) {
      console.error('Failed to fetch URLs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const id = deleteModal.id
    setDeleteModal({ open: false, id: null })
    
    setDeleteLoading(id)
    try {
      await api.delete(`/api/urls/${id}`)
      setUrls((prev) => prev.filter((url) => url._id !== id))
    } catch (error) {
      console.error('Failed to delete URL:', error)
    } finally {
      setDeleteLoading(null)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] pt-8 sm:pt-12 px-4 pb-12">
      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteModal({ open: false, id: null })}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-sand-200 animate-[fadeInUp_0.2s_ease-out]">
            <h3 className="text-lg font-semibold text-ink-900 mb-2">Delete Link</h3>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete this link? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ open: false, id: null })}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-sand-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors shadow-[0_10px_20px_-14px_rgba(249,115,22,0.8)]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-xl font-semibold text-ink-900 tracking-tight mb-6">
          My Links
        </h1>

        {/* Empty State */}
        {urls.length === 0 ? (
          <div className="bg-white border border-sand-200 rounded-2xl p-10 text-center shadow-[0_16px_40px_-28px_rgba(15,23,42,0.2)]">
            <p className="text-slate-400 mb-4">No links yet</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-full transition-colors shadow-[0_10px_20px_-14px_rgba(249,115,22,0.8)]"
            >
              Create Your First Link
            </Link>
          </div>
        ) : (
          /* Links List */
          <div className="space-y-3">
            {urls.map((url) => (
              <div
                key={url._id}
                className="bg-white border border-sand-200 rounded-2xl p-4 hover:border-sand-300 transition-colors shadow-[0_12px_30px_-22px_rgba(15,23,42,0.18)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Link Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <a
                        href={url.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 font-semibold hover:underline truncate text-sm"
                      >
                        {url.shortUrl.replace('http://', '').replace('https://', '')}
                      </a>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          url.status === 'Active'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-500'
                        }`}
                      >
                        {url.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs truncate">{url.originalUrl}</p>
                    {url.expiresAt && (
                      <p className="text-slate-400 text-xs mt-1">
                        Expires : {formatDate(url.expiresAt)}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 sm:text-right">
                    <span>{url.clickCount} clicks</span>
                    <span>{formatDate(url.createdAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:border-l sm:border-sand-200 sm:pl-4">
                    <CopyButton text={url.shortUrl} className="!py-1.5 !px-2.5 text-xs" />
                    
                    <Link
                      to={`/analytics/${url._id}`}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-sand-100 rounded-lg transition-colors"
                      title="Analytics"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </Link>

                    <button
                      onClick={() => setDeleteModal({ open: true, id: url._id })}
                      disabled={deleteLoading === url._id}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleteLoading === url._id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Library
