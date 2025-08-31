import React, { useState, useEffect } from "react";
import bg2 from "./Assets/bg2.jpg";
import bandGigs from "./Assets/bandGigs.jpg";
import musicArrangement from "./Assets/music-arrangement.jpg";
import paradeEvents from "./Assets/paradeEvents.jpg";
import musicWorkshop from "./Assets/musicWorkshop.jpg";
import instrumentRentals from "./Assets/instrumentRentals.jpg";
import Login from './login'
import Signup from './signup'
import Dashboard from './dashboard'


const ADMIN_CREDENTIALS = {
  email: 'admin@blueeagles.com',
  password: 'Admin123!'
};

const Home = () => {
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  };

  const navStyle = {
    backgroundColor: 'rgba(10, 25, 47, 0.95)',
    padding: '16px 32px',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const logoStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  };

  const logoMainStyle = {
    fontFamily: 'Marcellus, serif',
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #60a5fa, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0
  };

  const logoSubStyle = {
    fontSize: '14px',
    color: '#93c5fd',
    margin: 0
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
    color: '#e5e7eb',
    fontWeight: '500',
    fontSize: '16px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '12px'
  };

  const loginButtonStyle = {
    backgroundColor: 'transparent',
    border: '2px solid  #64ffda',
    color: '#e5e7eb',
    padding: '8px 20px',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none'
  };

  const signUpButtonStyle = {
    backgroundColor: '#64ffda',
    border: '2px solid #64ffda',
    color: 'black',
    padding: '8px 20px',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none'
  };

  const handleMouseEnter = (e) => {
    e.target.style.color = '#60a5fa';
  };

  const handleMouseLeave = (e) => {
    e.target.style.color = '#e5e7eb';
  };

  const handleButtonHover = (e) => {
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 4px 12px rgba(96, 165, 250, 0.3)';
  };

  const handleButtonLeave = (e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = 'none';
  };

  // Hero styles
  const heroSectionStyle = {
    flex: '1 0 auto',
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    backgroundImage: `linear-gradient(rgba(10, 25, 47, 0.7), rgba(10, 25, 47, 0.9)), url(${bg2})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    scrollMarginTop: '80px'
  };

  const heroContentStyle = {
    textAlign: 'center',
    color: '#e5e7eb',
    maxWidth: '1000px'
  };

  const taglineStyle = {
    fontFamily: 'Marcellus, serif',
    fontWeight: 600,
    letterSpacing: '0.08em',
    fontSize: 'clamp(18px, 3vw, 40px)',
    lineHeight: 1.1,
    margin: '0 0 16px 0',
    textTransform: 'uppercase',
    color: '#e5e7eb',
    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    maxWidth: '100%'
  };

  const subTaglineStyle = {
    color: '#93a4b2',
    fontSize: '18px',
    marginBottom: '28px',
    whiteSpace: 'nowrap'
  };

  // Services styles
  const servicesSectionStyle = {
    backgroundImage: 'linear-gradient(180deg, rgba(2,6,23,0.96) 0%, rgba(2,6,23,0.98) 100%)',
    padding: '80px 24px 88px',
    minHeight: 'calc(100vh - 64px)',
    scrollMarginTop: '80px'
  };

  // About/Contact styles
  const aboutSectionStyle = {
    backgroundImage: 'linear-gradient(180deg, rgba(2,6,23,0.98) 0%, rgba(2,6,23,1) 100%)',
    padding: '80px 24px',
    scrollMarginTop: '80px'
  };

  const aboutHeaderStyle = {
    color: '#e5e7eb',
    fontFamily: 'Marcellus, serif',
    fontWeight: 600,
    fontSize: '30px',
    margin: 0,
    letterSpacing: '0.04em'
  };

  const aboutSubtextStyle = {
    color: '#94a3b8',
    fontSize: '14px',
    maxWidth: '780px',
    textAlign: 'center',
    margin: '0 auto'
  };

  // About side-by-side layout
  const aboutWrapStyle = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
    gap: '24px',
    alignItems: 'start',
    marginBottom: '28px'
  };

  const aboutTextCardStyle = {
    backgroundColor: 'rgba(10, 25, 47, 0.6)',
    border: '1px solid rgba(100, 255, 218, 0.15)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 10px 24px rgba(0,0,0,0.25)'
  };

  const aboutStoryParagraphStyle = {
    color: '#a8b2d1',
    textAlign: 'justify',
    lineHeight: 1.9,
    margin: '0 0 12px 0'
  };

  // Carousel styles
  const carouselWrapperStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '980px',
    margin: '0 auto 28px',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(100, 255, 218, 0.15)',
    boxShadow: '0 14px 30px rgba(0,0,0,0.25)'
  };

  const carouselImageStyle = {
    height: '440px',
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
    background: 'rgba(2,6,23,0.6)',
    color: '#e5e7eb',
    border: '1px solid rgba(100, 255, 218, 0.35)',
    borderRadius: '999px',
    width: '40px',
    height: '40px',
    cursor: 'pointer'
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
    width: '8px',
    height: '8px',
    borderRadius: '999px',
    backgroundColor: active ? '#64ffda' : 'rgba(148,163,184,0.6)',
    border: active ? '1px solid rgba(100, 255, 218, 0.8)' : '1px solid rgba(148,163,184,0.4)'
  });

  // Story styles
  const storyCardStyle = {
    backgroundColor: 'rgba(10, 25, 47, 0.6)',
    border: '1px solid rgba(100, 255, 218, 0.15)',
    borderRadius: '16px',
    padding: '20px',
    color: '#a8b2d1',
    margin: '0 auto 28px',
    maxWidth: '980px',
    lineHeight: 1.7
  };

  // Officers styles
  const officersHeaderStyle = {
    color: '#e5e7eb',
    fontFamily: 'Marcellus, serif',
    fontWeight: 600,
    fontSize: '24px',
    margin: '0 0 16px 0',
    letterSpacing: '0.04em',
    textAlign: 'center'
  };

  const officersGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '16px',
    maxWidth: '980px',
    margin: '0 auto'
  };

  const officerCardStyle = {
    backgroundColor: 'rgba(10, 25, 47, 0.6)',
    border: '1px solid rgba(100, 255, 218, 0.15)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    color: '#e5e7eb'
  };

  const officerAvatarStyle = (image) => ({
    width: '100%',
    height: '120px',
    backgroundImage: `url(${image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '8px',
    marginBottom: '10px'
  });

  const officerRoleStyle = {
    color: '#64ffda',
    fontSize: '13px',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    margin: '0 0 6px 0'
  };

  const officerNameStyle = {
    fontFamily: 'Marcellus, serif',
    fontSize: '16px',
    margin: 0
  };

  const contactSectionStyle = {
    backgroundImage: 'linear-gradient(180deg, rgba(2,6,23,1) 0%, rgba(2,6,23,1) 100%)',
    padding: '80px 24px',
    scrollMarginTop: '80px'
  };

  // Contact section styles
  const contactGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
    gap: '32px',
    marginBottom: '48px'
  };

  const contactInfoCardStyle = {
    backgroundColor: 'rgba(10, 25, 47, 0.6)',
    border: '1px solid rgba(100, 255, 218, 0.15)',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 10px 24px rgba(0,0,0,0.25)'
  };

  const contactFormCardStyle = {
    backgroundColor: 'rgba(10, 25, 47, 0.6)',
    border: '1px solid rgba(100, 255, 218, 0.15)',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 10px 24px rgba(0,0,0,0.25)'
  };

  const contactCardTitleStyle = {
    color: '#e5e7eb',
    fontFamily: 'Marcellus, serif',
    fontSize: '22px',
    fontWeight: 600,
    margin: '0 0 24px 0',
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
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    borderRadius: '8px',
    flexShrink: 0
  };

  const contactLabelStyle = {
    color: '#64ffda',
    fontSize: '14px',
    fontWeight: 600,
    margin: '0 0 4px 0',
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  };

  const contactValueStyle = {
    color: '#a8b2d1',
    fontSize: '16px',
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
    color: '#e5e7eb',
    fontSize: '14px',
    fontWeight: 500,
    letterSpacing: '0.04em'
  };

  const formInputStyle = {
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    border: '1px solid rgba(100, 255, 218, 0.2)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#e5e7eb',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    outline: 'none',
    ':focus': {
      borderColor: 'rgba(100, 255, 218, 0.6)',
      boxShadow: '0 0 0 3px rgba(100, 255, 218, 0.1)'
    },
    ':hover': {
      borderColor: 'rgba(100, 255, 218, 0.4)'
    }
  };

  const formTextareaStyle = {
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    border: '1px solid rgba(100, 255, 218, 0.2)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#e5e7eb',
    fontSize: '16px',
    resize: 'vertical',
    minHeight: '120px',
    transition: 'all 0.3s ease',
    outline: 'none',
    fontFamily: 'inherit',
    ':focus': {
      borderColor: 'rgba(100, 255, 218, 0.6)',
      boxShadow: '0 0 0 3px rgba(100, 255, 218, 0.1)'
    },
    ':hover': {
      borderColor: 'rgba(100, 255, 218, 0.4)'
    }
  };

  const submitButtonStyle = {
    backgroundColor: '#64ffda',
    border: '2px solid #64ffda',
    color: '#0b1a2c',
    padding: '14px 28px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '8px',
    ':hover': {
      backgroundColor: 'transparent',
      color: '#64ffda',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(100, 255, 218, 0.3)'
    }
  };

  const additionalInfoStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '24px'
  };

  const infoCardStyle = {
    backgroundColor: 'rgba(10, 25, 47, 0.4)',
    border: '1px solid rgba(100, 255, 218, 0.1)',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: 'rgba(10, 25, 47, 0.6)',
      borderColor: 'rgba(100, 255, 218, 0.3)',
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
    }
  };

  const infoCardTitleStyle = {
    color: '#64ffda',
    fontSize: '16px',
    fontWeight: 600,
    margin: '0 0 12px 0',
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  };

     const infoCardTextStyle = {
     color: '#a8b2d1',
     fontSize: '14px',
     lineHeight: 1.6,
     margin: 0
   };

   // Footer styles
   const footerStyle = {
     backgroundColor: '#0a1929',
     borderTop: '1px solid rgba(100, 255, 218, 0.1)',
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
     borderBottom: '1px solid rgba(100, 255, 218, 0.1)'
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
     background: 'linear-gradient(45deg, #60a5fa, #3b82f6)',
     WebkitBackgroundClip: 'text',
     WebkitTextFillColor: 'transparent',
     margin: 0
   };

   const footerLogoSubtitleStyle = {
     fontSize: '16px',
     color: '#93c5fd',
     margin: 0,
     letterSpacing: '0.1em'
   };

   const footerDescriptionStyle = {
     color: '#a8b2d1',
     fontSize: '16px',
     lineHeight: 1.6,
     margin: 0,
     maxWidth: '300px'
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
     fontSize: '20px'
   };

   const footerSectionStyle = {
     display: 'flex',
     flexDirection: 'column',
     gap: '20px'
   };

   const footerSectionTitleStyle = {
     color: '#e5e7eb',
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
     color: '#a8b2d1',
     textDecoration: 'none',
     fontSize: '15px',
     transition: 'all 0.3s ease',
     cursor: 'pointer',
     ':hover': {
       color: '#64ffda'
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
     flexShrink: 0
   };

   const footerContactTextStyle = {
     color: '#a8b2d1',
     fontSize: '15px',
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
     color: '#94a3b8',
     fontSize: '14px',
     margin: 0
   };

   const footerBottomLinksStyle = {
     display: 'flex',
     gap: '24px'
   };

   const footerBottomLinkStyle = {
     color: '#94a3b8',
     textDecoration: 'none',
     fontSize: '14px',
     transition: 'all 0.3s ease',
     cursor: 'pointer',
     ':hover': {
       color: '#64ffda'
     }
   };

  const servicesContainerStyle = {
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const sectionEyebrowStyle = {
    color: '#64ffda',
    textTransform: 'uppercase',
    letterSpacing: '0.22em',
    fontSize: '12px',
    marginBottom: '8px'
  };

  const servicesHeaderWrapStyle = {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '28px'
  };

  const servicesSubTextStyle = {
    color: '#94a3b8',
    fontSize: '14px',
    maxWidth: '540px'
  };


  const servicesHeaderStyle = {
    color: '#e5e7eb',
    fontFamily: 'Marcellus, serif',
    fontWeight: 600,
    fontSize: '30px',
    margin: 0,
    letterSpacing: '0.04em'
  };

  const servicesGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '20px',
    alignItems: 'stretch'
  };

  const cardStyle = {
    backgroundColor: 'rgba(10, 25, 47, 0.6)',
    border: '1px solid rgba(100, 255, 218, 0.15)',
    borderRadius: '16px',
    overflow: 'hidden',
    color: '#e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '340px',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background-color 0.25s ease',
    backdropFilter: 'blur(4px)'
  };

  const cardImageStyle = {
    height: '68%', // was 52%
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'saturate(0.9) contrast(1.05)'
  };

  const cardBodyStyle = {
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1
  };

  const cardTitleStyle = {
    fontFamily: 'Marcellus, serif',
    fontSize: '19px',
    fontWeight: 400, // was 600
    letterSpacing: '0.04em',
    margin: 0
  };

  const readMoreStyle = {
    color: '#64ffda',
    textDecoration: 'none',
    fontSize: '14px',
    marginTop: 'auto',
    cursor: 'pointer',
    alignSelf: 'flex-start'
  };

  const readMoreTextStyle = {
    fontSize: '14px',
    color: '#a8b2d1'
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
    backgroundColor: '#0b1a2c',
    border: '1px solid rgba(100,255,218,0.2)',
    borderRadius: '12px',
    width: 'min(720px, 92vw)',
    maxHeight: '80vh',
    overflowY: 'auto',
    color: '#e5e7eb',
    boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
  };

  const modalHeaderStyle = {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(100,255,218,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const modalTitleStyle = {
    margin: 0,
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '22px',
    letterSpacing: '0.04em'
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
    background: 'transparent',
    border: '1px solid rgba(100,255,218,0.4)',
    color: '#e5e7eb',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer'
  };

  const bookButtonStyle = {
    backgroundColor: '#64ffda',
    border: '1px solid #64ffda',
    color: '#0b1a2c',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    textDecoration: 'none'
  };

  // Services data
  const [modalService, setModalService] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const aboutImages = [bandGigs, paradeEvents, musicWorkshop, musicArrangement, instrumentRentals];

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
        'Work with schools, LGUs, and organizations to co-host music-driven initiatives, workshops, and parades that strengthen community spirit.'
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
}, []);

const handleLogin = (userData) => {
  // For the predefined admin, we don't need to check localStorage
  if (userData.email === ADMIN_CREDENTIALS.email) {
    setUser(userData);
    localStorage.setItem('davaoBlueEaglesUser', JSON.stringify(userData));
    setCurrentView('dashboard');
    return;
  }
  
  // For regular users, check if they're blocked
  const storedUsers = JSON.parse(localStorage.getItem('davaoBlueEaglesUsers') || '[]');
  const userFromStorage = storedUsers.find(user => user.email === userData.email);
  
  if (userFromStorage && userFromStorage.isBlocked) {
    alert('Your account has been blocked. Please contact administrator.');
    return;
  }
  
  const userWithRole = {
    ...userData,
    role: userFromStorage?.role || 'user',
    isBlocked: userFromStorage?.isBlocked || false
  };
  
  setUser(userWithRole);
  localStorage.setItem('davaoBlueEaglesUser', JSON.stringify(userWithRole));
  setCurrentView('dashboard');
};

const handleLogout = () => {
  setUser(null);
  localStorage.removeItem('davaoBlueEaglesUser');
  setShowUserMenu(false);
};

const handleShowLogin = () => {
  setCurrentView('login');
};

const handleBackToHome = () => {
  setCurrentView('home');
};

const handleShowSignup = () => {
  setCurrentView('signup');
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
  setCurrentView('dashboard');
};

const handleSwitchToLogin = () => {
  setCurrentView('login');
};

const handleSwitchToSignup = () => {
  setCurrentView('signup');
};

return (
  <>
    {/* Login view */}
    {currentView === 'login' && (
      <Login onBack={handleBackToHome} onLogin={handleLogin} onSwitchToSignup={handleSwitchToSignup} />
    )}

    {/* Add this after the login view */}
{currentView === 'signup' && (
  <Signup 
    onBack={handleBackToHome} 
    onSignup={handleSignup}
    onSwitchToLogin={handleSwitchToLogin}
  />
)}

{currentView === 'dashboard' && (
  <Dashboard 
    user={user} 
    onBackToHome={() => setCurrentView('home')} 
  />
)}




    
    {/* Home view */}
    {currentView === 'home' && (
      <div style={containerStyle}>
        <nav style={navStyle}>
          {/* Logo Section */}
          <div style={logoStyle}>
            <h1 style={logoMainStyle}>DAVAO</h1>
            <p style={logoSubStyle}>BLUE EAGLES</p>
          </div>

          {/* Navigation Links */}
          <ul style={ulStyle}>
            <li>
              <a 
                href="#home" 
                style={linkStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="#services" 
                style={linkStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Services
              </a>
            </li>
            <li>
              <a 
                href="#about" 
                style={linkStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                About Us
              </a>
            </li>
            <li>
              <a 
                href="#contact" 
                style={linkStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Contact
              </a>
            </li>
          </ul>

          {/* Updated Buttons Section with Authentication */}
          <div style={buttonContainerStyle}>
            {user ? (
              // Logged in state
              <div style={{ position: 'relative' }}>
                <button 
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(100, 255, 218, 0.3)',
                    color: '#e5e7eb',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(100, 255, 218, 0.1)';
                    e.target.style.borderColor = 'rgba(100, 255, 218, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = 'rgba(100, 255, 218, 0.3)';
                  }}
                >
                  👤 {user.firstName || user.email.split('@')[0]} ▼
                </button>
                
                
                {showUserMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    backgroundColor: 'rgba(10, 25, 47, 0.95)',
                    border: '1px solid rgba(100, 255, 218, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 0',
                    minWidth: '180px',
                    marginTop: '4px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <a href="#profile" style={{ 
                      display: 'block', 
                      padding: '12px 16px', 
                      color: '#e5e7eb', 
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(100, 255, 218, 0.1)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >My Profile</a>
                    <a href="#bookings" style={{ 
                      display: 'block', 
                      padding: '12px 16px', 
                      color: '#e5e7eb', 
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(100, 255, 218, 0.1)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >My Bookings</a>
                    
                    {/* Only show User Management for admins */}
                    {user.role === 'admin' && (
                      <a href="#user-management" style={{ 
                        display: 'block', 
                        padding: '12px 16px', 
                        color: '#e5e7eb', 
                        textDecoration: 'none',
                        fontSize: '14px',
                        transition: 'background-color 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(100, 255, 218, 0.1)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >User Management</a>
                    )}
                    
                    <hr style={{ 
                      margin: '8px 0', 
                      border: 'none', 
                      borderTop: '1px solid rgba(100, 255, 218, 0.2)' 
                    }} />
                    <button 
                      onClick={handleLogout}
                      style={{ 
                        display: 'block', 
                        width: '100%', 
                        padding: '12px 16px', 
                        color: '#e5e7eb', 
                        background: 'none', 
                        border: 'none', 
                        textAlign: 'left', 
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 99, 99, 0.1)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Not logged in state
              <>
                <button 
                  onClick={handleShowLogin}
                  style={loginButtonStyle}
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                >
                  Login
                </button>
                <button 
                  onClick={handleShowSignup}
                  style={signUpButtonStyle}
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section id="home" style={heroSectionStyle}>
          <div style={heroContentStyle}>
            <h2 style={taglineStyle}>CIRVA A LA GENTE POR LA MUSICA</h2>
            <p style={subTaglineStyle}>Serve the People through Music.</p>
            <button 
              onClick={handleShowSignup}
              style={signUpButtonStyle}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              Register Now!
            </button>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" style={servicesSectionStyle}>
          <div style={servicesContainerStyle}>
            <div style={servicesHeaderWrapStyle}>
              <div>
                <div style={sectionEyebrowStyle}>What we offer</div>
                <h3 style={servicesHeaderStyle}>Our Services</h3>
              </div>
              <p style={servicesSubTextStyle}>From parades and corporate shows to workshops and rentals—we tailor each service to your event with professional coordination and musical excellence.</p>
            </div>

            {/* Two-row layout: 3 on top, 2 centered below */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '20px' }}>
              {services.slice(0, 3).map((service) => (
                <div
                  key={service.title}
                  style={cardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 14px 30px rgba(0,0,0,0.35)';
                    e.currentTarget.style.borderColor = 'rgba(100, 255, 218, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(100, 255, 218, 0.2)';
                  }}
                >
                  <div
                    style={{
                      ...cardImageStyle,
                      backgroundImage: `url(${service.img})`
                    }}
                  />
                  <div style={cardBodyStyle}>
                    <h4 style={cardTitleStyle}>{service.title}</h4>
                    <a
                      href="#services"
                      style={readMoreStyle}
                      onClick={(e) => {
                        e.preventDefault();
                        setModalService(service);
                      }}
                    >
                      Read more →
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px', maxWidth: '800px', margin: '20px auto 0' }}>
              {services.slice(3).map((service) => (
                <div
                  key={service.title}
                  style={cardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 14px 30px rgba(0,0,0,0.35)';
                    e.currentTarget.style.borderColor = 'rgba(100, 255, 218, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(100, 255, 218, 0.2)';
                  }}
                >
                  <div
                    style={{
                      ...cardImageStyle,
                      backgroundImage: `url(${service.img})`
                    }}
                  />
                  <div style={cardBodyStyle}>
                    <h4 style={cardTitleStyle}>{service.title}</h4>
                    <a
                      href="#services"
                      style={readMoreStyle}
                      onClick={(e) => {
                        e.preventDefault();
                        setModalService(service);
                      }}
                    >
                      Read more →
                    </a>
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
                <div style={sectionEyebrowStyle}>Who we are</div>
                <h3 style={aboutHeaderStyle}>About Us</h3>
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
                <div style={sectionEyebrowStyle}>Get in touch</div>
                <h3 style={servicesHeaderStyle}>Contact Us</h3>
              </div>
              <p style={servicesSubTextStyle}>
                Ready to bring the Davao Blue Eagles Marching Band to your event? Get in touch with us for bookings, inquiries, or collaborations.
              </p>
            </div>

            <div style={contactGridStyle}>
              {/* Contact Information */}
              <div style={contactInfoCardStyle}>
                <h4 style={contactCardTitleStyle}>Get In Touch</h4>
                <div style={contactInfoListStyle}>
                  <div style={contactInfoItemStyle}>
                    <div style={contactIconStyle}>📧</div>
                    <div>
                      <h5 style={contactLabelStyle}>Email</h5>
                      <p style={contactValueStyle}>dbe.official@example.com</p>
                    </div>
                  </div>
                  <div style={contactInfoItemStyle}>
                    <div style={contactIconStyle}>📱</div>
                    <div>
                      <h5 style={contactLabelStyle}>Phone</h5>
                      <p style={contactValueStyle}>+63 900 000 0000</p>
                    </div>
                  </div>
                  <div style={contactInfoItemStyle}>
                    <div style={contactIconStyle}>📍</div>
                    <div>
                      <h5 style={contactLabelStyle}>Location</h5>
                      <p style={contactValueStyle}>Davao City, Philippines</p>
                    </div>
                  </div>
                  <div style={contactInfoItemStyle}>
                    <div style={contactIconStyle}>⏰</div>
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

        {/* Modal */}
        {modalService && (
          <div style={modalOverlayStyle} onClick={() => setModalService(null)}>
            <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
              <div style={modalHeaderStyle}>
                <h4 style={modalTitleStyle}>{modalService.title}</h4>
                <button style={closeButtonStyle} onClick={() => setModalService(null)}>Close</button>
              </div>
              <div style={modalBodyStyle}>
                <p style={readMoreTextStyle}>{modalService.description}</p>
              </div>
              <div style={modalActionsStyle}>
                <a href="#contact" style={bookButtonStyle}>Book Now</a>
              </div>
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
                    <span style={socialIconStyle}>📘</span>
                  </a>
                  <a href="#" style={socialLinkStyle} aria-label="Instagram">
                    <span style={socialIconStyle}>📷</span>
                  </a>
                  <a href="#" style={socialLinkStyle} aria-label="YouTube">
                    <span style={socialIconStyle}>📺</span>
                  </a>
                  <a href="#" style={socialLinkStyle} aria-label="Email">
                    <span style={socialIconStyle}>📧</span>
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
                    <span style={footerContactIconStyle}>📍</span>
                    <span style={footerContactTextStyle}>Davao City, Philippines</span>
                  </div>
                  <div style={footerContactItemStyle}>
                    <span style={footerContactIconStyle}>📧</span>
                    <span style={footerContactTextStyle}>dbe.official@example.com</span>
                  </div>
                  <div style={footerContactItemStyle}>
                    <span style={footerContactIconStyle}>📱</span>
                    <span style={footerContactTextStyle}>+63 900 000 0000</span>
                  </div>
                  <div style={footerContactItemStyle}>
                    <span style={footerContactIconStyle}>⏰</span>
                    <span style={footerContactTextStyle}>Mon-Fri: 9AM-6PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Bottom */}
            <div style={footerBottomStyle}>
              <div style={footerBottomContentStyle}>
                <p style={footerCopyrightStyle}>
                  © 2024 Davao Blue Eagles Marching Band. All rights reserved.
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
