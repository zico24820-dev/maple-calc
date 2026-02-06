// Simple client-side updater panel loader
async function loadUpdatesFromJson() {
  try {
    const resp = await fetch('/maple-calc/data/updates.json');
    if (!resp.ok) return;
    const data = await resp.json();
    renderUpdatesPanel(data.updates || []);
  } catch (e) {
    console.error('업데이트 로드 실패', e);
  }
}

function renderUpdatesPanel(updates) {
  const panel = document.getElementById('updates-panel');
  if (!panel) return;
  if (!updates || updates.length === 0) return;
  const header = `<div class="header"><div style="font-weight:700; font-size:16px">업데이트 안내</div><button onclick="toggleUpdatesPanel()" style="border:0; background:transparent; font-size:14px; color:#555">닫기</button></div>`;
  const content = document.createElement('div');
  content.id = 'updates-content';
  content.style.padding = '12px';
  content.style.overflow = 'auto';
  content.style.height = 'calc(100% - 52px)';
  content.innerHTML = updates.map(u => `
    <div style="border:1px solid #eee; padding:10px; border-radius:8px; margin-bottom:10px; background:#fff">
      <div style="font-weight:600; margin-bottom:6px">${u.version} — ${u.date}</div>
      <ul style="margin:0; padding-left:18px;">
        ${ (u.notes || []).map(n => `<li>${n}</li>`).join('') }
      </ul>
    </div>
  `).join('');
  panel.innerHTML = header + content.outerHTML;
}

// init on load
document.addEventListener('DOMContentLoaded', () => {
  loadUpdatesFromJson();
});
