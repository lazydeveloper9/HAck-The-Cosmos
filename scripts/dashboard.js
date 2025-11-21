// Dashboard live charts and mock data updater
const locations = {
  Raipur: { baseVisibility: 70, light: 40, clouds: 20 },
  Bilaspur: { baseVisibility: 60, light: 55, clouds: 30 },
  Jagdalpur: { baseVisibility: 85, light: 20, clouds: 10 },
  Durg: { baseVisibility: 65, light: 50, clouds: 25 },
  Ambikapur: { baseVisibility: 75, light: 30, clouds: 15 },
};

function randOffset(range) { return (Math.random() - 0.5) * range; }

function formatScore(v){ return Math.max(0, Math.min(100, Math.round(v))) + "%"; }

// Wait for DOM
window.addEventListener('load', () => {
  const locSelect = document.getElementById('locationSelect');
  const starScoreEl = document.getElementById('starScore');
  const cloudScoreEl = document.getElementById('cloudScore');
  const lightScoreEl = document.getElementById('lightScore');
  const suggestionText = document.getElementById('suggestionText');

  // create charts if canvas exists
  const lineCtx = document.getElementById('lineChart')?.getContext('2d');
  const barCtx = document.getElementById('barChart')?.getContext('2d');

  // Time labels
  const labels = Array.from({length:12}, (_,i)=>{
    const d = new Date(Date.now() - (11-i)*5*60*1000);
    return d.getHours().toString().padStart(2,'0')+ ':' + d.getMinutes().toString().padStart(2,'0');
  });

  const baseData = { labels, datasets: [] };

  const lineChart = lineCtx ? new Chart(lineCtx, {
    type: 'line',
    data: { labels: [...labels], datasets: [{ label: 'Star Visibility', data: Array(12).fill(null), borderColor: '#ffd54f', backgroundColor:'rgba(255,213,79,0.12)', tension:0.3 }] },
    options: { responsive:true, maintainAspectRatio:false, scales:{ y:{ min:0, max:100 } } }
  }) : null;

  const barChart = barCtx ? new Chart(barCtx, {
    type: 'bar',
    data: { labels: ['Visibility','Clouds','Light Pollution'], datasets: [{ label:'Now', data:[0,0,0], backgroundColor:['#81c784','#64b5f6','#e57373'] }] },
    options: { responsive:true, maintainAspectRatio:false, scales:{ y:{ min:0, max:100 } } }
  }) : null;

  function computeFor(loc){
    const base = locations[loc] || locations.Raipur;
    const clouds = Math.max(0, Math.min(100, base.clouds + randOffset(25)));
    const light = Math.max(0, Math.min(100, base.light + randOffset(30)));
    // star visibility decreases with clouds and light
    const visibility = Math.max(0, Math.min(100, base.baseVisibility - clouds*0.6 - light*0.4 + randOffset(12)));
    return { visibility: Math.round(visibility), clouds: Math.round(clouds), light: Math.round(light) };
  }

  function updateUI(loc){
    const data = computeFor(loc);
    if(starScoreEl) starScoreEl.textContent = formatScore(data.visibility);
    if(cloudScoreEl) cloudScoreEl.textContent = formatScore(data.clouds);
    if(lightScoreEl) lightScoreEl.textContent = formatScore(data.light);
    if(suggestionText){
      let suggestion = '';
      if(data.visibility > 75) suggestion = 'Excellent — ideal for deep-sky observation. Use a wide-field scope.';
      else if(data.visibility > 55) suggestion = 'Good — pick areas away from streetlights and wait for peak hours.';
      else if(data.visibility > 35) suggestion = 'Fair — target bright objects like planets and the Moon.';
      else suggestion = 'Poor — postpone if possible or visit an even darker site.';
      suggestionText.textContent = suggestion;
    }

    // push to charts
    if(lineChart){
      lineChart.data.labels.push(new Date().getHours().toString().padStart(2,'0') + ':' + new Date().getMinutes().toString().padStart(2,'0'));
      lineChart.data.labels.shift();
      lineChart.data.datasets[0].data.push(data.visibility);
      lineChart.data.datasets[0].data.shift();
      lineChart.update();
    }
    if(barChart){
      barChart.data.datasets[0].data = [data.visibility, data.clouds, data.light];
      barChart.update();
    }
  }

  // initial fill for line chart
  if(lineChart){
    const loc = locSelect?.value || 'Raipur';
    for(let i=0;i<12;i++){
      const v = computeFor(loc).visibility;
      lineChart.data.datasets[0].data[i] = v;
    }
    lineChart.update();
  }

  // initial update
  updateUI(locSelect?.value || 'Raipur');

  // change handler
  locSelect?.addEventListener('change', ()=>{
    updateUI(locSelect.value);
  });

  // live updates every 8 seconds
  setInterval(()=>{
    updateUI(locSelect?.value || 'Raipur');
  }, 8000);

});
