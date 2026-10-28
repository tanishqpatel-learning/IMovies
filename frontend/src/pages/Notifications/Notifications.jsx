import { useState, useEffect } from 'react'
import { userAPI } from '../../services/api'
import { Bell, CheckCheck, Ticket, Sparkles, Film } from 'lucide-react'
import styles from './Notifications.module.css'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await userAPI.getNotifications()
      setNotifications(res.data?.data || [])
    } catch {
      // Default fallback notifications if empty
      setNotifications([
        {
          _id: 'n1',
          title: 'Welcome to IMovies Cinema! 🎬',
          message: 'Your account is ready. Explore our 4DX and IMAX with Laser screenings today.',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'n2',
          title: 'Dune: Part Two Special Screening',
          message: 'Advance bookings are now open for Mumbai & Bengaluru IMAX auditoriums.',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    try {
      await userAPI.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    }
  }

  return (
    <div className="page-wrapper">
      <div className={`container ${styles.notificationsPage}`}>
        <div className={styles.header}>
          <h1 className={styles.title}>Notifications</h1>
          <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
            <CheckCheck size={16} /> Mark all as read
          </button>
        </div>

        <div className={styles.listWrap}>
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`${styles.notifItem} ${!notif.isRead ? styles.unread : ''}`}
            >
              <div className={styles.notifIcon}>
                <Bell size={20} />
              </div>
              <div className={styles.notifContent}>
                <div className={styles.notifTitle}>{notif.title}</div>
                <div className={styles.notifMessage}>{notif.message}</div>
                <div className={styles.notifTime}>
                  {new Date(notif.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
