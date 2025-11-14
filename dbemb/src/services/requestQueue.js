import AuthService from './authService';

// In-memory request queue for failed API requests. This keeps pending requests
// while the app is running (not persisted to localStorage) and retries them
// periodically. Designed to respect strict localStorage mode.

const queue = [];
let processing = false;

const processQueue = async () => {
  if (processing) return;
  if (!AuthService.isAuthenticated()) return; // need auth token to post
  if (!queue.length) return;
  processing = true;
  try {
    for (let i = 0; i < queue.length; ) {
      const item = queue[i];
      try {
        const resp = await AuthService.post(item.endpoint, item.payload);
        // call success handler
        try { item.onSuccess && item.onSuccess(resp); } catch (e) { console.warn('onSuccess handler failed', e); }
        // remove item from queue
        queue.splice(i, 1);
      } catch (err) {
        // If auth error, stop processing until re-authenticated
        const msg = (err && err.message) ? err.message.toLowerCase() : '';
        if (msg.includes('session expired') || msg.includes('no authentication')) {
          // leave in queue and break to wait for login
          break;
        }
        // otherwise move to next and retry later
        console.warn('RequestQueue: failed to send queued request, will retry later', err);
        i++;
      }
    }
  } finally {
    processing = false;
  }
};

// process every 20s while app runs
setInterval(() => {
  try { processQueue(); } catch (e) { console.error('RequestQueue processing error', e); }
}, 20000);

const addRequest = (opts) => {
  const item = {
    id: opts.id || `q-${Date.now()}`,
    endpoint: opts.endpoint,
    payload: opts.payload,
    meta: opts.meta || null,
    onSuccess: opts.onSuccess,
    onFailure: opts.onFailure
  };

  // push to queue
  queue.push(item);

  // try immediate processing
  processQueue().catch(e => console.warn('RequestQueue immediate process failed', e));

  return item.id;
};

const getQueue = () => queue.slice();

export default {
  addRequest,
  getQueue
};
