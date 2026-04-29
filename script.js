// ShiftSync – Supervisor Staffing App
// CS 422 Group Project 5
// Authors: Bryan Dominguez, Shreyas Katkoor, Aditya Lnu

const NEEDED = 2; // positions that must be filled in Checkout

const state = {
  selectedEmployees:  [],
  committedEmployees: [], // employees who accepted in any prior round — never reset
  coverageRequested:  false,
  coverageSecured:    false,
  coverageShort:      false,  // all responded but not enough accepted
  employeeResponses:  {},     // { name: 'accepted' | 'declined' }
  acceptedCount:      0,
};

// ── Screen Navigation ──────────────────────────────────────────

function showView(name) {
  if (name === 'confirm') {
    document.getElementById('confirm-employees').textContent =
      state.selectedEmployees.length > 0
        ? state.selectedEmployees.join(', ')
        : '—';
  }

  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));

  const target = document.getElementById('screen-' + name);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ── Employee Selection (GR3 Iteration 2 fix) ───────────────────

function updateSelection() {
  const cap = NEEDED - state.acceptedCount; // spots still left to fill
  const checkboxes = [...document.querySelectorAll(
    '.sel-item:not(.sel-disabled) input[type="checkbox"]'
  )];

  // Enforce cap: if more than cap boxes are checked, uncheck the extras
  const checked = checkboxes.filter(cb => cb.checked);
  if (checked.length > cap) {
    checked.slice(cap).forEach(cb => { cb.checked = false; });
  }

  state.selectedEmployees = [];
  const atCap = checkboxes.filter(cb => cb.checked).length >= cap;

  checkboxes.forEach(cb => {
    const item = cb.closest('.sel-item');
    const indicator = item.querySelector('.chk-indicator');

    if (cb.checked) {
      state.selectedEmployees.push(cb.value);
      item.classList.add('is-checked');
      item.classList.remove('sel-cap-locked');
      cb.disabled = false;
      if (indicator) indicator.textContent = '☑';
    } else {
      item.classList.remove('is-checked');
      if (indicator) indicator.textContent = '☐';
      // Lock unchosen rows when cap is reached so user can't over-select
      if (atCap) {
        item.classList.add('sel-cap-locked');
        cb.disabled = true;
      } else {
        item.classList.remove('sel-cap-locked');
        cb.disabled = false;
      }
    }
  });

  const count    = state.selectedEmployees.length;
  const countBox = document.getElementById('sel-count-box');
  const countTxt = document.getElementById('sel-count-text');
  const sendBtn  = document.getElementById('send-btn');

  countBox.classList.toggle('hidden', count === 0);
  countTxt.textContent =
    count + ' employee' + (count !== 1 ? 's' : '') + ' selected';
  sendBtn.disabled = count === 0;
}

// ── Confirm & Send Request ─────────────────────────────────────

function confirmRequest() {
  state.coverageRequested = true;
  requestsSentCount++;

  const list = document.getElementById('notified-list');
  list.innerHTML = state.selectedEmployees
    .map(name => `
      <div class="notified-row">
        <div class="avatar">${name.charAt(0)}</div>
        <span class="notified-name">${name}</span>
        <span class="tag tag-pending">⏳ Pending</span>
      </div>`)
    .join('');

  updateDashboardStats();
  showView('success');
}

// ── Return to Dashboard (updates dept status) ──────────────────

function returnToDashboard() {
  if (state.coverageRequested) {
    // Always hide the original alert and suggested-action panel
    document.getElementById('dashboard-alert').classList.add('hidden');
    document.getElementById('suggested-action').classList.add('hidden');

    const checkout = document.getElementById('dept-checkout');

    if (state.coverageSecured) {
      // ✅ Enough employees accepted
      document.getElementById('dashboard-pending').classList.add('hidden');
      document.getElementById('dashboard-incomplete').classList.add('hidden');
      document.getElementById('dashboard-secured').classList.remove('hidden');
      document.getElementById('pending-action').classList.add('hidden');
      document.getElementById('request-more-action').classList.add('hidden');

      checkout.className = 'dept dept-staffed';
      checkout.innerHTML = `
        <span class="dept-icon">🟢</span>
        <div class="dept-info">
          <div class="dept-name">Checkout</div>
          <div class="dept-status">Coverage Secured ✅</div>
        </div>`;

    } else if (state.coverageShort) {
      // ❗ All responded but not enough accepted
      document.getElementById('dashboard-pending').classList.add('hidden');
      document.getElementById('dashboard-incomplete').classList.remove('hidden');
      document.getElementById('pending-action').classList.add('hidden');
      document.getElementById('request-more-action').classList.remove('hidden');

      checkout.className = 'dept dept-understaffed';
      checkout.innerHTML = `
        <span class="dept-icon">🔴</span>
        <div class="dept-info">
          <div class="dept-name">Checkout</div>
          <div class="dept-status">Coverage Incomplete – still needs more staff</div>
        </div>`;

    } else {
      // ⏳ Still waiting for responses
      document.getElementById('dashboard-pending').classList.remove('hidden');
      document.getElementById('pending-action').classList.remove('hidden');

      checkout.className = 'dept dept-pending';
      checkout.innerHTML = `
        <span class="dept-icon">🟡</span>
        <div class="dept-info">
          <div class="dept-name">Checkout</div>
          <div class="dept-status">
            Pending Coverage – ${state.selectedEmployees.length} request(s) sent
          </div>
        </div>`;
    }
  }

  updateDashboardStats();
  showView('dashboard');
}

