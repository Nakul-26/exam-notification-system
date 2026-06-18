import { useState } from 'react'
import type { FormEvent } from 'react'

type LoginUser = {
  id: string
  role: 'admin' | 'teacher'
  name: string
  email: string
}

type LoginPageProps = {
  onLoginSuccess: (payload: { token?: string; accessToken?: string; user: LoginUser }) => void
}

const authApiPath = '/api/auth/login'

const parseResponsePayload = async (response: Response) => {
  const contentType = (response.headers.get('content-type') || '').toLowerCase()

  if (contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return {}
    }
  }

  const text = await response.text().catch(() => '')
  if (!text) {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')

      const response = await fetch(authApiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const payload = await parseResponsePayload(response)
      if (!response.ok) {
        throw new Error(payload?.message || 'Login failed')
      }

      if (!payload?.data?.user) {
        throw new Error('Invalid login response from server')
      }
      onLoginSuccess(payload.data)
    } catch (err) {
      const message =
        err instanceof TypeError
          ? 'Unable to reach server. Please confirm backend is running on port 5000.'
          : err instanceof Error
            ? err.message
            : 'Unexpected error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <header className="login-header">
          <p className="eyebrow" style={{ color: '#2563eb', marginBottom: '0.5rem' }}>School Management</p>
          <h2>Welcome Back</h2>
          <p>Sign in to your account to continue</p>
        </header>

        {error ? (
          <div className="error" style={{ marginBottom: '1.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        ) : null}

        <form className="student-form" onSubmit={handleSubmit}>
          <label className="field field-full">
            <span>Email Address</span>
            <input
              type="email"
              placeholder="e.g. admin@school.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="field field-full">
            <span>Password</span>
            <div className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button type="submit" className="primary" disabled={loading} style={{ width: '100%', height: '48px', fontSize: '1rem' }}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#fff', marginRight: '0.75rem' }}></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default LoginPage
