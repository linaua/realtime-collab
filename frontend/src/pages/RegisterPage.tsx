import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export function RegisterPage() {
  const navigate  = useNavigate()
  const { setAuth } = useAuthStore()
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { token, user } = await authApi.register({ username, email, password })
      setAuth(user, token)
      navigate('/chat')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center
                          justify-center text-2xl font-bold text-white mx-auto mb-4">
            💬
          </div>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Join your team workspace</p>
        </div>

        <div className="bg-dark-800 rounded-2xl border border-dark-600 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20
                            rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Username', value: username, set: setUsername,
                type: 'text', placeholder: 'yourname', pattern: '^[a-zA-Z0-9_]+$' },
              { label: 'Email',    value: email,    set: setEmail,
                type: 'email', placeholder: 'you@email.com' },
              { label: 'Password', value: password, set: setPassword,
                type: 'password', placeholder: 'Min. 6 characters', minLength: 6 },
            ].map(({ label, value, set, ...rest }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  {label}
                </label>
                <input
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  required
                  className="w-full bg-dark-700 text-white text-sm px-3 py-2.5
                             rounded-xl border border-dark-500 focus:outline-none
                             focus:border-blue-500 placeholder:text-gray-700"
                  {...rest}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                         text-white font-semibold py-2.5 rounded-xl transition-colors
                         text-sm mt-2"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}