// ── Employee Responses Screen ──────────────────────────────────

function openResponsesScreen() {
  const list = document.getElementById('response-list');

  list.innerHTML = state.selectedEmployees.map(name => {
    const rowId    = rowIdFor(name);
    const response = state.employeeResponses[name];

    if (response === 'accepted') {
      return rowHTML(name, rowId, `<span class="resp-status resp-accepted">✓ Accepted</span>`);
    }
    if (response === 'declined') {
      return rowHTML(name, rowId, `<span class="resp-status resp-declined">✗ Declined</span>`);
    }
    return rowHTML(name, rowId, `
      <div class="resp-actions">
        <button class="btn-resp btn-accept" onclick="respondToRequest('${name}', 'accepted')">✓ Accept</button>
        <button class="btn-resp btn-decline" onclick="respondToRequest('${name}', 'declined')">✗ Decline</button>
      </div>`);
  }).join('');

  // Restore result notices if all have already responded
  const allDone = Object.keys(state.employeeResponses).length >= state.selectedEmployees.length;
  document.getElementById('coverage-secured-box').classList.toggle('hidden', !state.coverageSecured);
  document.getElementById('coverage-short-box').classList.toggle('hidden', !allDone || state.coverageSecured);

  showView('responses');
}

function rowIdFor(name) {
  return 'resp-' + name.replace(/\s+/g, '-').toLowerCase();
}

function rowHTML(name, rowId, actionHTML) {
  return `
    <div class="response-row" id="${rowId}">
      <div class="avatar">${name.charAt(0)}</div>
      <span class="resp-name">${name}</span>
      ${actionHTML}
    </div>`;
}

function respondToRequest(name, response) {
  if (state.employeeResponses[name]) return; // already responded

  state.employeeResponses[name] = response;
  if (response === 'accepted') {
    state.acceptedCount++;
    state.committedEmployees.push(name);
  }

  // Swap the buttons in this row to a status label
  const row = document.getElementById(rowIdFor(name));
  if (row) {
    const actions = row.querySelector('.resp-actions');
    if (actions) {
      const cls  = response === 'accepted' ? 'resp-accepted' : 'resp-declined';
      const text = response === 'accepted' ? '✓ Accepted'    : '✗ Declined';
      actions.outerHTML = `<span class="resp-status ${cls}">${text}</span>`;
    }
  }

  checkCoverageStatus();
  updateDashboardStats();
}

function checkCoverageStatus() {
  const totalResponded = Object.keys(state.employeeResponses).length;
  if (totalResponded < state.selectedEmployees.length) return;

  if (state.acceptedCount >= NEEDED) {
    state.coverageSecured = true;
    document.getElementById('coverage-secured-box').classList.remove('hidden');
  } else {
    state.coverageShort = true;
    document.getElementById('coverage-short-box').classList.remove('hidden');
  }
}

// ── Request More Employees (retry after decline) ───────────────

function requestMoreEmployees() {
  // Keep acceptedCount and committedEmployees — already-accepted employees stay locked
  state.selectedEmployees = [];
  state.employeeResponses = {};
  state.coverageShort     = false;
  state.coverageRequested = false;

  // Uncheck remaining (non-committed, non-permanently-disabled) employees
  document.querySelectorAll('.sel-item:not(.sel-disabled)').forEach(item => {
    const cb = item.querySelector('input[type="checkbox"]');
    if (cb) { cb.checked = false; cb.disabled = false; }
    item.classList.remove('is-checked', 'sel-cap-locked');
    const indicator = item.querySelector('.chk-indicator');
    if (indicator) indicator.textContent = '☐';
  });

  document.getElementById('send-btn').disabled = true;
  document.getElementById('sel-count-box').classList.add('hidden');

  // Reset coverage-secured/short boxes for next visit to responses screen
  document.getElementById('coverage-secured-box').classList.add('hidden');
  document.getElementById('coverage-short-box').classList.add('hidden');

  lockCommittedEmployees();
  showView('details');
}

