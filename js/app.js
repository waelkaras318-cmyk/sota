/**
 * Streamly — app.js
 * Main JavaScript for the frontend-only video platform demo.
 *
 * Responsibilities:
 * - Initialize sample data
 * - Handle user subscription/login simulation (localStorage)
 * - Render home video grid and categories
 * - Handle search and navigation to video page
 * - Upload form (mock)
 * - Subscription plan toggles
 * - Live page access control
 * - Simple AI-like recommendations based on category & watch history
 *
 * Note: All persistence is localStorage. Replace with backend APIs for production.
 */

/* -------------------------
   Utilities & Data Helpers
   ------------------------- */

const LS_KEYS = {
  VIDEOS: 'streamly_videos',
  USER: 'streamly_user',
  WATCH_HISTORY: 'streamly_watch_history',
  LIKES: 'streamly_likes'
};

// Default sample videos (small set). In production replace with real thumbnails and file URLs.
const SAMPLE_VIDEOS = [
  {
    id: 'v1',
    title: 'Amazing Nature — Relaxing 4K',
    desc: 'Beautiful nature footage for relaxation.',
    category: 'Entertainment',
    duration: '3:24',
    thumb: 'assets/thumb1.svg',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  },
  {
    id: 'v2',
    title: 'JavaScript Basics — Quick Guide',
    desc: 'Introduction to JS fundamentals.',
    category: 'Education',
    duration: '7:56',
    thumb: 'assets/thumb2.svg',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  },
  {
    id: 'v3',
    title: 'Epic Music Mix',
    desc: 'A short epic soundtrack mix.',
    category: 'Music',
    duration: '4:50',
    thumb: 'assets/thumb3.svg',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  }
];

// Helper: load or initialize videos
function loadVideos(){
  const raw = localStorage.getItem(LS_KEYS.VIDEOS);
  if(raw) return JSON.parse(raw);
  localStorage.setItem(LS_KEYS.VIDEOS, JSON.stringify(SAMPLE_VIDEOS));
  return SAMPLE_VIDEOS.slice();
}

function saveVideos(videos){
  localStorage.setItem(LS_KEYS.VIDEOS, JSON.stringify(videos));
}

/* -------------------------
   Auth & Subscription (simulated)
   ------------------------- */

function getUser(){
  const raw = localStorage.getItem(LS_KEYS.USER);
  if(!raw) return { loggedIn: false, subscription: 'free' }; // default: free
  return JSON.parse(raw);
}

function setUser(user){
  localStorage.setItem(LS_KEYS.USER, JSON.stringify(user));
}

/* -------------------------
   Watch History & Likes
   ------------------------- */

function addToWatchHistory(videoId){
  const raw = localStorage.getItem(LS_KEYS.WATCH_HISTORY);
  const arr = raw ? JSON.parse(raw) : [];
  arr.push({ id: videoId, at: Date.now() });
  // keep last 50 to avoid unbounded growth
  while(arr.length > 50) arr.shift();
  localStorage.setItem(LS_KEYS.WATCH_HISTORY, JSON.stringify(arr));
}

function getWatchHistory(){
  const raw = localStorage.getItem(LS_KEYS.WATCH_HISTORY);
  return raw ? JSON.parse(raw) : [];
}

function toggleLike(videoId){
  const raw = localStorage.getItem(LS_KEYS.LIKES);
  const set = raw ? new Set(JSON.parse(raw)) : new Set();
  if(set.has(videoId)) set.delete(videoId);
  else set.add(videoId);
  localStorage.setItem(LS_KEYS.LIKES, JSON.stringify(Array.from(set)));
}

function isLiked(videoId){
  const raw = localStorage.getItem(LS_KEYS.LIKES);
  const arr = raw ? JSON.parse(raw) : [];
  return arr.includes(videoId);
}

/* -------------------------
   Rendering: Home / Grid / Categories
   ------------------------- */

function renderCategories(containerId = 'categoriesList'){
  const videos = loadVideos();
  const categories = Array.from(new Set(videos.map(v => v.category))).sort();
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = '';
  categories.forEach(cat => {
    const li = document.createElement('li');
    li.textContent = cat;
    li.onclick = () => {
      // filter grid by category
      renderVideoGrid(videos.filter(v => v.category === cat));
    };
    container.appendChild(li);
  });

  // Add "All" entry
  const liAll = document.createElement('li');
  liAll.textContent = 'All';
  liAll.onclick = () => renderVideoGrid(videos);
  container.prepend(liAll);
}

