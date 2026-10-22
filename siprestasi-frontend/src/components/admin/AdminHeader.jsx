import './AdminHeader.css'

function RankingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20V10h4v10" />
      <path d="M10 20V4h4v16" />
      <path d="M16 20v-7h4v7" />
    </svg>
  )
}

function AdminHeader({
  title,
  description,
  metaStage = 'Tahap 1 sedang berlangsung',
  metaInfo = 'Batas verifikasi: 28 Februari 2026',
  showRankingButton = false,
  onRankingClick,

  actionLabel,
  onActionClick,
}) {
  return (
    <section className="admin-header">

      <div className="admin-header-content">

        <span className="admin-header-badge">
          ● PORTAL ADMINISTRATOR
        </span>

        <h1>{title}</h1>

        <p>{description}</p>

        <div className="admin-header-meta">
          <span>TA 2025/2026</span>
          <span>•</span>
          <strong>{metaStage}</strong>
          <span>•</span>
          <span>{metaInfo}</span>
        </div>

      </div>

      {showRankingButton && (
        <button
          type="button"
          className="admin-header-action"
          onClick={onRankingClick}
        >
          <RankingIcon />
          Lihat Peringkat Tahap 1
        </button>
      )}

      {actionLabel && (
        <button
          type="button"
          className="admin-header-action"
          onClick={onActionClick}
        >
          {actionLabel}
        </button>
      )}

       <div className="admin-header-art" aria-hidden="true">

    <div className="header-wave wave-one"></div>
    <div className="header-wave wave-two"></div>
    <div className="header-wave wave-three"></div>

  </div>

    </section>
  )
}

export default AdminHeader