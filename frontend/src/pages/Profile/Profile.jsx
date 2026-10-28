import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Shield, Ticket, Star, Sparkles, LogOut, ArrowRight } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import styles from './Profile.module.css'

export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <div className="page-wrapper">
      <div className={`container ${styles.profilePage}`}>
        <div className={styles.profileCard}>
          <div className={styles.cardGlow} />

          <div className={styles.profileHeader}>
            <div className={styles.avatarWrap}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
              ) : (
                user?.name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div className={styles.userInfo}>
              <h1>{user?.name || 'Movie Connoisseur'}</h1>
              <div className={styles.userEmail}>
                <Mail size={16} />
                <span>{user?.email}</span>
              </div>
              <div className={styles.badgeRole}>
                <Shield size={13} /> {user?.role === 'admin' ? 'System Administrator' : 'IMovies Premier Member'}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><Ticket size={24} /></div>
              <div>
                <div className={styles.statValue}>{user?.bookingsCount || 1}</div>
                <div className={styles.statLabel}>Tickets Booked</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(245, 197, 24, 0.12)', color: 'var(--secondary)' }}>
                <Star size={24} />
              </div>
              <div>
                <div className={styles.statValue}>450</div>
                <div className={styles.statLabel}>Cinema Reward Points</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(0, 210, 255, 0.12)', color: 'var(--accent)' }}>
                <Sparkles size={24} />
              </div>
              <div>
                <div className={styles.statValue}>Gold Tier</div>
                <div className={styles.statLabel}>Membership Club</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actionsRow}>
            <Link to="/bookings" className="btn btn-primary btn-lg">
              <Ticket size={18} /> View My Bookings <ArrowRight size={16} />
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="btn btn-secondary btn-lg">
                <Shield size={18} /> Open Admin Panel
              </Link>
            )}
            <button className="btn btn-ghost btn-lg" onClick={handleLogout}>
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
