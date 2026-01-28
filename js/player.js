/**
 * player.js
 * Small helper functions for player UX (ad simulation and basic analytics)
 */

/* Simulated pre-roll ad flow for free users:
   - When a video starts, if the user is free, display an ad overlay for X seconds.
   - This is purely UI-level. Replace with a real ad integration in production.
*/

document.addEventListener('play', (e) => {
  // Only handle our mainVideo play events
  const video = e.target;
  if(!video || video.id !== 'mainVideo') return;

  // Fetch subscription info (simple)
  const userRaw = localStorage.getItem('streamly_user');
  const user = userRaw ? JSON.parse(userRaw) : { subscription: 'free' };

  if(user.subscription === 'free'){
    // show simple overlay "ad" for 3 seconds
    const adOverlay = document.createElement('div');
    adOverlay.className = 'ad-overlay';
    adOverlay.style = `
      position:absolute;
      inset:0;
      display:flex;
      align-items:center;
      justify-content:center;
      background:rgba(0,0,0,0.6);
      z-index:30;
      color:white;
      font-weight:600;
      border-radius:10px;
    `;
    adOverlay.textContent = 'Simulated pre-roll ad — skipping in 3s';
    // position relative container
    const wrap = video.closest('.player-wrap');
    wrap.style.position = 'relative';
    wrap.appendChild(adOverlay);
    video.pause();
    setTimeout(()=>{
      adOverlay.remove();
      video.play();
    }, 3000);
  }
}, true);

/* Tracking (very minimal)
   - Save last played video id into watch history is handled in app.js
   - Here you could post analytics events to your analytics API.
*/
