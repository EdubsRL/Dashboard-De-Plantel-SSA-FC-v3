function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const SIZES = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-11 h-11 text-xs',
  lg: 'w-16 h-16 text-base',
}

export default function Avatar({ name, photoUrl, size = 'sm', className = '' }) {
  const sizeClass = SIZES[size] || SIZES.sm

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover shrink-0 border border-graphite-700 ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-full shrink-0 bg-graphite-700 border border-graphite-600 flex items-center justify-center font-semibold text-gray-300 ${className}`}
    >
      {initials(name)}
    </div>
  )
}
