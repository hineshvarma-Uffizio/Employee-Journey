/* ==========================================================================
   ADMIN CONTROL PANEL, LIVE BIDIRECTIONAL SYNC & ROOMS MANAGER
   ========================================================================== */
    // Mapping of chamber ID to its dedicated tab heading and nav label inputs
    const CHAMBER_TAB_INPUT_MAP = {
      'chamber-milestone': { titleId: 'adminCelebTitle', navId: 'adminCelebNav' },
      'chamber-0': { titleId: 'adminMilestonesRoomTitle', navId: 'adminMilestonesRoomNav' },
      'chamber-1': { titleId: 'adminSkillsRoomTitle', navId: 'adminSkillsRoomNav' },
      'chamber-2b': { titleId: 'adminProjectsRoomTitle', navId: 'adminProjectsRoomNav' },
      'chamber-memories-2': { titleId: 'adminMemoriesRoomTitle', navId: 'adminMemoriesRoomNav' },
      'chamber-values': { titleId: 'adminValuesRoomTitle', navId: 'adminValuesRoomNav' },
      'chamber-3': { titleId: 'adminNotesRoomTitle', navId: 'adminNotesRoomNav' },
      'chamber-4': { titleId: 'adminProudRoomTitle', navId: 'adminProudRoomNav' },
      'chamber-5': { titleId: 'adminFutureTitle', navId: 'adminFutureNav' },
      'chamber-thankyou': { titleId: 'adminThankYouTitle', navId: 'adminThankYouNav' }
    };

    function setupChamberTabHeadingListeners() {
      Object.entries(CHAMBER_TAB_INPUT_MAP).forEach(([chamberId, map]) => {
        const tInp = document.getElementById(map.titleId);
        const nInp = document.getElementById(map.navId);
        if (tInp && !tInp.dataset.boundSync) {
          tInp.dataset.boundSync = 'true';
          tInp.addEventListener('input', (e) => {
            const r = (palaceState.chambers || []).find(c => c.id === chamberId);
            if (r) {
              r.title = e.target.value;
              if (chamberId === 'chamber-milestone') {
                if (palaceState.celebration) palaceState.celebration.title = e.target.value;
                const formatted = typeof escapeHtml === 'function' ? escapeHtml(e.target.value).replace(/\r?\n/g, '<br>') : e.target.value.replace(/\r?\n/g, '<br>');
                const cTitle = document.querySelector('.celebration-main-title');
                if (cTitle) cTitle.innerHTML = formatted;
                const dTitle = document.querySelector('.doorway-main-title');
                if (dTitle) dTitle.innerHTML = formatted;
              }
              if (chamberId === 'chamber-thankyou' && palaceState.thankYou) {
                palaceState.thankYou.title = e.target.value;
                if (typeof renderThankYouRoom === 'function') renderThankYouRoom();
              }
              renderPlacards();
              syncPalaceNavigation();
              persistPalaceState();
              const ovHeading = document.querySelector(`.admin-room-card[data-room-id="${chamberId}"] .room-display-heading`);
              if (ovHeading) ovHeading.textContent = e.target.value;
              const ovInp = document.querySelector(`.room-input-title[data-id="${chamberId}"]`);
              if (ovInp && ovInp.value !== e.target.value) ovInp.value = e.target.value;
            }
          });
        }
        if (nInp && !nInp.dataset.boundSync) {
          nInp.dataset.boundSync = 'true';
          nInp.addEventListener('input', (e) => {
            const r = (palaceState.chambers || []).find(c => c.id === chamberId);
            if (r) {
              r.navLabel = e.target.value;
              syncPalaceNavigation();
              persistPalaceState();
              const ovNav = document.querySelector(`.admin-room-card[data-room-id="${chamberId}"] .room-display-navlabel`);
              if (ovNav) ovNav.textContent = e.target.value;
              const ovInp = document.querySelector(`.room-input-navlabel[data-id="${chamberId}"]`);
              if (ovInp && ovInp.value !== e.target.value) ovInp.value = e.target.value;
            }
          });
        }
      });
    }

    // Render Admin Rooms Manager tab content
    function renderAdminRoomsManager() {
      const container = document.getElementById('adminRoomsList');
      const countersContainer = document.getElementById('roomsVisCounters');
      if (!container) return;

      const typeLabels = {
        celebration: '🏆 Celebration',
        timeline: '📅 Timeline',
        skills: '💡 Skills',
        projects: '🚀 Projects',
        people: '💌 Team Notes',
        memories: '📸 Memories',
        values: '💎 Values',
        achievements: '🏆 Honors',
        future: '🔮 Future',
        thankyou: '💖 Thank You',
        custom: '✨ Custom'
      };

      const list = palaceState.chambers || [];
      const activeCount = list.filter(c => c.enabled !== false).length;
      const hiddenCount = list.length - activeCount;

      if (countersContainer) {
        countersContainer.innerHTML = `
          <span class="vis-count-chip active-chip">● ${activeCount} Active</span>
          <span class="vis-count-chip hidden-chip">${hiddenCount > 0 ? `🚫 ${hiddenCount} Hidden` : '○ 0 Hidden'}</span>
        `;
      }

      container.innerHTML = list.map((c, idx) => {
        const isFirst = (idx === 0);
        const isLast = (idx === list.length - 1);
        const isCore = (c.canDelete === false || c.type === 'celebration');
        const isEnabled = (c.enabled !== false);

        return `
          <div class="admin-room-card ${isEnabled ? '' : 'room-card-hidden'}" data-room-id="${c.id}" data-index="${idx}">
            <div class="room-card-top">
              <div class="room-badges-group">
                <span class="room-badge-num">${isEnabled ? c.navNum : 'OFF'}</span>
                <span class="room-badge-type">${typeLabels[c.type] || '✨ Room'}</span>
                ${isCore ? '<span style="font-size:12px; font-weight:600; color:#f5c065; background:rgba(245,192,101,0.12); padding:2px 6px; border-radius:4px;">Core Room</span>' : ''}
              </div>

              <!-- Room Visibility Switch (Show / Hide per employee) -->
              <div class="room-card-actions">
                <div class="room-visibility-control">
                  <label class="room-switch-toggle" title="${isEnabled ? 'Click to Hide this room for this employee' : 'Click to Show this room for this employee'}">
                    <input type="checkbox" class="room-enable-checkbox" data-room-id="${c.id}" ${isEnabled ? 'checked' : ''} onchange="window.togglePalaceRoomVisibility('${c.id}', this.checked)">
                    <span class="room-switch-slider"></span>
                  </label>
                  <span class="room-vis-status ${isEnabled ? 'status-active' : 'status-hidden'}">
                    ${isEnabled ? '👁️ Visible' : '🚫 Hidden'}
                  </span>
                </div>

                <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.1); margin: 0 4px;"></div>

                <button type="button" class="btn-room-action btn-room-up" onclick="window.movePalaceRoom(${idx}, -1)" ${isFirst ? 'disabled' : ''} title="Move Room Up">▲</button>
                <button type="button" class="btn-room-action btn-room-down" onclick="window.movePalaceRoom(${idx}, 1)" ${isLast ? 'disabled' : ''} title="Move Room Down">▼</button>
                <button type="button" class="btn-room-action btn-room-delete" onclick="window.deletePalaceRoom('${c.id}')" ${isCore ? 'disabled title="Core celebration room cannot be deleted"' : 'title="Remove this room from palace"'}>🗑️</button>
              </div>
            </div>

            ${!isEnabled ? `
              <div class="room-hidden-badge-banner">
                <span>🚫 <strong>This room is Hidden for this employee</strong> (will be skipped during the Journey).</span>
                <button type="button" class="btn-quick-show-room" onclick="window.togglePalaceRoomVisibility('${c.id}', true)">👁️ Enable / Show</button>
              </div>
            ` : ''}

            <div class="room-card-display-info" style="margin: 8px 0 12px; padding: 10px 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div>
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--gold-light); font-weight: 700; margin-bottom: 2px;">Room Heading</div>
                <div class="room-display-heading" style="font-size: 14px; font-weight: 600; color: #ffffff;">${escapeHtml(c.title || 'Untitled Chamber')}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; font-weight: 600; margin-bottom: 2px;">Floorplan Label</div>
                <span class="room-display-navlabel" style="display: inline-block; font-size: 12px; font-weight: 600; color: var(--gold-primary); background: rgba(245,192,101,0.12); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(245,192,101,0.25);">${escapeHtml(c.navLabel || '')}</span>
              </div>
            </div>

            ${!c.tabTarget ? `
              <div class="room-card-fields">
                <div class="form-group">
                  <label>Room Title (Placard & Header)</label>
                  <input type="text" class="form-input room-input-title" data-id="${c.id}" value="${escapeHtml(c.title || '')}" placeholder="Room Title">
                </div>
                <div class="form-group">
                  <label>Bottom Floorplan Label</label>
                  <input type="text" class="form-input room-input-navlabel" data-id="${c.id}" value="${escapeHtml(c.navLabel || '')}" placeholder="Nav Label">
                </div>
              </div>
            ` : ''}

            <div class="room-card-footer">
              ${c.tabTarget ? `
                <button type="button" class="btn-room-edit-content" onclick="window.switchAdminTab('${c.tabTarget}')" style="display:flex; align-items:center; justify-content:center; gap:6px; width:100%; padding:9px 14px; font-weight:600; background:rgba(245,192,101,0.08); border:1px solid rgba(245,192,101,0.25); color:var(--gold-light); border-radius:6px; cursor:pointer; transition:all 0.2s;">
                  ✏️ Edit Headings & Content in ${typeLabels[c.type] || c.navLabel} Tab ›
                </button>
              ` : `
                <button type="button" class="btn-room-edit-content" onclick="window.previewRoomStage('${c.id}')" ${!isEnabled ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>
                  👁️ View Room in Palace ›
                </button>
              `}
            </div>
          </div>
        `;
      }).join('');

      // Attach real-time input listeners to room cards
      container.querySelectorAll('.room-input-title').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const id = e.target.dataset.id;
          const r = palaceState.chambers.find(c => c.id === id);
          if (r) {
            r.title = e.target.value;
            if (id === 'chamber-milestone' && palaceState.celebration) palaceState.celebration.title = e.target.value;
            if (id === 'chamber-thankyou' && palaceState.thankYou) {
              palaceState.thankYou.title = e.target.value;
              if (typeof renderThankYouRoom === 'function') renderThankYouRoom();
            }
            renderPlacards();
            syncPalaceNavigation();
            persistPalaceState();
            const map = CHAMBER_TAB_INPUT_MAP[id];
            if (map) {
              const tabInp = document.getElementById(map.titleId);
              if (tabInp && tabInp.value !== e.target.value) tabInp.value = e.target.value;
            }
          }
        });
      });
      container.querySelectorAll('.room-input-navlabel').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const id = e.target.dataset.id;
          const r = palaceState.chambers.find(c => c.id === id);
          if (r) {
            r.navLabel = e.target.value;
            syncPalaceNavigation();
            persistPalaceState();
            const map = CHAMBER_TAB_INPUT_MAP[id];
            if (map) {
              const tabInp = document.getElementById(map.navId);
              if (tabInp && tabInp.value !== e.target.value) tabInp.value = e.target.value;
            }
          }
        });
      });

      updateAdminTabHiddenIndicators();
    }

    // Update tab header badges and in-tab warning banners when rooms are hidden or removed
    function updateAdminTabHiddenIndicators() {
      const list = palaceState.chambers || [];
      const tabTargetMap = {
        'tab-celebration': 'chamber-milestone',
        'tab-milestones': 'chamber-0',
        'tab-skills': 'chamber-1',
        'tab-projects-2': 'chamber-2b',
        'tab-notes': 'chamber-3',
        'tab-memories-2': 'chamber-memories-2',
        'tab-values': 'chamber-values',
        'tab-proud': 'chamber-4',
        'tab-future': 'chamber-5',
        'tab-thankyou': 'chamber-thankyou'
      };

      Object.entries(tabTargetMap).forEach(([tabId, roomId]) => {
        const room = list.find(c => c.id === roomId);
        const tabBtn = document.querySelector(`.admin-tab-btn[data-tab="${tabId}"]`);
        const tabContent = document.getElementById(tabId);
        if (!tabBtn) return;

        const existingIndicator = tabBtn.querySelector('.tab-hidden-indicator');
        if (existingIndicator) existingIndicator.remove();

        const isDeleted = !room;
        const isHidden = room && room.enabled === false;

        if (isDeleted) {
          const badge = document.createElement('span');
          badge.className = 'tab-hidden-indicator tab-deleted-indicator';
          badge.style.background = 'rgba(239, 68, 68, 0.2)';
          badge.style.color = '#f87171';
          badge.style.border = '1px solid rgba(239, 68, 68, 0.4)';
          badge.textContent = 'Removed';
          tabBtn.appendChild(badge);
        } else if (isHidden) {
          const badge = document.createElement('span');
          badge.className = 'tab-hidden-indicator';
          badge.textContent = 'Hidden';
          tabBtn.appendChild(badge);
        }

        if (tabContent) {
          let alertBanner = tabContent.querySelector('.tab-room-hidden-alert');
          if (isDeleted) {
            if (!alertBanner) {
              alertBanner = document.createElement('div');
              alertBanner.className = 'tab-room-hidden-alert tab-room-deleted-alert';
              alertBanner.style.borderColor = 'rgba(239, 68, 68, 0.5)';
              alertBanner.style.background = 'rgba(239, 68, 68, 0.12)';
              alertBanner.innerHTML = `
                <p>🗑️ <strong>This room has been removed from the Palace.</strong> It will not appear in the Palace Journey or PDF export.</p>
              `;
              tabContent.insertBefore(alertBanner, tabContent.firstChild);
            }
          } else if (isHidden) {
            if (!alertBanner) {
              alertBanner = document.createElement('div');
              alertBanner.className = 'tab-room-hidden-alert';
              alertBanner.innerHTML = `
                <p>🚫 <strong>This room is currently Hidden for this employee.</strong> It will not appear in the Palace Journey.</p>
                <button type="button" class="btn-quick-show-room" onclick="window.togglePalaceRoomVisibility('${roomId}', true)">👁️ Enable / Show This Room</button>
              `;
              tabContent.insertBefore(alertBanner, tabContent.firstChild);
            }
          } else if (alertBanner) {
            alertBanner.remove();
          }
        }
      });
    }

    // Global room action handlers
    window.togglePalaceRoomVisibility = function(roomId, isEnabled) {
      const room = palaceState.chambers.find(c => c.id === roomId);
      if (!room) return;
      room.enabled = isEnabled;

      // Immediately hide/show element on stage
      const targetEl = document.getElementById(roomId);
      if (targetEl) {
        if (!isEnabled) {
          targetEl.style.display = 'none';
          targetEl.style.visibility = 'hidden';
          targetEl.style.opacity = '0';
          targetEl.style.pointerEvents = 'none';
          targetEl.classList.remove('active', 'waiting-depth', 'exited-forward', 'pdf-page-active');
          targetEl.classList.add('chamber-hidden', 'pdf-page-hidden');
        } else {
          targetEl.classList.remove('chamber-hidden', 'pdf-page-hidden');
          targetEl.style.display = '';
          targetEl.style.visibility = '';
          targetEl.style.pointerEvents = '';
        }
      }

      // Persist state to localStorage & IndexedDB
      persistPalaceState();

      const domInitScript = document.getElementById('initialPalaceState');
      if (domInitScript) {
        try {
          const closeScriptPattern = new RegExp('<' + '/script', 'gi');
          domInitScript.textContent = '\n' + JSON.stringify(palaceState, null, 2).replace(closeScriptPattern, () => '<\\/' + 'script') + '\n';
        } catch (e) {}
      }

      syncPalaceNavigation();
      renderAdminRoomsManager();

      showPalaceToast(isEnabled ? `👁️ "${room.title || room.navLabel}" is now Visible!` : `🚫 "${room.title || room.navLabel}" is now Hidden from Palace!`, 3000);
    };

    window.showAllPalaceRooms = function() {
      (palaceState.chambers || []).forEach(c => {
        c.enabled = true;
      });
      persistPalaceState();
      const domInitScript = document.getElementById('initialPalaceState');
      if (domInitScript) {
        try {
          const closeScriptPattern = new RegExp('<' + '/script', 'gi');
          domInitScript.textContent = '\n' + JSON.stringify(palaceState, null, 2).replace(closeScriptPattern, () => '<\\/' + 'script') + '\n';
        } catch (e) {}
      }
      syncPalaceNavigation();
      renderAdminRoomsManager();
      showPalaceToast("👁️ All rooms are now visible!", 3000);
    };

    window.movePalaceRoom = function(idx, direction) {
      const list = palaceState.chambers;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= list.length) return;
      const temp = list[idx];
      list[idx] = list[targetIdx];
      list[targetIdx] = temp;
      persistPalaceState();
      const domInitScript = document.getElementById('initialPalaceState');
      if (domInitScript) {
        try {
          const closeScriptPattern = new RegExp('<' + '/script', 'gi');
          domInitScript.textContent = '\n' + JSON.stringify(palaceState, null, 2).replace(closeScriptPattern, () => '<\\/' + 'script') + '\n';
        } catch (e) {}
      }
      syncPalaceNavigation();
      renderAdminRoomsManager();
    };

    window.deletePalaceRoom = function(roomId) {
      const room = palaceState.chambers.find(c => c.id === roomId);
      if (!room) return;
      if (room.canDelete === false || room.type === 'celebration') {
        showPalaceToast("⚠️ The core celebration screen cannot be deleted.", 3000);
        return;
      }
      const confirmDelete = confirm(`Are you sure you want to remove "${room.title || room.navLabel}" from the palace?`);
      if (!confirmDelete) return;

      // 1. Immediately hide & detach the chamber element on stage
      const targetEl = document.getElementById(roomId);
      if (targetEl) {
        targetEl.style.display = 'none';
        targetEl.style.visibility = 'hidden';
        targetEl.style.opacity = '0';
        targetEl.style.pointerEvents = 'none';
        targetEl.classList.remove('active', 'waiting-depth', 'exited-forward', 'pdf-page-active');
        targetEl.classList.add('chamber-hidden', 'pdf-page-hidden');
        if (room.isCustom || roomId.startsWith('custom-') || (targetEl.dataset && targetEl.dataset.customRoom)) {
          targetEl.remove();
        }
      }

      // 2. Filter from palaceState.chambers
      palaceState.chambers = palaceState.chambers.filter(c => c.id !== roomId);

      // 3. Persist state immediately to localStorage & IndexedDB
      persistPalaceState();

      // 4. Sync initialPalaceState in DOM
      const domInitScript = document.getElementById('initialPalaceState');
      if (domInitScript) {
        try {
          const closeScriptPattern = new RegExp('<' + '/script', 'gi');
          domInitScript.textContent = '\n' + JSON.stringify(palaceState, null, 2).replace(closeScriptPattern, () => '<\\/' + 'script') + '\n';
        } catch (e) {}
      }

      // 5. Re-sync Palace navigation, stage titles, dots, and 3D chamber positions
      syncPalaceNavigation();
      renderAdminRoomsManager();

      // 6. Provide user confirmation toast
      showPalaceToast(`🗑️ "${room.title || room.navLabel}" removed from Palace!`, 3500);
    };

    window.switchAdminTab = function(tabId) {
      const adminTabs = document.querySelectorAll('.admin-tab-btn');
      const adminContents = document.querySelectorAll('.admin-tab-content');
      adminTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
      adminContents.forEach(c => c.classList.toggle('active', c.id === tabId));
    };

    window.previewRoomStage = function(roomId) {
      if (roomId === 'entrance' || roomId === 'portalStage' || roomId === 'stage-0') {
        closeAdminPanel();
        goToStage(0);
        return;
      }
      const activeChambers = palaceState.chambers.filter(c => c.enabled !== false);
      const idx = activeChambers.findIndex(c => c.id === roomId);
      if (idx !== -1) {
        closeAdminPanel();
        goToStage(idx + 1);
      }
    };


    /* ==========================================================================
       12. COMPREHENSIVE ADMIN CONTROL PANEL & JOURNEY CUSTOMIZER
       ========================================================================== */
        /* ==========================================================================
       DYNAMIC ADMIN PANEL & LIVE ON-SCREEN EDIT CONTROLLER
       ========================================================================== */
    const profileModalBackdrop = document.getElementById('profileModalBackdrop');
    const profileEditBtn = document.getElementById('profileEditBtn');
    const closeProfileModal = document.getElementById('closeProfileModal');
    const btnCancelAdmin = document.getElementById('btnCancelAdmin');
    const btnSaveProfile = document.getElementById('btnSaveProfile');
    const adminStatusMsg = document.getElementById('adminStatusMsg');

    const inputEmployeeName = document.getElementById('inputEmployeeName');
    const inputEmployeeRole = document.getElementById('inputEmployeeRole');
    const inputEmployeeDate = document.getElementById('inputEmployeeDate');
    const inputEmployeeYears = document.getElementById('inputEmployeeYears');
    const inputEmployeePhoto = document.getElementById('inputEmployeePhoto');
    const adminPhotoPreview = document.getElementById('adminPhotoPreview');
    const photoDropZone = document.getElementById('photoDropZone');
    const adminPhotoInput = document.getElementById('adminPhotoInput');

    const adminCelebTitle = document.getElementById('adminCelebTitle');
    const adminCelebSub = document.getElementById('adminCelebSub');
    const adminCelebQuote = document.getElementById('adminCelebQuote');

    const btnExportJson = document.getElementById('btnExportJson');
    const btnImportJsonTrigger = document.getElementById('btnImportJsonTrigger');
    const importJsonInput = document.getElementById('importJsonInput');
    const btnResetDefault = document.getElementById('btnResetDefault');
    const floatingAdminBtn = document.getElementById('floatingAdminBtn');

    let stagedPhotoData = null;

    // --- Dynamic List Renders in Modal ---
    function renderAdminMilestonesList() {
      const container = document.getElementById('adminMilestonesList');
      if (!container) return;
      container.innerHTML = (palaceState.milestones || []).map((m, idx) => `
        <div class="admin-dynamic-item" data-idx="${idx}">
          <div class="admin-item-header">
            <span class="admin-item-num">MILESTONE 0${idx + 1}</span>
            <button type="button" class="btn-item-delete" onclick="deleteMilestone(${idx})">🗑️ Delete</button>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div class="form-group">
              <label>Date</label>
              <input type="text" class="form-input milestone-input-date" value="${m.date || ''}" placeholder="e.g. 01 September 2025">
            </div>
            <div class="form-group">
              <label>Title</label>
              <input type="text" class="form-input milestone-input-title" value="${m.title || ''}" placeholder="e.g. Joined Uffizio">
            </div>
          </div>
          <div class="form-group" style="margin-top:6px;">
            <label>Subtext / Tag</label>
            <input type="text" class="form-input milestone-input-sub" value="${m.sub || ''}" placeholder="e.g. Customer Support Journey Begins">
          </div>
        </div>
      `).join('');
    }

    function renderAdminSkillsList() {
      const container = document.getElementById('adminSkillsList');
      if (!container) return;
      container.innerHTML = (palaceState.skills || []).map((s, idx) => `
        <div class="admin-dynamic-item" data-idx="${idx}">
          <div class="admin-item-header">
            <span class="admin-item-num">SKILL 0${idx + 1}</span>
            <button type="button" class="btn-item-delete" onclick="deleteSkill(${idx})">🗑️ Delete</button>
          </div>
          <div style="display:grid; grid-template-columns: 2fr 1fr; gap:8px;">
            <div class="form-group">
              <label>Skill Title</label>
              <input type="text" class="form-input skill-input-title" value="${s.title || ''}" placeholder="e.g. Strategic Communication">
            </div>
            <div class="form-group">
              <label>Proficiency (%)</label>
              <input type="number" min="1" max="100" class="form-input skill-input-pct" value="${s.pct || 95}">
            </div>
          </div>
          <div style="display:grid; grid-template-columns: 80px 1fr; gap:8px; margin-top:6px;">
            <div class="form-group">
              <label>Icon</label>
              <input type="text" class="form-input skill-input-icon" value="${s.icon || '⚡'}">
            </div>
            <div class="form-group">
              <label>Description / Tools</label>
              <input type="text" class="form-input skill-input-desc" value="${s.desc || ''}" placeholder="e.g. Problem-solving & Cross-team collaboration">
            </div>
          </div>
        </div>
      `).join('');
    }

    // Upload custom project screenshot or photo from device
    window.triggerProjectImageUpload = function(idx) {
      if (typeof palaceAccessMode !== 'undefined' && palaceAccessMode === 'view') return;
      let fileInput = document.getElementById('projectPhotoFileInput');
      if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'projectPhotoFileInput';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
      }

      fileInput.onchange = function(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
          const dataUrl = evt.target.result;
          const input = document.querySelector(`.admin-dynamic-item[data-idx="${idx}"] .proj-input-image`);
          if (input) {
            input.value = dataUrl;
          }
          if (palaceState.contributions && palaceState.contributions[idx]) {
            palaceState.contributions[idx].image = dataUrl;
          }
          renderAdminProjectsList();
          renderProjects();
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
      };

      fileInput.click();
    };

    window.triggerProjectImageUpload2 = function(idx) {
      if (typeof palaceAccessMode !== 'undefined' && palaceAccessMode === 'view') return;
      let fileInput = document.getElementById('projectPhotoFileInput2');
      if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'projectPhotoFileInput2';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
      }

      fileInput.onchange = function(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
          const dataUrl = evt.target.result;
          const input = document.querySelector(`.admin-dynamic-item[data-idx="${idx}"] .proj-input-image`);
          if (input) {
            input.value = dataUrl;
          }
          if (palaceState.contributions2 && palaceState.contributions2[idx]) {
            palaceState.contributions2[idx].image = dataUrl;
          }
          renderAdminProjectsList2();
          renderProjects2();
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
      };

      fileInput.click();
    };

    function renderAdminProjectsList2() {
      const container = document.getElementById('adminProjectsList2');
      if (!container) return;
      const list = palaceState.contributions2 || [];

      if (list.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:24px; color:#94a3b8; font-style:italic; border:1px dashed rgba(255,255,255,0.1); border-radius:10px;">
            No projects added yet to Part 2. Click "+ Add New Project" above to create one.
          </div>
        `;
        return;
      }

      container.innerHTML = list.map((c, idx) => {
        const pTitle = c.project?.title || '';
        const pDesc = c.project?.desc || '';
        const cTitle = c.contribution?.title || '';
        const cDesc = c.contribution?.desc || '';
        const iTitle = c.impact?.title || '';
        const iDesc = c.impact?.desc || '';
        const metric = c.impact?.metricVal1 ? (c.impact.metricVal1 + (c.impact.metricLbl1 ? ' ' + c.impact.metricLbl1 : '')) : '';

        return `
          <div class="admin-dynamic-item" data-idx="${idx}">
            <div class="admin-item-header">
              <span class="admin-item-num">PROJECT 0${idx + 1} (PART 2)</span>
              <button type="button" class="btn-item-delete" onclick="deleteProject2(${idx})">🗑️ Delete Project</button>
            </div>

            <!-- Visual Image Input -->
            <div class="form-group" style="margin-bottom:8px; background:rgba(255,255,255,0.02); padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
              <label>Project Visual Image (URL or Upload Screenshot)</label>
              <div style="display:flex; gap:8px; margin-top:4px;">
                <input type="text" class="form-input proj-input-image" value="${escapeHtmlAttr(c.image || '')}" placeholder="Paste image URL or click Upload...">
                <button type="button" class="btn-upload-avatar" onclick="triggerProjectImageUpload2(${idx})" style="white-space:nowrap; padding:6px 12px; font-size:11px;">📷 Upload</button>
              </div>
              ${c.image ? `<div style="margin-top:6px;"><img src="${escapeHtmlAttr(c.image)}" style="height:48px; border-radius:6px; border:1px solid rgba(255,255,255,0.15); object-fit:cover;"></div>` : ''}
            </div>

            <!-- Column 1: Project / Task -->
            <div class="admin-item-row" style="grid-template-columns: 1fr 1fr; margin-bottom:8px;">
              <div class="form-group">
                <label>Project Title / Deliverable Name</label>
                <input type="text" class="form-input proj-input-title" value="${escapeHtmlAttr(pTitle)}" placeholder="e.g. Cross-Platform Telematics Sync">
              </div>
              <div class="form-group">
                <label>Summary / Deliverable Description</label>
                <input type="text" class="form-input proj-input-desc" value="${escapeHtmlAttr(pDesc)}" placeholder="Brief summary of the mission or system...">
              </div>
            </div>

            <!-- Column 2: Contribution -->
            <div class="admin-item-row" style="grid-template-columns: 1fr 1fr; margin-bottom:8px;">
              <div class="form-group">
                <label>Your Contribution / Role Badge</label>
                <input type="text" class="form-input proj-input-contrib-title" value="${escapeHtmlAttr(cTitle)}" placeholder="e.g. Hardware Telemetry Harmonization">
              </div>
              <div class="form-group">
                <label>Contribution Description (Details Modal)</label>
                <input type="text" class="form-input proj-input-contrib-desc" value="${escapeHtmlAttr(cDesc)}" placeholder="Specific action, code, or leadership you took...">
              </div>
            </div>

            <!-- Column 3: Impact & Stat -->
            <div class="admin-item-row" style="grid-template-columns: 1fr 2fr;">
              <div class="form-group">
                <label>Impact Metric / Stat Badge</label>
                <input type="text" class="form-input proj-input-metric" value="${escapeHtmlAttr(metric)}" placeholder="e.g. 99.9% Telematics Accuracy">
              </div>
              <div class="form-group">
                <label>Measurable Result (Details Modal)</label>
                <input type="text" class="form-input proj-input-impact-title" value="${escapeHtmlAttr(iTitle || iDesc)}" placeholder="e.g. Zero packet drops and high data reliability.">
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function renderAdminProjectsList() {
      const container = document.getElementById('adminProjectsList');
      if (!container) return;
      const list = palaceState.contributions || [];

      if (list.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:24px; color:#94a3b8; font-style:italic; border:1px dashed rgba(255,255,255,0.1); border-radius:10px;">
            No projects or contributions added yet. Click "+ Add New Project" above to create one.
          </div>
        `;
        return;
      }

      container.innerHTML = list.map((c, idx) => {
        const pTitle = c.project?.title || '';
        const pDesc = c.project?.desc || '';
        const cTitle = c.contribution?.title || '';
        const cDesc = c.contribution?.desc || '';
        const iTitle = c.impact?.title || '';
        const iDesc = c.impact?.desc || '';
        const metric = c.impact?.metricVal1 ? (c.impact.metricVal1 + (c.impact.metricLbl1 ? ' ' + c.impact.metricLbl1 : '')) : '';

        return `
          <div class="admin-dynamic-item" data-idx="${idx}">
            <div class="admin-item-header">
              <span class="admin-item-num">PROJECT 0${idx + 1}</span>
              <button type="button" class="btn-item-delete" onclick="deleteProject(${idx})">🗑️ Delete Project</button>
            </div>

            <!-- Visual Image Input -->
            <div class="form-group" style="margin-bottom:8px; background:rgba(255,255,255,0.02); padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
              <label>Project Visual Image (URL or Upload Screenshot)</label>
              <div style="display:flex; gap:8px; margin-top:4px;">
                <input type="text" class="form-input proj-input-image" value="${escapeHtmlAttr(c.image || '')}" placeholder="Paste image URL or click Upload...">
                <button type="button" class="btn-upload-avatar" onclick="triggerProjectImageUpload(${idx})" style="white-space:nowrap; padding:6px 12px; font-size:11px;">📷 Upload</button>
              </div>
              ${c.image ? `<div style="margin-top:6px;"><img src="${escapeHtmlAttr(c.image)}" style="height:48px; border-radius:6px; border:1px solid rgba(255,255,255,0.15); object-fit:cover;"></div>` : ''}
            </div>

            <!-- Column 1: Project / Task -->
            <div style="background:rgba(0, 229, 255, 0.04); border:1px solid rgba(0, 229, 255, 0.16); border-radius:8px; padding:10px; margin-bottom:8px;">
              <div style="font-size:11px; font-weight:700; color:var(--cyan-accent); text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
                01 • Project / Task
              </div>
              <div class="form-group">
                <label>Title</label>
                <input type="text" class="form-input proj-input-title" value="${escapeHtmlAttr(pTitle)}" placeholder="e.g. Enterprise Support SLA 99.8%">
              </div>
              <div class="form-group" style="margin-top:6px;">
                <label>Scope / Context Description</label>
                <textarea class="form-input form-textarea proj-input-desc" rows="2" placeholder="e.g. Delivering mission-critical technical support for enterprise partners...">${escapeHtmlAttr(pDesc)}</textarea>
              </div>
            </div>

            <!-- Column 2: Your Contribution -->
            <div style="background:rgba(245, 192, 101, 0.04); border:1px solid rgba(245, 192, 101, 0.18); border-radius:8px; padding:10px; margin-bottom:8px;">
              <div style="font-size:11px; font-weight:700; color:var(--gold-primary); text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
                02 • Your Contribution
              </div>
              <div class="form-group">
                <label>Contribution Title / Ownership</label>
                <input type="text" class="form-input proj-input-contrib-title" value="${escapeHtmlAttr(cTitle)}" placeholder="e.g. Direct Triage & Swift Resolution">
              </div>
              <div class="form-group" style="margin-top:6px;">
                <label>Action & Execution Details</label>
                <textarea class="form-input form-textarea proj-input-contrib-desc" rows="2" placeholder="e.g. Owned incident lifecycle, coordinated cross-functional fixes...">${escapeHtmlAttr(cDesc)}</textarea>
              </div>
            </div>

            <!-- Column 3: Result / Impact -->
            <div style="background:rgba(16, 185, 129, 0.04); border:1px solid rgba(16, 185, 129, 0.2); border-radius:8px; padding:10px;">
              <div style="font-size:11px; font-weight:700; color:var(--emerald-accent); text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
                03 • Result / Impact
              </div>
              <div style="display:grid; grid-template-columns: 1fr 2fr; gap:8px;">
                <div class="form-group">
                  <label>Metric Badge</label>
                  <input type="text" class="form-input proj-input-metric" value="${escapeHtmlAttr(metric)}" placeholder="e.g. 99.8% SLA">
                </div>
                <div class="form-group">
                  <label>Result Outcome Title</label>
                  <input type="text" class="form-input proj-input-impact-title" value="${escapeHtmlAttr(iTitle)}" placeholder="e.g. Zero SLA Breaches & 99.8% CSAT">
                </div>
              </div>
              <div class="form-group" style="margin-top:6px;">
                <label>Impact Description</label>
                <textarea class="form-input form-textarea proj-input-impact-desc" rows="2" placeholder="e.g. Maintained an impeccable SLA track record throughout Year 1...">${escapeHtmlAttr(iDesc)}</textarea>
              </div>
            </div>

          </div>
        `;
      }).join('');
    }

    function renderAdminNotesList() {
      const container = document.getElementById('adminNotesList');
      if (!container) return;
      container.innerHTML = (palaceState.stickyNotes || []).map((n, idx) => `
        <div class="admin-dynamic-item" data-idx="${idx}">
          <div class="admin-item-header">
            <span class="admin-item-num">TEAM NOTE 0${idx + 1}</span>
            <button type="button" class="btn-item-delete" onclick="deleteNote(${idx})">🗑️ Delete</button>
          </div>
          <div class="form-group">
            <label>Message</label>
            <textarea class="form-input form-textarea note-input-text" rows="2">${n.text || ''}</textarea>
          </div>
          <div style="display:grid; grid-template-columns: 2fr 1fr; gap:8px; margin-top:6px;">
            <div class="form-group">
              <label>Author</label>
              <input type="text" class="form-input note-input-author" value="${n.author || ''}" placeholder="e.g. Team Lead">
            </div>
            <div class="form-group">
              <label>Color</label>
              <select class="form-input note-input-color">
                <option value="yellow" ${n.color === 'yellow' ? 'selected' : ''}>Yellow</option>
                <option value="pink" ${n.color === 'pink' ? 'selected' : ''}>Pink</option>
                <option value="mint" ${n.color === 'mint' ? 'selected' : ''}>Mint</option>
                <option value="sky" ${n.color === 'sky' ? 'selected' : ''}>Sky</option>
              </select>
            </div>
          </div>
          <div class="form-group" style="margin-top: 8px;">
            <label>Author Photo URL / Base64</label>
            <input type="text" class="form-input note-input-photo" value="${n.photo || ''}" placeholder="https://... or click avatar on note to upload">
          </div>
        </div>
      `).join('');
    }

    // Window global delete functions for inline onclick
    window.deleteMilestone = function(idx) {
      if (palaceState.milestones) {
        palaceState.milestones.splice(idx, 1);
        persistPalaceState();
        renderAdminMilestonesList();
        renderMilestones();
      }
    };
    window.deleteSkill = function(idx) {
      if (palaceState.skills) {
        palaceState.skills.splice(idx, 1);
        persistPalaceState();
        renderAdminSkillsList();
        renderSkills();
      }
    };
    window.deleteProject = function(idx) {
      if (palaceState.contributions && palaceState.contributions[idx]) {
        palaceState.contributions.splice(idx, 1);
        persistPalaceState();
        renderAdminProjectsList();
        renderProjects();
      }
    };
    window.deleteProject2 = function(idx) {
      if (palaceState.contributions2 && palaceState.contributions2[idx]) {
        palaceState.contributions2.splice(idx, 1);
        persistPalaceState();
        renderAdminProjectsList2();
        renderProjects2();
      }
    };
    window.deleteNote = function(idx) {
      if (palaceState.stickyNotes) {
        palaceState.stickyNotes.splice(idx, 1);
        persistPalaceState();
        renderAdminNotesList();
        renderStickyNotes();
      }
    };

    // Add item button handlers
    const btnAddMilestone = document.getElementById('btnAddMilestone');
    if (btnAddMilestone) {
      btnAddMilestone.addEventListener('click', () => {
        if (!palaceState.milestones) palaceState.milestones = [];
        palaceState.milestones.push({ date: "New Date", title: "New Milestone", sub: "Description" });
        persistPalaceState();
        renderAdminMilestonesList();
        renderMilestones();
      });
    }

    const btnAddSkill = document.getElementById('btnAddSkill');
    if (btnAddSkill) {
      btnAddSkill.addEventListener('click', () => {
        if (!palaceState.skills) palaceState.skills = [];
        palaceState.skills.push({ title: "New Skill", desc: "Skill Description", pct: 90, icon: "⭐" });
        persistPalaceState();
        renderAdminSkillsList();
        renderSkills();
      });
    }

    const btnAddProject = document.getElementById('btnAddProject');
    if (btnAddProject) {
      btnAddProject.addEventListener('click', () => {
        if (!palaceState.contributions) palaceState.contributions = [];
        const num = palaceState.contributions.length + 1;
        palaceState.contributions.push({
          id: Date.now(),
          project: {
            title: `Project / Task ${num}`,
            desc: "Describe the key project scope, customer problem, or technical initiative."
          },
          contribution: {
            title: "Key Contribution & Ownership",
            desc: "Describe the direct action you took, solutions created, or fixes delivered."
          },
          impact: {
            title: "Measurable Business Result",
            desc: "Explain the outcome, customer satisfaction, or efficiency achieved.",
            metricVal1: "100% Success",
            metricLbl1: ""
          }
        });
        renderAdminProjectsList();
        renderProjects();
        persistPalaceState();

        const container = document.getElementById('adminProjectsList');
        if (container) {
          setTimeout(() => {
            const items = container.querySelectorAll('.admin-dynamic-item');
            if (items.length > 0) items[items.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 50);
        }
      });
    }

    const btnAddProject2 = document.getElementById('btnAddProject2');
    if (btnAddProject2) {
      btnAddProject2.addEventListener('click', () => {
        if (!palaceState.contributions2) palaceState.contributions2 = [];
        const nextIdx = palaceState.contributions2.length + 1;
        palaceState.contributions2.push({
          id: nextIdx - 1,
          tabLabel: `Project ${nextIdx}`,
          tabIcon: "🚀",
          image: defaultProjectImages[(nextIdx - 1) % defaultProjectImages.length] || "assets/images/portal/where_it_started.png",
          project: {
            title: `New Deliverable ${nextIdx}`,
            desc: "Add project description, objectives, and context here."
          },
          contribution: {
            title: "Key Contribution & Ownership",
            desc: "Describe the direct action you took, solutions created, or fixes delivered."
          },
          impact: {
            title: "Measurable Business Result",
            desc: "Explain the outcome, customer satisfaction, or efficiency achieved.",
            metricVal1: "100% Success",
            metricLbl1: ""
          }
        });
        renderAdminProjectsList2();
        renderProjects2();
        persistPalaceState();

        const container = document.getElementById('adminProjectsList2');
        if (container) {
          setTimeout(() => {
            const items = container.querySelectorAll('.admin-dynamic-item');
            if (items.length > 0) items[items.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 50);
        }
      });
    }

    const btnAddNote = document.getElementById('btnAddNote');
    if (btnAddNote) {
      btnAddNote.addEventListener('click', () => {
        if (!palaceState.stickyNotes) palaceState.stickyNotes = [];
        palaceState.stickyNotes.push({ text: "Congratulations on an incredible milestone!", author: "Teammate", color: "yellow" });
        persistPalaceState();
        renderAdminNotesList();
        renderStickyNotes();
      });
    }

    // Populate Modal inputs from state
    

    // Dynamic Values Editor in Admin Panel
    const adminValuesList = document.getElementById('adminValuesList');
    const btnAddValue = document.getElementById('btnAddValue');

    function populateAdminValues() {
      if (!adminValuesList) return;
      adminValuesList.innerHTML = '';

      const items = palaceState.values || [];
      items.forEach((v, idx) => {
        const fallbackKeys = ['shield', 'sprout', 'users', 'target'];
        const fallback = fallbackKeys[idx % 4] || 'diamond';
        const rawIcon = (v.icon || fallback).trim();
        const vKey = rawIcon.toLowerCase();
        const isPreset = typeof VALUES_PRESET_ICONS !== 'undefined' && !!VALUES_PRESET_ICONS[vKey];

        const itemEl = document.createElement('div');
        itemEl.className = 'admin-dynamic-item';
        itemEl.dataset.idx = idx;
        itemEl.innerHTML = `
          <div class="admin-item-header">
            <span class="admin-item-num">💎 VALUE #${idx + 1}</span>
            <button type="button" class="btn-item-delete" onclick="deleteValueItem(${idx})">🗑️ Delete</button>
          </div>

          <!-- Icon Row: Live Preview, Preset Dropdown & Upload Button -->
          <div style="margin-bottom:10px; padding:8px 10px; background:rgba(255,255,255,0.03); border-radius:8px; border:1px solid rgba(245,192,101,0.15);">
            <label style="font-size:11px; color:#94a3b8; display:block; margin-bottom:4px;">Value Icon (Vector Preset or SVG / PNG Upload)</label>
            <div style="display:flex; align-items:center; gap:8px;">
              <div class="admin-value-icon-preview" id="adminValIconPreview${idx}">
                ${renderValueIconContent(v.icon, fallback)}
              </div>
              <select class="form-input val-input-preset" id="adminValIconPreset${idx}" onchange="onAdminValuePresetChange(${idx}, this.value)" style="flex:1; font-size:12px; padding:6px 8px;">
                <option value="shield" ${vKey === 'shield' ? 'selected' : ''}>🛡️ Shield / Accountability (Vector SVG)</option>
                <option value="sprout" ${vKey === 'sprout' ? 'selected' : ''}>🌱 Growth Leaf / Learning (Vector SVG)</option>
                <option value="users" ${vKey === 'users' ? 'selected' : ''}>👥 Team / Collaboration (Vector SVG)</option>
                <option value="target" ${vKey === 'target' ? 'selected' : ''}>🎯 Target / Customer Focus (Vector SVG)</option>
                <option value="diamond" ${vKey === 'diamond' ? 'selected' : ''}>💎 Diamond / Core Value (Vector SVG)</option>
                <option value="star" ${vKey === 'star' ? 'selected' : ''}>⭐ Star / Excellence (Vector SVG)</option>
                <option value="heart" ${vKey === 'heart' ? 'selected' : ''}>❤️ Heart / Empathy & Passion (Vector SVG)</option>
                <option value="zap" ${vKey === 'zap' ? 'selected' : ''}>⚡ Energy / Innovation (Vector SVG)</option>
                <option value="crown" ${vKey === 'crown' ? 'selected' : ''}>👑 Crown / Ownership & Leadership (Vector SVG)</option>
                <option value="award" ${vKey === 'award' ? 'selected' : ''}>🏆 Award / Impact (Vector SVG)</option>
                <option value="rocket" ${vKey === 'rocket' ? 'selected' : ''}>🚀 Rocket / Bold Action (Vector SVG)</option>
                <option value="compass" ${vKey === 'compass' ? 'selected' : ''}>🧭 Compass / Integrity & Direction (Vector SVG)</option>
                <option value="custom" ${!isPreset ? 'selected' : ''}>📁 Custom Uploaded SVG / PNG</option>
              </select>
              <button type="button" class="btn-upload-avatar" onclick="triggerValueIconUpload(${idx})" style="white-space:nowrap; padding:6px 12px; font-size:11px;">📷 Upload</button>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:8px;">
            <div>
              <label style="font-size:12px; color:#cbd5e1; display:block; margin-bottom:4px; font-weight:600;">Value Name</label>
              <input type="text" class="form-input val-input-title" value="${escapeHtmlAttr(v.title || '')}" placeholder="e.g. OWNERSHIP">
            </div>
            <div>
              <label style="font-size:12px; color:#cbd5e1; display:block; margin-bottom:4px; font-weight:600;">Tag / Badge</label>
              <input type="text" class="form-input val-input-badge" value="${escapeHtmlAttr(v.badge || '')}" placeholder="e.g. Accountability">
            </div>
          </div>
          <div style="margin-bottom:8px;">
            <label style="font-size:12px; color:#cbd5e1; display:block; margin-bottom:4px; font-weight:600;">Behavioral Axiom (Bold Quote)</label>
            <input type="text" class="form-input val-input-quote" value="${escapeHtmlAttr(v.quote || '')}" placeholder="e.g. You step forward when something needs to be done.">
          </div>
          <div>
            <label style="font-size:10px; color:#94a3b8; display:block; margin-bottom:3px;">Personal Behavioral Manifestation / Example</label>
            <textarea class="form-input form-textarea val-input-desc" rows="2" placeholder="Describe how the employee uniquely demonstrates this value...">${escapeHtmlAttr(v.desc || '')}</textarea>
          </div>
        `;
        adminValuesList.appendChild(itemEl);
      });
    }

    window.deleteValueItem = function(idx) {
      if (confirm('Delete this value from The Values You Bring room?')) {
        palaceState.values.splice(idx, 1);
        persistPalaceState();
        populateAdminValues();
        renderValuesRoom();
      }
    };

    if (btnAddValue) {
      btnAddValue.addEventListener('click', () => {
        if (!palaceState.values) palaceState.values = [];
        palaceState.values.push({
          id: Date.now(),
          title: "NEW VALUE",
          icon: "star",
          quote: "You demonstrate dedication and bring your best every single day.",
          desc: "Consistently going above and beyond to support team goals and deliver quality.",
          badge: "Commitment"
        });
        persistPalaceState();
        populateAdminValues();
        renderValuesRoom();
      });
    }

    // Dynamic Memories Editor in Admin Panel
    const adminMemoriesList = document.getElementById('adminMemoriesList');
    const btnAddMemory = document.getElementById('btnAddMemory');

    function populateAdminMemories() {
      if (!adminMemoriesList) return;
      adminMemoriesList.innerHTML = '';

      const items = palaceState.memories || [];
      items.forEach((m, idx) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'admin-dynamic-item';
        itemEl.dataset.idx = idx;
        itemEl.innerHTML = `
          <div class="admin-item-header">
            <span class="admin-item-num">📸 PHOTO #${idx + 1}</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span id="memStatus_${idx}" style="font-size:11px; display:none;"></span>
              <button type="button" class="btn-item-delete" onclick="deleteMemoryItem(${idx})">🗑️ Delete</button>
            </div>
          </div>
          <div style="display:flex; gap:16px; align-items:flex-start;">
            <div style="width:90px; height:90px; border-radius:10px; overflow:hidden; border:1.5px solid var(--gold-primary); flex-shrink:0; background:#000; box-shadow:0 4px 12px rgba(0,0,0,0.5); margin-top:2px;">
              <img src="${m.image || 'assets/images/portal/where_it_started.png'}" id="memPreview_${idx}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/images/portal/where_it_started.png'">
            </div>
            <div style="flex:1;">
              <label style="font-size:12px; color:#cbd5e1; display:block; margin-bottom:4px; font-weight:600;">Photo Source / Upload</label>
              <div style="display:flex; gap:8px;">
                <input type="text" class="form-input mem-img-input" value="${escapeHtmlAttr(m.image || '')}" placeholder="Image URL or local file" oninput="document.getElementById('memPreview_${idx}').src = this.value; if(palaceState.memories[${idx}]) palaceState.memories[${idx}].image = this.value; persistPalaceState(); renderMemories();">
                <label class="btn-secondary" style="font-size:11px; padding:7px 14px; cursor:pointer; white-space:nowrap; display:inline-flex; align-items:center; gap:4px;">
                  📁 Browse
                  <input type="file" accept="image/*" style="display:none;" onchange="handleMemoryFileUpload(event, ${idx})">
                </label>
              </div>
            </div>
          </div>
        `;
        adminMemoriesList.appendChild(itemEl);
      });
    }

    window.deleteMemoryItem = function(idx) {
      if (confirm('Delete this photo from memories collage?')) {
        palaceState.memories.splice(idx, 1);
        persistPalaceState();
        populateAdminMemories();
        renderMemories();
      }
    };

    window.handleMemoryFileUpload = function(e, idx) {
      const file = e.target.files[0];
      if (!file) return;

      const preview = document.getElementById(`memPreview_${idx}`);
      const input = document.querySelectorAll('#adminMemoriesList .admin-dynamic-item')[idx]?.querySelector('.mem-img-input');
      const statusEl = document.getElementById(`memStatus_${idx}`);
      if (statusEl) {
        statusEl.style.display = 'inline-block';
        statusEl.textContent = '⏳ Optimizing...';
        statusEl.style.color = '#38bdf8';
      }

      const reader = new FileReader();
      reader.onload = function(evt) {
        const rawData = evt.target.result;
        const img = new Image();
        img.onload = function() {
          // Downscale & compress image to high-def dimensions (max 960x960, JPEG 0.82)
          // Reduces a 10MB photo to ~80KB-120KB so it fits permanently into localStorage & IndexedDB
          const maxDim = 960;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

          if (!palaceState.memories) palaceState.memories = [];
          if (!palaceState.memories[idx]) palaceState.memories[idx] = { id: Date.now() };
          palaceState.memories[idx].image = optimizedDataUrl;

          if (preview) preview.src = optimizedDataUrl;
          if (input) input.value = optimizedDataUrl;
          if (statusEl) {
            statusEl.textContent = '✅ Saved & Persisted!';
            statusEl.style.color = '#4ade80';
            setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
          }

          // Auto-persist immediately to localStorage & IndexedDB!
          persistPalaceState();
          renderMemories();
        };
        img.onerror = function() {
          if (!palaceState.memories) palaceState.memories = [];
          if (!palaceState.memories[idx]) palaceState.memories[idx] = { id: Date.now() };
          palaceState.memories[idx].image = rawData;
          if (preview) preview.src = rawData;
          if (input) input.value = rawData;
          persistPalaceState();
          renderMemories();
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
    };

    if (btnAddMemory) {
      btnAddMemory.addEventListener('click', () => {
        if (!palaceState.memories) palaceState.memories = [];
        palaceState.memories.push({
          id: Date.now(),
          title: "New Memory Photo",
          tag: "🎉 Moment",
          date: "",
          image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80"
        });
        persistPalaceState();
        populateAdminMemories();
        renderMemories();
      });
    }

    // Dynamic Memories Part 2 Collage Editor in Admin Panel
    window.switchMemories2Mode = function(mode) {
      palaceState.memories2Mode = 'grid';
      if (!palaceState.memories2 || palaceState.memories2.length === 0) {
        palaceState.memories2 = [
          { id: 201, image: 'assets/images/memories/memories_photo_1.png', title: 'Office Celebrations', desc: '' },
          { id: 202, image: 'assets/images/memories/memories_photo_2.png', title: 'Creative Collaboration', desc: '' },
          { id: 203, image: 'assets/images/memories/memories_photo_3.png', title: 'Beyond The Workplace', desc: '' },
          { id: 204, image: 'assets/images/memories/memories_photo_4.png', title: 'Outdoor Strategy & Synergy', desc: '' },
          { id: 205, image: 'assets/images/memories/memories_photo_5.png', title: 'Music & Park Retreat', desc: '' },
          { id: 206, image: 'assets/images/memories/memories_photo_6.png', title: 'Riverside Conversations', desc: '' },
          { id: 207, image: 'assets/images/memories/memories_photo_7.png', title: 'Cheers to Milestones', desc: '' },
          { id: 208, image: 'assets/images/memories/memories_photo_8.png', title: 'Team Alignment & Discussions', desc: '' },
          { id: 209, image: 'assets/images/memories/memories_photo_9.png', title: 'Sprint Planning & Analytics', desc: '' }
        ];
      }
      persistPalaceState();
      populateAdminMemories2();
      renderMemories2();
    };

    function populateAdminMemories2() {
      palaceState.memories2Mode = 'grid';
      const btnUneven = document.getElementById('btnMem2ModeUneven');
      const secSingle = document.getElementById('adminMem2SingleSection');
      const secMulti = document.getElementById('adminMem2MultiSection');
      const noticeEl = document.getElementById('mem2ModeNotice');

      if (btnUneven) btnUneven.classList.add('active');
      if (secSingle) secSingle.style.display = 'none';

      if (secMulti) {
        secMulti.style.display = 'flex';
        renderAdminMemories2List();
      }

      if (noticeEl) {
        noticeEl.style.display = 'flex';
        noticeEl.style.background = 'rgba(245, 192, 101, 0.12)';
        noticeEl.style.border = '1px solid rgba(245, 192, 101, 0.3)';
        noticeEl.style.color = '#fde68a';
        noticeEl.innerHTML = `📸 <strong>Mode 2 Active:</strong> Dynamic White-Frame Uneven Photo Collage. Adapts smoothly to all photos with auto-aspect-ratio frames.`;
      }
    }

    function renderAdminMemories2List() {
      const container = document.getElementById('adminMemories2List');
      if (!container) return;
      container.innerHTML = '';

      const items = palaceState.memories2 || [];
      if (items.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 24px; color: #94a3b8; background: rgba(15,23,42,0.4); border-radius: 10px; border: 1px dashed rgba(245,192,101,0.25);">
            <p style="font-size: 14px; margin-bottom: 6px;">No individual photos uploaded yet.</p>
            <p style="font-size: 12px; color: #64748b;">Click <strong>"📁 Upload Multiple Photos (Bulk Select)"</strong> above to select 5–15 photos at once, or <strong>"➕ Add Single Photo"</strong>.</p>
          </div>
        `;
        return;
      }

      items.forEach((m, idx) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'admin-dynamic-item';
        itemEl.dataset.idx = idx;
        itemEl.innerHTML = `
          <div class="admin-item-header">
            <span class="admin-item-num">📸 PHOTO #${idx + 1}</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <button type="button" class="btn-secondary" style="font-size:11px; padding:3px 8px;" onclick="moveMemories2Photo(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} title="Move Up">⬆️</button>
              <button type="button" class="btn-secondary" style="font-size:11px; padding:3px 8px;" onclick="moveMemories2Photo(${idx}, 1)" ${idx === items.length - 1 ? 'disabled' : ''} title="Move Down">⬇️</button>
              <button type="button" class="btn-item-delete" onclick="deleteMemories2Photo(${idx})">🗑️ Delete</button>
            </div>
          </div>
          <div style="display:flex; gap:16px; align-items:flex-start;">
            <div style="width:90px; height:90px; border-radius:10px; overflow:hidden; border:1.5px solid var(--gold-primary); flex-shrink:0; background:#000; box-shadow:0 4px 12px rgba(0,0,0,0.5); margin-top:2px;">
              <img src="${m.image || 'assets/images/portal/where_it_started.png'}" id="mem2Preview_${idx}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/images/portal/where_it_started.png'">
            </div>
            <div style="flex:1;">
              <label style="font-size:12px; color:#cbd5e1; display:block; margin-bottom:4px; font-weight:600;">Photo Source / Upload</label>
              <div style="display:flex; gap:8px;">
                <input type="text" class="form-input mem2-item-src" value="${escapeHtmlAttr(m.image || '')}" placeholder="Image URL or local file" oninput="updateMemories2PhotoSrc(${idx}, this.value)" onchange="updateMemories2PhotoSrc(${idx}, this.value)">
                <label class="btn-secondary" style="font-size:11px; padding:7px 14px; cursor:pointer; white-space:nowrap; display:inline-flex; align-items:center; gap:4px;">
                  📁 Browse
                  <input type="file" accept="image/*" style="display:none;" onchange="handleMemories2SingleFileUpload(event, ${idx})">
                </label>
              </div>
            </div>
          </div>
        `;
        container.appendChild(itemEl);
      });
    }

    window.addMemories2SinglePhoto = function() {
      if (!palaceState.memories2) palaceState.memories2 = [];
      palaceState.memories2.push({
        id: Date.now(),
        image: "assets/images/portal/where_it_started.png",
        title: `Memory Photo ${palaceState.memories2.length + 1}`,
        desc: ""
      });
      if (palaceState.memories2Mode !== 'grid') {
        palaceState.memories2Mode = 'grid';
      }
      persistPalaceState();
      populateAdminMemories2();
      renderMemories2();
    };

    window.deleteMemories2Photo = function(idx) {
      if (confirm('Delete this photo from Memories 2 collage?')) {
        palaceState.memories2.splice(idx, 1);
        persistPalaceState();
        populateAdminMemories2();
        renderMemories2();
      }
    };

    window.moveMemories2Photo = function(idx, dir) {
      const targetIdx = idx + dir;
      if (targetIdx < 0 || targetIdx >= palaceState.memories2.length) return;
      const temp = palaceState.memories2[idx];
      palaceState.memories2[idx] = palaceState.memories2[targetIdx];
      palaceState.memories2[targetIdx] = temp;
      persistPalaceState();
      populateAdminMemories2();
      renderMemories2();
    };

    window.updateMemories2PhotoSrc = function(idx, val) {
      if (!palaceState.memories2) palaceState.memories2 = [];
      if (!palaceState.memories2[idx]) {
        palaceState.memories2[idx] = { id: Date.now() + idx, title: `Memory Photo ${idx + 1}`, desc: '' };
      }
      palaceState.memories2[idx].image = val;
      const preview = document.getElementById(`mem2Preview_${idx}`);
      if (preview) preview.src = val;
      persistPalaceState();
      renderMemories2();
    };

    window.handleMemories2SingleFileUpload = function(e, idx) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        const rawData = evt.target.result;
        const img = new Image();
        img.onload = function() {
          const maxDim = 960;
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
            else { w = Math.round((w * maxDim) / h); h = maxDim; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          const optUrl = canvas.toDataURL('image/jpeg', 0.82);

          if (!palaceState.memories2) palaceState.memories2 = [];
          if (!palaceState.memories2[idx]) {
            palaceState.memories2[idx] = { id: Date.now() + idx, title: file.name.replace(/\.[^/.]+$/, ""), desc: '' };
          }
          palaceState.memories2[idx].image = optUrl;

          const preview = document.getElementById(`mem2Preview_${idx}`);
          if (preview) preview.src = optUrl;
          const inputEl = document.querySelectorAll('#adminMemories2List .admin-dynamic-item')[idx]?.querySelector('.mem2-item-src');
          if (inputEl) inputEl.value = optUrl;

          persistPalaceState();
          renderMemories2();
        };
        img.onerror = function() {
          if (!palaceState.memories2) palaceState.memories2 = [];
          if (!palaceState.memories2[idx]) {
            palaceState.memories2[idx] = { id: Date.now() + idx, title: file.name.replace(/\.[^/.]+$/, ""), desc: '' };
          }
          palaceState.memories2[idx].image = rawData;

          const preview = document.getElementById(`mem2Preview_${idx}`);
          if (preview) preview.src = rawData;
          const inputEl = document.querySelectorAll('#adminMemories2List .admin-dynamic-item')[idx]?.querySelector('.mem2-item-src');
          if (inputEl) inputEl.value = rawData;

          persistPalaceState();
          renderMemories2();
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    };

    window.handleMemories2BulkUpload = function(e) {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const statusEl = document.getElementById('mem2MultiStatus');
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.textContent = `⏳ Processing 0 of ${files.length} photos...`;
        statusEl.style.color = '#38bdf8';
      }

      let completed = 0;
      const newItems = [];

      function processNext(index) {
        if (index >= files.length) {
          if (!palaceState.memories2) palaceState.memories2 = [];
          if (palaceState.memories2.length === 1 && (palaceState.memories2[0].image === 'assets/images/memories/memories_collage_part2.png' || palaceState.memories2[0].title === 'Year in Memories Collage')) {
            palaceState.memories2 = newItems;
          } else {
            palaceState.memories2 = palaceState.memories2.concat(newItems);
          }
          if (palaceState.memories2Mode !== 'grid') {
            palaceState.memories2Mode = 'grid';
          }
          persistPalaceState();
          populateAdminMemories2();
          renderMemories2();

          if (statusEl) {
            statusEl.textContent = `✅ Successfully added ${files.length} photos! Auto-collage updated.`;
            statusEl.style.color = '#4ade80';
            setTimeout(() => { statusEl.style.display = 'none'; }, 4000);
          }
          e.target.value = '';
          return;
        }

        const file = files[index];
        const reader = new FileReader();
        reader.onload = function(evt) {
          const img = new Image();
          img.onload = function() {
            const maxDim = 1200;
            let w = img.width, h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
              else { w = Math.round((w * maxDim) / h); h = maxDim; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            const optUrl = canvas.toDataURL('image/jpeg', 0.88);

            newItems.push({
              id: Date.now() + index,
              image: optUrl,
              title: file.name.replace(/\.[^/.]+$/, ""),
              desc: ""
            });

            completed++;
            if (statusEl) {
              statusEl.textContent = `⏳ Processed ${completed} of ${files.length} photos...`;
            }
            processNext(index + 1);
          };
          img.onerror = function() {
            processNext(index + 1);
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }

      processNext(0);
    };

    // Canvas Collage Auto-Stitcher Logic
    window.openMemories2CanvasStitcherModal = function() {
      const items = palaceState.memories2 || [];
      if (items.length === 0) {
        alert('Please upload or add some photos first before generating a stitched collage!');
        return;
      }
      const modal = document.getElementById('memories2StitcherModal');
      if (!modal) return;
      modal.style.display = 'flex';
      modal.classList.add('active');
      generateMemories2CanvasComposite();
    };

    window.closeMemories2StitcherModal = function() {
      const modal = document.getElementById('memories2StitcherModal');
      if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
      }
    };

    window.generateMemories2CanvasComposite = function() {
      const loadingEl = document.getElementById('stitcherLoading');
      const wrapperEl = document.getElementById('stitcherCanvasWrapper');
      const resultImg = document.getElementById('stitchedResultImg');
      if (loadingEl) loadingEl.style.display = 'block';
      if (wrapperEl) wrapperEl.style.display = 'none';

      const items = palaceState.memories2 || [];
      const loadPromises = items.map(m => {
        return new Promise(resolve => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => {
            const fallback = new Image();
            fallback.onload = () => resolve(fallback);
            fallback.onerror = () => resolve(null);
            fallback.src = 'assets/images/portal/where_it_started.png';
          };
          img.src = m.image || 'assets/images/portal/where_it_started.png';
        });
      });

      Promise.all(loadPromises).then(images => {
        const validImgs = images.filter(Boolean);
        if (validImgs.length === 0) {
          if (loadingEl) loadingEl.textContent = '❌ Failed to load images for collage.';
          return;
        }

        const count = validImgs.length;
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');

        // 100% Transparent Background - collage photos float cleanly over chamber wallpaper
        ctx.clearRect(0, 0, 1600, 1200);

        const slots = getUnevenLayoutSlots(count);
        if (slots) {
          // Sort items by z-index so layers overlap properly on canvas
          const indexed = slots.map((s, idx) => ({ slot: s, img: validImgs[idx], idx })).filter(item => !!item.img);
          indexed.sort((a, b) => (a.slot.z || 0) - (b.slot.z || 0));

          indexed.forEach(({ slot, img }) => {
            const slotW = (slot.width * 1600) / 100;
            const slotH = (slot.height * 1200) / 100;
            const cx = (slot.left * 1600) / 100 + slotW / 2;
            const cy = (slot.top * 1200) / 100 + slotH / 2;
            const rotRad = (slot.rot * Math.PI) / 180;

            const ratio = img.width / img.height;
            let pw, ph;
            if (ratio >= 1.25) {
              pw = slotW;
              ph = pw / ratio;
              if (ph > slotH * 1.15) {
                ph = slotH * 1.15;
                pw = ph * ratio;
              }
            } else if (ratio <= 0.85) {
              ph = Math.min(slotH * 1.18, 1200 * 0.46);
              pw = ph * ratio;
              if (pw < slotW * 0.62) pw = slotW * 0.62;
              ph = pw / ratio;
            } else {
              pw = Math.min(slotW * 0.92, slotH * 1.05 * ratio);
              ph = pw / ratio;
            }

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rotRad);

            // Realistic drop shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
            ctx.shadowBlur = 32;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 16;

            // Crisp White Photo Frame matching photo's exact dimensions
            const framePad = 10;
            const frameBottomExtra = 4;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-pw / 2 - framePad, -ph / 2 - framePad, pw + framePad * 2, ph + framePad * 2 + frameBottomExtra);

            // Reset shadow before drawing photo
            ctx.shadowColor = 'transparent';

            // Draw full uncropped photo matching frame aspect ratio
            ctx.drawImage(img, 0, 0, img.width, img.height, -pw / 2, -ph / 2, pw, ph);
            ctx.restore();
          });
        } else {
          // Fallback multi-row uneven for count > 12
          const cols = Math.ceil(Math.sqrt(count));
          const rows = Math.ceil(count / cols);
          const pad = 40, gap = 20;
          const cw = (1600 - pad * 2 - gap * (cols - 1)) / cols;
          const ch = (1200 - pad * 2 - gap * (rows - 1)) / rows;
          const rotPattern = [-5, 4, -4, 5, -3, 3];

          for (let i = 0; i < count; i++) {
            const img = validImgs[i];
            const r = Math.floor(i / cols);
            const c = i % cols;
            const cx = pad + c * (cw + gap) + cw / 2;
            const cy = pad + r * (ch + gap) + ch / 2;
            const rot = (rotPattern[i % rotPattern.length] * Math.PI) / 180;

            const ratio = img.width / img.height;
            let pw = cw - 16;
            let ph = pw / ratio;
            if (ph > ch - 16) {
              ph = ch - 16;
              pw = ph * ratio;
            }

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rot);

            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 24;
            ctx.shadowOffsetY = 12;

            const framePad = 8;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-pw / 2 - framePad, -ph / 2 - framePad, pw + framePad * 2, ph + framePad * 2 + 3);

            ctx.shadowColor = 'transparent';
            ctx.drawImage(img, 0, 0, img.width, img.height, -pw / 2, -ph / 2, pw, ph);
            ctx.restore();
          }
        }

        const stitchedDataUrl = canvas.toDataURL('image/png');
        window._lastStitchedDataUrl = stitchedDataUrl;
        if (resultImg) resultImg.src = stitchedDataUrl;
        if (loadingEl) loadingEl.style.display = 'none';
        if (wrapperEl) wrapperEl.style.display = 'flex';
      }).catch(err => {
        console.error("Canvas collage error", err);
        if (loadingEl) loadingEl.textContent = '❌ Error generating collage. Please try again.';
      });
    };

    window.applyStitchedCollageAsSingle = function() {
      if (!window._lastStitchedDataUrl) return;
      palaceState.memories2CollageImage = window._lastStitchedDataUrl;
      palaceState.memories2Mode = 'single';
      persistPalaceState();
      populateAdminMemories2();
      renderMemories2();
      closeMemories2StitcherModal();
      showPalaceToast("✅ Stitched collage applied as Single Collage (Mode 1)!", 3500);
    };

    window.downloadStitchedCollagePng = function() {
      if (!window._lastStitchedDataUrl) return;
      const a = document.createElement('a');
      a.download = 'memories_2_auto_collage.png';
      a.href = window._lastStitchedDataUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    const inputMem2Collage = document.getElementById('inputMemories2CollageSrc');
    if (inputMem2Collage) {
      inputMem2Collage.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
          palaceState.memories2CollageImage = val;
          const preview = document.getElementById('adminMemories2Preview');
          if (preview) preview.src = val;
          persistPalaceState();
          renderMemories2();
        }
      });
    }

    const fileUploadMem2Collage = document.getElementById('fileUploadMemories2Collage');
    if (fileUploadMem2Collage) {
      fileUploadMem2Collage.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const statusEl = document.getElementById('mem2UploadStatus');
        if (statusEl) {
          statusEl.style.display = 'inline-block';
          statusEl.textContent = '⏳ Optimizing image...';
          statusEl.style.color = '#38bdf8';
        }

        const reader = new FileReader();
        reader.onload = function(evt) {
          const rawData = evt.target.result;
          const img = new Image();
          img.onload = function() {
            const maxDim = 1400;
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
            const optimizedDataUrl = isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.85);

            palaceState.memories2CollageImage = optimizedDataUrl;

            const preview = document.getElementById('adminMemories2Preview');
            if (preview) preview.src = optimizedDataUrl;
            if (inputMem2Collage) inputMem2Collage.value = optimizedDataUrl;

            if (statusEl) {
              statusEl.textContent = '✅ Collage Saved & Persisted!';
              statusEl.style.color = '#4ade80';
              setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
            }

            persistPalaceState();
            renderMemories2();
          };
          img.onerror = function() {
            palaceState.memories2CollageImage = rawData;
            const preview = document.getElementById('adminMemories2Preview');
            if (preview) preview.src = rawData;
            if (inputMem2Collage) inputMem2Collage.value = rawData;
            persistPalaceState();
            renderMemories2();
          };
          img.src = rawData;
        };
        reader.readAsDataURL(file);
        e.target.value = '';
      });
    }

    const btnResetMem2Collage = document.getElementById('btnResetMemories2Collage');
    if (btnResetMem2Collage) {
      btnResetMem2Collage.addEventListener('click', () => {
        palaceState.memories2CollageImage = 'assets/images/memories/memories_collage_part2.png';
        const preview = document.getElementById('adminMemories2Preview');
        if (preview) preview.src = 'assets/images/memories/memories_collage_part2.png';
        if (inputMem2Collage) inputMem2Collage.value = 'assets/images/memories/memories_collage_part2.png';
        populateAdminMemories2();
        persistPalaceState();
        renderMemories2();
        const statusEl = document.getElementById('mem2UploadStatus');
        if (statusEl) {
          statusEl.style.display = 'inline-block';
          statusEl.textContent = '↺ Reset to Default!';
          statusEl.style.color = '#e2e8f0';
          setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
        }
      });
    }

    function populateAdminEvolution() {
      const evo = palaceState.evolution || {
        thenTitle: "Day 01",
        thenPoints: [
          { icon: "globe", text: "Learning the environment" },
          { icon: "box", text: "Understanding the product" },
          { icon: "compass", text: "Getting familiar with the role" }
        ],
        growthLabel: "",
        nowTitle: "Today",
        nowPoints: [
          { icon: "shield", text: "More confidence" },
          { icon: "target", text: "Better understanding" },
          { icon: "crown", text: "Greater ownership" }
        ]
      };

      const adminThenTitle = document.getElementById('adminEvolThenTitle');
      if (adminThenTitle) adminThenTitle.value = evo.thenTitle || "Day 01";

      const thenFallbacks = ['globe', 'box', 'compass'];
      (evo.thenPoints || []).forEach((p, i) => {
        const tx = document.getElementById(`adminEvolThenText${i}`);
        const sel = document.getElementById(`adminEvolThenPreset${i}`);
        const prev = document.getElementById(`adminEvolThenPreview${i}`);
        if (tx) tx.value = p.text || '';
        const fallback = thenFallbacks[i] || 'globe';
        const iconKey = p.icon || fallback;
        if (sel) {
          sel.value = EVOLUTION_PRESET_ICONS[iconKey] ? iconKey : 'custom';
        }
        if (prev) {
          prev.innerHTML = renderIconContent(iconKey, fallback);
        }
      });

      const adminGrowth = document.getElementById('adminEvolGrowthLabel');
      if (adminGrowth) adminGrowth.value = evo.growthLabel || "";

      const adminNowTitle = document.getElementById('adminEvolNowTitle');
      if (adminNowTitle) adminNowTitle.value = evo.nowTitle || "Today";

      const nowFallbacks = ['shield', 'target', 'crown'];
      (evo.nowPoints || []).forEach((p, i) => {
        const tx = document.getElementById(`adminEvolNowText${i}`);
        const sel = document.getElementById(`adminEvolNowPreset${i}`);
        const prev = document.getElementById(`adminEvolNowPreview${i}`);
        if (tx) tx.value = p.text || '';
        const fallback = nowFallbacks[i] || 'shield';
        const iconKey = p.icon || fallback;
        if (sel) {
          sel.value = EVOLUTION_PRESET_ICONS[iconKey] ? iconKey : 'custom';
        }
        if (prev) {
          prev.innerHTML = renderIconContent(iconKey, fallback);
        }
      });
    }

    // Direct upload for Entrance Brand Logo
    window.triggerEntranceLogoUpload = function() {
      if (typeof palaceAccessMode !== 'undefined' && palaceAccessMode === 'view') return;
      let fileInput = document.getElementById('entranceLogoFileInput');
      if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'entranceLogoFileInput';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
      }

      fileInput.onchange = function(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
          const dataUrl = evt.target.result;
          palaceState.entrance = palaceState.entrance || {};
          palaceState.entrance.logo = dataUrl;

          const portalArchLogo = document.getElementById('portalArchLogo');
          if (portalArchLogo) portalArchLogo.src = dataUrl;

          const adminLogoPrev = document.getElementById('adminEntranceLogoPreview');
          if (adminLogoPrev) adminLogoPrev.src = dataUrl;

          const adminLogoInp = document.getElementById('adminEntranceLogo');
          if (adminLogoInp) adminLogoInp.value = dataUrl;

          persistPalaceState();
          showPalaceToast("✨ Entrance logo updated!", 3000);
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
      };

      fileInput.click();
    };

    function populateAdminEntrance() {
      const ent = palaceState.entrance || {};
      const adminEntTitle = document.getElementById('adminEntranceTitle');
      const adminEntSub = document.getElementById('adminEntranceSub');
      const adminEntPrompt = document.getElementById('adminEntrancePrompt');
      const adminEntLogo = document.getElementById('adminEntranceLogo');
      const adminEntLogoPrev = document.getElementById('adminEntranceLogoPreview');
      const adminEntDoorLeft = document.getElementById('adminEntranceDoorLeft');
      const adminEntDoorRight = document.getElementById('adminEntranceDoorRight');

      if (adminEntTitle) adminEntTitle.value = ent.title || "WELCOME TO YOUR JOURNEY";
      if (adminEntSub) adminEntSub.value = ent.subtitle || "WALK THROUGH YOUR YEAR • 2025 → 2026";
      if (adminEntPrompt) adminEntPrompt.value = ent.prompt || "Scroll Down or Click Door to Enter";
      if (adminEntLogo) adminEntLogo.value = ent.logo || "assets/images/branding/uffizio_logo_white.png";
      if (adminEntLogoPrev) adminEntLogoPrev.src = ent.logo || "assets/images/branding/uffizio_logo_white.png";
      if (adminEntLogo && adminEntLogoPrev) {
        adminEntLogo.oninput = function() {
          if (adminEntLogo.value.trim()) {
            adminEntLogoPrev.src = adminEntLogo.value.trim();
          }
        };
      }
      if (adminEntDoorLeft) adminEntDoorLeft.value = palaceState.doorWingLeft || "UFFIZIO";
      if (adminEntDoorRight) adminEntDoorRight.value = palaceState.doorWingRight || "2025 → 2026";
    }

    function populateAdminThankYou() {
      const ty = palaceState.thankYou || {};
      const emp = palaceState.employee || {};
      const adminTyBadge = document.getElementById('adminThankYouBadge');
      const adminTyTitle = document.getElementById('adminThankYouTitle');
      const adminTySub = document.getElementById('adminThankYouSub');
      const adminTyMsg = document.getElementById('adminThankYouMsg');
      const adminTySig = document.getElementById('adminThankYouSig');
      const adminTyBtn1 = document.getElementById('adminThankYouBtn1');
      const adminTyBtn2 = document.getElementById('adminThankYouBtn2');
      const adminTyBtn3 = document.getElementById('adminThankYouBtn3');

      if (adminTyBadge) adminTyBadge.value = ty.headerBadge || "✨ HEARTFELT APPRECIATION • 1 YEAR MILESTONE ✨";
      if (adminTyTitle) adminTyTitle.value = ty.title || (emp.name ? `Thank You, ${emp.name}!` : "Thank You!");
      if (adminTySub) adminTySub.value = (ty.subtitle && ty.subtitle !== "For an extraordinary year of passion, impact, and shared success with Uffizio.") ? ty.subtitle : "";
      if (adminTyMsg) adminTyMsg.value = ty.message || "Thank you for your dedication, energy, and spirit at Uffizio. Your contributions strengthen our team, and we’re proud of your growth and journey with us.";
      if (adminTySig) adminTySig.value = ty.signature || "— With heartfelt gratitude & best wishes, Team Uffizio 🌟";

      if (adminTyBtn1) adminTyBtn1.value = ty.actionBtn1 || "🎉 Shower Confetti & Applause";
      if (adminTyBtn2) adminTyBtn2.value = ty.actionBtn2 || "📜 View Souvenir Card";
      if (adminTyBtn3) adminTyBtn3.value = ty.actionBtn3 || "🏛️ Revisit Palace From Start";
    }

    function populateAdminInputs() {
      const emp = palaceState.employee;
      const celeb = palaceState.celebration || {};
      const cs = palaceState.chamberStories || {};

      inputEmployeeName.value = emp.name || "Dhara Patel";
      inputEmployeeRole.value = emp.role || "Customer Support";
      inputEmployeeDate.value = emp.date || "01 September 2025";
      inputEmployeeYears.value = emp.years || "2025 → 2026";
      const adminMilestoneTierEl = document.getElementById('adminMilestoneTier');
      if (adminMilestoneTierEl) {
        adminMilestoneTierEl.value = palaceState.milestoneTier || '1yr';
      }
      inputEmployeePhoto.value = emp.photo || "assets/images/profiles/manushi_hero.jpg";

      const inputDoorLeft = document.getElementById('inputDoorLeftText');
      if (inputDoorLeft) inputDoorLeft.value = palaceState.doorWingLeft || "UFFIZIO";
      const inputDoorRight = document.getElementById('inputDoorRightText');
      if (inputDoorRight) inputDoorRight.value = palaceState.doorWingRight || emp.years || "2025 → 2026";

      if (adminPhotoPreview) {
        adminPhotoPreview.src = emp.photo || "assets/images/profiles/manushi_hero.jpg";
      }
      stagedPhotoData = null;

      if (adminCelebTitle) adminCelebTitle.value = celeb.title || "Celebrating Your First Year With Uffizio";
      if (adminCelebSub) adminCelebSub.value = celeb.sub || "With Uffizio";
      if (adminCelebQuote) adminCelebQuote.value = celeb.quote || "“One year ago, a new chapter began. Today, we celebrate everything that made it meaningful.”";

      renderAdminMilestonesList();
      populateAdminEvolution();
      renderAdminSkillsList();
      renderAdminProjectsList();
      renderAdminProjectsList2();

      const adminCommonImgUrl = document.getElementById('adminCommonImgUrl');
      const adminCommonImgTitle = document.getElementById('adminCommonImgTitle');
      const adminCommonImgDesc = document.getElementById('adminCommonImgDesc');
      const btnUploadCommonImg = document.getElementById('btnUploadCommonImg');

      if (adminCommonImgUrl) adminCommonImgUrl.value = palaceState.chamber2bCommonImage || '';
      if (adminCommonImgTitle) adminCommonImgTitle.value = palaceState.chamber2bCommonTitle || 'Innovation & Systems In Action';
      if (adminCommonImgDesc) adminCommonImgDesc.value = palaceState.chamber2bCommonDesc || 'Real-time architecture, proactive incident workflows, and high-impact partner success.';

      if (btnUploadCommonImg && !btnUploadCommonImg.dataset.initialized) {
        btnUploadCommonImg.dataset.initialized = 'true';
        btnUploadCommonImg.addEventListener('click', () => {
          let fileInput = document.getElementById('commonPhotoFileInput2');
          if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'commonPhotoFileInput2';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
          }
          fileInput.onchange = (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
              const dataUrl = evt.target.result;
              if (adminCommonImgUrl) adminCommonImgUrl.value = dataUrl;
              palaceState.chamber2bCommonImage = dataUrl;
              resetChamber2bCommonImage();
            };
            reader.readAsDataURL(file);
            fileInput.value = '';
          };
          fileInput.click();
        });
      }
      renderAdminNotesList();
      populateAdminMemories();
      populateAdminMemories2();
      populateAdminValues();
      populateAdminProud();
      populateAdminFuture();
      populateAdminThankYou();
      populateAdminEntrance();
      renderAdminRoomsManager();

      // Populate individual chamber tab heading & navlabel inputs directly from palaceState.chambers
      (palaceState.chambers || []).forEach(c => {
        const map = CHAMBER_TAB_INPUT_MAP[c.id];
        if (map) {
          const tInp = document.getElementById(map.titleId);
          const nInp = document.getElementById(map.navId);
          if (tInp) tInp.value = c.title || '';
          if (nInp) nInp.value = c.navLabel || '';
        }
      });
      setupChamberTabHeadingListeners();
      setupAdminPanelLiveSync();

      adminStatusMsg.textContent = "";
    }

    /* ==========================================================================
       REAL-TIME ADMIN PANEL LIVE SYNC CONTROLLER
       ========================================================================== */
    function setupAdminPanelLiveSync() {
      if (window._adminLiveSyncInitialized) return;
      window._adminLiveSyncInitialized = true;

      let persistTimer = null;
      function schedulePersist() {
        clearTimeout(persistTimer);
        persistTimer = setTimeout(() => {
          persistPalaceState();
        }, 300);
      }

      // 1. Profile Tab
      if (inputEmployeeName) {
        inputEmployeeName.addEventListener('input', (e) => {
          const val = e.target.value.trim();
          palaceState.employee = palaceState.employee || {};
          if (val) palaceState.employee.name = val;
          const dName = document.getElementById('doorwayEmpName');
          if (dName) dName.textContent = val || palaceState.employee.name || '';
          const cName = document.getElementById('celebrationEmpName');
          if (cName) cName.textContent = val || palaceState.employee.name || '';
          const topBadge = document.getElementById('topActiveProfileName');
          if (topBadge) topBadge.textContent = val || palaceState.employee.name || '';
          const swBadge = document.getElementById('switcherActiveBadge');
          if (swBadge) swBadge.textContent = 'Active: ' + (val || palaceState.employee.name || '');
          schedulePersist();
        });
      }

      if (inputEmployeeRole) {
        inputEmployeeRole.addEventListener('input', (e) => {
          palaceState.employee = palaceState.employee || {};
          palaceState.employee.role = e.target.value.trim();
          schedulePersist();
        });
      }

      if (inputEmployeeDate) {
        inputEmployeeDate.addEventListener('input', (e) => {
          palaceState.employee = palaceState.employee || {};
          palaceState.employee.date = e.target.value.trim();
          schedulePersist();
        });
      }

      if (inputEmployeeYears) {
        inputEmployeeYears.addEventListener('input', (e) => {
          palaceState.employee = palaceState.employee || {};
          palaceState.employee.years = e.target.value.trim();
          const dSealR = document.getElementById('doorSealRight');
          if (dSealR) dSealR.textContent = e.target.value.trim();
          schedulePersist();
        });
      }

      if (inputEmployeePhoto) {
        inputEmployeePhoto.addEventListener('input', (e) => {
          const url = e.target.value.trim();
          if (url) {
            palaceState.employee = palaceState.employee || {};
            palaceState.employee.photo = url;
            if (adminPhotoPreview) adminPhotoPreview.src = url;
            const dImg = document.getElementById('doorwayPortraitImg');
            if (dImg) dImg.src = url;
            const cImg = document.getElementById('celebrationPortraitImg');
            if (cImg) cImg.src = url;
            schedulePersist();
          }
        });
      }

      const inputDoorLeft = document.getElementById('inputDoorLeftText');
      if (inputDoorLeft) {
        inputDoorLeft.addEventListener('input', (e) => {
          palaceState.doorWingLeft = e.target.value.trim();
          const dSealL = document.getElementById('doorSealLeft');
          if (dSealL) dSealL.textContent = e.target.value.trim();
          schedulePersist();
        });
      }

      const inputDoorRight = document.getElementById('inputDoorRightText');
      if (inputDoorRight) {
        inputDoorRight.addEventListener('input', (e) => {
          palaceState.doorWingRight = e.target.value.trim();
          const dSealR = document.getElementById('doorSealRight');
          if (dSealR) dSealR.textContent = e.target.value.trim();
          schedulePersist();
        });
      }

      const adminMilestoneTierEl = document.getElementById('adminMilestoneTier');
      if (adminMilestoneTierEl) {
        adminMilestoneTierEl.addEventListener('change', (e) => {
          palaceState.milestoneTier = e.target.value;
          if (typeof applyThemeTier === 'function') applyThemeTier(e.target.value);
          schedulePersist();
        });
      }

      // 2. Entrance / Welcome Tab
      const adminEntTitle = document.getElementById('adminEntranceTitle');
      if (adminEntTitle) {
        adminEntTitle.addEventListener('input', (e) => {
          palaceState.entrance = palaceState.entrance || {};
          palaceState.entrance.title = e.target.value;
          const portalTitle = document.querySelector('.portal-arch-title');
          if (portalTitle) portalTitle.textContent = e.target.value;
          schedulePersist();
        });
      }

      const adminEntSub = document.getElementById('adminEntranceSub');
      if (adminEntSub) {
        adminEntSub.addEventListener('input', (e) => {
          palaceState.entrance = palaceState.entrance || {};
          palaceState.entrance.subtitle = e.target.value;
          const portalSub = document.querySelector('.portal-arch-sub');
          if (portalSub) portalSub.textContent = e.target.value;
          schedulePersist();
        });
      }

      const adminEntPrompt = document.getElementById('adminEntrancePrompt');
      if (adminEntPrompt) {
        adminEntPrompt.addEventListener('input', (e) => {
          palaceState.entrance = palaceState.entrance || {};
          palaceState.entrance.prompt = e.target.value;
          const portalPrompt = document.getElementById('portalPromptText');
          if (portalPrompt && !isDoorOpen) portalPrompt.textContent = e.target.value;
          schedulePersist();
        });
      }

      const adminEntDoorLeft = document.getElementById('adminEntranceDoorLeft');
      if (adminEntDoorLeft) {
        adminEntDoorLeft.addEventListener('input', (e) => {
          palaceState.doorWingLeft = e.target.value;
          const dSealL = document.getElementById('doorSealLeft');
          if (dSealL) dSealL.textContent = e.target.value;
          schedulePersist();
        });
      }

      const adminEntDoorRight = document.getElementById('adminEntranceDoorRight');
      if (adminEntDoorRight) {
        adminEntDoorRight.addEventListener('input', (e) => {
          palaceState.doorWingRight = e.target.value;
          const dSealR = document.getElementById('doorSealRight');
          if (dSealR) dSealR.textContent = e.target.value;
          schedulePersist();
        });
      }

      // 3. Celebration Screen Tab
      if (adminCelebTitle) {
        adminCelebTitle.addEventListener('input', (e) => {
          palaceState.celebration = palaceState.celebration || {};
          palaceState.celebration.title = e.target.value;
          const formatted = typeof escapeHtml === 'function' ? escapeHtml(e.target.value).replace(/\r?\n/g, '<br>') : e.target.value.replace(/\r?\n/g, '<br>');
          const cTitle = document.querySelector('.celebration-main-title');
          if (cTitle) cTitle.innerHTML = formatted;
          const dTitle = document.querySelector('.doorway-main-title');
          if (dTitle) dTitle.innerHTML = formatted;
          const c0 = (palaceState.chambers || []).find(c => c.id === 'chamber-milestone');
          if (c0) c0.title = e.target.value;
          renderPlacards();
          syncPalaceNavigation();
          schedulePersist();
        });
      }

      if (adminCelebSub) {
        adminCelebSub.addEventListener('input', (e) => {
          palaceState.celebration = palaceState.celebration || {};
          palaceState.celebration.sub = e.target.value;
          schedulePersist();
        });
      }

      if (adminCelebQuote) {
        adminCelebQuote.addEventListener('input', (e) => {
          palaceState.celebration = palaceState.celebration || {};
          palaceState.celebration.quote = e.target.value;
          const cQuote = document.querySelector('.celebration-quote-text');
          if (cQuote) cQuote.textContent = e.target.value;
          schedulePersist();
        });
      }

      // 4. Dynamic Milestones List Container Delegation
      const milestonesContainer = document.getElementById('adminMilestonesList');
      if (milestonesContainer && !milestonesContainer.dataset.liveBound) {
        milestonesContainer.dataset.liveBound = 'true';
        milestonesContainer.addEventListener('input', () => {
          const mItems = milestonesContainer.querySelectorAll('.admin-dynamic-item');
          const newMilestones = [];
          mItems.forEach(item => {
            const d = item.querySelector('.milestone-input-date')?.value.trim() || '';
            const t = item.querySelector('.milestone-input-title')?.value.trim() || '';
            const s = item.querySelector('.milestone-input-sub')?.value.trim() || '';
            if (t || d) newMilestones.push({ date: d, title: t, sub: s });
          });
          if (newMilestones.length > 0) {
            palaceState.milestones = newMilestones;
            renderMilestones();
            schedulePersist();
          }
        });
      }

      // 5. Dynamic Skills List Container Delegation
      const skillsContainer = document.getElementById('adminSkillsList');
      if (skillsContainer && !skillsContainer.dataset.liveBound) {
        skillsContainer.dataset.liveBound = 'true';
        skillsContainer.addEventListener('input', () => {
          const sItems = skillsContainer.querySelectorAll('.admin-dynamic-item');
          const newSkills = [];
          sItems.forEach(item => {
            const t = item.querySelector('.skill-input-title')?.value.trim() || '';
            const p = parseInt(item.querySelector('.skill-input-pct')?.value, 10) || 90;
            const i = item.querySelector('.skill-input-icon')?.value.trim() || '⚡';
            const d = item.querySelector('.skill-input-desc')?.value.trim() || '';
            if (t) newSkills.push({ title: t, desc: d, pct: p, icon: i });
          });
          if (newSkills.length > 0) {
            palaceState.skills = newSkills;
            renderSkills();
            schedulePersist();
          }
        });
      }

      // 6. Projects 1 & 2 Containers Delegation
      const projContainer1 = document.getElementById('adminProjectsList');
      if (projContainer1 && !projContainer1.dataset.liveBound) {
        projContainer1.dataset.liveBound = 'true';
        projContainer1.addEventListener('input', () => {
          const pItems = projContainer1.querySelectorAll('.admin-dynamic-item');
          const newContribs = [];
          pItems.forEach((item, idx) => {
            const pTitle = item.querySelector('.proj-input-title')?.value.trim() || `Task ${idx + 1}`;
            const pDesc = item.querySelector('.proj-input-desc')?.value.trim() || '';
            const cTitle = item.querySelector('.proj-input-contrib-title')?.value.trim() || '';
            const cDesc = item.querySelector('.proj-input-contrib-desc')?.value.trim() || '';
            const metric = item.querySelector('.proj-input-metric')?.value.trim() || '';
            const iTitle = item.querySelector('.proj-input-impact-title')?.value.trim() || '';
            const iDesc = item.querySelector('.proj-input-impact-desc')?.value.trim() || '';
            const img = item.querySelector('.proj-input-image')?.value.trim() || (palaceState.contributions && palaceState.contributions[idx]?.image) || '';
            newContribs.push({
              id: idx,
              image: img,
              project: { title: pTitle, desc: pDesc },
              contribution: { title: cTitle, desc: cDesc },
              impact: { title: iTitle, desc: iDesc, metricVal1: metric, metricLbl1: '' }
            });
          });
          if (newContribs.length > 0) {
            palaceState.contributions = newContribs;
            renderProjects();
            schedulePersist();
          }
        });
      }

      const projContainer2 = document.getElementById('adminProjectsList2');
      if (projContainer2 && !projContainer2.dataset.liveBound) {
        projContainer2.dataset.liveBound = 'true';
        projContainer2.addEventListener('input', () => {
          const pItems2 = projContainer2.querySelectorAll('.admin-dynamic-item');
          const newContribs2 = [];
          pItems2.forEach((item, idx) => {
            const pTitle = item.querySelector('.proj-input-title')?.value.trim() || `Task ${idx + 1}`;
            const pDesc = item.querySelector('.proj-input-desc')?.value.trim() || '';
            const cTitle = item.querySelector('.proj-input-contrib-title')?.value.trim() || '';
            const cDesc = item.querySelector('.proj-input-contrib-desc')?.value.trim() || '';
            const metric = item.querySelector('.proj-input-metric')?.value.trim() || '';
            const iTitle = item.querySelector('.proj-input-impact-title')?.value.trim() || '';
            const iDesc = item.querySelector('.proj-input-impact-desc')?.value.trim() || '';
            const img = item.querySelector('.proj-input-image')?.value.trim() || (palaceState.contributions2 && palaceState.contributions2[idx]?.image) || '';
            newContribs2.push({
              id: idx,
              image: img,
              project: { title: pTitle, desc: pDesc },
              contribution: { title: cTitle, desc: cDesc },
              impact: { title: iTitle, desc: iDesc, metricVal1: metric, metricLbl1: '' }
            });
          });
          if (newContribs2.length > 0) {
            palaceState.contributions2 = newContribs2;
            renderProjects2();
            schedulePersist();
          }
        });
      }

      // Chamber 2b Common Image & Text
      const adminCommonImgUrl = document.getElementById('adminCommonImgUrl');
      if (adminCommonImgUrl) {
        adminCommonImgUrl.addEventListener('input', (e) => {
          palaceState.chamber2bCommonImage = e.target.value.trim();
          if (typeof resetChamber2bCommonImage === 'function') resetChamber2bCommonImage();
          schedulePersist();
        });
      }
      const adminCommonImgTitle = document.getElementById('adminCommonImgTitle');
      if (adminCommonImgTitle) {
        adminCommonImgTitle.addEventListener('input', (e) => {
          palaceState.chamber2bCommonTitle = e.target.value.trim();
          const el = document.getElementById('chamber2bCommonTitle');
          if (el) el.textContent = e.target.value.trim();
          schedulePersist();
        });
      }
      const adminCommonImgDesc = document.getElementById('adminCommonImgDesc');
      if (adminCommonImgDesc) {
        adminCommonImgDesc.addEventListener('input', (e) => {
          palaceState.chamber2bCommonDesc = e.target.value.trim();
          const el = document.getElementById('chamber2bCommonDesc');
          if (el) el.textContent = e.target.value.trim();
          schedulePersist();
        });
      }

      // 7. Evolution Live Sync
      const adminThenTitle = document.getElementById('adminEvolThenTitle');
      const adminGrowth = document.getElementById('adminEvolGrowthLabel');
      const adminNowTitle = document.getElementById('adminEvolNowTitle');
      function syncEvolutionInputs() {
        palaceState.evolution = palaceState.evolution || {};
        if (adminThenTitle) palaceState.evolution.thenTitle = adminThenTitle.value.trim() || "Day 01";
        if (adminGrowth) palaceState.evolution.growthLabel = adminGrowth.value.trim();
        if (adminNowTitle) palaceState.evolution.nowTitle = adminNowTitle.value.trim() || "Today";
        [0, 1, 2].forEach(i => {
          const thenText = document.getElementById(`adminEvolThenText${i}`)?.value.trim();
          if (thenText !== undefined && palaceState.evolution.thenPoints && palaceState.evolution.thenPoints[i]) {
            palaceState.evolution.thenPoints[i].text = thenText;
          }
          const nowText = document.getElementById(`adminEvolNowText${i}`)?.value.trim();
          if (nowText !== undefined && palaceState.evolution.nowPoints && palaceState.evolution.nowPoints[i]) {
            palaceState.evolution.nowPoints[i].text = nowText;
          }
        });
        renderEvolutionRoom();
        schedulePersist();
      }
      [adminThenTitle, adminGrowth, adminNowTitle].forEach(el => {
        if (el) el.addEventListener('input', syncEvolutionInputs);
      });
      [0, 1, 2].forEach(i => {
        const tEl = document.getElementById(`adminEvolThenText${i}`);
        const nEl = document.getElementById(`adminEvolNowText${i}`);
        if (tEl) tEl.addEventListener('input', syncEvolutionInputs);
        if (nEl) nEl.addEventListener('input', syncEvolutionInputs);
      });

      // 8. Sticky Notes Live Sync Container Delegation
      const notesContainer = document.getElementById('adminNotesList');
      if (notesContainer && !notesContainer.dataset.liveBound) {
        notesContainer.dataset.liveBound = 'true';
        notesContainer.addEventListener('input', () => {
          const nItems = notesContainer.querySelectorAll('.admin-dynamic-item');
          const newNotes = [];
          nItems.forEach((item, idx) => {
            const txt = item.querySelector('.note-input-text')?.value.trim() || '';
            const aut = item.querySelector('.note-input-author')?.value.trim() || '';
            const col = item.querySelector('.note-input-color')?.value || '#f5c065';
            const pho = item.querySelector('.note-input-photo')?.value.trim() || (palaceState.stickyNotes && palaceState.stickyNotes[idx]?.photo) || '';
            if (txt) newNotes.push({ text: txt, author: aut, color: col, photo: pho });
          });
          if (newNotes.length > 0) {
            palaceState.stickyNotes = newNotes;
            renderStickyNotes();
            schedulePersist();
          }
        });
      }

      // 9. Values Live Sync Container Delegation
      const valContainer = document.getElementById('adminValuesList');
      if (valContainer && !valContainer.dataset.liveBound) {
        valContainer.dataset.liveBound = 'true';
        valContainer.addEventListener('input', () => {
          const valItems = valContainer.querySelectorAll('.admin-dynamic-item');
          const newValues = [];
          valItems.forEach((item, idx) => {
            const existing = (palaceState.values && palaceState.values[idx]) || {};
            const selVal = item.querySelector('.val-input-preset')?.value;
            const finalIcon = (selVal && selVal !== 'custom') ? selVal : (existing.icon || ['shield', 'sprout', 'users', 'target'][idx % 4] || 'diamond');
            const title = item.querySelector('.val-input-title')?.value.trim() || `VALUE ${idx + 1}`;
            const badge = item.querySelector('.val-input-badge')?.value.trim() || '';
            const quote = item.querySelector('.val-input-quote')?.value.trim() || '';
            const desc = item.querySelector('.val-input-desc')?.value.trim() || '';
            newValues.push({
              ...existing,
              id: existing.id || (Date.now() + idx),
              icon: finalIcon,
              title: title,
              badge: badge,
              quote: quote,
              desc: desc
            });
          });
          if (newValues.length > 0) {
            palaceState.values = newValues;
            renderValuesRoom();
            schedulePersist();
          }
        });
      }

      // 10. Proud Moments Live Sync
      const proudInputs = [
        'adminProudPlaqueTitle', 'adminProudPlaqueSubtitle', 'adminProudTrophyImg',
        'adminProudCelebTitle', 'adminProudCelebDesc', 'adminProudCelebBtn',
        'adminProudPhoto0', 'adminProudCaption0',
        'adminProudPhoto1', 'adminProudCaption1',
        'adminProudPhoto2', 'adminProudCaption2'
      ];
      function syncProudInputs() {
        palaceState.proud = palaceState.proud || {};
        const adminPlaqueT = document.getElementById('adminProudPlaqueTitle');
        const adminPlaqueS = document.getElementById('adminProudPlaqueSubtitle');
        const adminTrophyInp = document.getElementById('adminProudTrophyImg');
        const adminCelebT = document.getElementById('adminProudCelebTitle');
        const adminCelebD = document.getElementById('adminProudCelebDesc');
        const adminCelebB = document.getElementById('adminProudCelebBtn');
        if (adminPlaqueT) palaceState.proud.plaqueTitle = adminPlaqueT.value.trim() || "INNOVATOR OF THE YEAR";
        if (adminPlaqueS) palaceState.proud.plaqueSubtitle = adminPlaqueS.value.trim() || "2025 - 2026 ANNUAL HONORS";
        if (adminTrophyInp && adminTrophyInp.value.trim()) palaceState.proud.trophyImg = adminTrophyInp.value.trim();
        if (adminCelebT) palaceState.proud.celebrateTitle = adminCelebT.value.trim() || "Celebrate This Milestone";
        if (adminCelebD) palaceState.proud.celebrateDesc = adminCelebD.value.trim() || "";
        if (adminCelebB) palaceState.proud.celebrateBtn = adminCelebB.value.trim() || "🎉 Fire Confetti!";

        palaceState.proud.polaroids = [0, 1, 2].map(i => {
          const existing = (palaceState.proud.polaroids && palaceState.proud.polaroids[i]) || {};
          const photoVal = document.getElementById(`adminProudPhoto${i}`)?.value.trim();
          const capVal = document.getElementById(`adminProudCaption${i}`)?.value.trim();
          return {
            image: photoVal || existing.image || (['assets/images/chambers/proud_polaroid_1.png', 'assets/images/chambers/proud_polaroid_2.png', 'assets/images/chambers/proud_polaroid_3.png'][i]),
            caption: capVal !== undefined && capVal !== '' ? capVal : (existing.caption || ['v4.0 Launch Night! 🚀', 'Hackathon Runners-up 🏆', 'All-Hands Demo Day 🎤'][i])
          };
        });
        renderProudRoom();
        schedulePersist();
      }
      proudInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', syncProudInputs);
      });

      // 11. Future Live Sync
      const futureInputs = [
        'adminFutureTitle', 'adminFutureImage',
        'adminFutureCardTitle0', 'adminFutureCardSub0',
        'adminFutureCardTitle1', 'adminFutureCardSub1',
        'adminFutureCardTitle2', 'adminFutureCardSub2',
        'adminFutureCardTitle3', 'adminFutureCardSub3'
      ];
      function syncFutureInputs() {
        palaceState.future = palaceState.future || {};
        const fTitle = document.getElementById('adminFutureTitle');
        const fImg = document.getElementById('adminFutureImage');
        if (fTitle) palaceState.future.title = fTitle.value.trim();
        if (fImg) palaceState.future.image = fImg.value.trim();

        palaceState.future.cards = [0, 1, 2, 3].map(i => {
          const tInp = document.getElementById(`adminFutureCardTitle${i}`);
          const sInp = document.getElementById(`adminFutureCardSub${i}`);
          const existing = (palaceState.future.cards && palaceState.future.cards[i]) || {};
          return {
            title: (tInp && tInp.value.trim()) || existing.title || '',
            sub: (sInp && sInp.value.trim()) || existing.sub || ''
          };
        });
        renderFutureRoom();
        schedulePersist();
      }
      futureInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', syncFutureInputs);
      });

      // 12. Thank You Room Live Sync
      const tyInputs = [
        'adminThankYouBadge', 'adminThankYouTitle', 'adminThankYouSub',
        'adminThankYouMsg', 'adminThankYouSig'
      ];
      function syncThankYouInputs() {
        palaceState.thankYou = palaceState.thankYou || {};
        const tBadge = document.getElementById('adminThankYouBadge');
        const tTitle = document.getElementById('adminThankYouTitle');
        const tSub = document.getElementById('adminThankYouSub');
        const tMsg = document.getElementById('adminThankYouMsg');
        const tSig = document.getElementById('adminThankYouSig');
        if (tBadge) palaceState.thankYou.badge = tBadge.value.trim();
        if (tTitle) palaceState.thankYou.title = tTitle.value.trim();
        if (tSub) palaceState.thankYou.subtitle = tSub.value.trim();
        if (tMsg) palaceState.thankYou.message = tMsg.value.trim();
        if (tSig) palaceState.thankYou.signature = tSig.value.trim();
        renderThankYouRoom();
        schedulePersist();
      }
      tyInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', syncThankYouInputs);
      });
    }

    // Modal Tabs Logic
    const adminTabs = document.querySelectorAll('.admin-tab-btn');
    const adminContents = document.querySelectorAll('.admin-tab-content');
    adminTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        adminTabs.forEach(t => t.classList.remove('active'));
        adminContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(tab.dataset.tab);
        if (target) target.classList.add('active');
      });
    });

    // Photo Upload Listeners
    if (photoDropZone && adminPhotoInput) {
      photoDropZone.addEventListener('click', () => adminPhotoInput.click());
      adminPhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleAdminPhotoFile(file);
      });
      photoDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        photoDropZone.classList.add('drag-active');
      });
      photoDropZone.addEventListener('dragleave', () => photoDropZone.classList.remove('drag-active'));
      photoDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        photoDropZone.classList.remove('drag-active');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleAdminPhotoFile(e.dataTransfer.files[0]);
        }
      });
    }

    function handleAdminPhotoFile(file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, WebP).');
        return;
      }
      adminStatusMsg.style.color = '#38bdf8';
      adminStatusMsg.textContent = `Optimizing photo "${file.name}" for instant sharing...`;

      const reader = new FileReader();
      reader.onload = (event) => {
        const rawData = event.target.result;
        // Optimize and downscale image to crisp portrait dimensions (~380x480) so it fits in Share URLs and localStorage seamlessly
        const img = new Image();
        img.onload = () => {
          const maxW = 380;
          const maxH = 480;
          let w = img.width;
          let h = img.height;
          if (w > maxW || h > maxH) {
            if (w / maxW > h / maxH) {
              h = Math.round((h * maxW) / w);
              w = maxW;
            } else {
              w = Math.round((w * maxH) / h);
              h = maxH;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          stagedPhotoData = canvas.toDataURL('image/jpeg', 0.78);
          if (adminPhotoPreview) adminPhotoPreview.src = stagedPhotoData;
          if (inputEmployeePhoto) inputEmployeePhoto.value = stagedPhotoData;
          palaceState.employee = palaceState.employee || {};
          palaceState.employee.photo = stagedPhotoData;
          const dImg = document.getElementById('doorwayPortraitImg');
          if (dImg) dImg.src = stagedPhotoData;
          const cImg = document.getElementById('celebrationPortraitImg');
          if (cImg) cImg.src = stagedPhotoData;
          persistPalaceState();
          adminStatusMsg.style.color = '#4ade80';
          adminStatusMsg.textContent = `Photo "${file.name}" optimized & applied!`;
        };
        img.onerror = () => {
          stagedPhotoData = rawData;
          if (adminPhotoPreview) adminPhotoPreview.src = stagedPhotoData;
          if (inputEmployeePhoto) inputEmployeePhoto.value = stagedPhotoData;
          palaceState.employee = palaceState.employee || {};
          palaceState.employee.photo = stagedPhotoData;
          const dImg = document.getElementById('doorwayPortraitImg');
          if (dImg) dImg.src = stagedPhotoData;
          const cImg = document.getElementById('celebrationPortraitImg');
          if (cImg) cImg.src = stagedPhotoData;
          persistPalaceState();
          adminStatusMsg.style.color = '#4ade80';
          adminStatusMsg.textContent = `Photo "${file.name}" applied.`;
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
    }

    // Chamber Future Artwork Image Upload & Input Listeners
    const adminFutureImageFile = document.getElementById('adminFutureImageFile');
    const adminFutureImageInput = document.getElementById('adminFutureImage');
    const adminFutureImgPreview = document.getElementById('adminFutureImgPreview');
    const adminFutureImageStatus = document.getElementById('adminFutureImageStatus');

    if (adminFutureImageFile) {
      adminFutureImageFile.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
          alert('Please select a valid image file (PNG, JPG, WebP).');
          return;
        }
        if (adminFutureImageStatus) {
          adminFutureImageStatus.style.color = '#38bdf8';
          adminFutureImageStatus.textContent = 'Processing image...';
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
          const rawData = ev.target.result;
          const img = new Image();
          img.onload = () => {
            const maxW = 1280;
            const maxH = 960;
            let w = img.width;
            let h = img.height;
            if (w > maxW || h > maxH) {
              if (w / maxW > h / maxH) {
                h = Math.round((h * maxW) / w);
                w = maxW;
              } else {
                w = Math.round((w * maxH) / h);
                h = maxH;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const optimizedData = canvas.toDataURL('image/jpeg', 0.85);
            if (adminFutureImgPreview) adminFutureImgPreview.src = optimizedData;
            if (adminFutureImageInput) adminFutureImageInput.value = optimizedData;
            palaceState.future = palaceState.future || {};
            palaceState.future.image = optimizedData;
            renderFutureRoom();
            persistPalaceState();
            if (adminFutureImageStatus) {
              adminFutureImageStatus.style.color = '#4ade80';
              adminFutureImageStatus.textContent = `✓ Uploaded: ${file.name}`;
            }
          };
          img.onerror = () => {
            if (adminFutureImgPreview) adminFutureImgPreview.src = rawData;
            if (adminFutureImageInput) adminFutureImageInput.value = rawData;
            palaceState.future = palaceState.future || {};
            palaceState.future.image = rawData;
            renderFutureRoom();
            persistPalaceState();
            if (adminFutureImageStatus) {
              adminFutureImageStatus.style.color = '#4ade80';
              adminFutureImageStatus.textContent = `✓ Loaded: ${file.name}`;
            }
          };
          img.src = rawData;
        };
        reader.readAsDataURL(file);
      });
    }

    if (adminFutureImageInput) {
      adminFutureImageInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const finalVal = val || 'assets/images/chambers/future_vision_board.png';
        if (adminFutureImgPreview) adminFutureImgPreview.src = finalVal;
        palaceState.future = palaceState.future || {};
        palaceState.future.image = finalVal;
        renderFutureRoom();
        persistPalaceState();
      });
    }

    function openAdminPanel() {
      if (typeof palaceAccessMode !== 'undefined' && palaceAccessMode === 'view') {
        console.warn("Editing locked in View Mode.");
        return;
      }
      populateAdminInputs();
      setupAdminPanelLiveSync();
      profileModalBackdrop.classList.add('active');
    }
    function closeAdminPanel() {
      profileModalBackdrop.classList.remove('active');
    }


    if (profileEditBtn) profileEditBtn.addEventListener('click', openAdminPanel);
    if (floatingAdminBtn) floatingAdminBtn.addEventListener('click', openAdminPanel);
    if (closeProfileModal) closeProfileModal.addEventListener('click', closeAdminPanel);
    if (btnCancelAdmin) btnCancelAdmin.addEventListener('click', closeAdminPanel);

    // Add Room Panel & Reset Controls
    const btnToggleAddRoom = document.getElementById('btnToggleAddRoom');
    const addRoomPanel = document.getElementById('addRoomPanel');
    const btnCancelAddRoom = document.getElementById('btnCancelAddRoom');
    const btnConfirmAddRoom = document.getElementById('btnConfirmAddRoom');
    const btnResetRoomsDefault = document.getElementById('btnResetRoomsDefault');

    let selectedTemplate = 'timeline';
    const templatePickerGrid = document.getElementById('templatePickerGrid');
    if (templatePickerGrid) {
      templatePickerGrid.querySelectorAll('.template-pick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          templatePickerGrid.querySelectorAll('.template-pick-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          selectedTemplate = btn.dataset.template;
        });
      });
    }

    if (btnToggleAddRoom && addRoomPanel) {
      btnToggleAddRoom.addEventListener('click', () => {
        const isHidden = addRoomPanel.style.display === 'none' || !addRoomPanel.style.display;
        addRoomPanel.style.display = isHidden ? 'block' : 'none';
        btnToggleAddRoom.textContent = isHidden ? '✕ Close Panel' : '➕ Add New Room';
      });
    }

    if (btnCancelAddRoom && addRoomPanel) {
      btnCancelAddRoom.addEventListener('click', () => {
        addRoomPanel.style.display = 'none';
        if (btnToggleAddRoom) btnToggleAddRoom.textContent = '➕ Add New Room';
      });
    }

    if (btnConfirmAddRoom) {
      btnConfirmAddRoom.addEventListener('click', () => {
        const titleInput = document.getElementById('newRoomTitle');
        const navInput = document.getElementById('newRoomNavLabel');
        const subInput = document.getElementById('newRoomSub');

        const title = titleInput.value.trim() || "New Palace Chamber";
        const navLabel = navInput.value.trim() || title.substring(0, 12);
        const sub = (subInput ? subInput.value.trim() : "") || "A newly added milestone in your palace journey.";

        const newId = 'chamber-custom-' + Date.now();
        const newRoom = {
          id: newId,
          type: selectedTemplate,
          navNum: '00',
          navLabel: navLabel,
          title: title,
          sub: sub,
          canDelete: true,
          enabled: true,
          isCustom: true,
          customData: {
            items: [
              { date: 'Milestone 1', title: title, desc: sub },
              { date: 'Milestone 2', title: 'Great Progress', desc: 'Continuing the journey of excellence at Uffizio.' }
            ]
          }
        };

        palaceState.chambers.push(newRoom);
        persistPalaceState();
        const domInitScript = document.getElementById('initialPalaceState');
        if (domInitScript) {
          try {
            const closeScriptPattern = new RegExp('<' + '/script', 'gi');
            domInitScript.textContent = '\n' + JSON.stringify(palaceState, null, 2).replace(closeScriptPattern, () => '<\\/' + 'script') + '\n';
          } catch (e) {}
        }
        syncPalaceNavigation();
        renderAdminRoomsManager();

        // Reset inputs
        titleInput.value = '';
        navInput.value = '';
        subInput.value = '';
        if (addRoomPanel) addRoomPanel.style.display = 'none';
        if (btnToggleAddRoom) btnToggleAddRoom.textContent = '➕ Add New Room';

        showPalaceToast(`✨ Room "${title}" successfully added to the palace!`, 3500);
      });
    }

    if (btnResetRoomsDefault) {
      btnResetRoomsDefault.addEventListener('click', () => {
        const confirmed = confirm("Are you sure you want to reset all palace rooms back to the default 8 chambers?");
        if (!confirmed) return;
        palaceState.chambers = JSON.parse(JSON.stringify(defaultChambers));
        persistPalaceState();
        const domInitScript = document.getElementById('initialPalaceState');
        if (domInitScript) {
          try {
            const closeScriptPattern = new RegExp('<' + '/script', 'gi');
            domInitScript.textContent = '\n' + JSON.stringify(palaceState, null, 2).replace(closeScriptPattern, () => '<\\/' + 'script') + '\n';
          } catch (e) {}
        }
        syncPalaceNavigation();
        renderAdminRoomsManager();
        showPalaceToast("🔄 Rooms reset to default!", 3500);
      });
    }


    // Save & Apply Changes
    
    // Sync Milestone Period with Right Door Wing Text if not manually detached
    const inputEmployeeYearsEl = document.getElementById('inputEmployeeYears');
    const inputDoorRightTextEl = document.getElementById('inputDoorRightText');
    if (inputEmployeeYearsEl && inputDoorRightTextEl) {
      inputEmployeeYearsEl.addEventListener('input', () => {
        if (!inputDoorRightTextEl.dataset.manuallyEdited) {
          inputDoorRightTextEl.value = inputEmployeeYearsEl.value;
        }
      });
      inputDoorRightTextEl.addEventListener('input', () => {
        inputDoorRightTextEl.dataset.manuallyEdited = "true";
      });
    }

    if (btnSaveProfile) {
      btnSaveProfile.addEventListener('click', () => {
        const name = inputEmployeeName.value.trim() || (palaceState.employee && palaceState.employee.name) || "Dhara Patel";
        const role = inputEmployeeRole.value.trim() || (palaceState.employee && palaceState.employee.role) || "Customer Support";
        const date = inputEmployeeDate.value.trim() || (palaceState.employee && palaceState.employee.date) || "01 September 2025";
        const years = inputEmployeeYears.value.trim() || (palaceState.employee && palaceState.employee.years) || "2025 → 2026";
        const photo = stagedPhotoData || inputEmployeePhoto.value.trim() || (palaceState.employee && palaceState.employee.photo) || "assets/images/profiles/manushi_hero.jpg";

        palaceState.employee = { name, role, date, photo, years };
        palaceState.celebration = {
          title: (adminCelebTitle ? adminCelebTitle.value.trim() : "") || (palaceState.celebration && palaceState.celebration.title) || "Celebrating Your First Year With Uffizio",
          sub: (adminCelebSub ? adminCelebSub.value.trim() : "") || (palaceState.celebration && palaceState.celebration.sub) || "With Uffizio",
          quote: (adminCelebQuote ? adminCelebQuote.value.trim() : "") || (palaceState.celebration && palaceState.celebration.quote) || "“One year ago, a new chapter began. Today, we celebrate everything that made it meaningful.”"
        };

        // First Screen / Entrance & Door wings
        const adminEntTitle = document.getElementById('adminEntranceTitle');
        const adminEntSub = document.getElementById('adminEntranceSub');
        const adminEntPrompt = document.getElementById('adminEntrancePrompt');
        const adminEntLogo = document.getElementById('adminEntranceLogo');
        const adminEntDoorLeft = document.getElementById('adminEntranceDoorLeft');
        const adminEntDoorRight = document.getElementById('adminEntranceDoorRight');

        palaceState.entrance = palaceState.entrance || {};
        if (adminEntTitle && adminEntTitle.value.trim()) palaceState.entrance.title = adminEntTitle.value.trim();
        if (adminEntSub && adminEntSub.value.trim()) palaceState.entrance.subtitle = adminEntSub.value.trim();
        if (adminEntPrompt && adminEntPrompt.value.trim()) palaceState.entrance.prompt = adminEntPrompt.value.trim();
        if (adminEntLogo && adminEntLogo.value.trim()) palaceState.entrance.logo = adminEntLogo.value.trim();

        const inpDoorL = document.getElementById('inputDoorLeftText');
        const inpDoorR = document.getElementById('inputDoorRightText');
        if (adminEntDoorLeft && adminEntDoorLeft.value.trim()) {
          palaceState.doorWingLeft = adminEntDoorLeft.value.trim();
        } else if (inpDoorL) {
          palaceState.doorWingLeft = inpDoorL.value.trim() || "UFFIZIO";
        }

        if (adminEntDoorRight && adminEntDoorRight.value.trim()) {
          palaceState.doorWingRight = adminEntDoorRight.value.trim();
        } else if (inpDoorR) {
          palaceState.doorWingRight = inpDoorR.value.trim() || years || "2025 → 2026";
        }
        const adminMilestoneTierEl = document.getElementById('adminMilestoneTier');
        if (adminMilestoneTierEl) {
          palaceState.milestoneTier = adminMilestoneTierEl.value;
          applyThemeTier(palaceState.milestoneTier);
        }

        // Collect Room Customizations from Rooms Manager
        const roomCards = document.querySelectorAll('#adminRoomsList .admin-room-card');
        roomCards.forEach(card => {
          const roomId = card.dataset.roomId;
          const room = palaceState.chambers.find(c => c.id === roomId);
          if (room) {
            const titleInp = card.querySelector('.room-input-title');
            const navInp = card.querySelector('.room-input-navlabel');
            const subInp = card.querySelector('.room-input-sub');
            const enableCb = card.querySelector('.room-enable-checkbox');
            if (enableCb) room.enabled = enableCb.checked;
            if (titleInp && titleInp.value.trim()) room.title = titleInp.value.trim();
            if (navInp && navInp.value.trim()) room.navLabel = navInp.value.trim();
            if (subInp) room.sub = subInp.value.trim();
          }
        });

        // Collect Milestones from dynamic inputs
        const mItems = document.querySelectorAll('#adminMilestonesList .admin-dynamic-item');
        const newMilestones = [];
        mItems.forEach(item => {
          const d = item.querySelector('.milestone-input-date').value.trim();
          const t = item.querySelector('.milestone-input-title').value.trim();
          const s = item.querySelector('.milestone-input-sub').value.trim();
          if (t || d) newMilestones.push({ date: d, title: t, sub: s });
        });
        palaceState.milestones = newMilestones;

        // Collect Evolution from dynamic inputs
        const adminThenTitle = document.getElementById('adminEvolThenTitle');
        const adminGrowth = document.getElementById('adminEvolGrowthLabel');
        const adminNowTitle = document.getElementById('adminEvolNowTitle');
        if (adminThenTitle || adminNowTitle) {
          const thenFallbacks = ['globe', 'box', 'compass'];
          const nowFallbacks = ['shield', 'target', 'crown'];
          palaceState.evolution = palaceState.evolution || {};
          palaceState.evolution.thenTitle = adminThenTitle ? adminThenTitle.value.trim() : "Day 01";
          palaceState.evolution.growthLabel = adminGrowth ? adminGrowth.value.trim() : "";
          palaceState.evolution.nowTitle = adminNowTitle ? adminNowTitle.value.trim() : "Today";

          palaceState.evolution.thenPoints = [0, 1, 2].map(i => {
            const existingIcon = (palaceState.evolution.thenPoints && palaceState.evolution.thenPoints[i] && palaceState.evolution.thenPoints[i].icon) || thenFallbacks[i];
            const selVal = document.getElementById(`adminEvolThenPreset${i}`)?.value;
            const finalIcon = (selVal && selVal !== 'custom') ? selVal : existingIcon;
            return {
              icon: finalIcon,
              text: document.getElementById(`adminEvolThenText${i}`)?.value.trim() || ''
            };
          });

          palaceState.evolution.nowPoints = [0, 1, 2].map(i => {
            const existingIcon = (palaceState.evolution.nowPoints && palaceState.evolution.nowPoints[i] && palaceState.evolution.nowPoints[i].icon) || nowFallbacks[i];
            const selVal = document.getElementById(`adminEvolNowPreset${i}`)?.value;
            const finalIcon = (selVal && selVal !== 'custom') ? selVal : existingIcon;
            return {
              icon: finalIcon,
              text: document.getElementById(`adminEvolNowText${i}`)?.value.trim() || '',
              colorClass: i === 0 ? 'highlight-gold' : i === 1 ? 'highlight-cyan' : 'highlight-emerald'
            };
          });
        }

        // Collect Skills from dynamic inputs
        const sItems = document.querySelectorAll('#adminSkillsList .admin-dynamic-item');
        if (sItems && sItems.length > 0) {
          const newSkills = [];
          sItems.forEach(item => {
            const t = item.querySelector('.skill-input-title').value.trim();
            const p = parseInt(item.querySelector('.skill-input-pct').value, 10) || 90;
            const i = item.querySelector('.skill-input-icon').value.trim() || '⚡';
            const d = item.querySelector('.skill-input-desc').value.trim();
            if (t) newSkills.push({ title: t, desc: d, pct: p, icon: i });
          });
          if (newSkills.length > 0) palaceState.skills = newSkills;
        }

        // Collect Projects / Tasks from dynamic inputs
        const pItems = document.querySelectorAll('#adminProjectsList .admin-dynamic-item');
        if (pItems && pItems.length > 0) {
          const newContributions = [];
          pItems.forEach((item, idx) => {
            const pTitle = item.querySelector('.proj-input-title')?.value.trim() || `Task ${idx + 1}`;
            const pDesc = item.querySelector('.proj-input-desc')?.value.trim() || '';
            const cTitle = item.querySelector('.proj-input-contrib-title')?.value.trim() || '';
            const cDesc = item.querySelector('.proj-input-contrib-desc')?.value.trim() || '';
            const metric = item.querySelector('.proj-input-metric')?.value.trim() || '';
            const iTitle = item.querySelector('.proj-input-impact-title')?.value.trim() || '';
            const iDesc = item.querySelector('.proj-input-impact-desc')?.value.trim() || '';
            const img = item.querySelector('.proj-input-image')?.value.trim() || (palaceState.contributions && palaceState.contributions[idx]?.image) || '';

            newContributions.push({
              id: idx,
              image: img,
              project: { title: pTitle, desc: pDesc },
              contribution: { title: cTitle, desc: cDesc },
              impact: { title: iTitle, desc: iDesc, metricVal1: metric, metricLbl1: '' }
            });
          });
          if (newContributions.length > 0) palaceState.contributions = newContributions;
        }

        // Collect Projects / Tasks 2 from dynamic inputs
        const pItems2 = document.querySelectorAll('#adminProjectsList2 .admin-dynamic-item');
        if (pItems2 && pItems2.length > 0) {
          const newContributions2 = [];
          pItems2.forEach((item, idx) => {
            const pTitle = item.querySelector('.proj-input-title')?.value.trim() || `Task ${idx + 1}`;
            const pDesc = item.querySelector('.proj-input-desc')?.value.trim() || '';
            const cTitle = item.querySelector('.proj-input-contrib-title')?.value.trim() || '';
            const cDesc = item.querySelector('.proj-input-contrib-desc')?.value.trim() || '';
            const metric = item.querySelector('.proj-input-metric')?.value.trim() || '';
            const iTitle = item.querySelector('.proj-input-impact-title')?.value.trim() || '';
            const iDesc = item.querySelector('.proj-input-impact-desc')?.value.trim() || '';
            const img = item.querySelector('.proj-input-image')?.value.trim() || (palaceState.contributions2 && palaceState.contributions2[idx]?.image) || '';

            newContributions2.push({
              id: idx,
              image: img,
              project: { title: pTitle, desc: pDesc },
              contribution: { title: cTitle, desc: cDesc },
              impact: { title: iTitle, desc: iDesc, metricVal1: metric, metricLbl1: '' }
            });
          });
          if (newContributions2.length > 0) palaceState.contributions2 = newContributions2;
        }

        // Save Chamber 2b Common Image & Captions
        const adminCommonImgUrl = document.getElementById('adminCommonImgUrl');
        if (adminCommonImgUrl && adminCommonImgUrl.value.trim()) {
          palaceState.chamber2bCommonImage = adminCommonImgUrl.value.trim();
        }
        const adminCommonImgTitle = document.getElementById('adminCommonImgTitle');
        if (adminCommonImgTitle) palaceState.chamber2bCommonTitle = adminCommonImgTitle.value.trim();
        const adminCommonImgDesc = document.getElementById('adminCommonImgDesc');
        if (adminCommonImgDesc) palaceState.chamber2bCommonDesc = adminCommonImgDesc.value.trim();

        // Collect Notes from dynamic inputs
        const nItems = document.querySelectorAll('#adminNotesList .admin-dynamic-item');
        const newNotes = [];
        nItems.forEach((item, idx) => {
          const txt = item.querySelector('.note-input-text').value.trim();
          const aut = item.querySelector('.note-input-author').value.trim();
          const col = item.querySelector('.note-input-color').value;
          const pho = item.querySelector('.note-input-photo')?.value.trim() || (palaceState.stickyNotes && palaceState.stickyNotes[idx]?.photo) || '';
          if (txt) newNotes.push({ text: txt, author: aut, color: col, photo: pho });
        });
        palaceState.stickyNotes = newNotes;

        // Collect Values from dynamic inputs
        const valItems = document.querySelectorAll('#adminValuesList .admin-dynamic-item');
        if (valItems && valItems.length > 0) {
          const newValues = [];
          valItems.forEach((item, idx) => {
            const existing = (palaceState.values && palaceState.values[idx]) || {};
            const selVal = item.querySelector('.val-input-preset')?.value;
            const finalIcon = (selVal && selVal !== 'custom') ? selVal : (existing.icon || ['shield', 'sprout', 'users', 'target'][idx % 4] || 'diamond');
            const title = item.querySelector('.val-input-title')?.value.trim() || `VALUE ${idx + 1}`;
            const badge = item.querySelector('.val-input-badge')?.value.trim() || '';
            const quote = item.querySelector('.val-input-quote')?.value.trim() || '';
            const desc = item.querySelector('.val-input-desc')?.value.trim() || '';
            newValues.push({
              ...existing,
              id: existing.id || (Date.now() + idx),
              icon: finalIcon,
              title: title,
              badge: badge,
              quote: quote,
              desc: desc
            });
          });
          palaceState.values = newValues;
        }

        // Collect Thank You Room edits (from admin form inputs or live DOM)
        const adminTyBadgeInp = document.getElementById('adminThankYouBadge');
        const adminTyTitleInp = document.getElementById('adminThankYouTitle');
        const adminTySubInp = document.getElementById('adminThankYouSub');
        const adminTyMsgInp = document.getElementById('adminThankYouMsg');
        const adminTySigInp = document.getElementById('adminThankYouSig');
        const adminTyBtn1Inp = document.getElementById('adminThankYouBtn1');
        const adminTyBtn2Inp = document.getElementById('adminThankYouBtn2');
        const adminTyBtn3Inp = document.getElementById('adminThankYouBtn3');

        const liveTyBadge = document.querySelector('#chamber-thankyou .thankyou-tag-pill');
        const liveTyTitle = document.querySelector('#chamber-thankyou .thankyou-main-title');
        const liveTySub = document.querySelector('#chamber-thankyou .thankyou-subtitle');
        const liveTyMsg = document.querySelector('#chamber-thankyou .thankyou-letter-text');
        const liveTySig = document.querySelector('#chamber-thankyou .thankyou-signature-line');

        palaceState.thankYou = palaceState.thankYou || {};
        if (adminTyTitleInp && adminTyTitleInp.value.trim()) {
          palaceState.thankYou.title = adminTyTitleInp.value.trim();
        } else if (liveTyTitle) {
          palaceState.thankYou.title = liveTyTitle.textContent.trim();
        }

        if (adminTySubInp) {
          palaceState.thankYou.subtitle = adminTySubInp.value.trim();
        } else if (liveTySub) {
          palaceState.thankYou.subtitle = liveTySub.textContent.trim();
        }

        if (adminTyMsgInp && adminTyMsgInp.value.trim()) {
          palaceState.thankYou.message = adminTyMsgInp.value.trim();
        } else if (liveTyMsg) {
          palaceState.thankYou.message = liveTyMsg.textContent.trim();
        }

        if (adminTySigInp && adminTySigInp.value.trim()) {
          palaceState.thankYou.signature = adminTySigInp.value.trim();
        } else if (liveTySig) {
          palaceState.thankYou.signature = liveTySig.textContent.trim();
        }

                // Collect Proud Moments (Chamber 7 / Room 05)
        const adminPlaqueT = document.getElementById('adminProudPlaqueTitle');
        const adminPlaqueS = document.getElementById('adminProudPlaqueSubtitle');
        const adminTrophyInp = document.getElementById('adminProudTrophyImg');
        const adminCelebT = document.getElementById('adminProudCelebTitle');
        const adminCelebD = document.getElementById('adminProudCelebDesc');
        const adminCelebB = document.getElementById('adminProudCelebBtn');
        if (adminPlaqueT || adminPlaqueS || adminCelebT || document.getElementById('adminProudPhoto0')) {
          palaceState.proud = palaceState.proud || {};
          if (adminPlaqueT) palaceState.proud.plaqueTitle = adminPlaqueT.value.trim() || "INNOVATOR OF THE YEAR";
          if (adminPlaqueS) palaceState.proud.plaqueSubtitle = adminPlaqueS.value.trim() || "2025 - 2026 ANNUAL HONORS";
          if (adminTrophyInp && adminTrophyInp.value.trim()) palaceState.proud.trophyImg = adminTrophyInp.value.trim();
          if (adminCelebT) palaceState.proud.celebrateTitle = adminCelebT.value.trim() || "Celebrate This Milestone";
          if (adminCelebD) palaceState.proud.celebrateDesc = adminCelebD.value.trim() || "Trigger the palace confetti cannon and commemorate your incredible achievements.";
          if (adminCelebB) palaceState.proud.celebrateBtn = adminCelebB.value.trim() || "🎉 Fire Confetti!";

          palaceState.proud.polaroids = [0, 1, 2].map(i => {
            const existing = (palaceState.proud.polaroids && palaceState.proud.polaroids[i]) || {};
            const photoVal = document.getElementById(`adminProudPhoto${i}`)?.value.trim();
            const capVal = document.getElementById(`adminProudCaption${i}`)?.value.trim();
            return {
              image: photoVal || existing.image || (['assets/images/chambers/proud_polaroid_1.png', 'assets/images/chambers/proud_polaroid_2.png', 'assets/images/chambers/proud_polaroid_3.png'][i]),
              caption: capVal !== undefined && capVal !== '' ? capVal : (existing.caption || ['v4.0 Launch Night! 🚀', 'Hackathon Runners-up 🏆', 'All-Hands Demo Day 🎤'][i])
            };
          });
        }

        // Collect Future (Chamber 08 / Chamber 5)
        const adminFutTitle = document.getElementById('adminFutureTitle');
        const adminFutImg = document.getElementById('adminFutureImage');

        palaceState.future = palaceState.future || {};
        if (adminFutTitle && adminFutTitle.value.trim()) palaceState.future.title = adminFutTitle.value.trim();
        if (adminFutImg && adminFutImg.value.trim()) palaceState.future.image = adminFutImg.value.trim();

        palaceState.future.cards = [0, 1, 2, 3].map(i => {
          const tInp = document.getElementById(`adminFutureCardTitle${i}`);
          const sInp = document.getElementById(`adminFutureCardSub${i}`);
          const liveCard = document.querySelectorAll('#chamber-5 .future-card')[i];
          const defCards = [
            { title: "What skills do you want to build?", sub: "Share the skills or knowledge you want to develop to grow in your career." },
            { title: "What new challenges do you want to take on?", sub: "Tell us about the kind of opportunities or responsibilities you would like to explore." },
            { title: "What impact do you want to create?", sub: "How do you see yourself contributing more to your team and Uffizio?" },
            { title: "Where do you see yourself growing?", sub: "Envision your long-term goals, milestones, and leadership journey ahead." }
          ];
          return {
            title: (tInp && tInp.value.trim()) || (liveCard && liveCard.querySelector('.future-card-title')?.textContent.trim()) || defCards[i].title,
            sub: (sInp && sInp.value.trim()) || (liveCard && liveCard.querySelector('.future-card-sub')?.textContent.trim()) || defCards[i].sub
          };
        });

        // Collect Photo Memories from dynamic inputs
        const memItems = document.querySelectorAll('#adminMemoriesList .admin-dynamic-item');
        if (memItems && memItems.length > 0) {
          const newMemories = [];
          memItems.forEach((item, idx) => {
            const imgSrc = item.querySelector('.mem-img-input')?.value.trim();
            const title = item.querySelector('.mem-title-input')?.value.trim() || '';
            const tag = item.querySelector('.mem-tag-input')?.value.trim() || '';
            const date = item.querySelector('.mem-date-input')?.value.trim() || '';
            const existing = (palaceState.memories && palaceState.memories[idx]) || {};
            if (imgSrc) {
              newMemories.push({
                ...existing,
                id: existing.id || (Date.now() + idx),
                image: imgSrc,
                title: title,
                tag: tag,
                date: date
              });
            }
          });
          if (newMemories.length > 0) {
            palaceState.memories = newMemories;
          }
        }

        // Collect Photo Memories Part 2 Mode (Locked to Mode 2: Uneven White-Frame Collage)
        palaceState.memories2Mode = 'grid';

        // Collect Photo Memories Part 2 Single Ready-made Collage Image
        const mem2CollageInput = document.getElementById('inputMemories2CollageSrc');
        if (mem2CollageInput && mem2CollageInput.value.trim()) {
          palaceState.memories2CollageImage = mem2CollageInput.value.trim();
        }

        // Collect Photo Memories Part 2 dynamic multi-photo list
        const mem2Items = document.querySelectorAll('#adminMemories2List .admin-dynamic-item');
        if (mem2Items && mem2Items.length > 0) {
          const newMemories2 = [];
          mem2Items.forEach((item, idx) => {
            const imgSrc = item.querySelector('.mem2-item-src')?.value.trim();
            const existing = (palaceState.memories2 && palaceState.memories2[idx]) || {};
            if (imgSrc) {
              newMemories2.push({
                ...existing,
                id: existing.id || (Date.now() + idx),
                image: imgSrc,
                title: existing.title || `Memory Photo ${idx + 1}`,
                desc: existing.desc || ''
              });
            }
          });
          if (newMemories2.length > 0) {
            palaceState.memories2 = newMemories2;
          }
        }

        // Collect Chamber Placards & Nav Labels directly from each chamber tab
        Object.entries(CHAMBER_TAB_INPUT_MAP).forEach(([chamberId, map]) => {
          const tInp = document.getElementById(map.titleId);
          const nInp = document.getElementById(map.navId);
          const r = (palaceState.chambers || []).find(c => c.id === chamberId);
          if (r) {
            if (tInp && tInp.value.trim()) r.title = toSentenceCase(tInp.value.trim());
            if (nInp && nInp.value.trim()) r.navLabel = nInp.value.trim();
            if (chamberId === 'chamber-milestone' && palaceState.celebration && tInp) {
              palaceState.celebration.title = tInp.value.trim();
            }
          }
        });

        const c0 = palaceState.chambers.find(c => c.id === 'chamber-0');
        const c1 = palaceState.chambers.find(c => c.id === 'chamber-1');
        const c2b = palaceState.chambers.find(c => c.id === 'chamber-2b');
        const c3 = palaceState.chambers.find(c => c.id === 'chamber-3');
        const cVal = palaceState.chambers.find(c => c.id === 'chamber-values');
        const cMem2 = palaceState.chambers.find(c => c.id === 'chamber-memories-2');

        palaceState.chamberStories = {
          ch1Title: (c0 && c0.title) || "Where Your Journey Began",
          ch1Sub: (c0 && c0.sub) || "",
          ch2Title: (c1 && c1.title) || "What You Learned",
          ch2Sub: (c1 && c1.sub) || "",
          ch3Title: (c2b && c2b.title) || "Building Impact Through Innovation",
          ch3Sub: (c2b && c2b.sub) || "",
          ch2bTitle: (c2b && c2b.title) || "Building Impact Through Innovation",
          ch2bSub: (c2b && c2b.sub) || "",
          ch4Title: (c3 && c3.title) || "The People & Bonds",
          ch4Sub: (c3 && c3.sub) || "",
          chValTitle: (cVal && cVal.title) || "The Values You Bring",
          chValDesc: (cVal && cVal.sub) || "",
          chMem2Title: (cMem2 && cMem2.title) || "Celebrating A Year Of Memories",
          chMem2Desc: (cMem2 && cMem2.sub) || "",
          ch6Wish: ""
        };

        palaceState.profileVersion = Math.max(palaceState.profileVersion || 7, 7);

        // Persist to localStorage, IndexedDB & BUILTIN_PROFILES
        persistPalaceState();

        // Also update live DOM initialPalaceState tag with latest edited state
        const domInitScript = document.getElementById('initialPalaceState');
        if (domInitScript) {
          try {
            const closeScriptPattern = new RegExp('<' + '/script', 'gi');
            domInitScript.textContent = '\n' + JSON.stringify(palaceState, null, 2).replace(closeScriptPattern, () => '<\\/' + 'script') + '\n';
          } catch (e) {
            console.warn("Could not sync live initialPalaceState DOM", e);
          }
        }

        updatePalaceFromState();
        renderPlacards();
        updateSwitcherUI(currentEmpSlug || 'dhara');
        if (typeof populateProfileDropdown === 'function') {
          populateProfileDropdown();
        }
        if (typeof populateAdminInputs === 'function') {
          populateAdminInputs();
        }
        closeAdminPanel();

        if (typeof showPalaceToast === 'function') {
          showPalaceToast("✨ ફેરફારો સફળતાપૂર્વક સેવ થઈ ગયા છે અને લાગુ થઈ ગયા છે!", 3500);
        }
      });
    }


      // Milestone Tier Selection & Auto-Suggest
      const adminMilestoneTierEl = document.getElementById('adminMilestoneTier');
      const btnApplyTierTitles = document.getElementById('btnApplyTierTitles');

      if (adminMilestoneTierEl) {
        adminMilestoneTierEl.addEventListener('change', () => {
          const chosen = adminMilestoneTierEl.value;
          palaceState.milestoneTier = chosen;
          applyThemeTier(chosen);
        });
      }

      if (btnApplyTierTitles && adminMilestoneTierEl) {
        btnApplyTierTitles.addEventListener('click', () => {
          const tier = adminMilestoneTierEl.value;
          const empName = (palaceState.employee && palaceState.employee.name) || "Employee";
          
          if (tier === '1yr') {
            if (adminCelebTitle) adminCelebTitle.value = "Celebrating Your First Year With Uffizio";
            if (adminCelebSub) adminCelebSub.value = "With Uffizio";
            if (adminCelebQuote) adminCelebQuote.value = "“One year ago, a new chapter began. Today, we celebrate everything that made it meaningful.”";
          } else if (tier === '3yr') {
            if (adminCelebTitle) adminCelebTitle.value = "Celebrating 3 Remarkable Years With Uffizio";
            if (adminCelebSub) adminCelebSub.value = "Core Pillar • With Uffizio";
            if (adminCelebQuote) adminCelebQuote.value = "“Three years of building trust, mastering challenges, and shaping success together.”";
          } else if (tier === '5yr') {
            if (adminCelebTitle) adminCelebTitle.value = "Celebrating Half a Decade of Impact With Uffizio";
            if (adminCelebSub) adminCelebSub.value = "5 Years of Leadership • With Uffizio";
            if (adminCelebQuote) adminCelebQuote.value = "“Five years of passion, vision, and guiding our journey forward.”";
          } else if (tier === '10yr') {
            if (adminCelebTitle) adminCelebTitle.value = "Celebrating A Decade of Excellence With Uffizio";
            if (adminCelebSub) adminCelebSub.value = "10 Years of Timeless Impact & Legacy";
            if (adminCelebQuote) adminCelebQuote.value = "“A decade of loyalty, brilliance, and being an unbreakable pillar of Uffizio.”";
          } else if (tier === '15yr') {
            if (adminCelebTitle) adminCelebTitle.value = "Celebrating 15 Years of Sovereign Leadership With Uffizio";
            if (adminCelebSub) adminCelebSub.value = "Architect of Our Success & Culture";
            if (adminCelebQuote) adminCelebQuote.value = "“Fifteen years of forging paths, inspiring generations, and building our foundation.”";
          } else if (tier === '20yr') {
            if (adminCelebTitle) adminCelebTitle.value = "Honoring Two Decades of Timeless Heritage With Uffizio";
            if (adminCelebSub) adminCelebSub.value = "20 Years of Invaluable Dedication With Uffizio";
            if (adminCelebQuote) adminCelebQuote.value = "“Twenty years of extraordinary dedication, enduring wisdom, and a legacy that inspires us all.”";
          }
          
          alert(`✨ Titles and quotes for ${tier.toUpperCase()} milestone have been automatically set!`);
        });
      }

      // Multi-Employee Profile Switcher Events
      const selectEmployeeProfile = document.getElementById('selectEmployeeProfile');
      const btnSwitchProfile = document.getElementById('btnSwitchProfile');
      const btnToggleNewJourneyForm = document.getElementById('btnToggleNewJourneyForm');
      const newJourneyPanel = document.getElementById('newJourneyPanel');
      const btnCloseNewJourneyForm = document.getElementById('btnCloseNewJourneyForm');
      const btnCancelNewJourney = document.getElementById('btnCancelNewJourney');
      const btnSubmitNewJourney = document.getElementById('btnSubmitNewJourney');
      const btnDeleteCustomProfile = document.getElementById('btnDeleteCustomProfile');
      const topActiveProfilePill = document.getElementById('topActiveProfilePill');

      if (topActiveProfilePill) {
        topActiveProfilePill.addEventListener('click', () => {
          const exportTabBtn = document.querySelector('.admin-tab-btn[data-tab="tab-export"]');
          if (exportTabBtn) exportTabBtn.click();
        });
      }

      if (selectEmployeeProfile) {
        selectEmployeeProfile.addEventListener('change', () => {
          const selected = selectEmployeeProfile.value;
          if (selected) {
            switchActiveProfile(selected, true);
          }
        });
      }

      if (btnSwitchProfile && selectEmployeeProfile) {
        btnSwitchProfile.addEventListener('click', () => {
          const selected = selectEmployeeProfile.value;
          if (selected) {
            switchActiveProfile(selected, true);
          }
        });
      }

      if (btnToggleNewJourneyForm && newJourneyPanel) {
        btnToggleNewJourneyForm.addEventListener('click', () => {
          const isShown = newJourneyPanel.style.display !== 'none';
          newJourneyPanel.style.display = isShown ? 'none' : 'block';
          if (!isShown) {
            const inputName = document.getElementById('newJourneyEmpName');
            if (inputName) setTimeout(() => inputName.focus(), 50);
          }
        });
      }

      if (btnCloseNewJourneyForm && newJourneyPanel) {
        btnCloseNewJourneyForm.addEventListener('click', () => {
          newJourneyPanel.style.display = 'none';
        });
      }

      if (btnCancelNewJourney && newJourneyPanel) {
        btnCancelNewJourney.addEventListener('click', () => {
          newJourneyPanel.style.display = 'none';
        });
      }

      if (btnSubmitNewJourney) {
        btnSubmitNewJourney.addEventListener('click', async () => {
          const empNameInput = document.getElementById('newJourneyEmpName');
          const empName = (empNameInput ? empNameInput.value : '').trim();
          if (!empName) {
            alert("Please enter the employee's full name.");
            if (empNameInput) empNameInput.focus();
            return;
          }

          const rawSlug = empName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          const slug = rawSlug || ('emp-' + Date.now());
          const chosenTier = (document.getElementById('newJourneyTierSelect') ? document.getElementById('newJourneyTierSelect').value : '1yr') || '1yr';
          const role = ((document.getElementById('newJourneyEmpRole') ? document.getElementById('newJourneyEmpRole').value : '') || 'Software Engineer').trim();

          // Base template
          let newProfile;
          if (window.BUILTIN_PROFILES && window.BUILTIN_PROFILES['template']) {
            newProfile = JSON.parse(JSON.stringify(window.BUILTIN_PROFILES['template']));
          } else {
            newProfile = JSON.parse(JSON.stringify(palaceState));
          }

          newProfile.milestoneTier = chosenTier;
          newProfile.employee = {
            ...newProfile.employee,
            name: empName,
            role: role,
            date: "01 October 2025",
            photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
            years: "2025 → 2026"
          };

          let celebTitle = `Celebrating Your Journey With Uffizio`;
          if (chosenTier === '1yr') celebTitle = `Celebrating Your First Year With Uffizio`;
          else if (chosenTier === '3yr') celebTitle = `Celebrating 3 Remarkable Years With Uffizio`;
          else if (chosenTier === '5yr') celebTitle = `Celebrating 5 Milestone Years With Uffizio`;
          else if (chosenTier === '10yr') celebTitle = `A Decade of Excellence With Uffizio`;
          else if (chosenTier === '15yr') celebTitle = `Celebrating 15 Years of Sovereign Leadership With Uffizio`;
          else if (chosenTier === '20yr') celebTitle = `Honoring Two Decades of Timeless Heritage With Uffizio`;

          newProfile.celebration = {
            ...newProfile.celebration,
            title: celebTitle,
            sub: `With Uffizio`,
            quote: `“Celebrating dedication, milestones, and continuous growth together.”`
          };

          if (Array.isArray(newProfile.chambers)) {
            const c0 = newProfile.chambers.find(c => c.id === 'chamber-milestone');
            if (c0) c0.title = celebTitle;
          }

          if (newProfile.thankYou) {
            newProfile.thankYou.title = `Thank You, ${empName}!`;
          }

          // Save to storage
          const storageKey = getStorageKeyForProfile(slug);
          try {
            localStorage.setItem(storageKey, JSON.stringify(newProfile));
          } catch(e) {}
          saveToIndexedDB(newProfile, slug);

          // Register in custom profiles registry
          const customList = getCustomProfilesList();
          const existingIdx = customList.findIndex(p => p.slug === slug);
          const itemObj = { slug: slug, name: empName, tier: chosenTier, role: role };
          if (existingIdx >= 0) {
            customList[existingIdx] = itemObj;
          } else {
            customList.push(itemObj);
          }
          try {
            localStorage.setItem('palace_custom_profiles_registry', JSON.stringify(customList));
          } catch(e) {}

          if (newJourneyPanel) newJourneyPanel.style.display = 'none';
          if (empNameInput) empNameInput.value = '';

          await populateProfileDropdown();
          await switchActiveProfile(slug, true);
        });
      }

      if (btnDeleteCustomProfile) {
        btnDeleteCustomProfile.addEventListener('click', async () => {
          const selected = selectEmployeeProfile ? selectEmployeeProfile.value : '';
          if (!selected || selected === 'dhara' || selected === 'rahul') {
            alert('Built-in profiles cannot be deleted.');
            return;
          }
          const confirmDel = confirm(`Are you sure you want to delete profile "${selected}"?\nThis cannot be undone.`);
          if (!confirmDel) return;

          const storageKey = getStorageKeyForProfile(selected);
          try {
            localStorage.removeItem(storageKey);
          } catch(e) {}

          let customList = getCustomProfilesList();
          customList = customList.filter(p => p.slug !== selected);
          try {
            localStorage.setItem('palace_custom_profiles_registry', JSON.stringify(customList));
          } catch(e) {}

          await populateProfileDropdown();
          await switchActiveProfile('dhara', true);
          if (typeof showPalaceToast === 'function') {
            showPalaceToast(`🗑️ Profile "${selected}" deleted.`);
          }
        });
      }

    // Export Profile to JSON
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(palaceState, null, 2));
        const dlAnchor = document.createElement('a');
        const currentName = (palaceState.employee && palaceState.employee.name) || currentEmpSlug || 'employee';
        const filename = `${currentName.replace(/\s+/g, '_')}_journey.json`;
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", filename);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
      });
    }

    // Import Profile from JSON
    if (btnImportJsonTrigger && importJsonInput) {
      btnImportJsonTrigger.addEventListener('click', () => importJsonInput.click());
      importJsonInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target.result);
            if (imported.employee) palaceState.employee = imported.employee;
            if (imported.celebration) palaceState.celebration = imported.celebration;
            if (imported.milestones) palaceState.milestones = imported.milestones;
        if (imported.evolution) palaceState.evolution = imported.evolution;
            if (imported.skills) palaceState.skills = imported.skills;
            if (imported.projects) palaceState.projects = imported.projects;
            if (imported.contributions) palaceState.contributions = imported.contributions;
            if (imported.stickyNotes) palaceState.stickyNotes = imported.stickyNotes;
            if (imported.memories && Array.isArray(imported.memories)) palaceState.memories = imported.memories;
            if (imported.values && Array.isArray(imported.values)) palaceState.values = imported.values;
            if (imported.proud) palaceState.proud = imported.proud;
            if (imported.future) palaceState.future = imported.future;
            if (imported.chamberStories) palaceState.chamberStories = imported.chamberStories;
            if (imported.doorWingLeft) palaceState.doorWingLeft = imported.doorWingLeft;
            if (imported.doorWingRight) palaceState.doorWingRight = imported.doorWingRight;
            if (imported.entrance) palaceState.entrance = imported.entrance;
            if (imported.chambers && Array.isArray(imported.chambers) && imported.chambers.length > 0) {
              palaceState.chambers = imported.chambers;
            }

            persistPalaceState();
            populateAdminInputs();
            updatePalaceFromState();
            alert(`✅ Successfully loaded profile for ${palaceState.employee.name}!`);
          } catch (err) {
            alert("Invalid JSON profile file.");
          }
        };
        reader.readAsText(file);
      });
    }

    // Reset to Default
    if (btnResetDefault) {
      btnResetDefault.addEventListener('click', () => {
        if (confirm("Reset journey back to default profile?")) {
          const activeKey = getStorageKeyForProfile(currentEmpSlug);
          localStorage.removeItem(activeKey);
          if (window.indexedDB) window.indexedDB.deleteDatabase(DB_NAME);
          location.reload();
        }
      });
    }


// Global admin exports
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.populateAdminInputs = populateAdminInputs;
window.setupAdminPanelLiveSync = setupAdminPanelLiveSync;
window.setupChamberTabHeadingListeners = setupChamberTabHeadingListeners;
window.renderAdminRoomsManager = renderAdminRoomsManager;