function renderVideoGrid(videos = null){
  const videoGrid = document.getElementById('videoGrid');
  if(!videoGrid) return;
  const data = videos || loadVideos();
  videoGrid.innerHTML = '';
  if(data.length === 0){
    document.getElementById('noResults').style.display = 'block';
    return;
  } else {
    document.getElementById('noResults').style.display = 'none';
  }

  data.forEach(v => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="thumb" data-id="${v.id}" style="background-image:url('${v.thumb}'); background-size:cover;">
        <div class="duration">${v.duration}</div>
      </div>
      <div style="padding-top:8px;">
        <a href="video.html?id=${v.id}" class="video-link"><strong>${v.title}</strong></a>
        <div class="muted">${v.category}</div>
      </div>
    `;

    // clicking thumbnail navigates to video page
    card.querySelector('.thumb').addEventListener('click', () => {
      location.href = `video.html?id=${v.id}`;
    });

    videoGrid.appendChild(card);
  });
}

/* -------------------------
   Search
   ------------------------- */

function initSearch(){
  const input = document.getElementById('searchInput');
  const btn = document.getElementById('searchBtn');
  if(!input || !btn) return;
  btn.addEventListener('click', () => {
    const q = input.value.trim().toLowerCase();
    const videos = loadVideos().filter(v => v.title.toLowerCase().includes(q) || v.category.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q));
    renderVideoGrid(videos);
  });

  // simple Enter handling
  input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') btn.click();
  });
}

/* -------------------------
   Video Page: load & recommend
   ------------------------- */

function getQueryParam(key){
  return new URLSearchParams(location.search).get(key);
}

// Recommendation algorithm (simple AI-like simulation):
// 1) Recommend videos from same category
// 2) Then recommend based on frequency of watched categories (from watch history)
// Comments show where a real AI API could be called for personalized recommendations.
function getRecommendations(currentVideoId, limit = 6){
  const videos = loadVideos();
  const current = videos.find(v => v.id === currentVideoId);
  let recs = [];

  if(!current){
    // fallback: top videos
    recs = videos.slice(0, limit);
    return recs;
  }

  // same category first
  recs = videos.filter(v => v.id !== currentVideoId && v.category === current.category);

  // fill more based on watch history (most watched categories)
  const history = getWatchHistory();
  const freq = {};
  history.forEach(h => {
    const vid = videos.find(v => v.id === h.id);
    if(vid){
      freq[vid.category] = (freq[vid.category] || 0) + 1;
    }
  });

  const favCategories = Object.keys(freq).sort((a,b)=>freq[b]-freq[a]);
  favCategories.forEach(cat => {
    if(recs.length >= limit) return;
    const more = videos.filter(v => v.category === cat && v.id !== currentVideoId && !recs.includes(v));
    recs.push(...more);
  });

  // finally fill with other videos
  if(recs.length < limit){
    recs.push(...videos.filter(v => v.id !== currentVideoId && !recs.includes(v)));
  }

  return recs.slice(0, limit);
}

function initVideoPage(){
  const videoId = getQueryParam('id') || loadVideos()[0]?.id;
  const videos = loadVideos();
  const video = videos.find(v => v.id === videoId) || videos[0];

  if(!video) return;

  // Set video metadata
  document.getElementById('videoTitle').textContent = video.title;
  document.getElementById('videoDesc').textContent = video.desc;

  const mainVideo = document.getElementById('mainVideo');
  // If user provided a src in the video data, use it
  mainVideo.src = video.src || mainVideo.getAttribute('src');

  // register watch history
  addToWatchHistory(video.id);

  // Like button state
  const likeBtn = document.getElementById('likeBtn');
  const updateLikeState = () => {
    likeBtn.textContent = isLiked(video.id) ? 'Liked' : 'Like';
  };
  updateLikeState();
  likeBtn.onclick = () => {
    toggleLike(video.id);
    updateLikeState();
  };

  // Subscribe toggle (simulated)
  const subscribeToggle = document.getElementById('subscribeToggle');
  subscribeToggle.onclick = () => {
    const user = getUser();
    if(user.subscription === 'free'){
      user.subscription = 'premium';
      alert('You are now premium (simulated). Ads removed. Live access granted.');
    } else {
      user.subscription = 'free';
      alert('You reverted to free plan (simulated). Ads shown.');
    }
    setUser(user);
    renderVideoAd(); // refresh ad display
  };

  // Render recommendations
  const recs = getRecommendations(video.id, 6);
  const recContainer = document.getElementById('recommendedList');
  if(recContainer){
    recContainer.innerHTML = '';
    recs.forEach(r => {
      const div = document.createElement('div');
      div.className = 'recommended-item';
      div.innerHTML = `
        <img src="${r.thumb}" alt="${r.title}">
        <div>
          <a href="video.html?id=${r.id}"><strong>${r.title}</strong></a>
          <div class="muted">${r.duration} • ${r.category}</div>
        </div>
      `;
      recContainer.appendChild(div);
    });
  }

  // Video ads for free users: show placeholder
  renderVideoAd();
}

function renderVideoAd(){
  const user = getUser();
  const adDiv = document.getElementById('videoAd');
  if(!adDiv) return;
  if(user.subscription === 'free'){
    adDiv.style.display = 'block';
  } else {
    adDiv.style.display = 'none';
  }
}

/* -------------------------
   Upload (mocked)
   ------------------------- */

function initUploadForm(){
  const form = document.getElementById('uploadForm');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('uploadTitle').value.trim();
    const desc = document.getElementById('uploadDesc').value.trim();
    const category = document.getElementById('uploadCategory').value;
    const url = document.getElementById('uploadUrl').value.trim();

    // In a real app you would upload the file and get a URL. Here we simulate by saving metadata.
    const videos = loadVideos();
    const id = 'v' + (Date.now());
    const newVideo = {
      id,
      title,
      desc,
      category,
      duration: '0:00',
      thumb: 'assets/placeholder.svg',
      src: url || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
    };
    videos.unshift(newVideo);
    saveVideos(videos);
    // update UI
    document.getElementById('uploadStatus').textContent = 'Upload simulated — video added to library.';
    setTimeout(()=>location.href='index.html', 800);
  });
}

/* -------------------------
   Subscriptions Page
   ------------------------- */

function initSubscriptionsPage(){
  const btnFree = document.getElementById('chooseFree');
  const btnPremium = document.getElementById('choosePremium');
  if(btnFree){
    btnFree.onclick = () => {
      const u = getUser();
      u.subscription = 'free';
      setUser(u);
      alert('Switched to Free plan (simulated).');
    };
  }
  if(btnPremium){
    btnPremium.onclick = () => {
      const u = getUser();
      u.subscription = 'premium';
      setUser(u);
      alert('Upgraded to Premium (simulated).');
    };
  }
}

/* -------------------------
   Live Page
   ------------------------- */

function initLivePage(){
  const wrap = document.getElementById('liveAccess');
  if(!wrap) return;
  const user = getUser();
  if(user.subscription === 'premium'){
    wrap.innerHTML = `
      <h3>Live Stream (Simulated)</h3>
      <p class="muted">You have access because you are a premium user.</p>
      <!-- In production this player would be a real live player / WebRTC embed -->
      <video controls autoplay muted style="width:100%;border-radius:8px;">
        <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
      </video>
    `;
  } else {
    wrap.innerHTML = `
      <h3>Live Stream (Premium Only)</h3>
      <p class="muted">Live streaming is available to Premium subscribers.</p>
      <button id="upgradeNow" class="btn">Become Premium (simulate)</button>
    `;
    document.getElementById('upgradeNow').onclick = () => {
      const u = getUser();
      u.subscription = 'premium';
      setUser(u);
      initLivePage(); // re-render
    };
  }
}

/* -------------------------
   Support / Membership
   ------------------------- */

function initSupportPage(){
  const btn = document.getElementById('supportBtn');
  if(!btn) return;
  btn.onclick = () => {
    alert('Thank you — membership/support simulation received. Implement payment provider here in production.');
  };
}

/* -------------------------
   Global initialization
   ------------------------- */

function initCommonUI(){
  // Wire up login/register mock buttons
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');

  if(loginBtn){
    loginBtn.addEventListener('click', () => {
      const user = getUser();
      user.loggedIn = true;
      setUser(user);
      alert('Logged in (simulated). Account stored in localStorage.');
    });
  }
  if(registerBtn){
    registerBtn.addEventListener('click', () => {
      const user = getUser();
      user.loggedIn = true;
      setUser(user);
      alert('Registered & logged in (simulated).');
    });
  }

  initSearch();
}

/* -------------------------
   Page-specific bootstrapping
   ------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  initCommonUI();
  renderCategories();
  renderVideoGrid();

  // page-specific inits:
  if(document.body.classList.contains('video-page') || location.pathname.endsWith('video.html')){
    // video page
    initVideoPage();
  }

  // Try to init if elements exist (works across pages)
  initUploadForm();
  initSubscriptionsPage();
  initLivePage();
  initSupportPage();
});

/* -------------------------
   Notes on AI and Ads integration:
   - AI: Replace getRecommendations with a call to your recommender service (send watch history, video metadata)
   - Ads: Replace ad-placeholder divs with AdSense/your ad provider scripts.
   - Auth: Current auth is simulated via localStorage. Plug your OAuth / custom auth here.
------------------------- */
