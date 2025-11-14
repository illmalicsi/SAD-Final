// Centralized pricing configuration for bookings

const bandPackages = {
  '20-players-with': { label: '20 Players (with Food & Transport)', price: 15000 },
  '20-players-without': { label: '20 Players (without Food & Transport)', price: 20000 },
  '30-players-with': { label: '30 Players (with Food & Transport)', price: 25000 },
  '30-players-without': { label: '30 Players (without Food & Transport)', price: 30000 },
  'full-band': { label: 'Full Band', price: 35000 },
};

const instruments = {
  'trumpet': { label: 'Trumpet', pricePerDay: 500 },
  'trombone': { label: 'Trombone', pricePerDay: 500 },
  'french-horn': { label: 'French Horn', pricePerDay: 500 },
  'tuba': { label: 'Tuba', pricePerDay: 500 },
  'flute': { label: 'Flute', pricePerDay: 500 },
  'clarinet': { label: 'Clarinet', pricePerDay: 500 },
  'saxophone': { label: 'Saxophone', pricePerDay: 500 },
  'yamaha-snare': { label: 'Yamaha Snare Drum', pricePerDay: 1000 },
  'pearl-snare': { label: 'Pearl Snare Drum', pricePerDay: 1000 },
  'bass-drum': { label: 'Bass Drum', pricePerDay: 500 },
  'cymbals': { label: 'Cymbals', pricePerDay: 500 },
};

const musicArrangementBasePrice = 3000;
const workshopBasePrice = 5000;

// Helper to compute price from booking details
function computeAmountForBooking(booking) {
  const service = booking?.service;
  const notes = booking?.notes || '';
  if (service === 'Band Gigs' || service === 'Parade Events') {
    const m = notes.match(/Package:\s*([^\n]+)/i);
    const label = m ? m[1].trim() : null;
    for (const key in bandPackages) {
      if (bandPackages[key].label === label) return bandPackages[key].price;
    }
    return 0;
  }
  if (service === 'Instrument Rentals') {
    const mi = notes.match(/Instrument:\s*([^\n]+)/i);
    const instrumentLabel = mi ? mi[1].trim() : null;
    const mdays = notes.match(/\((\d+)\s*days?\)/i);
    let days = mdays ? parseInt(mdays[1], 10) : 0;
    for (const key in instruments) {
      if (instruments[key].label === instrumentLabel && days > 0) {
        return instruments[key].pricePerDay * days;
      }
    }
    return 0;
  }
  if (service === 'Music Arrangement') {
    const m = notes.match(/Number\s+of\s+Pieces:\s*(\d+)/i);
    const pieces = m ? parseInt(m[1], 10) : 1;
    return musicArrangementBasePrice * pieces;
  }
  if (service === 'Music Workshops') {
    return workshopBasePrice;
  }
  return 0;
}

module.exports = {
  bandPackages,
  instruments,
  musicArrangementBasePrice,
  workshopBasePrice,
  computeAmountForBooking,
};
