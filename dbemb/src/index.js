import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Simple hash routing for /#/booking and /#/instrument-booking
const BookStandalone = React.lazy(() => import('./Components/Booking'));
const InstrumentBookStandalone = React.lazy(() => import('./Components/InstrumentBooking'));
const InstrumentBorrowStandalone = React.lazy(() => import('./Components/InstrumentBorrowing'));

const root = ReactDOM.createRoot(document.getElementById('root'));
const HashRouter = () => {
  const [route, setRoute] = React.useState(window.location.hash);
  React.useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  if (route === '#/booking') {
    return (
      <React.Suspense fallback={<div />}> 
        <BookStandalone />
      </React.Suspense>
    );
  }
  if (route === '#/instrument-booking') {
    return (
      <React.Suspense fallback={<div />}> 
        <InstrumentBookStandalone />
      </React.Suspense>
    );
  }
  if (route === '#/instrument-borrowing') {
    return (
      <React.Suspense fallback={<div />}>
        <InstrumentBorrowStandalone />
      </React.Suspense>
    );
  }
  return <App />;
};

root.render(
  <React.StrictMode>
    <HashRouter />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
