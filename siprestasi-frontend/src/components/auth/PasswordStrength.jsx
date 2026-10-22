function PasswordStrength({ password }) {
  if (!password) return null

  const requirements = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  const score = Object.values(requirements).filter(Boolean).length

  let level = 1
  let label = 'Lemah'

  if (score >= 5) {
    level = 3
    label = 'Kuat'
  } else if (score >= 3) {
    level = 2
    label = 'Cukup'
  }

  return (
    <div className={`password-strength strength-${level}`}>
      <div className="strength-row">
        <div className="strength-bars">
          {[1, 2, 3].map((item) => (
            <span
              key={item}
              className={`strength-bar ${
                item <= level ? 'filled' : ''
              }`}
            />
          ))}
        </div>

        <span className="strength-label">{label}</span>
      </div>

      <p className="password-helper">
        Minimal 8 karakter, huruf kecil, huruf kapital, angka, dan simbol.
      </p>
    </div>
  )
}

export default PasswordStrength