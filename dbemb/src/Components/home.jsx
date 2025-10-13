import React, { useState, useEffect } from "react";
import { FaFacebookF, FaInstagram, FaYoutube, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaClock, FaUser, FaMusic } from 'react-icons/fa';
import bg2 from "./Assets/bg2.jpg";
import bandGigs from "./Assets/bandGigs.jpg";
import musicArrangement from "./Assets/music-arrangement.jpg";
import paradeEvents from "./Assets/paradeEvents.jpg";
import musicWorkshop from "./Assets/musicWorkshop.jpg";
import instrumentRentals from "./Assets/instrumentRentals.jpg";
import Login from './login'
import Signup from './signup'
import UserSignup from './UserSignup'
import Dashboard from './dashboard'


const Home = () => {
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    position: 'relative'
  };

  const navStyle = {
    // Solid non-transparent navbar for clearer separation from page content
    background: 'linear-gradient(180deg, #0b3b78 0%, #0b4f8a 100%)',
    color: '#fff',
    padding: '14px 30px',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Subtle shadow to lift the nav from the page
    boxShadow: '0 6px 18px rgba(7, 24, 48, 0.14)',
    transition: 'background 220ms ease, box-shadow 220ms ease'
  };

  const logoStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  };

  const logoMainStyle = {
    fontFamily: 'Georgia, Times, "Times New Roman", serif',
    fontSize: '28px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
    letterSpacing: '0.02em'
  };

  const logoSubStyle = {
    fontSize: '12px',
    color: '#ffffff',
    margin: 0,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase'
  };

  const ulStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    margin: 0,
    padding: 0,
    listStyle: 'none'
  };

  const linkStyle = {
    color: 'rgba(240, 248, 255, 0.95)',
    fontWeight: '600',
    fontSize: '15px',
    textDecoration: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    position: 'relative',
    fontFamily: 'Georgia, Times, "Times New Roman", serif'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '12px'
  };

  const loginButtonStyle = {
    background: 'transparent',
    border: '2px solid rgba(255,255,255,0.14)',
    color: 'rgba(240,248,255,0.95)',
    padding: '10px 24px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textDecoration: 'none',
    fontFamily: 'Georgia, Times, "Times New Roman", serif',
    letterSpacing: '0.01em'
  };

  const signUpButtonStyle = {
    background: 'linear-gradient(135deg, rgba(59,130,246,0.95) 0%, rgba(29,78,216,0.95) 100%)',
    border: 'none',
    color: 'white',
    padding: '12px 28px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '14px',
    letterSpacing: '0.01em',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textDecoration: 'none',
    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.2)',
    fontFamily: 'Georgia, Times, "Times New Roman", serif',
    position: 'relative',
    overflow: 'hidden'
  };

  const handleMouseEnter = (e) => {
    const t = e.currentTarget || e.target;
    t.style.color = '#60a5fa'; // Blue text on hover
  };

  const handleMouseLeave = (e) => {
    const t = e.currentTarget || e.target;
    // Check if this is the active hash - if so, keep blue color
    const hash = t.getAttribute('href');
    if (hash === activeHash) {
      t.style.color = '#60a5fa';
    } else {
      t.style.color = 'rgba(240, 248, 255, 0.95)';
    }
  };

  const handleLoginHover = (e) => {
    e.target.style.background = '#3b82f6';
    e.target.style.color = 'white';
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
  };

  const handleLoginLeave = (e) => {
    e.target.style.background = 'transparent';
    e.target.style.color = '#3b82f6';
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = 'none';
  };

  const handleSignupHover = (e) => {
    e.target.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)';
    e.target.style.transform = 'translateY(-2px) scale(1.02)';
    e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
  };

  const handleSignupLeave = (e) => {
    e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
    e.target.style.transform = 'translateY(0) scale(1)';
    e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.2)';
  };

  // Hero styles
  const heroSectionStyle = {
    flex: '1 0 auto',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    background: `
      linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(15, 23, 42, 0.6) 50%, rgba(30, 41, 59, 0.4) 100%),
      url(${bg2})
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    scrollMarginTop: '80px',
    position: 'relative',
    overflow: 'hidden'
  };

  const heroContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    maxWidth: '1000px',
    width: '100%',
    padding: '60px 40px',
    position: 'relative',
    zIndex: 10,
    minHeight: '80vh'
  };

  const taglineStyle = {
    fontFamily: 'Georgia, Times, "Times New Roman", serif',
    fontWeight: 700,
    letterSpacing: '-0.01em',
    fontSize: 'clamp(28px, 5vw, 56px)',
    lineHeight: 1.1,
    margin: '0 0 24px 0',
    textTransform: 'none',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 20%, #e2e8f0 40%, #cbd5e1 60%, #94a3b8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '0 0 40px rgba(255, 255, 255, 0.1)',
    animation: 'heroTextReveal 2s ease-out forwards',
    position: 'relative',
    whiteSpace: 'nowrap'
  };

  const translationStyle = {
    fontFamily: 'Georgia, Times, "Times New Roman", serif',
    color: '#fbbf24',
    fontSize: 'clamp(20px, 3vw, 32px)',
    fontWeight: 400,
    marginBottom: '48px',
    lineHeight: '1.3',
    letterSpacing: '0.01em',
    opacity: 0,
    animation: 'fadeInUp 1.4s ease-out 0.8s forwards',
    fontStyle: 'italic'
  };



  const heroButtonContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '30px',
    opacity: 0,
    animation: 'fadeInScale 1.5s ease-out 1.2s forwards'
  };

  const heroFeatureGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '40px',
    marginTop: '60px',
    maxWidth: '600px',
    width: '100%',
    opacity: 0,
    animation: 'slideInFromBottom 1.5s ease-out 1.5s forwards'
  };

  // Services styles
  const servicesSectionStyle = {
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    padding: '80px 24px 88px',
    minHeight: 'calc(100vh - 64px)',
    scrollMarginTop: '80px',
    position: 'relative'
  };

  // About/Contact styles
  const aboutSectionStyle = {
    background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
    padding: '80px 24px',
    scrollMarginTop: '80px',
    position: 'relative'
  };

const aboutHeaderStyle = {
  background: 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontFamily: 'Marcellus, serif',
  fontWeight: 700,
  fontSize: '64px',
  lineHeight: 1.0,
  margin: '0 0 16px 0',
  letterSpacing: '-0.02em',
  textAlign: 'left'
};

  const aboutSubtextStyle = {
    color: '#6b7280',
    fontSize: '16px',
    fontWeight: '500',
    maxWidth: '780px',
    textAlign: 'center',
    margin: '0 auto',
    lineHeight: '1.6'
  };

  // About side-by-side layout
const aboutWrapStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
  gap: '24px',
  alignItems: 'stretch',
  marginBottom: '28px'
};

  const aboutTextCardStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2) inset'
  };

  const aboutStoryParagraphStyle = {
    color: '#374151',
    textAlign: 'justify',
    lineHeight: 1.8,
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '400'
  };

  // Carousel styles
const carouselWrapperStyle = {
  position: 'relative',
  width: '100%',
  maxWidth: '980px',
  margin: '0 auto 32px',
  borderRadius: '24px',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
  height: '100%'
};

const carouselImageStyle = {
  height: '100%',
  minHeight: '400px',
  backgroundSize: 'cover',
  backgroundPosition: 'center'
};

  const carouselControlsStyle = {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 8px',
    transform: 'translateY(-50%)'
  };

  const navButtonStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    color: '#1e40af',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
  };

  const dotsStyle = {
    position: 'absolute',
    bottom: '10px',
    left: 0,
    right: 0,
    display: 'flex',
    gap: '8px',
    justifyContent: 'center'
  };

  const dotStyle = (active) => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: active ? '#1e40af' : 'rgba(255, 255, 255, 0.6)',
    border: active ? '2px solid #06b6d4' : '2px solid rgba(255, 255, 255, 0.8)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer'
  });

  // Story styles
  const storyCardStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '24px',
    padding: '32px',
    color: '#374151',
    margin: '0 auto 32px',
    maxWidth: '980px',
    lineHeight: 1.8,
    fontSize: '18px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2) inset'
  };

  const contactSectionStyle = {
    background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
    padding: '80px 24px',
    scrollMarginTop: '80px',
    position: 'relative'
  };

  // Contact section styles

  const contactHeaderStyle = {
  background: 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontFamily: 'Marcellus, serif',
  fontWeight: 700,
  fontSize: '64px',
  lineHeight: 1.0,
  margin: '0 0 16px 0',
  letterSpacing: '-0.02em',
  textAlign: 'left'
};

const contactSubTextStyle = {
  color: '#6b7280',
  fontSize: '16px',
  fontWeight: '500',
  maxWidth: '540px',
  textAlign: 'center',
  margin: '0 auto',
  lineHeight: '1.6'
};

  const contactGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
    gap: '32px',
    marginBottom: '48px'
  };

  const contactInfoCardStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2) inset'
  };

  const contactFormCardStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2) inset'
  };

  const contactCardTitleStyle = {
    background: 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontFamily: 'Marcellus, serif',
    fontSize: '24px',
    fontWeight: 600,
    margin: '0 0 32px 0',
    letterSpacing: '0.04em'
  };

  const contactInfoListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  };

  const contactInfoItemStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px'
  };

  const contactIconStyle = {
    fontSize: '24px',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
    borderRadius: '12px',
    flexShrink: 0,
    color: 'white',
    boxShadow: '0 4px 16px rgba(30, 64, 175, 0.3)'
  };

  const contactLabelStyle = {
    background: 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: '14px',
    fontWeight: 600,
    margin: '0 0 4px 0',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    textAlign: 'left'
  };

  const contactValueStyle = {
    color: '#374151',
    fontSize: '16px',
    fontWeight: '500',
    margin: 0,
    lineHeight: 1.5
  };

  const contactFormStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  };

  const formRowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  };

  const formFieldStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const formLabelStyle = {
    background: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '0.04em'
  };

  const formInputStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    padding: '14px 18px',
    color: '#374151',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
    ':focus': {
      borderColor: '#1e40af',
      boxShadow: '0 0 0 4px rgba(30, 64, 175, 0.1)'
    },
    ':hover': {
      borderColor: 'rgba(30, 64, 175, 0.5)'
    }
  };

  const formTextareaStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    padding: '14px 18px',
    color: '#374151',
    fontSize: '16px',
    fontWeight: '500',
    resize: 'vertical',
    minHeight: '140px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    fontFamily: 'inherit',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
    ':focus': {
      borderColor: '#1e40af',
      boxShadow: '0 0 0 4px rgba(30, 64, 175, 0.1)'
    },
    ':hover': {
      borderColor: 'rgba(30, 64, 175, 0.5)'
    }
  };

  const submitButtonStyle = {
    background: 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
    border: 'none',
    color: 'white',
    padding: '16px 32px',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginTop: '12px',
    boxShadow: '0 4px 16px rgba(30, 64, 175, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(30, 64, 175, 0.4)'
    }
  };

  const additionalInfoStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '24px'
  };

  const infoCardStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '20px',
    padding: '32px',
    textAlign: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    ':hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.3) inset'
    }
  };

  const infoCardTitleStyle = {
    background: 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: '18px',
    fontWeight: 600,
    margin: '0 0 16px 0',
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  };

  const infoCardTextStyle = {
    color: '#6b7280',
    fontSize: '15px',
    fontWeight: '500',
    lineHeight: 1.6,
    margin: 0
  };

  // Footer styles
  const footerStyle = {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '0'
  };

  const footerContainerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px'
  };

  const footerMainStyle = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '48px',
    padding: '64px 0 48px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.3)'
  };

  const footerBrandStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  };

  const footerLogoStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  };

  const footerLogoTitleStyle = {
    fontFamily: 'Marcellus, serif',
    fontSize: '28px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0
  };

  const footerLogoSubtitleStyle = {
    fontSize: '16px',
    background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
    letterSpacing: '0.1em'
  };

  const footerDescriptionStyle = {
    color: '#6b7280',
    fontSize: '16px',
    fontWeight: '500',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '300px',
    textAlign: 'left',
    textAlignLast: 'left'
  };

  const footerSocialStyle = {
    display: 'flex',
    gap: '16px'
  };

  const socialLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    border: '1px solid rgba(100, 255, 218, 0.2)',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'rgba(100, 255, 218, 0.2)',
      borderColor: 'rgba(100, 255, 218, 0.4)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(100, 255, 218, 0.2)'
    }
  };

  const socialIconStyle = {
    fontSize: '20px',
    color: '#60a5fa'
  };

  const footerSectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  };

  const footerSectionTitleStyle = {
    background: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontFamily: 'Marcellus, serif',
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
    letterSpacing: '0.04em'
  };

  const footerLinkListStyle = {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const footerLinkStyle = {
    color: '#6b7280',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    ':hover': {
      color: '#1e40af',
      transform: 'translateX(4px)'
    }
  };

  const footerContactListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  };

  const footerContactItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const footerContactIconStyle = {
    fontSize: '18px',
    width: '20px',
    flexShrink: 0,
    background: 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };

  const footerContactTextStyle = {
    color: '#6b7280',
    fontSize: '15px',
    fontWeight: '500',
    lineHeight: 1.4
  };

  const footerBottomStyle = {
    padding: '24px 0'
  };

  const footerBottomContentStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  };

  const footerCopyrightStyle = {
    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '14px',
    fontWeight: 500,
    margin: 0,
    letterSpacing: '0.025em'
  };

  const footerBottomLinksStyle = {
    display: 'flex',
    gap: '24px'
  };

  const footerBottomLinkStyle = {
    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    letterSpacing: '0.025em',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    position: 'relative',
    ':hover': {
      transform: 'translateY(-1px)'
    }
  };

  const servicesContainerStyle = {
    maxWidth: '1200px',
    margin: '0 auto'
  };

const sectionEyebrowStyle = {
  background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textTransform: 'uppercase',
  letterSpacing: '0.25em',
  fontSize: '15px',
  marginBottom: '16px',
  textAlign: 'left',
  fontWeight: 700,
};

  const servicesHeaderWrapStyle = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)',
    gap: '24px',
    alignItems: 'end',
    marginBottom: '28px'
  };

  const servicesSubTextStyle = {
    color: '#6b7280',
    fontSize: '16px',
    lineHeight: 1.6,
    textAlign: 'left',
    maxWidth: '540px',
    fontWeight: 400,
    letterSpacing: '0.025em'
  };


  const servicesHeaderStyle = {
    background: 'linear-gradient(135deg, #1e40af 0%, #06b6d4 50%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: 800,
    fontSize: '64px',
    lineHeight: 1.1,
    margin: '0 0 8px 0',
    letterSpacing: '-0.025em',
    textAlign: 'left'
  };

const servicesHeaderRightStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  justifySelf: 'end',
  alignItems: 'flex-end'
};

  const servicesHeaderActionsStyle = {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  };

  const linkButtonStyle = {
    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '14px',
    letterSpacing: '0.02em',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const servicesGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '20px',
    alignItems: 'stretch'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    overflow: 'hidden',
    color: '#1f2937',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '340px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    }
  };

  const cardImageStyle = {
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'grayscale(0.3) contrast(1.05)'
  };

  const cardBodyStyle = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '12px'
  };

  const cardTitleStyle = {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '0.025em',
    textTransform: 'uppercase',
    background: 'linear-gradient(135deg, #1e40af, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0
  };

  const cardBottomPillStyle = {
    alignSelf: 'flex-start',
    marginTop: '12px',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: '#1f2937',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.025em'
  };

  const cardArrowButtonStyle = {
    position: 'absolute',
    right: '12px',
    bottom: '12px',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    color: 'white',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)',
    ':hover': {
      transform: 'scale(1.1)',
      boxShadow: '0 8px 20px rgba(107, 114, 128, 0.4)'
    }
  };

  const readMoreStyle = {
    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    marginTop: 'auto',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    letterSpacing: '0.025em'
  };

  const readMoreTextStyle = {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: 500,
    letterSpacing: '0.025em'
  };

  const responsiveGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '20px'
  };

  // Modal styles
  const modalOverlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  };

  const modalContentStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '20px',
    width: 'min(720px, 92vw)',
    maxHeight: '80vh',
    overflowY: 'auto',
    color: '#1f2937',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
  };

  const modalHeaderStyle = {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(100,255,218,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const modalTitleStyle = {
    margin: 0,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: '24px',
    fontWeight: 700,
    letterSpacing: '-0.025em',
    background: 'linear-gradient(135deg, #1e40af, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const modalBodyStyle = {
    padding: '20px'
  };

  const modalActionsStyle = {
    display: 'flex',
    gap: '12px',
    padding: '0 20px 20px 20px'
  };

  const closeButtonStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#6b7280',
    padding: '10px 18px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ':hover': {
      background: 'rgba(255, 255, 255, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    }
  };

  const bookButtonStyle = {
    background: 'linear-gradient(135deg, #1e40af, #06b6d4)',
    border: 'none',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    letterSpacing: '0.025em',
    textDecoration: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(30, 64, 175, 0.4)'
    }
  };

  // Booking UI helpers
  const sectionTitleStyle = {
    background: 'linear-gradient(135deg, #1e40af, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: '18px',
    fontWeight: 700,
    margin: '8px 0 6px 0',
    letterSpacing: '-0.025em'
  };

  const helperTextStyle = {
    color: '#6b7280',
    fontSize: '14px',
    margin: '2px 0 8px 0',
    lineHeight: 1.5
  };

  const labelSmallStyle = {
    color: '#374151',
    fontSize: '14px',
    fontWeight: 600,
    display: 'block',
    marginBottom: '6px',
    letterSpacing: '0.025em'
  };

  const statusBadgeStyle = (status) => {
    const palette = {
      pending: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)', color: '#f59e0b' },
      confirmed: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.35)', color: '#22c55e' },
      cancelled: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.35)', color: '#ef4444' }
    };
    const p = palette[status] || palette.pending;
    return {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '999px',
      backgroundColor: p.bg,
      border: `1px solid ${p.border}`,
      color: p.color,
      fontSize: '12px',
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    };
  };

  const timeChipStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: '#374151',
    fontSize: '13px',
    fontWeight: 500
  };

  // Dark theme booking modal (matching site theme)
  const darkLabelStyle = {
    color: '#374151',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '8px',
    display: 'block',
    letterSpacing: '0.025em'
  };

  const darkInputStyle = {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#1f2937',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ':focus': {
      border: '1px solid rgba(6, 182, 212, 0.5)',
      background: 'rgba(255, 255, 255, 0.15)'
    }
  };

  const darkTextareaStyle = {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#1f2937',
    fontSize: '15px',
    outline: 'none',
    minHeight: '120px',
    resize: 'vertical',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ':focus': {
      border: '1px solid rgba(6, 182, 212, 0.5)',
      background: 'rgba(255, 255, 255, 0.15)'
    }
  };

  const bookingModalContentStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '24px',
    width: 'min(1100px, 94vw)',
    maxHeight: '92vh',
    overflowY: 'auto',
    color: '#1f2937',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
  };

  const bookingHeaderStyle = {
    padding: '18px 22px',
    borderBottom: '1px solid rgba(100,255,218,0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 1
  };

  const bookingTitleStyle = {
    margin: 0,
    fontSize: '24px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    letterSpacing: '-0.025em',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #1e40af, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const bookingBodyStyle = {
    padding: '22px',
    display: 'grid',
    gap: '18px'
  };

  const bookingSectionStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    padding: '20px'
  };

  const bookingSectionTitleStyle = {
    margin: 0,
    fontSize: '16px',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #374151, #1f2937)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '12px',
    letterSpacing: '0.025em'
  };

  const gridTwoStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px'
  };

  const gridThreeStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '14px'
  };

  const primaryButtonDarkStyle = {
    background: 'linear-gradient(135deg, #1e40af, #06b6d4)',
    border: 'none',
    color: 'white',
    padding: '14px 24px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '15px',
    letterSpacing: '0.025em',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(30, 64, 175, 0.4)'
    }
  };

  // Services data
  const [modalService, setModalService] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeHash, setActiveHash] = useState('#home');
  const [currentView, setCurrentView] = useState(() => {
    // Check if user was previously on dashboard
    const savedView = localStorage.getItem('davaoBlueEaglesCurrentView');
    const savedUser = localStorage.getItem('davaoBlueEaglesUser');
    
    // Only restore dashboard view if user is logged in and is admin
    if (savedView === 'dashboard' && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user && user.role === 'admin') {
          return 'dashboard';
        }
      } catch (error) {
        // If there's an error parsing, fallback to home
      }
    }
    
    return 'home';
  });
  const [loginError, setLoginError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingService, setBookingService] = useState(null);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    service: '',
    name: '',
    email: '',
    phone: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: ''
  });
  const [toast, setToast] = useState(null);
  const [profileFirstName, setProfileFirstName] = useState('');
  const [profileLastName, setProfileLastName] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const today = new Date();
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth()); // 0-11
  const [serviceCols, setServiceCols] = useState(5);
  const [serviceCardH, setServiceCardH] = useState(240);
  const aboutImages = [bandGigs, paradeEvents, musicWorkshop, musicArrangement, instrumentRentals];
  
  // Instrument Request States
  const [showInstrumentRequest, setShowInstrumentRequest] = useState(false);
  const [availableInstruments, setAvailableInstruments] = useState([]);
  const [instrumentRequestForm, setInstrumentRequestForm] = useState({
    instrumentType: '',
    instrumentName: '',
    quantity: 1,
    startDate: '',
    endDate: '',
    purpose: '',
    notes: ''
  });

  const goPrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? aboutImages.length - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrentSlide((prev) => (prev === aboutImages.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev === aboutImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Load available instruments
  useEffect(() => {
    // Default inventory - same as in inventory.jsx
    const defaultInventory = [
      { id: 1, name: 'Yamaha Black Snare Drum #01', category: 'percussion', subcategory: 'Snare Drums', status: 'Available', archived: false },
      { id: 2, name: 'Yamaha Black Snare Drum #02', category: 'percussion', subcategory: 'Snare Drums', status: 'Available', archived: false },
      { id: 3, name: 'Yamaha Black Snare Drum (Evans Drum Head) #03', category: 'percussion', subcategory: 'Snare Drums', status: 'Available', archived: false },
      { id: 4, name: 'Pearl Snare Drum Color White #01', category: 'percussion', subcategory: 'Snare Drums', status: 'Available', archived: false },
      { id: 5, name: 'Pearl Snare Drum Color Dirt White #02', category: 'percussion', subcategory: 'Snare Drums', status: 'Available', archived: false },
      { id: 6, name: 'Lazer Bass Drum #01', category: 'percussion', subcategory: 'Bass Drums', status: 'Available', archived: false },
      { id: 7, name: 'E-lance Bass Drum #02', category: 'percussion', subcategory: 'Bass Drums', status: 'Available', archived: false },
      { id: 8, name: 'E-lance Bass Drum #03', category: 'percussion', subcategory: 'Bass Drums', status: 'Available', archived: false },
      { id: 9, name: 'E-lance Bass Drum #04', category: 'percussion', subcategory: 'Bass Drums', status: 'Available', archived: false },
      { id: 10, name: 'Fernando Bass Drum #002', category: 'percussion', subcategory: 'Bass Drums', status: 'Available', archived: false },
      { id: 11, name: 'E-lance Percussion Black Tenor Drums', category: 'percussion', subcategory: 'Tenor Drums', status: 'Available', archived: false },
      { id: 12, name: 'Century Percussion White Tenor Drums', category: 'percussion', subcategory: 'Tenor Drums', status: 'Available', archived: false },
      { id: 13, name: 'Zildjian Marching Cymbals', category: 'percussion', subcategory: 'Cymbals', status: 'Available', archived: false },
      { id: 14, name: 'E-lance Percussion Marching Glockenspiel #01', category: 'percussion', subcategory: 'Other Percussion', status: 'Available', archived: false },
      { id: 15, name: 'E-lance Percussion Marching Glockenspiel #02', category: 'percussion', subcategory: 'Other Percussion', status: 'Available', archived: false },
      { id: 16, name: 'Yamaha Clarinet', category: 'wind', subcategory: 'Woodwinds', status: 'Available', archived: false },
      { id: 17, name: 'Fernando Tuba', category: 'wind', subcategory: 'Brass', status: 'Available', archived: false }
    ];

    // Try to get from localStorage, otherwise use default
    try {
      const saved = localStorage.getItem('dbeInventory');
      if (saved) {
        const inventory = JSON.parse(saved);
        // Filter for available, non-archived instruments only
        const available = inventory.filter(item => item.status === 'Available' && !item.archived);
        setAvailableInstruments(available);
      } else {
        setAvailableInstruments(defaultInventory);
      }
    } catch (e) {
      setAvailableInstruments(defaultInventory);
    }
  }, []);

  // Load bookings from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('dbeBookings') || '[]');
      setBookings(Array.isArray(saved) ? saved : []);
    } catch (e) {
      setBookings([]);
    }
    // If opened in a new tab with a requested service, auto-open booking
    const svc = localStorage.getItem('dbeOpenBookingForService');
    if (svc) {
      setTimeout(() => {
        openBooking(svc);
        localStorage.removeItem('dbeOpenBookingForService');
      }, 200);
    }
    // Responsive services grid
    const setResponsive = () => {
      const w = window.innerWidth;
      if (w >= 1280) { setServiceCols(5); setServiceCardH(240); }
      else if (w >= 1100) { setServiceCols(4); setServiceCardH(220); }
      else if (w >= 860) { setServiceCols(3); setServiceCardH(210); }
      else if (w >= 560) { setServiceCols(2); setServiceCardH(200); }
      else { setServiceCols(1); setServiceCardH(200); }
    };
    setResponsive();
    window.addEventListener('resize', setResponsive);
    return () => window.removeEventListener('resize', setResponsive);
  }, []);

  // Navbar scroll effect: change translucency and shadow on scroll
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setScrolled(y > 8);
      const root = document.documentElement;
      if (y > 8) {
        root.style.setProperty('--nav-bg', 'linear-gradient(180deg, rgba(6,38,83,0.36), rgba(3,105,161,0.18))');
        root.style.setProperty('--nav-shadow', '0 12px 40px rgba(2,6,23,0.45)');
      } else {
        root.style.setProperty('--nav-bg', 'linear-gradient(180deg, rgba(6,38,83,0.24), rgba(3,105,161,0.12))');
        root.style.setProperty('--nav-shadow', '0 4px 20px rgba(0, 0, 0, 0.08)');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close menus on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setShowUserMenu(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // detect mobile width for hamburger
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 860);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // active link based on hash
  useEffect(() => {
    const setFromHash = () => setActiveHash(window.location.hash || '#home');
    setFromHash();
    window.addEventListener('hashchange', setFromHash);
    return () => window.removeEventListener('hashchange', setFromHash);
  }, []);

  const handleNavClick = (e, hash) => {
    e.preventDefault();
    if (hash) {
      setActiveHash(hash);
      // navigate
      try { window.location.hash = hash; } catch (err) {}
    }
    if (isMobile) setMobileOpen(false);
  };

  const saveBookings = (next) => {
    setBookings(next);
    localStorage.setItem('dbeBookings', JSON.stringify(next));
  };

  const openBooking = (serviceTitle) => {
    const svc = serviceTitle || (modalService?.title || '');
    setBookingService(svc);
    setBookingForm((f) => ({
      ...f,
      service: svc,
      name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      email: user?.email || '',
      phone: user?.phone || ''
    }));
    setShowBookingModal(true);
  };

  const closeBooking = () => {
    setShowBookingModal(false);
    setBookingService(null);
  };

  const overlap = (aStart, aEnd, bStart, bEnd) => {
    return aStart < bEnd && bStart < aEnd; // strict overlap
  };

  const hasConflict = (service, date, startTime, endTime) => {
    if (!service || !date || !startTime || !endTime) return false;
    const start = `${date}T${startTime}`;
    const end = `${date}T${endTime}`;
    return bookings.some(b => b.service === service && b.date === date && b.status !== 'cancelled' && overlap(start, end, `${b.date}T${b.startTime}`, `${b.date}T${b.endTime}`));
  };

  const confirmBooking = (e) => {
    e.preventDefault();
    const { service, name, email, phone, date, startTime, endTime, notes } = bookingForm;
    if (!service || !name || !email || !date || !startTime || !endTime) {
      alert('Please fill in all required fields.');
      return;
    }
    if (endTime <= startTime) {
      alert('End time must be after start time.');
      return;
    }
    if (hasConflict(service, date, startTime, endTime)) {
      alert('Selected time conflicts with an existing booking. Please choose a different time.');
      return;
    }
    const newBooking = {
      id: Date.now(),
      service,
      name,
      email,
      phone,
      date,
      startTime,
      endTime,
      notes,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    const next = [...bookings, newBooking];
    saveBookings(next);
    setToast({ type: 'success', message: 'Booking submitted! We will confirm via email.' });
    setShowBookingModal(false);
  };

  const cancelBooking = (id) => {
    const next = bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b);
    saveBookings(next);
    setToast({ type: 'info', message: 'Booking cancelled.' });
  };

  // Auto-hide toasts
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Calendar helpers
  const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
  const ymd = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstWeekday = (y, m) => new Date(y, m, 1).getDay(); // 0 Sun - 6 Sat
  const isDayTaken = (service, y, m, d) => {
    if (!service) return false;
    const dateStr = ymd(y, m, d);
    return bookings.some(b => b.service === service && b.date === dateStr && b.status !== 'cancelled');
  };
  const handlePrevMonth = () => {
    setCalendarMonth((prev) => {
      if (prev === 0) { setCalendarYear((y) => y - 1); return 11; }
      return prev - 1;
    });
  };
  const handleNextMonth = () => {
    setCalendarMonth((prev) => {
      if (prev === 11) { setCalendarYear((y) => y + 1); return 0; }
      return prev + 1;
    });
  };
  const services = [
    {
      title: 'Band Gigs',
      img: bandGigs,
      description:
        'High-energy band performances tailored for corporate events, festivals, inaugurations, and community gatherings. Includes full marching setup, choreography, and segment programming.'
    },
    {
      title: 'Music Arrangement',
      img: musicArrangement,
      description:
        'Custom musical arrangements for parades, field shows, and ceremonial pieces. We adapt to your theme and instrumentation to deliver a polished performance.'
    },
    {
      title: 'Parade Events',
      img: paradeEvents,
      description:
        'Signature marching band sets with precision marching, drumline features, and dynamic brass/woodwind sections designed to elevate any occasion.'
    },
    {
      title: 'Music Workshops',
      img: musicWorkshop,
      description:
        'Formal musical accompaniment for openings, dignitary arrivals, awardings, and commemorations with tasteful repertoire and disciplined presentation.'
    },
    {
      title: 'Instrument Rentals',
      img: instrumentRentals,
      description:
        'Rent high-quality instruments for your performances, practice sessions, or events. Members can borrow instruments for free, while customers can rent at affordable rates. Browse our collection of percussion, brass, and woodwind instruments.'
    }
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem('davaoBlueEaglesUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('davaoBlueEaglesUser');
      }
    }
    // Listen for external updates to the user (e.g., avatar changes in dashboard)
    const onUserUpdated = (e) => {
      try {
        const updated = e?.detail || JSON.parse(localStorage.getItem('davaoBlueEaglesUser') || 'null');
        if (updated) setUser(updated);
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('davaoUserUpdated', onUserUpdated);

    return () => {
      window.removeEventListener('davaoUserUpdated', onUserUpdated);
    };
  }, []);

  // Save current view to localStorage to persist dashboard state on refresh
  useEffect(() => {
    localStorage.setItem('davaoBlueEaglesCurrentView', currentView);
    
    // Update URL hash when view changes to maintain consistency
    if (currentView === 'dashboard') {
      window.history.replaceState(null, null, '#dashboard');
    } else if (currentView === 'home') {
      window.history.replaceState(null, null, '#home');
    }
  }, [currentView]);

  // Load notifications from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('dbeNotifications') || '[]');
      setNotifications(Array.isArray(stored) ? stored : []);
    } catch (err) {
      setNotifications([]);
    }
  }, []);

  const saveNotifications = (next) => {
    setNotifications(next);
    localStorage.setItem('dbeNotifications', JSON.stringify(next));
  };

  const unreadCount = () => notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    const next = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(next);
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  const handleOpenNotification = (index) => {
    // mark as read and open notifications view focused on the clicked item
    const next = notifications.map((n, i) => i === index ? { ...n, read: true } : n);
    saveNotifications(next);
    setSelectedNotification(next[index]);
    setShowNotifications(false);
    setCurrentView('notifications');
  };

  const deleteNotification = (index) => {
    const next = notifications.filter((_, i) => i !== index);
    saveNotifications(next);
    // if the deleted was selected, clear selection
    if (selectedNotification && notifications[index] && selectedNotification.ts === notifications[index].ts) {
      setSelectedNotification(null);
    }
  };

  const toggleNotificationRead = (index) => {
    const next = notifications.map((n, i) => i === index ? { ...n, read: !n.read } : n);
    saveNotifications(next);
  };

  // Helper to add a test notification (useful while developing)
  const addTestNotification = (title = 'Test Notification', body = 'This is a test') => {
    const n = { title, body, ts: Date.now(), read: false };
    const next = [...notifications, n];
    saveNotifications(next);
  };

  // close dropdowns when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      // close notifications and user menu if click is outside their areas or toggle buttons
      const path = e.composedPath ? e.composedPath() : (e.path || []);
      const isNotif = path.some(p => p && (p.id === 'notification-menu' || (p.dataset && p.dataset.notifToggle)));
      const isUser = path.some(p => p && (p.id === 'user-menu' || (p.dataset && p.dataset.userToggle)));
      if (!isNotif) setShowNotifications(false);
      if (!isUser) setShowUserMenu(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [notifications]);

  const handleLogin = (userData) => {
    console.log('Home - handleLogin called with:', userData);
    
    // New authentication flow: userData is already an authenticated user object
    // (not raw email/password like the old flow)
    if (userData && userData.id) {
      const authenticatedUser = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isLoggedIn: true,
        isBlocked: false
      };
      
      console.log('Home - Setting authenticated user:', authenticatedUser);
      setUser(authenticatedUser);
      localStorage.setItem('davaoBlueEaglesUser', JSON.stringify(authenticatedUser));
      setLoginError(''); // Clear any previous errors

      // Only admins can access the dashboard
      if (authenticatedUser.role === 'admin') {
        setCurrentView('dashboard');
      } else {
        setCurrentView('home');
      }
      return;
    }
    
    // Fallback: if for some reason we get old-style credentials, handle them
    console.warn('Home - Received unexpected userData format:', userData);
    setLoginError('Authentication failed. Please try again.');
    setCurrentView('login');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('davaoBlueEaglesUser');
    localStorage.removeItem('davaoBlueEaglesCurrentView'); // Clear saved view on logout
    setCurrentView('home'); // Reset to home view
    setShowUserMenu(false);
  };

  const openProfile = () => {
    // Prefill form from current user
    setProfileFirstName(user?.firstName || '');
    setProfileLastName(user?.lastName || '');
    setShowUserMenu(false);
    setCurrentView('profile');
  };

  const handleSaveProfile = (e) => {
    e && e.preventDefault();
    try {
      const stored = JSON.parse(localStorage.getItem('davaoBlueEaglesUser') || 'null') || user || {};
      const updated = { ...stored, firstName: profileFirstName, lastName: profileLastName };
      // persist single user
      localStorage.setItem('davaoBlueEaglesUser', JSON.stringify(updated));

      // update users array if present
      const users = JSON.parse(localStorage.getItem('davaoBlueEaglesUsers') || '[]');
      if (users && users.length) {
        const updatedUsers = users.map(u => u.id === updated.id ? { ...u, firstName: profileFirstName, lastName: profileLastName } : u);
        localStorage.setItem('davaoBlueEaglesUsers', JSON.stringify(updatedUsers));
      }

      // update local state and notify
      setUser(updated);
      window.dispatchEvent(new CustomEvent('davaoUserUpdated', { detail: updated }));
      setToast({ type: 'success', message: 'Profile updated.' });
      // return to home after save
      setCurrentView('home');
    } catch (err) {
      console.error('Saving profile failed', err);
      setToast({ type: 'error', message: 'Failed to save profile.' });
    }
  };

  const handleShowLogin = () => {
    setCurrentView('login');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const handleShowSignup = () => {
    setCurrentView('signup'); // This is for membership applications
  };

  const handleShowUserSignup = () => {
    setCurrentView('userSignup'); // This is for regular user account creation
  };

  const handleSignup = (userData) => {
    // Add new user to users list
    const storedUsers = JSON.parse(localStorage.getItem('davaoBlueEaglesUsers') || '[]');
    const newUser = {
      ...userData,
      id: Date.now(),
      role: 'user', // Default role
      isBlocked: false, // Default not blocked
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedUsers = [...storedUsers, newUser];
    localStorage.setItem('davaoBlueEaglesUsers', JSON.stringify(updatedUsers));

    setUser(newUser);
    localStorage.setItem('davaoBlueEaglesUser', JSON.stringify(newUser));

    // Only admin users go to dashboard, regular users stay on home
    if (newUser.role === 'admin') {
      setCurrentView('dashboard');
    } else {
      setCurrentView('home');
    }
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleSwitchToSignup = () => {
    setCurrentView('userSignup'); // When switching from login, show user signup
  };

  const handleClearLoginError = () => {
    setLoginError('');
  };

  // Instrument Request Handlers
  const handleOpenInstrumentRequest = () => {
    if (!user) {
      setToast({ type: 'error', message: 'Please login to request instruments' });
      return;
    }
    setInstrumentRequestForm({
      instrumentType: '',
      instrumentName: '',
      quantity: 1,
      startDate: '',
      endDate: '',
      purpose: '',
      notes: ''
    });
    setShowInstrumentRequest(true);
  };

  const handleSubmitInstrumentRequest = (e) => {
    e.preventDefault();
    const { instrumentType, instrumentName, quantity, startDate, endDate, purpose } = instrumentRequestForm;
    
    if (!instrumentType || !instrumentName || !quantity || !startDate || !endDate || !purpose) {
      setToast({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setToast({ type: 'error', message: 'End date must be after start date' });
      return;
    }

    const requestType = user.role === 'user' ? 'rent' : 'borrow';
    
    const newRequest = {
      id: Date.now(),
      userId: user.id,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      userEmail: user.email,
      type: requestType, // 'borrow' for members, 'rent' for customers
      instrumentType,
      instrumentName,
      quantity: parseInt(quantity),
      startDate,
      endDate,
      purpose,
      notes: instrumentRequestForm.notes,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Save to appropriate localStorage key
    const storageKey = requestType === 'borrow' ? 'borrowRequests' : 'rentRequests';
    const existingRequests = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedRequests = [...existingRequests, newRequest];
    localStorage.setItem(storageKey, JSON.stringify(updatedRequests));

    // Dispatch event for dashboard to update
    window.dispatchEvent(new Event(`${requestType}RequestsUpdated`));

    setToast({ 
      type: 'success', 
      message: `Instrument ${requestType} request submitted successfully!` 
    });
    setShowInstrumentRequest(false);
  };

  return (
    <>
      {/* Login view */}
      {currentView === 'login' && (
        <Login onBack={handleBackToHome} onLogin={handleLogin} onSwitchToSignup={handleSwitchToSignup} error={loginError} onClearError={handleClearLoginError} />
      )}

      {/* User Signup (for booking accounts) */}
      {currentView === 'userSignup' && (
        <UserSignup
          onClose={handleBackToHome}
          onSignup={handleSignup}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}

      {/* Membership Application */}
      {currentView === 'signup' && (
        <Signup
          onClose={handleBackToHome}
          onSignup={handleSignup}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}

      {currentView === 'dashboard' && (
        <Dashboard
          user={user}
          onBackToHome={() => setCurrentView('home')}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'profile' && (
        <div style={{ padding: '28px', maxWidth: '720px', margin: '28px auto' }}>
          <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>Edit Profile</h2>
            <div style={{ color: '#6b7280', fontSize: 13 }}>Manage your account details</div>
          </div>

          <div style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', padding: 22, borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 96, height: 96, borderRadius: 12, overflow: 'hidden', background: '#e6f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {user?.avatar ? (
                      <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (user?.firstName || user?.email || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input id="profile-avatar-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const base64 = String(reader.result);
                        try {
                          const stored = JSON.parse(localStorage.getItem('davaoBlueEaglesUser') || 'null');
                          const updated = { ...(stored || {}), avatar: base64 };
                          localStorage.setItem('davaoBlueEaglesUser', JSON.stringify(updated));
                          const users = JSON.parse(localStorage.getItem('davaoBlueEaglesUsers') || '[]');
                          const updatedUsers = users.map(u => u.id === updated.id ? { ...u, avatar: base64 } : u);
                          if (users.length) localStorage.setItem('davaoBlueEaglesUsers', JSON.stringify(updatedUsers));
                          setUser(updated);
                          window.dispatchEvent(new CustomEvent('davaoUserUpdated', { detail: updated }));
                        } catch (err) {
                          console.error('Saving avatar failed', err);
                        }
                      };
                      reader.readAsDataURL(file);
                    }} />
                    <label htmlFor="profile-avatar-input" style={{ cursor: 'pointer', padding: '8px 10px', borderRadius: 8, background: '#eef2ff', color: '#0b3b78', fontWeight: 700, fontSize: 13 }}>Upload</label>
                    <button type="button" onClick={() => {
                      try {
                        const stored = JSON.parse(localStorage.getItem('davaoBlueEaglesUser') || 'null');
                        if (!stored) return;
                        const updated = { ...(stored || {}) };
                        delete updated.avatar;
                        localStorage.setItem('davaoBlueEaglesUser', JSON.stringify(updated));
                        const users = JSON.parse(localStorage.getItem('davaoBlueEaglesUsers') || '[]');
                        const updatedUsers = users.map(u => u.id === updated.id ? (function(){ const o = { ...u }; delete o.avatar; return o; })() : u);
                        if (users.length) localStorage.setItem('davaoBlueEaglesUsers', JSON.stringify(updatedUsers));
                        setUser(updated);
                        window.dispatchEvent(new CustomEvent('davaoUserUpdated', { detail: updated }));
                      } catch (err) {
                        console.error('Removing avatar failed', err);
                      }
                    }} style={{ padding: '8px 10px', borderRadius: 8, background: '#fff1f2', color: '#7f1d1d', border: 'none', fontWeight: 700, fontSize: 13 }}>Remove</button>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'grid', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <label style={{ width: 140, fontWeight: 700, color: '#0b3b78' }}>First Name</label>
                    <input type="text" value={profileFirstName} onChange={(e) => setProfileFirstName(e.target.value)} placeholder="First name" style={{ flex: 1, padding: '12px', borderRadius: 8, border: '1px solid rgba(11,59,120,0.08)', background: '#fff', color: '#06264a' }} />
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <label style={{ width: 140, fontWeight: 700, color: '#0b3b78' }}>Last Name</label>
                    <input type="text" value={profileLastName} onChange={(e) => setProfileLastName(e.target.value)} placeholder="Last name" style={{ flex: 1, padding: '12px', borderRadius: 8, border: '1px solid rgba(11,59,120,0.08)', background: '#fff', color: '#06264a' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                    <button type="button" onClick={() => setCurrentView('home')} style={{ padding: '10px 16px', borderRadius: 8, background: 'transparent', color: '#0b62d6', border: '1px solid rgba(11,98,214,0.12)', fontWeight: 700 }}>Cancel</button>
                    <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, background: 'linear-gradient(90deg,#06b6d4,#3b82f6)', color: 'white', border: 'none', fontWeight: 800 }}>Save changes</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {currentView === 'notifications' && (
        <div style={{ padding: '28px', maxWidth: '920px', margin: '28px auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ margin: 0 }}>Notifications</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={markAllRead} style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(11,98,214,0.12)', color: '#0b62d6', fontWeight: 700 }}>Mark all read</button>
              <button onClick={clearAllNotifications} style={{ padding: '8px 12px', borderRadius: 8, background: '#fff1f2', border: 'none', color: '#7f1d1d', fontWeight: 700 }}>Clear all</button>
              <button onClick={() => setCurrentView('home')} style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(11,98,214,0.06)', color: '#0b62d6', fontWeight: 700 }}>Close</button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 18, borderRadius: 12, background: '#f8fafc', color: '#6b7280' }}>No notifications</div>
            ) : notifications.slice().reverse().map((n, idx) => {
              const origIndex = notifications.length - 1 - idx;
              return (
                <div key={n.ts || idx} style={{ padding: 16, borderRadius: 12, border: '1px solid rgba(11,59,120,0.06)', background: n.read ? '#ffffff' : '#eef6ff', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#06264a' }}>{n.title}</div>
                    <div style={{ color: '#4b5563', marginTop: 6 }}>{n.body}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>{new Date(n.ts).toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <button onClick={() => toggleNotificationRead(origIndex)} style={{ padding: '6px 10px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(11,98,214,0.08)', color: '#0b62d6', fontWeight: 700 }}>{n.read ? 'Unread' : 'Mark read'}</button>
                    <button onClick={() => deleteNotification(origIndex)} style={{ padding: '6px 10px', borderRadius: 8, background: '#fff1f2', border: 'none', color: '#7f1d1d', fontWeight: 700 }}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}





      {/* Home view */}
      {currentView === 'home' && (
        <div style={containerStyle}>
          {/* small local styles for navbar animations and focus */}
          <style>{`
            .nav-fade { transition: opacity 220ms ease, transform 220ms ease; }
            .nav-link:focus { outline: 3px solid rgba(99,102,241,0.18); outline-offset: 4px; }
            .dropdown-enter { transform: translateY(-6px); opacity: 0; }
            .dropdown-enter-active { transform: translateY(0); opacity: 1; transition: all 220ms ease; }
          `}</style>
          <nav style={{ ...navStyle, alignItems: 'center' }} aria-label="Main navigation">
            {/* Left: Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={logoStyle}>
                <a href="#home" onClick={(e) => handleNavClick(e, '#home')} style={{ textDecoration: 'none' }}>
                  <h1 style={logoMainStyle}>DAVAO</h1>
                </a>
                <p style={logoSubStyle}>BLUE EAGLES</p>
              </div>
            </div>

            {/* Center: links (hidden on mobile) */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <ul style={{ ...ulStyle, display: isMobile ? 'none' : 'flex' }} role="menubar">
                {['#home','#services','#about','#contact'].map((hash, i) => {
                  const labels = ['Home','Services','About Us','Contact'];
                  return (
                    <li key={hash} style={{ listStyle: 'none' }}>
                      <a
                        href={hash}
                        onClick={(e) => handleNavClick(e, hash)}
                        style={{ ...linkStyle, ...(activeHash === hash ? { color: '#60a5fa' } : {}) }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        role="menuitem"
                      >
                        {labels[i]}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right: actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Mobile toggle */}
              <button
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-controls="mobile-menu"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ display: isMobile ? 'inline-flex' : 'none', background: 'transparent', border: 'none', color: 'rgba(240,248,255,0.95)', cursor: 'pointer', padding: '8px' }}
              >
                {mobileOpen ? (
                  <span style={{ fontSize: 22 }} aria-hidden>×</span>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </button>

              <div style={buttonContainerStyle}>
                {/* Notifications */}
                <div style={{ position: 'relative' }}>
                  <button aria-label="Notifications" data-notif-toggle="true" onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowUserMenu(false); }} style={{ background: 'transparent', border: 'none', color: 'rgba(240,248,255,0.95)', cursor: 'pointer', padding: '8px', position: 'relative' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {unreadCount() > 0 && (
                      <span style={{ position: 'absolute', top: 2, right: 2, background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 800, padding: '2px 6px', borderRadius: 999 }}>{unreadCount()}</span>
                    )}
                  </button>

                  {showNotifications && (
                    <div id="notification-menu" role="menu" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#ffffff', border: '1px solid rgba(15, 76, 129, 0.08)', borderRadius: '12px', padding: '12px', minWidth: '320px', maxWidth: '360px', boxShadow: '0 12px 28px rgba(2,6,23,0.18)', zIndex: 1200 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontWeight: 800, color: '#06264a' }}>Notifications</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={markAllRead} style={{ background: 'transparent', border: 'none', color: '#0b62d6', fontWeight: 700, cursor: 'pointer' }}>Mark all</button>
                          <button onClick={clearAllNotifications} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}>Clear</button>
                        </div>
                      </div>

                      <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'grid', gap: 8 }}>
                        {notifications.length === 0 ? (
                          <div style={{ color: '#6b7280' }}>No notifications</div>
                        ) : notifications.slice().reverse().map((n, idx) => {
                          const origIndex = notifications.length - 1 - idx;
                          return (
                            <div key={n.ts || idx} onClick={() => handleOpenNotification(origIndex)} style={{ padding: '8px', borderRadius: 8, background: n.read ? '#f8fafc' : '#eef6ff', border: '1px solid rgba(11,59,120,0.04)', cursor: 'pointer' }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#06264a' }}>{n.title}</div>
                              <div style={{ fontSize: 13, color: '#4b5563' }}>{n.body}</div>
                              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>{new Date(n.ts).toLocaleString()}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {user ? (
                  <div style={{ position: 'relative' }}>
                    <button
                      style={{
                        ...((buttonContainerStyle && {}) || {}),
                        background: 'linear-gradient(90deg, rgba(2,6,23,0.65), rgba(15,23,42,0.55))',
                        border: '1px solid rgba(255,255,255,0.04)',
                        color: '#e6eef8',
                        padding: '8px 12px',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '14px',
                        fontWeight: '700'
                      }}
                      onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); }}
                      data-user-toggle="true"
                      aria-controls="user-menu"
                      aria-expanded={showUserMenu}
                    >
                      <div style={{ width: '34px', height: '34px', borderRadius: '999px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: user?.avatar ? 'transparent' : 'linear-gradient(135deg,#06b6d4,#3b82f6)' }}>
                          {user?.avatar ? (
                            <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <FaUser style={{ color: 'white' }} />
                          )}
                        </div>
                      <div style={{ textAlign: 'left', lineHeight: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 800 }}>{user.firstName || (user.email || '').split('@')[0]}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(229,231,235,0.9)', marginTop: '2px' }}>{user.role || 'Member'}</div>
                      </div>
                      <div style={{ marginLeft: '6px', opacity: 0.9, transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 180ms ease' }}>▾</div>
                    </button>

                    {showUserMenu && (
                      <div id="user-menu" role="menu" style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: '#ffffff', border: '1px solid rgba(15, 76, 129, 0.08)', borderRadius: '12px', padding: '14px', minWidth: '240px', boxShadow: '0 12px 28px rgba(2,6,23,0.18)', zIndex: 1200 }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(11,59,120,0.04)' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', background: '#e6f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0b3b78', fontWeight: 800, fontSize: '18px' }}>
                            {user?.avatar ? (
                              <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              (user.firstName || user.email || 'U').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '15px', color: '#06264a' }}>{user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.email || '').split('@')[0]}</div>
                            <div style={{ fontSize: '12px', color: '#1e4f8a', marginTop: '3px' }}>{user.email}</div>
                          </div>
                        </div>

                        <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
                          {/* Avatar controls for all users */}
                          {/* Avatar editing moved to profile page. Preview only shown above. */}
                          <a href="#profile" onClick={(e) => { e.preventDefault(); openProfile(); }} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', borderRadius: '8px', textDecoration: 'none', color: '#0b3b78', fontWeight: 600 }}>
                            <FaUser style={{ color: '#0b62d6', minWidth: '18px' }} />
                            <span>View Profile</span>
                          </a>

                          <a href="#bookings" onClick={(e) => { e.preventDefault(); setShowMyBookings(true); setShowUserMenu(false); }} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', borderRadius: '8px', textDecoration: 'none', color: '#0b3b78', fontWeight: 600 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ minWidth: '18px' }}><path d="M3 7h18" stroke="#0b62d6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 3v4" stroke="#0b62d6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 3v4" stroke="#0b62d6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 10v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7" stroke="#0b62d6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <span>Bookings</span>
                          </a>

                          <a href="#instruments" onClick={(e) => { e.preventDefault(); handleOpenInstrumentRequest(); setShowUserMenu(false); }} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', borderRadius: '8px', textDecoration: 'none', color: '#0b3b78', fontWeight: 600 }}>
                            <FaMusic style={{ color: '#0b62d6', minWidth: '18px' }} />
                            <span>{user.role === 'user' ? 'Rent Instrument' : 'Borrow Instrument'}</span>
                          </a>

                          {user.role === 'admin' && (
                            <a href="#dashboard" onClick={(e) => { e.preventDefault(); if (user?.role === 'admin') { setCurrentView('dashboard'); } else { alert('Dashboard access is restricted to administrators.'); } setShowUserMenu(false); }} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', borderRadius: '8px', textDecoration: 'none', color: '#0b3b78', fontWeight: 600 }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ minWidth: '18px' }}><path d="M3 12h18" stroke="#0b62d6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 6h18" stroke="#0b62d6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 18h18" stroke="#0b62d6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              <span>Admin Dashboard</span>
                            </a>
                          )}

                          <div style={{ height: '1px', background: 'rgba(11,59,120,0.06)', margin: '6px 0' }} />

                          <button onClick={() => { handleLogout(); setShowUserMenu(false); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: '#0b62d6', color: 'white', fontWeight: 800, cursor: 'pointer' }}>Sign Out</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <button onClick={handleShowLogin} style={loginButtonStyle} onMouseEnter={handleLoginHover} onMouseLeave={handleLoginLeave}>Login</button>
                    <button onClick={handleShowUserSignup} style={signUpButtonStyle} onMouseEnter={handleSignupHover} onMouseLeave={handleSignupLeave}>Sign Up</button>
                  </>
                )}
              </div>
            </div>
          </nav>

          {/* Mobile menu overlay */}
          {mobileOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'linear-gradient(180deg, rgba(2,6,23,0.92), rgba(2,6,23,0.98))', display: 'flex', flexDirection: 'column', padding: '32px' }} onClick={() => setMobileOpen(false)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: 0, color: '#c7ddff', fontFamily: 'Marcellus, serif' }}>DAVAO</h3>
                  <small style={{ color: '#9fb6d9' }}>BLUE EAGLES</small>
                </div>
                <button onClick={() => setMobileOpen(false)} style={{ background: 'transparent', border: 'none', color: '#c7ddff', fontSize: '22px' }}>×</button>
              </div>

              <nav style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '18px' }} onClick={(e) => e.stopPropagation()}>
                <a href="#home" onClick={(e) => handleNavClick(e, '#home')} style={{ color: '#e6eef8', fontSize: '20px', textDecoration: 'none' }}>Home</a>
                <a href="#services" onClick={(e) => handleNavClick(e, '#services')} style={{ color: '#e6eef8', fontSize: '20px', textDecoration: 'none' }}>Services</a>
                <a href="#about" onClick={(e) => handleNavClick(e, '#about')} style={{ color: '#e6eef8', fontSize: '20px', textDecoration: 'none' }}>About Us</a>
                <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} style={{ color: '#e6eef8', fontSize: '20px', textDecoration: 'none' }}>Contact</a>

                <div style={{ marginTop: '18px', display: 'flex', gap: '12px' }}>
                  {user ? (
                    <button onClick={() => { setMobileOpen(false); setShowUserMenu(true); }} style={{ padding: '12px', borderRadius: '10px', background: '#0b62d6', border: 'none', color: 'white', fontWeight: 700 }}>Account</button>
                  ) : (
                    <>
                      <button onClick={() => { setMobileOpen(false); handleShowLogin(); }} style={{ padding: '12px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#e6eef8' }}>Login</button>
                      <button onClick={() => { setMobileOpen(false); handleShowSignup(); }} style={{ padding: '12px', borderRadius: '10px', background: 'linear-gradient(90deg,#06b6d4,#3b82f6)', border: 'none', color: 'white', fontWeight: 700 }}>Sign Up</button>
                    </>
                  )}
                </div>
              </nav>
            </div>
          )}

          {/* Hero Section */}
          <section id="home" style={heroSectionStyle}>
            {/* Ambient Light Effects */}
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(100px)',
              animation: 'ambientGlow 8s ease-in-out infinite'
            }}></div>
            
            <div style={{
              position: 'absolute',
              bottom: '20%',
              right: '15%',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(80px)',
              animation: 'ambientGlow 6s ease-in-out infinite 2s'
            }}></div>

            <div style={heroContentStyle}>
              {/* Main Tagline */}
              <h1 style={taglineStyle}>
                Cirva a la Gente por la Musica
              </h1>
              
              {/* English Translation */}
              <p style={translationStyle}>
                "Serve the People Through Music"
              </p>
              
              {/* Call to Action Button */}
              <button
                onClick={handleShowSignup}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '16px 40px',
                  borderRadius: '12px',
                  fontFamily: 'Georgia, Times, "Times New Roman", serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  letterSpacing: '0.01em',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: 0,
                  animation: 'slideInFromBottom 1.5s ease-out 1.2s forwards'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px) scale(1.05)';
                  e.target.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.4)';
                  e.target.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
                  e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
                }}
              >
                Register Now
              </button>
            </div>
          </section>

          {/* Services Section */}
          <section id="services" style={servicesSectionStyle}>
            <div style={servicesContainerStyle}>
              <div style={servicesHeaderWrapStyle}>
                <div>
                  <h3 style={servicesHeaderStyle}>Our Services</h3>
                  <div style={sectionEyebrowStyle}>What we offer</div>
                </div>
                <div style={servicesHeaderRightStyle}>
                  <div style={{ color: '#e5e7eb', fontFamily: 'Marcellus, serif', fontSize: '20px', fontWeight: 600 }}>Certified Excellence</div>
                  <p style={servicesSubTextStyle}>From parades and corporate shows to workshops and rentals—we tailor each service to your event with professional coordination and musical excellence.</p>
                </div>
              </div>

              {/* New card layout: 3 on top, 2 centered below */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {services.slice(0, 3).map((service) => (
                  <div key={service.title} style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(100,255,218,0.2)', backgroundColor: 'rgba(10,25,47,0.6)' }}>
                    <div style={{ position: 'relative', height: `${serviceCardH}px` }}>
                      <div style={{ ...cardImageStyle, backgroundImage: `url(${service.img})` }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(2,6,23,0.92), rgba(2,6,23,0.2) 60%)' }} />
                      <div style={cardBodyStyle}>
                        <div style={cardBottomPillStyle}>{service.title}</div>
                        <button aria-label="Open" style={cardArrowButtonStyle} onClick={() => setModalService(service)}>↗</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px', maxWidth: '860px', margin: '16px auto 0' }}>
                {services.slice(3).map((service) => (
                  <div key={service.title} style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(100,255,218,0.2)', backgroundColor: 'rgba(10,25,47,0.6)' }}>
                    <div style={{ position: 'relative', height: `${serviceCardH}px` }}>
                      <div style={{ ...cardImageStyle, backgroundImage: `url(${service.img})` }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(2,6,23,0.92), rgba(2,6,23,0.2) 60%)' }} />
                      <div style={cardBodyStyle}>
                        <div style={cardBottomPillStyle}>{service.title}</div>
                        <button aria-label="Open" style={cardArrowButtonStyle} onClick={() => setModalService(service)}>↗</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* About Section */}
          <section id="about" style={aboutSectionStyle}>
            <div style={servicesContainerStyle}>
              <div style={servicesHeaderWrapStyle}>
                <div>
                  <h3 style={aboutHeaderStyle}>About Us</h3>
                  <div style={sectionEyebrowStyle}>Who we are</div>
                </div>
              </div>
              <div style={aboutWrapStyle}>
                <div style={aboutTextCardStyle}>
                  <div>
                    <p style={aboutStoryParagraphStyle}>
                      The Davao Blue Eagles Marching Band (DBEMB) was founded in 2012, with November 24, 2012, as its official anniversary date. This marks the band's first-ever competition in Bohol, where it made history by sweeping all four major awards and breaking the 15-year championship streak of Bohol Island State University (BISU).
                    </p>
                    <p style={aboutStoryParagraphStyle}>
                      Since then, DBEMB has expanded its reach, competing across the Visayas (Bohol), Mindanao (Davao, Tagum, Kidapawan), and Luzon (Pasay, Pasig, Bacoor).
                    </p>
                    <p style={aboutStoryParagraphStyle}>
                      The band has secured five major championship titles—two from the Alturas Drum and Bugle competition in Tagbilaran City, Bohol, and three in Davao City.
                    </p>
                    <p style={aboutStoryParagraphStyle}>
                      However, the band's strength has gradually declined after the pandemic lockdown, particularly from early 2022 onward. Challenges such as reduced membership, financial struggles, and operational difficulties have affected its performance and stability. Despite these setbacks, DBEMB remains committed to its legacy of excellence, striving to rebuild and continue serving the people through music.
                    </p>
                  </div>
                </div>

                {/* Carousel */}
                <div style={carouselWrapperStyle}>
                  <div
                    style={{
                      ...carouselImageStyle,
                      backgroundImage: `url(${aboutImages[currentSlide]})`
                    }}
                  />
                  <div style={carouselControlsStyle}>
                    <button style={navButtonStyle} onClick={goPrev} aria-label="Previous slide">‹</button>
                    <button style={navButtonStyle} onClick={goNext} aria-label="Next slide">›</button>
                  </div>
                  <div style={dotsStyle}>
                    {aboutImages.map((_, idx) => (
                      <span key={idx} style={dotStyle(idx === currentSlide)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" style={contactSectionStyle}>
            <div style={servicesContainerStyle}>
              <div style={servicesHeaderWrapStyle}>
                <div>
                  <h3 style={contactHeaderStyle}>Contact Us</h3>
                  <div style={sectionEyebrowStyle}>Get in touch</div>
                </div>
                <p style={contactSubTextStyle}>
                  Ready to bring the Davao Blue Eagles Marching Band to your event? Get in touch with us for bookings, inquiries, or collaborations.
                </p>
              </div>

              <div style={contactGridStyle}>
                {/* Contact Information */}
                <div style={contactInfoCardStyle}>
                  <h4 style={contactCardTitleStyle}>Get In Touch</h4>
                  <div style={contactInfoListStyle}>
                    <div style={contactInfoItemStyle}>
                      <div style={contactIconStyle}><FaEnvelope /></div>
                      <div>
                        <h5 style={contactLabelStyle}>Email</h5>
                        <p style={contactValueStyle}>dbe.official@example.com</p>
                      </div>
                    </div>
                    <div style={contactInfoItemStyle}>
                      <div style={contactIconStyle}><FaPhoneAlt /></div>
                      <div>
                        <h5 style={contactLabelStyle}>Phone</h5>
                        <p style={contactValueStyle}>+63 900 000 0000</p>
                      </div>
                    </div>
                    <div style={contactInfoItemStyle}>
                      <div style={contactIconStyle}><FaMapMarkerAlt /></div>
                      <div>
                        <h5 style={contactLabelStyle}>Location</h5>
                        <p style={contactValueStyle}>Davao City, Philippines</p>
                      </div>
                    </div>
                    <div style={contactInfoItemStyle}>
                      <div style={contactIconStyle}><FaClock /></div>
                      <div>
                        <h5 style={contactLabelStyle}>Response Time</h5>
                        <p style={contactValueStyle}>Within 24 hours</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div style={contactFormCardStyle}>
                  <h4 style={contactCardTitleStyle}>Send Us a Message</h4>
                  <form style={contactFormStyle}>
                    <div style={formRowStyle}>
                      <div style={formFieldStyle}>
                        <label style={formLabelStyle}>First Name *</label>
                        <input
                          type="text"
                          style={formInputStyle}
                          placeholder="Enter your first name"
                          required
                        />
                      </div>
                      <div style={formFieldStyle}>
                        <label style={formLabelStyle}>Last Name *</label>
                        <input
                          type="text"
                          style={formInputStyle}
                          placeholder="Enter your last name"
                          required
                        />
                      </div>
                    </div>
                    <div style={formFieldStyle}>
                      <label style={formLabelStyle}>Email Address *</label>
                      <input
                        type="email"
                        style={formInputStyle}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                    <div style={formFieldStyle}>
                      <label style={formLabelStyle}>Phone Number</label>
                      <input
                        type="tel"
                        style={formInputStyle}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div style={formFieldStyle}>
                      <label style={formLabelStyle}>Event Type *</label>
                      <select style={formInputStyle} required>
                        <option value="">Select an event type</option>
                        <option value="corporate">Corporate Event</option>
                        <option value="festival">Festival</option>
                        <option value="parade">Parade</option>
                        <option value="ceremony">Ceremony</option>
                        <option value="workshop">Music Workshop</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div style={formFieldStyle}>
                      <label style={formLabelStyle}>Event Date</label>
                      <input
                        type="date"
                        style={formInputStyle}
                      />
                    </div>
                    <div style={formFieldStyle}>
                      <label style={formLabelStyle}>Message *</label>
                      <textarea
                        style={formTextareaStyle}
                        placeholder="Tell us about your event and requirements..."
                        rows="4"
                        required
                      ></textarea>
                    </div>
                    <button type="submit" style={submitButtonStyle}>
                      Send Message
                    </button>
                  </form>
                </div>
              </div>

              {/* Additional Info */}
              <div style={additionalInfoStyle}>
                <div style={infoCardStyle}>
                  <h5 style={infoCardTitleStyle}>Booking Process</h5>
                  <p style={infoCardTextStyle}>
                    We'll review your request and get back to you within 24 hours with availability and pricing details.
                  </p>
                </div>
                <div style={infoCardStyle}>
                  <h5 style={infoCardTitleStyle}>Service Areas</h5>
                  <p style={infoCardTextStyle}>
                    We serve Davao City and surrounding areas. For events outside our immediate area, please contact us for special arrangements.
                  </p>
                </div>
                <div style={infoCardStyle}>
                  <h5 style={infoCardTitleStyle}>Payment Terms</h5>
                  <p style={infoCardTextStyle}>
                    We require a 50% deposit upon booking confirmation, with the remaining balance due on the event date.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Modal - redesigned service info */}
          {modalService && (
            <div style={modalOverlayStyle} onClick={() => setModalService(null)}>
              <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                <div style={modalHeaderStyle}>
                  <h4 style={modalTitleStyle}>{modalService.title}</h4>
                  <button style={closeButtonStyle} onClick={() => setModalService(null)}>×</button>
                </div>
                <div style={{ ...modalBodyStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ height: '220px', borderRadius: '10px', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${modalService.img})`, border: '1px solid rgba(100,255,218,0.2)' }} />
                  </div>
                  <div>
                    <p style={readMoreTextStyle}>{modalService.description}</p>
                  
                  </div>
                </div>
                <div style={{ ...modalActionsStyle, justifyContent: 'space-between' }}>
                  <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                    {modalService.title === 'Instrument Rentals' 
                      ? 'Need an instrument? Request to borrow or rent now.'
                      : 'Ready to proceed? Reserve a date to get started.'}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {modalService.title === 'Instrument Rentals' ? (
                      <button 
                        style={bookButtonStyle} 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          setModalService(null);
                          handleOpenInstrumentRequest();
                        }}
                      >
                        {user ? (user.role === 'user' ? 'Rent Instrument' : 'Borrow Instrument') : 'Request Instrument'}
                      </button>
                    ) : (
                      <a href="#book" style={bookButtonStyle} onClick={(e) => { e.preventDefault(); localStorage.setItem('dbeOpenBookingForService', modalService?.title || ''); const url = window.location.origin + window.location.pathname + '#/booking'; window.open(url, '_blank'); }}>Book Now</a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instrument Request Modal */}
          {showInstrumentRequest && (
            <div style={modalOverlayStyle} onClick={() => setShowInstrumentRequest(false)}>
              <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                <div style={modalHeaderStyle}>
                  <h4 style={modalTitleStyle}>
                    {user && user.role === 'user' ? 'Rent an Instrument' : 'Borrow an Instrument'}
                  </h4>
                  <button style={closeButtonStyle} onClick={() => setShowInstrumentRequest(false)}>×</button>
                </div>
                
                <form onSubmit={handleSubmitInstrumentRequest} style={modalBodyStyle}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={darkLabelStyle}>Instrument Type *</label>
                    <select
                      style={darkInputStyle}
                      value={instrumentRequestForm.instrumentType}
                      onChange={(e) => setInstrumentRequestForm({ ...instrumentRequestForm, instrumentType: e.target.value })}
                      required
                    >
                      <option value="">Select instrument type</option>
                      <option value="percussion">Percussion</option>
                      <option value="brass">Brass</option>
                      <option value="woodwind">Woodwind</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={darkLabelStyle}>Instrument Name *</label>
                    <select
                      style={darkInputStyle}
                      value={instrumentRequestForm.instrumentName}
                      onChange={(e) => setInstrumentRequestForm({ ...instrumentRequestForm, instrumentName: e.target.value })}
                      required
                    >
                      <option value="">Select an instrument</option>
                      {availableInstruments
                        .filter(item => {
                          // Filter by selected type if one is chosen
                          if (!instrumentRequestForm.instrumentType) return true;
                          if (instrumentRequestForm.instrumentType === 'percussion') return item.category === 'percussion';
                          if (instrumentRequestForm.instrumentType === 'brass') return item.category === 'wind' && item.subcategory === 'Brass';
                          if (instrumentRequestForm.instrumentType === 'woodwind') return item.category === 'wind' && item.subcategory === 'Woodwinds';
                          return true;
                        })
                        .map(instrument => (
                          <option key={instrument.id} value={instrument.name}>
                            {instrument.name}
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={darkLabelStyle}>Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      style={darkInputStyle}
                      value={instrumentRequestForm.quantity}
                      onChange={(e) => setInstrumentRequestForm({ ...instrumentRequestForm, quantity: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={darkLabelStyle}>Start Date *</label>
                      <input
                        type="date"
                        style={darkInputStyle}
                        value={instrumentRequestForm.startDate}
                        onChange={(e) => setInstrumentRequestForm({ ...instrumentRequestForm, startDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <label style={darkLabelStyle}>End Date *</label>
                      <input
                        type="date"
                        style={darkInputStyle}
                        value={instrumentRequestForm.endDate}
                        onChange={(e) => setInstrumentRequestForm({ ...instrumentRequestForm, endDate: e.target.value })}
                        min={instrumentRequestForm.startDate || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={darkLabelStyle}>Purpose *</label>
                    <select
                      style={darkInputStyle}
                      value={instrumentRequestForm.purpose}
                      onChange={(e) => setInstrumentRequestForm({ ...instrumentRequestForm, purpose: e.target.value })}
                      required
                    >
                      <option value="">Select purpose</option>
                      <option value="practice">Practice</option>
                      <option value="performance">Performance</option>
                      <option value="event">Event</option>
                      <option value="learning">Learning</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={darkLabelStyle}>Additional Notes</label>
                    <textarea
                      style={darkTextareaStyle}
                      value={instrumentRequestForm.notes}
                      onChange={(e) => setInstrumentRequestForm({ ...instrumentRequestForm, notes: e.target.value })}
                      placeholder="Any additional information..."
                      rows="3"
                    />
                  </div>

                  <div style={{ 
                    padding: '16px', 
                    background: user && user.role === 'user' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(34, 197, 94, 0.1)', 
                    borderRadius: '12px', 
                    marginBottom: '20px',
                    border: user && user.role === 'user' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>
                      {user && user.role === 'user' 
                        ? '💵 As a customer, you can rent this instrument. Rental fees will be discussed upon approval.'
                        : '🎵 As a member, you can borrow this instrument for free. Please ensure to return it in good condition.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button 
                      type="button" 
                      style={closeButtonStyle} 
                      onClick={() => setShowInstrumentRequest(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" style={bookButtonStyle}>
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Toast */}
          {toast && (
            <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 3000 }}>
              <div style={{
                backgroundColor: toast.type === 'success' ? 'rgba(34,197,94,0.1)' : toast.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(96,165,250,0.1)',
                border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(96,165,250,0.4)'}`,
                color: toast.type === 'success' ? '#22c55e' : toast.type === 'error' ? '#ef4444' : '#60a5fa',
                padding: '12px 16px',
                borderRadius: '10px',
                backdropFilter: 'blur(8px)'
              }}>
                {toast.message}
              </div>
            </div>
          )}
          {/* Footer */}
          <footer style={footerStyle}>
            <div style={footerContainerStyle}>
              {/* Main Footer Content */}
              <div style={footerMainStyle}>
                {/* Brand Section */}
                <div style={footerBrandStyle}>
                  <div style={footerLogoStyle}>
                    <h3 style={footerLogoTitleStyle}>DAVAO</h3>
                    <p style={footerLogoSubtitleStyle}>BLUE EAGLES</p>
                  </div>
                  <p style={footerDescriptionStyle}>
                    Serving the people through music since 2012. We bring excellence, passion, and unforgettable performances to every event.
                  </p>
                  <div style={footerSocialStyle}>
                    <a href="#" style={socialLinkStyle} aria-label="Facebook">
                      <FaFacebookF />
                    </a>
                    <a href="#" style={socialLinkStyle} aria-label="Instagram">
                      <FaInstagram />
                    </a>
                    <a href="#" style={socialLinkStyle} aria-label="YouTube">
                      <FaYoutube />
                    </a>
                    <a href="#" style={socialLinkStyle} aria-label="Email">
                      <FaEnvelope />
                    </a>
                  </div>
                </div>

                {/* Quick Links */}
                <div style={footerSectionStyle}>
                  <h4 style={footerSectionTitleStyle}>Quick Links</h4>
                  <ul style={footerLinkListStyle}>
                    <li><a href="#home" style={footerLinkStyle}>Home</a></li>
                    <li><a href="#services" style={footerLinkStyle}>Services</a></li>
                    <li><a href="#about" style={footerLinkStyle}>About Us</a></li>
                    <li><a href="#contact" style={footerLinkStyle}>Contact</a></li>
                    <li><a href="#" style={footerLinkStyle}>Gallery</a></li>
                    <li><a href="#" style={footerLinkStyle}>News & Events</a></li>
                  </ul>
                </div>

                {/* Services */}
                <div style={footerSectionStyle}>
                  <h4 style={footerSectionTitleStyle}>Our Services</h4>
                  <ul style={footerLinkListStyle}>
                    <li><a href="#" style={footerLinkStyle}>Band Gigs</a></li>
                    <li><a href="#" style={footerLinkStyle}>Music Arrangement</a></li>
                    <li><a href="#" style={footerLinkStyle}>Parade Events</a></li>
                    <li><a href="#" style={footerLinkStyle}>Music Workshops</a></li>
                    <li><a href="#" style={footerLinkStyle}>Instrument Rentals</a></li>
                    <li><a href="#" style={footerLinkStyle}>Custom Performances</a></li>
                  </ul>
                </div>

                {/* Contact Info */}
                <div style={footerSectionStyle}>
                  <h4 style={footerSectionTitleStyle}>Contact Info</h4>
                  <div style={footerContactListStyle}>
                    <div style={footerContactItemStyle}>
                      <span style={footerContactIconStyle}><FaMapMarkerAlt /></span>
                      <span style={footerContactTextStyle}>Davao City, Philippines</span>
                    </div>
                    <div style={footerContactItemStyle}>
                      <span style={footerContactIconStyle}><FaEnvelope /></span>
                      <span style={footerContactTextStyle}>dbe.official@example.com</span>
                    </div>
                    <div style={footerContactItemStyle}>
                      <span style={footerContactIconStyle}><FaPhoneAlt /></span>
                      <span style={footerContactTextStyle}>+63 900 000 0000</span>
                    </div>
                    <div style={footerContactItemStyle}>
                      <span style={footerContactIconStyle}><FaClock /></span>
                      <span style={footerContactTextStyle}>Mon-Fri: 9AM-6PM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Bottom */}
              <div style={footerBottomStyle}>
                <div style={footerBottomContentStyle}>
                  <p style={footerCopyrightStyle}>
                    © 2025 Davao Blue Eagles Marching Band. All rights reserved.
                  </p>
                  <div style={footerBottomLinksStyle}>
                    <a href="#" style={footerBottomLinkStyle}>Privacy Policy</a>
                    <a href="#" style={footerBottomLinkStyle}>Terms of Service</a>
                    <a href="#" style={footerBottomLinkStyle}>Cookie Policy</a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
export default Home;