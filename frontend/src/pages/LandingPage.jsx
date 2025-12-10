import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- Custom 3D SVG Logo Component ---
const IsometricLogo = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.g
      animate={{ translateY: [-5, 5, -5] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
    >
      <path d="M60 85L10 60L60 35L110 60L60 85Z" fill="var(--theme-yellow-dark)" opacity="0.5" />
      <path d="M10 60V90L60 115V85L10 60Z" fill="var(--theme-yellow-dark)" opacity="0.7" />
      <path d="M110 60V90L60 115V85L110 60Z" fill="var(--theme-yellow)" opacity="0.8" />
    </motion.g>
    <motion.g
      animate={{ translateY: [-10, 10, -10] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
    >
      <path d="M60 65L25 47.5L60 30L95 47.5L60 65Z" fill="var(--theme-yellow)" />
      <path d="M45 42H55V52H45V42Z" fill="#121212" />
      <path d="M65 42H75V52H65V42Z" fill="#121212" />
      <path d="M45 56H55V60H65V56H75V62H45V56Z" fill="#121212" />
    </motion.g>
  </svg>
);

// --- Custom 3D Hero Illustration Component ---
const HeroScanIllustration = () => (
  <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-svg">
    <motion.g 
       initial={{ opacity: 0, y: 50 }}
       animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.8 }}}
    >
        <path d="M120 320L40 280V100L200 20L280 60V240L120 320Z" fill="#1a1a1a" stroke="var(--theme-yellow)" strokeWidth="2"/>
        <path d="M200 20L120 60V240L200 200V20Z" fill="#2a2a2a"/>
        <path d="M120 60L40 100V280L120 240V60Z" fill="#141414"/>
        <path d="M130 230L60 265V110L210 35L270 65V210L130 230Z" fill="url(#screen_gradient)" opacity="0.8"/>
        <motion.path 
            d="M60 110L210 35L270 65L120 140L60 110Z" 
            fill="var(--theme-yellow)" 
            opacity="0.4"
            animate={{ translateY: [0, 150, 0], opacity: [0.4, 0.1, 0.4] }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        />
    </motion.g>
    <motion.g
        animate={{ translateY: [-15, 15, -15], rotateY: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        style={{ transformOrigin: 'center' }}
    >
        <path d="M300 180L240 150L300 120L360 150L300 180Z" fill="var(--theme-yellow)"/>
        <path d="M240 150V210L300 240V180L240 150Z" fill="var(--theme-yellow-dark)"/>
        <path d="M360 150V210L300 240V180L360 150Z" fill="#BFA004"/>
        <rect x="290" y="140" width="20" height="20" fill="#121212" transform="rotate(-26 300 150) skewX(30)"/>
    </motion.g>
    <defs>
        <linearGradient id="screen_gradient" x1="40" y1="100" x2="280" y2="240" gradientUnits="userSpaceOnUse">
        <stop stopColor="var(--theme-yellow)" stopOpacity="0.1"/>
        <stop offset="1" stopColor="var(--theme-yellow)" stopOpacity="0.5"/>
        </linearGradient>
    </defs>
  </svg>
);

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
    whileInView: { transition: { staggerChildren: 0.2 } }
};

const LandingPage = () => {
  return (
    <div className="landing-page-dark">
      {/* Navbar */}
      <div className="d-flex justify-content-between align-items-center p-4 container brand-nav position-relative z-index-10">
          <div className="d-flex align-items-center gap-2">
            <IsometricLogo />
            <h4 className="mb-0 fw-bold text-white">NEXUS <span className="text-yellow">INVENTORY</span></h4>
          </div>
          <div>
            <Link to="/login">
                <Button variant="outline-yellow" size="sm" className="rounded-pill px-4">Login</Button>
            </Link>
          </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section position-relative overflow-hidden">
        
        {/* --- CSS Generated Waves (No external images needed) --- */}
        <div className="wave-container">
             {/* Top Left Yellow Blob */}
             <div className="wave-blob blob-top"></div>
             {/* Bottom Right Yellow Blob */}
             <div className="wave-blob blob-bottom"></div>
        </div>

        <Container>
          <Row className="align-items-center min-vh-80 py-5">
            <Col lg={6} className="position-relative z-index-2">
              <motion.div {...fadeInUp}>
                  <h1 className="display-3 fw-bold mb-4 text-white">
                    Welcome to<br />
                    <span className="text-yellow glow-text">Smart Inventory</span><br />
                    Management System!!
                  </h1>
                  <p className="lead mb-5 text-gray-300">
                    Manage, issue, and monitor lab materials seamlessly with our 
                    QR-based system designed for modern speed and efficiency.
                  </p>
                  <div className="d-flex gap-3 flex-wrap">
                    <Link to="/login">
                      <Button variant="yellow" size="lg" className="fw-bold px-5 rounded-pill glow-button">
                        🚀 Get Started
                      </Button>
                    </Link>
                    <Button variant="outline-yellow" size="lg" href="#features" className="rounded-pill px-4">
                      Explore Features
                    </Button>
                  </div>
              </motion.div>
            </Col>
            <Col lg={6} className="text-center position-relative z-index-2">
                <HeroScanIllustration />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section py-5">
        <Container>
          <motion.div className="text-center mb-5" {...fadeInUp}>
            <h2 className="display-5 fw-bold text-white">Key Features</h2>
            <p className="lead text-gray-400">Engineered for seamless lab operations</p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            <Row className="g-4">
                <Col md={4}><motion.div variants={fadeInUp}><Card className="h-100 dark-card hover-3d"><Card.Body className="text-center p-4"><div className="feature-icon mb-3">📱</div><h4 className="mt-3 text-white">QR Code Scanning</h4><p className="text-gray-400">Scan to instantly borrow and return. Lightning fast, paperless transactions.</p></Card.Body></Card></motion.div></Col>
                <Col md={4}><motion.div variants={fadeInUp}><Card className="h-100 dark-card hover-3d"><Card.Body className="text-center p-4"><div className="feature-icon mb-3">🛡️</div><h4 className="mt-3 text-white">Role-Based Access</h4><p className="text-gray-400">Secure, segregated dashboards for Admins, Faculty, and Students.</p></Card.Body></Card></motion.div></Col>
                <Col md={4}><motion.div variants={fadeInUp}><Card className="h-100 dark-card hover-3d"><Card.Body className="text-center p-4"><div className="feature-icon mb-3">📈</div><h4 className="mt-3 text-white">Live Analytics</h4><p className="text-gray-400">Real-time tracking of equipment availability and usage patterns.</p></Card.Body></Card></motion.div></Col>
                <Col md={4}><motion.div variants={fadeInUp}><Card className="h-100 dark-card hover-3d"><Card.Body className="text-center p-4"><div className="feature-icon mb-3">⚡</div><h4 className="mt-3 text-white">Fast Issue/Return</h4><p className="text-gray-400">Reduce waiting times with one-click automated workflows.</p></Card.Body></Card></motion.div></Col>
                <Col md={4}><motion.div variants={fadeInUp}><Card className="h-100 dark-card hover-3d"><Card.Body className="text-center p-4"><div className="feature-icon mb-3">🔔</div><h4 className="mt-3 text-white">Smart Notifications</h4><p className="text-gray-400">Automated alerts for due dates and low stock inventory.</p></Card.Body></Card></motion.div></Col>
                <Col md={4}><motion.div variants={fadeInUp}><Card className="h-100 dark-card hover-3d"><Card.Body className="text-center p-4"><div className="feature-icon mb-3">☁️</div><h4 className="mt-3 text-white">Cloud Secure</h4><p className="text-gray-400">Data is encrypted and safely stored in the cloud for easy access.</p></Card.Body></Card></motion.div></Col>
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* Roles Section */}
      <section className="roles-section py-5 bg-darker">
        <Container>
          <motion.div className="text-center mb-5" {...fadeInUp}>
            <h2 className="display-5 fw-bold text-white">Who Is It For?</h2>
            <p className="lead text-gray-400">Tailored experiences for every user type</p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            <Row className="g-4">
                <Col md={4}><motion.div variants={fadeInUp}><Card className="h-100 role-card shadow"><Card.Header className="role-header py-3"><div className="role-icon">🎓</div><h4 className="mb-0">Students</h4></Card.Header><Card.Body><ul className="list-unstyled text-gray-300"><li className="mb-2"><span className="text-yellow me-2">✓</span>Browse lab items</li><li className="mb-2"><span className="text-yellow me-2">✓</span>Quick QR borrowing</li><li className="mb-2"><span className="text-yellow me-2">✓</span>View history & dues</li></ul></Card.Body></Card></motion.div></Col>
                <Col md={4}><motion.div variants={fadeInUp}><Card className="h-100 role-card shadow main-role"><Card.Header className="role-header py-3"><div className="role-icon">👨‍🏫</div><h4 className="mb-0">Faculty</h4></Card.Header><Card.Body><ul className="list-unstyled text-gray-300"><li className="mb-2"><span className="text-yellow me-2">✓</span>Manage Lab Stock</li><li className="mb-2"><span className="text-yellow me-2">✓</span>Generate Item QRs</li><li className="mb-2"><span className="text-yellow me-2">✓</span>Monitor Student Usage</li></ul></Card.Body></Card></motion.div></Col>
                <Col md={4}><motion.div variants={fadeInUp}><Card className="h-100 role-card shadow"><Card.Header className="role-header py-3"><div className="role-icon">👨‍💼</div><h4 className="mb-0">Admin</h4></Card.Header><Card.Body><ul className="list-unstyled text-gray-300"><li className="mb-2"><span className="text-yellow me-2">✓</span>Full System Control</li><li className="mb-2"><span className="text-yellow me-2">✓</span>User Management</li><li className="mb-2"><span className="text-yellow me-2">✓</span>System-wide Analytics</li></ul></Card.Body></Card></motion.div></Col>
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <Container>
          <motion.div 
            className="cta-box p-5 rounded-4 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
             <h2 className="display-5 fw-bold mb-3 text-dark">Ready to Modernize Your Lab?</h2>
             <p className="lead mb-4 text-dark opacity-75">Join the future of inventory management today.</p>
             <Link to="/login">
               <Button variant="dark" size="lg" className="px-5 rounded-pill">Login Now →</Button>
             </Link>
          </motion.div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="footer py-5 bg-black text-white">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center gap-2 mb-3">
                 <IsometricLogo />
                 <h5 className="mb-0 text-yellow">NEXUS INVENTORY</h5>
              </div>
              <p className="text-gray-400">Next-gen inventory management for Mechanical and IDEAL labs.</p>
            </Col>
            <Col md={6} className="text-md-end mt-4 mt-md-0"></Col>
          </Row>
        </Container>
      </footer>

      <style jsx>{`
        :root {
          --theme-bg-main: #0a0a0a;
          --theme-bg-sec: #121212;
          --theme-bg-card: #1a1a1a;
          --theme-yellow: #FCD535;
          --theme-yellow-dark: #cca914;
          --theme-text-gray: #a0a0a0;
        }

        .landing-page-dark {
          background-color: var(--theme-bg-main);
          color: var(--theme-text-gray);
          overflow-x: hidden;
          font-family: 'Inter', sans-serif;
        }

        /* --- New CSS Wave Styling (Replaces Image Files) --- */
        .wave-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
            pointer-events: none;
        }
        
        .wave-blob {
            position: absolute;
            filter: blur(80px); /* Creates the soft "wave" glow look */
            opacity: 0.15;
            background: radial-gradient(circle, var(--theme-yellow) 0%, transparent 70%);
            border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
            animation: blobFloat 20s infinite alternate;
        }

        .blob-top {
            top: -20%;
            left: -10%;
            width: 800px;
            height: 800px;
        }

        .blob-bottom {
            bottom: -20%;
            right: -10%;
            width: 900px;
            height: 900px;
            animation-delay: -5s;
        }

        @keyframes blobFloat {
            0% { transform: translate(0, 0) rotate(0deg); }
            100% { transform: translate(30px, 50px) rotate(10deg); }
        }

        /* Utility Classes */
        .text-yellow { color: var(--theme-yellow) !important; }
        .text-white { color: #ffffff !important; }
        .bg-darker { background-color: var(--theme-bg-sec) !important; }
        .bg-black { background-color: #000000 !important; }
        .z-index-2 { z-index: 2; }
        .z-index-10 { z-index: 10; }
        .min-vh-80 { min-height: 80vh; }

        /* Buttons */
        .btn-yellow {
            background-color: var(--theme-yellow);
            border: none;
            color: var(--theme-bg-main);
            transition: all 0.3s ease;
        }
        .btn-yellow:hover {
            background-color: #fff;
            color: var(--theme-bg-main);
            transform: translateY(-3px);
            box-shadow: 0 10px 20px -10px rgba(252, 213, 53, 0.5);
        }
        .btn-outline-yellow {
            border: 2px solid var(--theme-yellow);
            color: var(--theme-yellow);
            font-weight: 600;
        }
        .btn-outline-yellow:hover {
            background-color: var(--theme-yellow);
            color: var(--theme-bg-main);
        }
        .glow-button {
            box-shadow: 0 0 15px rgba(252, 213, 53, 0.3);
        }
        .glow-text {
             text-shadow: 0 0 10px rgba(252, 213, 53, 0.4);
        }

        /* Card Styles */
        .dark-card {
            background-color: var(--theme-bg-card);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 16px;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .feature-icon {
            font-size: 3.5rem;
            display: inline-block;
            filter: drop-shadow(0 5px 15px rgba(252, 213, 53, 0.2));
        }
        .hover-3d:hover {
             transform: translateY(-15px) scale(1.03);
             background-color: #222;
             border-color: var(--theme-yellow);
             box-shadow: 0 20px 30px -10px rgba(0,0,0,0.5), 0 0 20px rgba(252, 213, 53, 0.2) inset;
        }

        /* Role Cards */
        .role-card {
            background-color: var(--theme-bg-card);
            border: none;
            border-radius: 20px;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .role-card:hover {
             transform: translateY(-10px);
             box-shadow: 0 20px 40px rgba(0,0,0,0.4) !important;
        }
        .main-role {
             border: 2px solid var(--theme-yellow-dark);
             transform: scale(1.05);
        }
        .main-role:hover {
             transform: scale(1.05) translateY(-10px);
        }
        .role-header {
            background-color: #252525;
            color: var(--theme-yellow);
            text-align: center;
            border-bottom: 3px solid var(--theme-yellow);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        .role-icon { font-size: 2.5rem; }

        /* CTA */
        .cta-box {
            background: linear-gradient(135deg, var(--theme-yellow), #e0bc20);
            box-shadow: 0 20px 50px rgba(252, 213, 53, 0.3);
            position: relative;
            overflow: hidden;
        }
        .cta-box::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: radial-gradient(circle at 10% 20%, rgba(0,0,0,0.1) 2px, transparent 2px);
            background-size: 20px 20px;
            opacity: 0.3;
            pointer-events: none;
        }
        .brand-nav svg { height: 50px; width: 50px; }

        @media (max-width: 991px) {
           .hero-section { text-align: center; }
           .hero-section .d-flex { justify-content: center; }
           .hero-svg { margin-top: 40px; max-height: 300px; }
           .display-3 { font-size: 2.5rem; }
           .main-role { transform: scale(1); }
           .main-role:hover { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;