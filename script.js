// Apps Script 
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzMQTEs2D-cQufenvEhCht_CtNMdF3tm7ezcelKGOtJm1ehIfeiCdt2TPUKnqJr2XvagA/exec';

let passengerID = generateID();

// Set initial screen conditions
document.getElementById('passID').textContent = passengerID;
document.getElementById('headerDate').textContent = new Date().toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
});

function generateID() {
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `PASS-${rnd}`;
}

// Form Submission Event Flow
document.getElementById('boatForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const name = document.getElementById('passengerName').value.trim();
  const weight = parseFloat(document.getElementById('weight').value);
  const height = parseFloat(document.getElementById('height').value);
  
  let status = "Fit to Board";
  let bannerColor = "#1a3a5c"; // Blue matching your customs colors
  let subText = "Safety Clearance Granted";

  // CONTROL STRUCTURE: Structural Safety Rule Evaluation
  // Max limits: 120kg or 200cm
  if (weight > 120 || height > 200) {
    status = "Not Fit";
    bannerColor = "#c62828"; // Emergency Red color block
    subText = "Exceeds standard individual safety structural limits.";
  }

  const passengerData = {
    passID: passengerID,
    name: name,
    weight: weight,
    height: height,
    status: status
  };

  // Display calculations onto the receipt layout immediately
  showResult(passengerData, bannerColor, subText);
  
  // Send data over to Google Sheets
  syncToSheet(passengerData);
});

function showResult(data, bannerColor, subText) {
  document.getElementById('resultBanner').style.backgroundColor = bannerColor;
  document.getElementById('resultRef').textContent = data.passID;
  document.getElementById('resultTitle').textContent = data.status;
  document.getElementById('resultSub').textContent = subText;
  
  document.getElementById('rName').textContent = data.name;
  document.getElementById('rWeight').textContent = data.weight + " kg";
  document.getElementById('rHeight').textContent = data.height + " cm";
  document.getElementById('rStatus').textContent = data.status;
  
  const card = document.getElementById('resultCard');
  card.classList.add('visible');
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function syncToSheet(data) {
  showStatus('Syncing manifest with harbor registry...', 'info');

  const urlEncodedData = Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');

  fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: urlEncodedData,
    mode: 'no-cors'
  })
  .then(() => {
    showStatus('Passenger profile safely recorded onto database ledger.', 'success');
  })
  .catch((err) => {
    console.error(err);
    showStatus('Manifest saved locally, but database sync failed.', 'error');
  });
}

function showStatus(msg, type) {
  const el = document.getElementById('statusMsg');
  el.textContent = msg;
  el.className = 'status-msg ' + type;
}

// Reset UI back to zero point state 
function resetForm() {
  document.getElementById('boatForm').reset();
  document.getElementById('resultCard').classList.remove('visible');
  document.getElementById('statusMsg').className = 'status-msg';
  
  passengerID = generateID();
  document.getElementById('passID').textContent = passengerID;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}