// Disable any employee who already accepted in a previous round
function lockCommittedEmployees() {
  state.committedEmployees.forEach(name => {
    const cb = document.querySelector(`.sel-item input[value="${name}"]`);
    if (!cb) return;
    const item = cb.closest('.sel-item');
    if (!item || item.classList.contains('sel-disabled')) return;

    item.classList.add('sel-disabled');
    cb.disabled = true; // prevents label click from toggling the hidden checkbox

    const indicator = item.querySelector('.chk-indicator');
    if (indicator) indicator.outerHTML = `<span class="cannot-sel">Already covering</span>`;
  });
}

// ── Refresh Status ─────────────────────────────────────────────

function refreshStatus(btn) {
  const original = btn.textContent;
  btn.textContent = '✓ Status Refreshed';
  btn.style.borderColor = '#15803D';
  btn.style.color = '#15803D';
  setTimeout(() => {
    btn.textContent = original;
    btn.style.borderColor = '';
    btn.style.color = '';
  }, 1600);
}

// ── Dashboard Charts & Stats ────────────────────────────────────

const TOTAL_POSITIONS = 8; // 4 Checkout + 2 Grocery + 2 Electronics
const BASE_ON_DUTY    = 6; // 2 Checkout on duty + 2 Grocery + 2 Electronics

let deptChart        = null;
let weeklyChart      = null;
let requestsSentCount = 0;

function initDashboard() {
  const dateEl = document.getElementById('dash-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
  }
  if (window.Chart) initCharts();
}

function initCharts() {
  // Donut — Department Coverage
  const deptCtx = document.getElementById('chart-dept');
  if (deptCtx) {
    deptChart = new Chart(deptCtx, {
      type: 'doughnut',
      data: {
        labels: ['Checkout', 'Grocery', 'Electronics', 'Unfilled'],
        datasets: [{
          data: [2, 2, 2, 2],
          backgroundColor: ['#2563EB', '#15803D', '#0369A1', '#FCA5A5'],
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 14, font: { size: 11 }, usePointStyle: true },
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw} staff`,
            },
          },
        },
      },
    });
  }

  // Bar — Staffing This Week (Sun–Sat, today highlighted)
  const weeklyCtx = document.getElementById('chart-weekly');
  if (weeklyCtx) {
    const todayIdx  = new Date().getDay();
    const staffData = [4, 7, 6, 8, 8, 9, 5];

    // Update today's bar to reflect the correct number of staff on duty
    staffData[todayIdx] = BASE_ON_DUTY + state.acceptedCount;

    weeklyChart = new Chart(weeklyCtx, {
      type: 'bar',
      data: {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
          label: 'Staff',
          data: staffData,
          backgroundColor: staffData.map((_, i) =>
            i === todayIdx ? '#2563EB' : '#BFDBFE'
          ),
          borderRadius: 5,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.raw} staff on duty` } },
        },
        scales: {
          y: {
            beginAtZero: true, max: 12,
            ticks: { stepSize: 2, font: { size: 10 } },
            grid: { color: '#F3F4F6' },
          },
          x: {
            ticks: { font: { size: 11 } },
            grid: { display: false },
          },
        },
      },
    });
  }
}

function updateDashboardStats() {
  const accepted = state.acceptedCount;
  const open     = Math.max(0, NEEDED - accepted);
  const onDuty   = BASE_ON_DUTY + accepted;
  const coverage = Math.round((onDuty / TOTAL_POSITIONS) * 100);

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('stat-duty',     onDuty);
  set('stat-open',     open);
  set('stat-requests', requestsSentCount);
  set('stat-coverage', coverage + '%');

  // Alert styling on open-positions card
  const openCard = document.getElementById('stat-card-open');
  if (openCard) openCard.classList.toggle('stat-alert', open > 0);

  // Update donut — Checkout slice grows as employees commit
  if (deptChart) {
    deptChart.data.datasets[0].data = [
      2 + accepted,
      2,
      2,
      Math.max(0, 2 - accepted),
    ];
    deptChart.update('none');
  }

  // Fill open shift rows as employees commit
  ['shift-open-1', 'shift-open-2'].forEach((rowId, i) => {
    const row = document.getElementById(rowId);
    if (!row) return;
    const name = state.committedEmployees[i];
    if (name) {
      const empCell    = row.querySelector('.shift-emp');
      const statusCell = row.querySelector('.shift-status');
      if (empCell)    { empCell.textContent = name; empCell.classList.remove('open-slot'); }
      if (statusCell) statusCell.innerHTML = '<span class="shift-badge shift-covered">Covered</span>';
    }
  });

  // Available employees = eligible pool minus those already committed or requested
  const totalOut = Math.max(state.committedEmployees.length, state.selectedEmployees.length);
  set('meta-available', Math.max(0, 3 - totalOut));
}

document.addEventListener('DOMContentLoaded', initDashboard);
