import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Spot Finding',
      description: 'Smart algorithms analyze real-time data to find optimal parking spots based on your preferences, vehicle size, and destination proximity.',
      price: '0.3 ADA',
      color: '#3b82f6'
    },
    {
      icon: '💰',
      title: 'Dynamic Pricing Engine',
      description: 'Get fair, transparent pricing powered by AI that considers demand, duration, spot features, and historical patterns.',
      price: '0.4 ADA',
      color: '#10b981'
    },
    {
      icon: '🗺️',
      title: 'Route Optimization',
      description: 'Navigate to your spot efficiently with AI-generated routes that avoid traffic and minimize walking distance.',
      price: '0.2 ADA',
      color: '#8b5cf6'
    },
    {
      icon: '🔐',
      title: 'Blockchain Security',
      description: 'Every transaction secured on Cardano blockchain with instant, transparent, and immutable payment records.',
      price: 'Included',
      color: '#f59e0b'
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Connect Wallet',
      description: 'Link your Cardano wallet (Nami, Eternl, or Flint) in seconds. Your balance is displayed instantly.',
      icon: '👛'
    },
    {
      step: '02',
      title: 'Explore 3D Map',
      description: 'View the parking lot in stunning 3D. Click on zones to see real-time availability and spot details.',
      icon: '🗺️'
    },
    {
      step: '03',
      title: 'Use AI Agents',
      description: 'Pay-per-use AI agents help you find spots, calculate pricing, and optimize your route. No subscriptions.',
      icon: '🤖'
    },
    {
      step: '04',
      title: 'Book & Park',
      description: 'Confirm booking, get your QR code, and park. Pay only for what you use with blockchain transparency.',
      icon: '✅'
    }
  ];

  const stats = [
    { value: '7', label: 'AI Agents', sublabel: 'Working 24/7' },
    { value: '99.9%', label: 'Uptime', sublabel: 'Blockchain Secured' },
    { value: '<1s', label: 'Response Time', sublabel: 'Real-time Updates' },
    { value: '₳0.3', label: 'Starting Price', sublabel: 'Per AI Agent' }
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    // Navigation
    nav: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '1rem 2rem',
      zIndex: 1000,
    },
    navContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
    logoIcon: {
      fontSize: '2rem',
    },
    navLinks: {
      display: 'flex',
      gap: '2rem',
      alignItems: 'center',
    },
    navLink: {
      color: '#94a3b8',
      textDecoration: 'none',
      fontSize: '0.95rem',
      fontWeight: '500',
      transition: 'color 0.2s',
      cursor: 'pointer',
    },
    ctaButton: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '0.95rem',
      transition: 'transform 0.2s',
    },
    // Hero Section
    hero: {
      paddingTop: '8rem',
      paddingBottom: '6rem',
      textAlign: 'center',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      position: 'relative',
      overflow: 'hidden',
    },
    heroContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem',
      position: 'relative',
      zIndex: 10,
    },
    heroTitle: {
      fontSize: '4rem',
      fontWeight: '800',
      lineHeight: '1.1',
      marginBottom: '1.5rem',
      background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    heroSubtitle: {
      fontSize: '1.5rem',
      color: '#94a3b8',
      marginBottom: '1rem',
      lineHeight: '1.6',
    },
    heroTagline: {
      fontSize: '1.1rem',
      color: '#64748b',
      marginBottom: '3rem',
    },
    heroButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      marginBottom: '4rem',
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      color: 'white',
      padding: '1rem 2.5rem',
      borderRadius: '0.75rem',
      border: 'none',
      fontWeight: '600',
      fontSize: '1.1rem',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      color: 'white',
      padding: '1rem 2.5rem',
      borderRadius: '0.75rem',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      fontWeight: '600',
      fontSize: '1.1rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    statCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: '2rem',
      borderRadius: '1rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'center',
    },
    statValue: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0.5rem',
    },
    statLabel: {
      fontSize: '1rem',
      color: '#e2e8f0',
      fontWeight: '600',
      marginBottom: '0.25rem',
    },
    statSublabel: {
      fontSize: '0.85rem',
      color: '#64748b',
    },
    // Sections
    section: {
      padding: '6rem 2rem',
      maxWidth: '1400px',
      margin: '0 auto',
    },
    sectionHeader: {
      textAlign: 'center',
      marginBottom: '4rem',
    },
    sectionTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
    },
    sectionSubtitle: {
      fontSize: '1.2rem',
      color: '#94a3b8',
      maxWidth: '700px',
      margin: '0 auto',
    },
    // Features
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '2rem',
    },
    featureCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: '2.5rem',
      borderRadius: '1rem',
      border: '2px solid rgba(255, 255, 255, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.3s',
      position: 'relative',
      overflow: 'hidden',
    },
    featureCardActive: {
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      transform: 'translateY(-5px)',
    },
    featureIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
    },
    featureTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
    },
    featureDescription: {
      color: '#94a3b8',
      lineHeight: '1.6',
      marginBottom: '1.5rem',
    },
    featurePrice: {
      display: 'inline-block',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      color: '#3b82f6',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      fontSize: '0.9rem',
    },
    // How It Works
    stepsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem',
    },
    stepCard: {
      position: 'relative',
      textAlign: 'center',
    },
    stepNumber: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: 'rgba(59, 130, 246, 0.3)',
      marginBottom: '1rem',
    },
    stepIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
    },
    stepTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '0.75rem',
    },
    stepDescription: {
      color: '#94a3b8',
      lineHeight: '1.6',
      fontSize: '0.95rem',
    },
    // Technology Stack
    techGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
    },
    techCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: '2rem',
      borderRadius: '1rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'center',
    },
    techIcon: {
      fontSize: '2.5rem',
      marginBottom: '1rem',
    },
    techTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '0.75rem',
    },
    techDescription: {
      color: '#94a3b8',
      fontSize: '0.95rem',
      marginBottom: '1rem',
    },
    techTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      justifyContent: 'center',
    },
    techTag: {
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      color: '#60a5fa',
      padding: '0.25rem 0.75rem',
      borderRadius: '0.25rem',
      fontSize: '0.85rem',
    },
    // CTA Section
    ctaSection: {
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      padding: '6rem 2rem',
      textAlign: 'center',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    },
    ctaTitle: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
    },
    ctaSubtitle: {
      fontSize: '1.3rem',
      color: '#94a3b8',
      marginBottom: '3rem',
      maxWidth: '800px',
      margin: '0 auto 3rem',
    },
    // Footer
    footer: {
      backgroundColor: '#0f172a',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '3rem 2rem 1.5rem',
      textAlign: 'center',
    },
    footerContent: {
      maxWidth: '1400px',
      margin: '0 auto',
    },
    footerText: {
      color: '#64748b',
      fontSize: '0.9rem',
    },
    footerLink: {
      color: '#3b82f6',
      textDecoration: 'none',
    },
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🅿️</span>
            <span>ParknGo</span>
          </div>
          <div style={styles.navLinks}>
            <a style={styles.navLink} onClick={() => scrollToSection('features')}>Features</a>
            <a style={styles.navLink} onClick={() => scrollToSection('how-it-works')}>How It Works</a>
            <a style={styles.navLink} onClick={() => scrollToSection('technology')}>Technology</a>
            <button 
              style={styles.ctaButton}
              onClick={() => navigate('/app')}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Launch App →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            AI-Powered Parking.<br />Pay Per Feature.
          </h1>
          <p style={styles.heroSubtitle}>
            The world's first blockchain-secured parking system with intelligent AI agents
          </p>
          <p style={styles.heroTagline}>
            No subscriptions. No free tier. Pay only for the AI features you use.
          </p>
          <div style={styles.heroButtons}>
            <button 
              style={styles.primaryButton}
              onClick={() => navigate('/app')}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Try Live Demo →
            </button>
            <button 
              style={styles.secondaryButton}
              onClick={() => scrollToSection('how-it-works')}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              Learn How It Works
            </button>
          </div>

          <div style={styles.statsGrid}>
            {stats.map((stat, idx) => (
              <div key={idx} style={styles.statCard}>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
                <div style={styles.statSublabel}>{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Intelligent Features, Fair Pricing</h2>
          <p style={styles.sectionSubtitle}>
            Each AI agent is a specialized service. Use only what you need, when you need it.
          </p>
        </div>
        <div style={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <div
              key={idx}
              style={{
                ...styles.featureCard,
                ...(activeFeature === idx ? styles.featureCardActive : {}),
                borderColor: activeFeature === idx ? feature.color : 'rgba(255, 255, 255, 0.1)',
              }}
              onMouseEnter={() => setActiveFeature(idx)}
            >
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDescription}>{feature.description}</p>
              <span style={{ ...styles.featurePrice, backgroundColor: `${feature.color}33`, color: feature.color }}>
                {feature.price}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ ...styles.section, backgroundColor: '#1e293b' }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>How ParknGo Works</h2>
          <p style={styles.sectionSubtitle}>
            Four simple steps to smarter parking with blockchain security
          </p>
        </div>
        <div style={styles.stepsContainer}>
          {howItWorks.map((step, idx) => (
            <div key={idx} style={styles.stepCard}>
              <div style={styles.stepNumber}>{step.step}</div>
              <div style={styles.stepIcon}>{step.icon}</div>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Stack */}
      <section id="technology" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Built on Cutting-Edge Technology</h2>
          <p style={styles.sectionSubtitle}>
            Enterprise-grade infrastructure powering the future of parking
          </p>
        </div>
        <div style={styles.techGrid}>
          <div style={styles.techCard}>
            <div style={styles.techIcon}>⛓️</div>
            <h3 style={styles.techTitle}>Cardano Blockchain</h3>
            <p style={styles.techDescription}>
              Peer-reviewed blockchain with proof-of-stake consensus for secure, energy-efficient transactions
            </p>
            <div style={styles.techTags}>
              <span style={styles.techTag}>Mesh SDK</span>
              <span style={styles.techTag}>Plutus</span>
              <span style={styles.techTag}>ADA</span>
            </div>
          </div>
          <div style={styles.techCard}>
            <div style={styles.techIcon}>🤖</div>
            <h3 style={styles.techTitle}>AI Agent Architecture</h3>
            <p style={styles.techDescription}>
              7 specialized AI agents using Google Gemini for intelligent decision-making and optimization
            </p>
            <div style={styles.techTags}>
              <span style={styles.techTag}>Gemini Pro</span>
              <span style={styles.techTag}>Python</span>
              <span style={styles.techTag}>Flask</span>
            </div>
          </div>
          <div style={styles.techCard}>
            <div style={styles.techIcon}>🔥</div>
            <h3 style={styles.techTitle}>Real-Time Database</h3>
            <p style={styles.techDescription}>
              Firebase for instant synchronization of parking availability and user sessions
            </p>
            <div style={styles.techTags}>
              <span style={styles.techTag}>Firebase</span>
              <span style={styles.techTag}>WebSockets</span>
              <span style={styles.techTag}>React</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Experience Smarter Parking?</h2>
        <p style={styles.ctaSubtitle}>
          Connect your Cardano wallet and try ParknGo with our interactive 3D demo. No sign-up required.
        </p>
        <button 
          style={{ ...styles.primaryButton, fontSize: '1.2rem', padding: '1.25rem 3rem' }}
          onClick={() => navigate('/app')}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          Launch Live Demo →
        </button>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p style={styles.footerText}>
            © 2025 ParknGo. Built with AI agents, secured by blockchain. |{' '}
            <a href="https://actualte.tech" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
              ActuAlte Robotics
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
