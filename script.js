// StarWay - script.js
// All data and logic live here (no backend)

(() => {
  // --- Theme ---
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('starway-theme') || 'light';
  function applyTheme(t){
    if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');themeToggle.textContent='☀️';themeToggle.setAttribute('aria-pressed','true')}else{document.documentElement.removeAttribute('data-theme');themeToggle.textContent='🌙';themeToggle.setAttribute('aria-pressed','false')}
    localStorage.setItem('starway-theme',t);
  }
  applyTheme(savedTheme);
  themeToggle.addEventListener('click',()=>applyTheme((localStorage.getItem('starway-theme')==='dark') ? 'light' : 'dark'));

  // --- Navigation / Tabs ---
  const navButtons = document.querySelectorAll('.nav-btn');
  const panels = document.querySelectorAll('.tab-panel');
  function showTab(id){
    panels.forEach(p=>p.id===id? p.classList.add('active'): p.classList.remove('active'));
    navButtons.forEach(b=>b.dataset.tab===id? b.classList.add('active'): b.classList.remove('active'));
  }
  navButtons.forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
  document.querySelectorAll('[data-tabgo]').forEach(btn=>btn.addEventListener('click', ()=>showTab(btn.dataset.tabgo)));

  // --- Sidebar collapse ---
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const savedSidebar = localStorage.getItem('starway-sidebar') || 'open';
  function applySidebar(state){
    if(state==='closed'){sidebar.classList.add('collapsed'); sidebarToggle.setAttribute('aria-expanded','false')} else {sidebar.classList.remove('collapsed'); sidebarToggle.setAttribute('aria-expanded','true')}
    localStorage.setItem('starway-sidebar', state);
  }
  applySidebar(savedSidebar);
  sidebarToggle.addEventListener('click', ()=> applySidebar(sidebar.classList.contains('collapsed') ? 'open' : 'closed'));

  // --- Personality Quiz ---
  const questionsEl = document.getElementById('questions');
  const quizResults = document.getElementById('quizResults');
  const creativeBar = document.getElementById('creativeBar');
  const logicalBar = document.getElementById('logicalBar');
  const analyticalBar = document.getElementById('analyticalBar');
  const creativePct = document.getElementById('creativePct');
  const logicalPct = document.getElementById('logicalPct');
  const analyticalPct = document.getElementById('analyticalPct');
  const careerSuggestions = document.getElementById('careerSuggestions');

  const quizQuestions = [
    {q:'I enjoy writing, drawing or designing.',k:'creative'},
    {q:'I like solving puzzles and coding.',k:'logical'},
    {q:'I enjoy analyzing data and research.',k:'analytical'},
    {q:'I prefer brainstorming new ideas over strict routines.',k:'creative'},
    {q:'I like math and structured problem solving.',k:'logical'},
    {q:'I enjoy experiments and careful evaluation.',k:'analytical'},
    {q:'I like presenting ideas visually.',k:'creative'},
    {q:'I enjoy algorithms or logical games.',k:'logical'},
    {q:'I prefer interpreting results and trends.',k:'analytical'}
  ];

  function renderQuiz(){
    questionsEl.innerHTML='';
    quizQuestions.forEach((item,i)=>{
      const div = document.createElement('div'); div.className='question';
      div.innerHTML = `<label>${i+1}. ${item.q}</label>
      <div class="options">
        <label><input type="radio" name="q${i}" value="2"> Strongly agree</label>
        <label><input type="radio" name="q${i}" value="1"> Agree</label>
        <label><input type="radio" name="q${i}" value="0"> Neutral/Disagree</label>
      </div>`;
      questionsEl.appendChild(div);
    });
  }
  renderQuiz();

  function computeResults(){
    const totals = {creative:0,logical:0,analytical:0};
    let answered=0;
    quizQuestions.forEach((item,i)=>{
      const val = document.querySelector(`input[name="q${i}"]:checked`);
      if(val){
        answered++; totals[item.k]+=Number(val.value);
      }
    });
    if(answered===0) return null;
    // Convert to percentage out of max possible
    const maxPerCategory = 2 * quizQuestions.filter(q=>q.k==='creative').length; // each question max 2
    const creativePctVal = Math.round((totals.creative / (2*quizQuestions.filter(q=>q.k==='creative').length)) * 100);
    const logicalPctVal = Math.round((totals.logical / (2*quizQuestions.filter(q=>q.k==='logical').length)) * 100);
    const analyticalPctVal = Math.round((totals.analytical / (2*quizQuestions.filter(q=>q.k==='analytical').length)) * 100);
    return {creative:creativePctVal,logical:logicalPctVal,analytical:analyticalPctVal};
  }

  // Store results globally for download
  let quizResultsData = {};

  document.getElementById('submitQuiz').addEventListener('click', ()=>{
    const res = computeResults();
    if(!res){alert('Please answer at least one question.');return}
    creativeBar.value=res.creative; logicalBar.value=res.logical; analyticalBar.value=res.analytical;
    creativePct.textContent = res.creative + '%'; logicalPct.textContent = res.logical + '%'; analyticalPct.textContent = res.analytical + '%';
    
    // Suggest careers (simple logic)
    const arr = Object.entries(res).sort((a,b)=>b[1]-a[1]);
    const top = arr[0][0];
    const suggestions = {
      creative:[
        {title:'Graphic Designer',desc:'Design visual content for digital and print media.'},
        {title:'Content Creator',desc:'Write, create and manage creative content.'},
        {title:'UX Designer',desc:'Create user experiences for digital products.'}
      ],
      logical:[
        {title:'Software Engineer',desc:'Develop software and solve technical problems.'},
        {title:'Data Engineer',desc:'Build systems for data processing.'},
        {title:'Full Stack Developer',desc:'Build complete web applications.'}
      ],
      analytical:[
        {title:'Data Scientist',desc:'Analyze data and build models.'},
        {title:'Research Analyst',desc:'Conduct research and interpret results.'},
        {title:'Business Analyst',desc:'Analyze business processes and improve efficiency.'}
      ]
    };
    
    // Find colleges matching the top career
    const careerToColleges = {
      creative: {courses:['Design','B.Des','Arts']},
      logical: {courses:['B.Tech','M.Tech','BCA']},
      analytical: {courses:['B.Tech','M.Tech','Science']}
    };
    
    const targetCourses = careerToColleges[top]?.courses || [];
    const suggestedCollegesList = colleges.filter(c=> c.courses.some(course=> targetCourses.includes(course))).slice(0,3);
    
    // Store for download
    quizResultsData = {creative:res.creative,logical:res.logical,analytical:res.analytical,topStrength:top,careers:suggestions[top],colleges:suggestedCollegesList};
    
    // Render careers
    let careerHTML = `<h4>Top Strength: ${top.charAt(0).toUpperCase() + top.slice(1)}</h4><div class="careers-list">`;
    suggestions[top].forEach(s=>{careerHTML += `<div class="card"><h4>${s.title}</h4><p class="muted">${s.desc}</p></div>`});
    careerHTML += '</div>';
    
    // Render suggested colleges
    if(suggestedCollegesList.length>0){
      careerHTML += `<h4 style="margin-top:14px;">Suggested Colleges</h4><div class="colleges-list">`;
      suggestedCollegesList.forEach(c=>{careerHTML += `<div class="card"><h4>${c.name}</h4><p class="muted">${c.city}, ${c.state}</p><p>Courses: ${c.courses.join(', ')}</p></div>`});
      careerHTML += '</div>';
    }
    
    careerSuggestions.innerHTML = careerHTML;
    quizResults.hidden=false;
    // Scroll to results
    setTimeout(()=>quizResults.scrollIntoView({behavior:'smooth',block:'start'}),200);
  });

  document.getElementById('resetQuiz').addEventListener('click', ()=>{document.getElementById('quizForm').reset();quizResults.hidden=true;quizResultsData={}});

  // Download result
  document.getElementById('downloadResult').addEventListener('click', ()=>{
    if(!Object.keys(quizResultsData).length){alert('No results to download. Please submit the quiz first.');return}
    const data = quizResultsData;
    let text = `=== STARWAY - PERSONALITY TEST RESULTS ===\n\n`;
    text += `SKILL ASSESSMENT:\n`;
    text += `Creative: ${data.creative}%\n`;
    text += `Logical: ${data.logical}%\n`;
    text += `Analytical: ${data.analytical}%\n\n`;
    text += `TOP STRENGTH: ${data.topStrength.toUpperCase()}\n\n`;
    text += `SUGGESTED CAREERS:\n`;
    data.careers.forEach(c=>{text += `• ${c.title}: ${c.desc}\n`});
    if(data.colleges.length>0){
      text += `\nSUGGESTED COLLEGES:\n`;
      data.colleges.forEach(c=>{text += `• ${c.name} (${c.city}, ${c.state})\n  Courses: ${c.courses.join(', ')}\n`});
    }
    text += `\n\nGenerated on: ${new Date().toLocaleDateString()}\n`;
    text += `Disclaimer: Sample data for educational purposes.\n`;
    const blob = new Blob([text],{type:'text/plain'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='starway-results-'+Date.now()+'.txt'; a.click(); URL.revokeObjectURL(url);
  });

  // --- Sample college data ---
  const colleges = [
    {name:'National Institute of Technology, Delhi',courses:['B.Tech','M.Tech'],state:'Delhi',city:'New Delhi',fees:120000,cutoff:85,rank:5000},
    {name:'St. Xavier College',courses:['Arts','Commerce','BCA'],state:'Karnataka',city:'Bangalore',fees:40000,cutoff:70,rank:50000},
    {name:'Institute of Design & Tech',courses:['Design','B.Des'],state:'Maharashtra',city:'Mumbai',fees:150000,cutoff:75,rank:20000},
    {name:'City Engineering College',courses:['B.Tech'],state:'Tamil Nadu',city:'Chennai',fees:80000,cutoff:60,rank:15000},
    {name:'Rural University',courses:['Arts','Science'],state:'Uttar Pradesh',city:'Lucknow',fees:20000,cutoff:50,rank:100000}
  ];

  // Populate filter options
  const courseSelect = document.getElementById('filterCourse');
  const stateSelect = document.getElementById('filterState');
  const uniqueCourses = new Set(); const uniqueStates = new Set();
  colleges.forEach(c=>{c.courses.forEach(x=>uniqueCourses.add(x)); uniqueStates.add(c.state)});
  Array.from(uniqueCourses).sort().forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;courseSelect.appendChild(o)});
  Array.from(uniqueStates).sort().forEach(s=>{const o=document.createElement('option');o.value=s;o.textContent=s;stateSelect.appendChild(o)});

  function renderColleges(list){
    const container = document.getElementById('collegeResults'); container.innerHTML='';
    if(list.length===0){container.innerHTML='<p class="muted">No colleges found for selected filters.</p>';return}
    list.forEach(c=>{
      const d=document.createElement('div');d.className='card';
      d.innerHTML = `<h4>${c.name}</h4><p class="muted">${c.city}, ${c.state}</p><p>Courses: ${c.courses.join(', ')}</p><p>Fees: ₹${c.fees.toLocaleString()} • Cutoff: ${c.cutoff}% • Rank cutoff: ${c.rank}</p>`;
      container.appendChild(d);
    });
  }
  renderColleges(colleges);

  document.getElementById('applyFilters').addEventListener('click', ()=>{
    const course = courseSelect.value; const state = stateSelect.value; const fees = document.getElementById('filterFees').value; const cutoff = document.getElementById('filterCutoff').value; const rank = Number(document.getElementById('filterRank').value || 0);
    let results = colleges.filter(c=>{
      if(course && !c.courses.includes(course)) return false;
      if(state && c.state!==state) return false;
      if(fees){
        const [min,max]=fees.split('-').map(Number);
        if(!(c.fees>=min && (max?c.fees<=max:true))) return false;
      }
      if(cutoff){
        const [lo,hi] = cutoff.split('-').map(Number);
        if(!(c.cutoff>=lo && (hi?c.cutoff<=hi:true))) return false;
      }
      if(rank && c.rank>rank) return false;
      return true;
    });
    renderColleges(results);
  });

  // --- Scholarships ---
  const scholarships = [
    {name:'Merit Boost Scholarship',amount:50000,eligibility: (p)=>p.income<=250000 && p.age<=25,category:['General','OBC','SC','ST'],link:'#'},
    {name:'Defense Children Aid',amount:100000,eligibility:(p)=>p.defense==='yes',category:['General','OBC','SC','ST'],link:'#'},
    {name:'SC/ST Education Grant',amount:60000,eligibility:(p)=>p.category==='SC' || p.category==='ST',category:['SC','ST'],link:'#'},
    {name:'PWD Support Fund',amount:40000,eligibility:(p)=>p.pwd==='yes',category:['General','OBC','SC','ST'],link:'#'},
    {name:'Low Income Student Aid',amount:30000,eligibility:(p)=>p.income<=100000,category:['General','OBC','SC','ST'],link:'#'}
  ];

  function renderScholarships(list){
    const container = document.getElementById('scholarResults'); container.innerHTML='';
    if(list.length===0){container.innerHTML='<p class="muted">No matching scholarships found.</p>';return}
    list.forEach(s=>{
      const d=document.createElement('div');d.className='card';
      d.innerHTML = `<h4>${s.name}</h4><p>Amount: ₹${s.amount.toLocaleString()}</p><p class="muted">Eligibility: ${s.category.join(', ')}</p><p><a href="${s.link}">Official Link</a></p>`;
      container.appendChild(d);
    });
  }

  document.getElementById('findScholarships').addEventListener('click', ()=>{
    const profile = {age: Number(document.getElementById('age').value||0),category: document.getElementById('category').value,income: Number(document.getElementById('income').value||999999999),pwd: document.getElementById('pwd').value,defense: document.getElementById('defense').value};
    // validation
    if(!profile.age){alert('Please enter your age');return}
    const matched = scholarships.filter(s=> s.eligibility(profile) && s.category.includes(profile.category));
    renderScholarships(matched);
  });

  // --- Help Desk (simple keyword-based assistant) ---
  const responses = [
    {k:['apply','application','process'],r:'For applications, prepare academic transcripts, ID proofs and follow the college portal instructions.'},
    {k:['exam','date','schedule'],r:'Exam dates vary by exam-board. Check official exam websites; typical cycles: JEE/NEET in April-May for mains.'},
    {k:['eligibility','criteria','cutoff'],r:'Eligibility depends on course — typical requirements: minimum % marks and entrance ranks where applicable.'},
    {k:['scholarship','scholarships','fund'],r:'Scholarships often require income proofs and category certificates; check deadlines and apply early.'},
    {k:['default'],r:'I can help with applications, exam dates, scholarships and eligibility. Try keywords like "application process" or "scholarship".'}
  ];

  function askBot(text){
    const t = text.toLowerCase();
    for(const entry of responses){
      if(entry.k.some(k=> t.includes(k))) return entry.r;
    }
    return responses.find(r=>r.k.includes('default')).r;
  }

  const chatWindow = document.getElementById('chatWindow');
  function appendChat(role,msg){
    const d = document.createElement('div'); d.className = role==='user'? 'chat-user':'chat-bot'; d.innerHTML = `<p><strong>${role==='user'?'You':'StarWay'}</strong><br><span class="muted">${msg}</span></p>`; chatWindow.appendChild(d); chatWindow.scrollTop = chatWindow.scrollHeight;
  }
  document.getElementById('askHelp').addEventListener('click', ()=>{
    const q = document.getElementById('helpQuery').value.trim(); if(!q){alert('Enter a question or keyword');return}
    appendChat('user',q);
    const reply = askBot(q);
    setTimeout(()=>appendChat('bot',reply),500);
    document.getElementById('helpQuery').value='';
  });

  // Keyboard: allow Enter in help input
  document.getElementById('helpQuery').addEventListener('keydown',(e)=>{if(e.key==='Enter'){e.preventDefault();document.getElementById('askHelp').click()}});

  // Initial small polish: focusable first panel
  document.querySelector('.tab-panel.active')?.focus();

  // Home dynamic interactions
  // Animate feature cards into view
  const featureCards = document.querySelectorAll('.features article');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); }});
  },{threshold:0.2});
  featureCards.forEach(f=>obs.observe(f));

  // Quick bounce effect on brand card when clicked (only if present)
  const brandCard = document.getElementById('brandCard');
  if(brandCard){
    brandCard.addEventListener('click', ()=>{
      brandCard.animate([{transform:'scale(1)'},{transform:'scale(1.03)'},{transform:'scale(1)'}],{duration:420,easing:'ease-out'});
    });
  }

  // Simple animated counters (example)
  function animateCounters(){
    const counters = document.querySelectorAll('.stat-counter');
    counters.forEach(c=>{
      const to = Number(c.dataset.to||0); let i=0; const step = Math.ceil(to/40);
      const id = setInterval(()=>{ i+=step; if(i>=to){c.textContent=to; clearInterval(id)} else c.textContent=i},20);
    });
  }
  // If homepage visible, animate counters
  if(document.querySelector('#home').classList.contains('active')) animateCounters();

  // Ensure counters re-run when navigating back to home
  navButtons.forEach(btn=>btn.addEventListener('click', ()=>{ if(btn.dataset.tab==='home') setTimeout(animateCounters,240)}));

  // --- Bottom disclaimer card logic ---
  const bottomCard = document.getElementById('bottomCard');
  const closeBottom = document.getElementById('closeBottom');
  const dismissed = localStorage.getItem('starway-bottom-dismissed') === '1';
  if(bottomCard){
    if(dismissed) bottomCard.classList.add('hidden');
    closeBottom.addEventListener('click', ()=>{
      bottomCard.classList.add('hidden'); localStorage.setItem('starway-bottom-dismissed','1');
    });
  }

})();
