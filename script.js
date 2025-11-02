
// script.js - handles login/register, balance, deposit, and slot spin with sounds
(function(){
  // Utilities
  function el(id){return document.getElementById(id)}
  function $(sel){return document.querySelector(sel)}

  // Local storage keys
  const KEY_USER = 'gacor_user'
  const KEY_BAL = 'gacor_balance'
  const KEY_LAST_CLAIM = 'gacor_last_claim'

  // Initialize if not present
  if(localStorage.getItem(KEY_BAL) === null){
    localStorage.setItem(KEY_BAL, '1000') // default starter balance
  }

  // Update nav info if elements present
  function updateNav(){
    const user = JSON.parse(localStorage.getItem(KEY_USER) || 'null')
    const bal = Number(localStorage.getItem(KEY_BAL) || 0)
    const userEl = document.querySelectorAll('#nav-user')
    const balEl = document.querySelectorAll('#nav-balance')
    userEl.forEach(n=> n.innerText = user ? user.username : '')
    balEl.forEach(n=> n.innerText = 'Rp ' + formatNumber(bal))
    const spinBtn = el('spinBtn')
    if(spinBtn) spinBtn.innerText = 'SPIN (10)'
  }
  function formatNumber(n){ return n.toLocaleString('id-ID') }

  // Register form
  const regForm = el('regForm')
  if(regForm){
    regForm.addEventListener('submit', (e)=>{
      e.preventDefault()
      const username = el('regUser').value.trim()
      const email = el('regEmail').value.trim()
      const pass = el('regPass').value
      if(!username || !email || !pass) return alert('Lengkapi data')
      // save user simple object
      const user = {username,email}
      localStorage.setItem(KEY_USER, JSON.stringify(user))
      // give signup bonus
      const oldBal = Number(localStorage.getItem(KEY_BAL) || 0)
      localStorage.setItem(KEY_BAL, String(oldBal + 1000))
      alert('Pendaftaran berhasil. Saldo +1000 (bonus)')
      window.location.href = 'game.html'
    })
  }

  // Login form
  const loginForm = el('loginForm')
  if(loginForm){
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault()
      const username = el('loginUser').value.trim()
      const pass = el('loginPass').value
      if(!username || !pass) return alert('Lengkapi data')
      // For demo, accept any username/password
      const user = {username}
      localStorage.setItem(KEY_USER, JSON.stringify(user))
      alert('Login sukses')
      window.location.href = 'game.html'
    })
  }

  // Deposit form
  const depositForm = el('depositForm')
  if(depositForm){
    depositForm.addEventListener('submit', (e)=>{
      e.preventDefault()
      const amt = Number(el('depositAmt').value)
      if(!amt || amt<=0) return alert('Masukkan jumlah valid')
      const bal = Number(localStorage.getItem(KEY_BAL) || 0)
      localStorage.setItem(KEY_BAL', String(bal + amt))
      alert('Deposit berhasil +Rp ' + amt.toLocaleString('id-ID'))
      window.location.href = 'game.html'
    })
  }

  // Fix: correct localStorage set (typo) - we'll define function instead and replace above
  function depositAmount(amt){
    const bal = Number(localStorage.getItem(KEY_BAL) || 0)
    localStorage.setItem(KEY_BAL, String(bal + Number(amt)))
    updateNav()
  }

  // If deposit form exists, wire it using depositAmount
  if(depositForm){
    depositForm.addEventListener('submit', (e)=>{
      e.preventDefault()
      const amt = Number(el('depositAmt').value)
      if(!amt || amt<=0) return alert('Masukkan jumlah valid')
      depositAmount(amt)
      alert('Deposit berhasil +Rp ' + amt.toLocaleString('id-ID'))
      window.location.href = 'game.html'
    })
  }

  // Spin logic
  const spinBtn = el('spinBtn')
  const autoBtn = el('autoBtn')
  const resultEl = el('result')
  const reelEls = [el('r1'), el('r2'), el('r3')].filter(Boolean)
  const symbols = ['🍒','🍋','🍊','⭐','🍇','🔔','7️⃣']

  // WebAudio for sounds
  const audioCtx = typeof AudioContext !== 'undefined' ? new AudioContext() : null
  function playTone(freq, duration=0.12, type='sine', when=0){
    if(!audioCtx) return
    const o = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    o.type = type
    o.frequency.value = freq
    o.connect(g)
    g.connect(audioCtx.destination)
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime + when)
    g.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + when + 0.02)
    o.start(audioCtx.currentTime + when)
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + when + duration)
    o.stop(audioCtx.currentTime + when + duration + 0.02)
  }
  function playSpinSound(){ // quick arpeggio
    playTone(200,0.08,'sawtooth',0)
    playTone(300,0.08,'sawtooth',0.06)
    playTone(400,0.08,'sawtooth',0.12)
  }
  function playWinSound(){ // celebratory
    playTone(800,0.18,'sine',0)
    playTone(1000,0.18,'sine',0.12)
    playTone(1200,0.22,'sine',0.26)
  }

  function canSpin(){
    const bal = Number(localStorage.getItem(KEY_BAL) || 0)
    return bal >= 10
  }

  function doSpin(){
    if(!canSpin()){ alert('Saldo tidak cukup. Silakan deposit.'); return }
    // charge
    const bal = Number(localStorage.getItem(KEY_BAL) || 0)
    localStorage.setItem(KEY_BAL, String(bal - 10))
    updateNav()

    // animation: change symbols quickly for 1.5s then stop separately
    const duration = 1500
    const interval = 80
    let elapsed = 0
    const ints = setInterval(()=>{
      reelEls.forEach(r=>{
        r.innerText = symbols[Math.floor(Math.random()*symbols.length)]
      })
      playSpinSound()
      elapsed += interval
      if(elapsed >= duration){
        clearInterval(ints)
        // stop reels with final result (simulate slight offsets)
        const final = [symbols[Math.floor(Math.random()*symbols.length)],
                      symbols[Math.floor(Math.random()*symbols.length)],
                      symbols[Math.floor(Math.random()*symbols.length)]]
        reelEls[0].innerText = final[0]
        setTimeout(()=> reelEls[1].innerText = final[1], 120)
        setTimeout(()=> reelEls[2].innerText = final[2], 260)
        // Determine win
        if(final[0] === final[1] && final[1] === final[2]){
          // jackpot
          const prize = 500
          depositAmount(prize)
          resultEl.innerText = 'JACKPOT! +Rp ' + prize.toLocaleString('id-ID')
          playWinSound()
        } else if(final[0] === final[1] || final[1] === final[2] || final[0] === final[2]){
          const prize = 50
          depositAmount(prize)
          resultEl.innerText = 'MENANG! +Rp ' + prize.toLocaleString('id-ID')
          playWinSound()
        } else {
          resultEl.innerText = 'Coba lagi...'
        }
      }
    }, interval)
  }

  if(spinBtn){
    spinBtn.addEventListener('click', ()=>{
      // resume audio context on user gesture
      if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume()
      doSpin()
    })
  }

  if(autoBtn){
    autoBtn.addEventListener('click', ()=>{
      let runs = 5
      const run = ()=> {
        if(runs<=0) return
        if(!canSpin()) { alert('Saldo tidak cukup untuk auto'); return }
        doSpin()
        runs--
        setTimeout(run, 1800)
      }
      run()
    })
  }

  // Auto-update nav on load
  updateNav()

  // If on pages, wire logout link? provide quick logout on double-click brand
  const brand = document.querySelectorAll('.brand')
  brand.forEach(b=> b.addEventListener('dblclick', ()=>{
    localStorage.removeItem(KEY_USER)
    alert('Logout (demo)')
    updateNav()
  }))

  // Claim daily bonus on promo page
  if(window.location.pathname.endsWith('promo.html')){
    const btn = document.createElement('button')
    btn.className='btn'
    btn.innerText = 'Klaim Bonus Harian (+200)'
    btn.onclick = ()=>{
      const last = Number(localStorage.getItem(KEY_LAST_CLAIM) || 0)
      const now = Date.now()
      if(now - last < 24*3600*1000) return alert('Sudah klaim hari ini. Tunggu 24 jam.')
      depositAmount(200)
      localStorage.setItem(KEY_LAST_CLAIM, String(now))
      alert('Bonus klaim berhasil +200')
    }
    document.querySelector('.form')?.appendChild(btn)
  }

  // Ensure nav updated periodically (when coming from other pages)
  setInterval(updateNav, 800)
})();
