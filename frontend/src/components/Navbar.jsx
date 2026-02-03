import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-sm border-b border-primary-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <img src="/logo.png" alt="Snippy" className="h-16" />
            </Link>

            <div className="hidden sm:ml-10 sm:flex sm:space-x-4">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/library"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/library')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                My Links
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full border-2 border-primary-200"
                  />
                )}
                <button
                  onClick={logout}
                  className="ml-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="sm:hidden border-t border-primary-100">
        <div className="flex">
          <Link
            to="/dashboard"
            className={`flex-1 py-3 text-center text-sm font-medium ${
              isActive('/dashboard')
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/library"
            className={`flex-1 py-3 text-center text-sm font-medium ${
              isActive('/library')
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600'
            }`}
          >
            My Links
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
