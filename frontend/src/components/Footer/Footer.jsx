import { Link } from 'react-router-dom'
import { Film, Mail, Send, Heart, Shield, Award, Sparkles } from 'lucide-react'
import styles from './Footer.module.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.topGradient} />
      
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.mainGrid}>
          {/* Brand Col */}
          <div className={styles.brandCol}>
            <Link to="/" className={styles.brandLogo}>
              <div className={styles.logoBadge}>
                <Film size={22} className={styles.logoIcon} />
              </div>
              <span className={styles.brandName}>
                I<span className={styles.brandHighlight}>MOVIES</span>
              </span>
            </Link>
            
            <p className={styles.brandTagline}>
              Experience cinematic brilliance with instant real-time seat reservations, IMAX 3D previews, and seamless Stripe payments.
            </p>

            <div className={styles.featuresPills}>
              <span className={styles.featurePill}>
                <Sparkles size={12} /> Real-time Sync
              </span>
              <span className={styles.featurePill}>
                <Shield size={12} /> Stripe Secured
              </span>
              <span className={styles.featurePill}>
                <Award size={12} /> TMDb & OMDb Powered
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Explore</h4>
            <ul className={styles.linkList}>
              <li><Link to="/movies">Now Showing</Link></li>
              <li><Link to="/movies?status=Coming Soon">Coming Soon</Link></li>
              <li><Link to="/movies?genre=Action">Action Blockbusters</Link></li>
              <li><Link to="/movies?genre=Sci-Fi">Sci-Fi & IMAX</Link></li>
              <li><Link to="/bookings">My Tickets</Link></li>
            </ul>
          </div>

          {/* Theatres & Experience */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Experiences</h4>
            <ul className={styles.linkList}>
              <li><span className={styles.staticLink}>IMAX with Laser</span></li>
              <li><span className={styles.staticLink}>4DX Dynamic Motion</span></li>
              <li><span className={styles.staticLink}>Dolby Atmos 7.1</span></li>
              <li><span className={styles.staticLink}>Director's Cut Lounge</span></li>
              <li><span className={styles.staticLink}>Gourmet Cinema Bites</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className={styles.newsletterCol}>
            <h4 className={styles.colTitle}>Cinematic Newsletter</h4>
            <p className={styles.newsletterDesc}>
              Subscribe to get exclusive premiere tickets, special screenings, and weekend promo codes.
            </p>

            <form className={styles.newsletterForm} onSubmit={(e) => { e.preventDefault(); alert('Subscribed to IMovies VIP updates!'); }}>
              <div className={styles.inputWrap}>
                <Mail size={16} className={styles.mailIcon} />
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  required 
                  className={styles.newsletterInput}
                />
              </div>
              <button type="submit" className={styles.subscribeBtn}>
                <Send size={15} />
              </button>
            </form>

            <div className={styles.paymentMethods}>
              <span className={styles.paymentLabel}>Secured By Stripe</span>
              <div className={styles.paymentBadges}>
                <span className={styles.badge}>STRIPE</span>
                <span className={styles.badge}>VISA</span>
                <span className={styles.badge}>MASTERCARD</span>
                <span className={styles.badge}>APPLE PAY</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            &copy; {currentYear} IMovies Entertainment Inc. Built with React 19, Express, MongoDB & Stripe.
          </div>
          <div className={styles.bottomLinks}>
            <Link to="/privacy">Privacy Policy</Link>
            <span className={styles.dot}>•</span>
            <Link to="/terms">Terms of Service</Link>
            <span className={styles.dot}>•</span>
            <span className={styles.creatorNote}>
              Crafted with <Heart size={12} color="#c77dff" fill="#c77dff" /> for Cinephiles
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
