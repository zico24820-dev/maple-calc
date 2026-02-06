/**
 * Updates loader: 서버 API 우선 시도, 실패 시 여러 로컬 경로 순차 시도
 */
async function loadUpdatesFromApiOrFallback() {
    let updates = [];

    // 1. 서버 API 우선 시도
    try {
        const resp = await fetch('/api/updates');
        if (resp && resp.ok) {
            const data = await resp.json();
            updates = (data && data.updates) || [];
            if (updates.length > 0) {
                console.log('updates-loader: loaded from API');
                renderUpdatesPanel(updates);
                return; // API 성공 시 종료
            }
        }
    } catch (e) {
        console.log('updates-loader: API failed, trying local fallback...');
    }

    // 2. API 실패 시, 로컬 여러 경로를 순차적으로 시도 (Fallback)
    const paths = [
        './data/updates.json',
        '/data/updates.json',
        '/maple-calc/data/updates.json',
        '/maple-calc/maple-calc/data/updates.json'
    ];

    for (const p of paths) {
        try {
            const r = await fetch(p, { cache: 'no-store' });
            if (r.ok) {
                const d = await r.json();
                const foundUpdates = (d && d.updates) || [];
                if (foundUpdates.length > 0) {
                    console.log('updates-loader: found local data at', p);
                    updates = foundUpdates;
                    break; // 데이터를 찾으면 루프 탈출
                }
            }
        } catch (err) {
            console.log('updates-loader: error at path', p, err.message);
        }
    }

    // 3. 최종 데이터로 화면 렌더링
    renderUpdatesPanel(updates);
}

// 패널 렌더링 함수
function renderUpdatesPanel(updates) {
    const panel = document.getElementById('updates-panel');
    if (!panel) return;

    const header = `<div class="header">
        <div style="font-weight:700; font-size:16px">업데이트 안내</div>
        <button onclick="toggleUpdatesPanel()" style="border:0; background:transparent; font-size:14px; color:#555; cursor:pointer">닫기</button>
    </div>`;

    if (!updates || updates.length === 0) {
        panel.innerHTML = header + '<div id="updates-content" style="padding:12px;">업데이트 내역이 없습니다.</div>';
        return;
    }

    const contentHtml = updates.map(u => `
        <div style="border:1px solid #eee; padding:10px; border-radius:8px; margin-bottom:10px; background:#fff">
            <div style="font-weight:600; margin-bottom:6px">${u.version} — ${u.date}</div>
            <ul style="margin:0; padding-left:18px;">
                ${(u.notes || []).map(n => `<li>${n}</li>`).join('')}
            </ul>
        </div>
    `).join('');

    panel.innerHTML = header + `<div id="updates-content" style="padding:12px; overflow:auto; height:calc(100% - 52px);">${contentHtml}</div>`;
}

// 패널 열기/닫기 토글
function toggleUpdatesPanel() {
    const panel = document.getElementById('updates-panel');
    if (!panel) return;
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
        panel.classList.remove('open');
        panel.style.display = 'none';
    } else {
        panel.style.display = 'block';
        panel.classList.add('open');
    }
}

// 토스트 표시
function showUpdatesToast(message) {
    const toast = document.getElementById('updates-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 4000);
}

// 초기 로드 설정
window.addEventListener('DOMContentLoaded', () => {
    loadUpdatesFromApiOrFallback();
    
    // 로컬스토리지 확인 후 토스트 표시 (v6 기준)
    const seen = localStorage.getItem('updates_seen_v6');
    if (!seen) {
        showUpdatesToast('새 업데이트가 준비됐습니다. 우측의 업데이트 아이콘을 눌러 확인해보세요!');
        localStorage.setItem('updates_seen_v6', '1');
    }
});