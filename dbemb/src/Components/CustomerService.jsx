import React, { useState } from 'react';
import { FaCommentDots, FaTimes, FaFacebook, FaInstagram, FaTwitter, FaYoutube } from '../icons/fa';

const CustomerService = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'bot',
      message: 'Hello! 👋 Welcome to our customer service. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Quick question suggestions
  const quickQuestions = [
    { text: 'What are your hours?', query: 'hours' },
    { text: 'How to rent an instrument?', query: 'rent' },
    { text: 'Payment methods?', query: 'payment' },
    { text: 'How to book?', query: 'booking' },
    { text: 'Where are you located?', query: 'location' },
    { text: 'Membership benefits?', query: 'membership' }
  ];

  // FAQ and automated responses
  const automatedResponses = {
    'hours': {
      keywords: ['hours', 'open', 'close', 'schedule', 'time'],
      response: 'We are open Monday to Friday, 9:00 AM - 6:00 PM, and Saturday 10:00 AM - 4:00 PM. We are closed on Sundays and holidays.'
    },
    'contact': {
      keywords: ['contact', 'phone', 'email', 'reach', 'call'],
      response: 'You can reach us at:\n📞 Phone: (123) 456-7890\n📧 Email: info@band.com\nOr connect with us on our social media!'
    },
    'rental': {
      keywords: ['rent', 'rental', 'borrow', 'instrument', 'how to rent'],
      response: 'To rent an instrument:\n1. Browse available instruments\n2. Submit a rental request\n3. Wait for admin approval\n4. Receive notification with payment details\n5. Complete payment\n6. Pick up your instrument!\n\nRental rates vary by instrument type.'
    },
    'payment': {
      keywords: ['payment', 'pay', 'invoice', 'price', 'cost'],
      response: 'We accept multiple payment methods:\n💳 Credit/Debit Cards\n💵 Cash\n📱 GCash\n🏦 Bank Transfer\n\nYou can pay online through our payment gateway or in person.'
    },
    'booking': {
      keywords: ['book', 'booking', 'reserve', 'appointment', 'schedule'],
      response: 'To book our services:\n1. Go to Booking section\n2. Fill in your details and preferred date\n3. Submit your request\n4. Admin will review and approve\n5. You\'ll receive a notification\n\nBooking fees apply based on the service type.'
    },
    'membership': {
      keywords: ['member', 'membership', 'join', 'sign up'],
      response: 'Join our membership program for exclusive benefits!\n✨ Priority booking\n💰 Discounted rates\n🎵 Access to exclusive events\n\nSign up through the Member Signup page!'
    },
    'location': {
      keywords: ['location', 'address', 'where', 'find you'],
      response: 'We are located at:\nMatina Crossing, Davao City\n\nLook for our building beside Matina Central Elementary School!'
    },
    'help': {
      keywords: ['help', 'support', 'assistance', 'problem', 'issue'],
      response: 'I can help you with:\n- Instrument rentals\n- Bookings\n- Payments\n- Hours & location\n- Membership\n- Contact information\n\nJust type your question!'
    }
  };

  const getAutomatedResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    // Check each response category
    for (const [key, data] of Object.entries(automatedResponses)) {
      if (data.keywords.some(keyword => lowerInput.includes(keyword))) {
        return data.response;
      }
    }
    
    // Default response if no match
    return 'I\'m not sure about that. Here are some topics I can help with:\n\n- Instrument rentals\n- Bookings\n- Payments\n- Hours & location\n- Membership\n- Contact information\n\nOr you can contact our team directly:\n📞 (123) 456-7890\n📧 info@band.com';
  };

  const handleSendMessage = (messageText = null) => {
    const textToSend = messageText || userInput;
    if (!textToSend.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      message: textToSend,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);

    // Generate automated response
    setTimeout(() => {
      const botResponse = {
        type: 'bot',
        message: getAutomatedResponse(textToSend),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 500);

    setUserInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Social media links
  const socialLinks = [
    { name: 'Facebook', icon: FaFacebook, url: 'https://www.facebook.com/DBEMB2012', color: '#1877f2' },
    { name: 'Instagram', icon: FaInstagram, url: 'https://www.instagram.com/dbemb.est2012/', color: '#e4405f' },
    { name: 'Twitter', icon: FaTwitter, url: 'https://twitter.com/yourband', color: '#1da1f2' },
    { name: 'YouTube', icon: FaYoutube, url: 'https://www.youtube.com/@davaoblueeaglemarchingband7819', color: '#ff0000' }
  ];

  return (
    <>
      {/* Floating Button */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px'
      }}>
        {/* Social Media Links */}
        {showSocialLinks && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'slideIn 0.3s ease-out'
          }}>
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                title={social.name}
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  backgroundColor: social.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '20px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                  animation: `slideIn 0.3s ease-out ${index * 0.1}s backwards`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
              >
                <social.icon />
              </a>
            ))}
          </div>
        )}

        {/* Main Chat Button */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowSocialLinks(false);
          }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#0ea5e9',
            border: 'none',
            color: '#fff',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(14, 165, 233, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.backgroundColor = '#0284c7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#0ea5e9';
          }}
        >
          {isOpen ? <FaTimes /> : <FaCommentDots />}
        </button>

        {/* Social Media Toggle Button */}
        <button
          onClick={() => setShowSocialLinks(!showSocialLinks)}
          style={{
            padding: '8px 12px',
            borderRadius: '20px',
            backgroundColor: '#6366f1',
            border: 'none',
            color: '#fff',
            fontSize: '12px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#4f46e5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6366f1';
          }}
        >
          Follow Us
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          width: '360px',
          maxWidth: 'calc(100vw - 40px)',
          height: '500px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            padding: '16px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaCommentDots style={{ fontSize: '24px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>Customer Service</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Always here to help!</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            paddingBottom: '8px',
            backgroundColor: '#f9fafb',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            minHeight: 0
          }}>
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: msg.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: msg.type === 'user' ? '#0ea5e9' : '#fff',
                  color: msg.type === 'user' ? '#fff' : '#374151',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-line',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  wordWrap: 'break-word'
                }}>
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
            
          {/* Quick Question Suggestions - Always Visible */}
          <div style={{
            padding: '8px 16px 10px 16px',
            backgroundColor: '#fff',
            borderTop: '1px solid #e5e7eb',
            flexShrink: 0
          }}>
            <div style={{
              fontSize: '11px',
              color: '#6b7280',
              fontWeight: 500,
              marginBottom: '6px'
            }}>
              Quick Questions
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              {quickQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(q.query)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#374151',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.2s ease',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span>{q.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div style={{
            padding: '12px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#fff',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '20px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#0ea5e9'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
            />
            <button
              onClick={handleSendMessage}
              disabled={!userInput.trim()}
              style={{
                padding: '10px 20px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: userInput.trim() ? '#0ea5e9' : '#d1d5db',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: userInput.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (userInput.trim()) e.currentTarget.style.backgroundColor = '#0284c7';
              }}
              onMouseLeave={(e) => {
                if (userInput.trim()) e.currentTarget.style.backgroundColor = '#0ea5e9';
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default CustomerService;
