/* ==========================================================================
   CHAMBERS RENDER ENGINE & INTERACTIVE CONTROLLERS
   ========================================================================== */
    /* ==========================================================================
       DYNAMIC DOM RENDERING FUNCTIONS
       ========================================================================== */
    // ==========================================================================
    // ROOM 01: HORIZONTAL MOTION JOURNEY TIMELINE CONTROLLER
    // ==========================================================================
    let currentFocusMilestoneIdx = 2; // Default to last completed milestone (1 Year)
    let isCameraZoomed = false;
    let journeyDrawAnimTimer = null;

    // 1. Render Chamber 1 Milestones in Horizontal Layout
    function renderMilestones() {
      const list = document.getElementById('journeyMilestonesList');
      if (!list) return;
      const items = palaceState.milestones || [];
      if (items.length === 0) return;

      if (currentFocusMilestoneIdx >= items.length) {
        currentFocusMilestoneIdx = items.length - 1;
      }

      list.innerHTML = items.map((m, idx) => {
        let stateClass = 'is-future';
        let statusTag = '⏳ Upcoming';
        if (idx < currentFocusMilestoneIdx) {
          stateClass = 'is-past';
          statusTag = '✓ Milestone Reached';
        } else if (idx === currentFocusMilestoneIdx) {
          stateClass = 'is-current';
          statusTag = '⚡ Current Milestone';
        }

        return `
          <div class="horizontal-milestone-item ${stateClass}" data-milestone-index="${idx}" id="hMilestone-${idx}">
            <!-- Top: Date Badge -->
            <div class="milestone-date-badge">
              <span class="milestone-date" data-editable="true">${m.date || ''}</span>
            </div>

            <!-- Center: Interactive Node Anchor -->
            <div class="milestone-node-anchor">
              <div class="milestone-pulse-aura"></div>
              <div class="milestone-node-pin">
                <div class="milestone-node-core"></div>
              </div>
            </div>

            <!-- Bottom: Narrative Card -->
            <div class="milestone-narrative-card">
              <h4 class="milestone-title" data-editable="true">${m.title || ''}</h4>
              ${m.sub ? `<div class="milestone-subtext" data-editable="true">${m.sub}</div>` : ''}
              <div class="milestone-status-tag">${statusTag}</div>
            </div>
          </div>
        `;
      }).join('');

      // Attach click listeners to each milestone for focus & camera zoom
      const milestoneCards = list.querySelectorAll('.horizontal-milestone-item');
      milestoneCards.forEach(card => {
        card.addEventListener('click', (e) => {
          // If in live edit mode, don't trigger camera zoom on contenteditable click
          if (document.body.classList.contains('live-edit-active') && e.target.getAttribute('contenteditable') === 'true') {
            return;
          }
          const idx = parseInt(card.dataset.milestoneIndex, 10);
          onMilestoneClicked(idx);
        });
      });

      // Update SVG coordinates after render
      requestAnimationFrame(() => {
        updateTimelineSvgGeometry();
        if (window.innerWidth <= 768) {
          updateMobileActiveMilestoneOnScroll();
        }
      });
    }

    // Continuous Scroll-Driven Timeline Architecture with Guaranteed Achievement Stops & Direct Navigation Line
    let currentTimelineProgress = 0.0;
    let targetTimelineProgress = 0.0;
    let timelineAnimFrameId = null;
    let room01ScrollReady = false;

    // Milestone Stop & Instant-Resume State
    let currentMilestoneStop = 0; // 0, 1, 2, or 3
    let isStoppedAtMilestone = true;
    let milestoneArrivalTime = 0;
    let milestoneStepStartTime = 0;
    let isWheelSilent = true;
    let milestoneSilenceTimer = null;

    // Helper: Compute layout-stable pin center immune to 3D chamber scales/perspectives
    function getStablePinCenter(anchor, wrap) {
      let x = 0, y = 0;
      let el = anchor;
      while (el && el !== wrap) {
        x += el.offsetLeft;
        y += el.offsetTop;
        el = el.offsetParent;
      }
      x += (anchor.offsetWidth || 36) / 2;
      y += (anchor.offsetHeight || 36) / 2;
      return { x, y };
    }

    // Render Timeline Line & Active Node: Active line physically ends at active node center (100% synchronous GPS navigation)
    function renderTimelineProgress(p) {
      const svg = document.getElementById('timelineJourneySvg');
      const baseLine = document.getElementById('svgJourneyBaseLine');
      const drawnLine = document.getElementById('svgJourneyDrawnLine');
      const comet = document.getElementById('svgJourneyComet');
      const wrap = document.getElementById('horizontalTimelineTrackWrap');
      if (!svg || !baseLine || !drawnLine || !wrap) return;

      const items = document.querySelectorAll('.horizontal-milestone-item');
      if (items.length === 0) return;

      // Collect layout-stable pin center positions from fixed-size anchors
      const pinPoints = [];
      items.forEach(item => {
        const anchor = item.querySelector('.milestone-node-anchor') || item.querySelector('.milestone-node-pin');
        if (!anchor) return;
        pinPoints.push(getStablePinCenter(anchor, wrap));
      });

      if (pinPoints.length === 0) return;

      const totalWidth = Math.max(wrap.scrollWidth, wrap.clientWidth);
      const totalHeight = wrap.clientHeight;
      svg.setAttribute('width', totalWidth);
      svg.setAttribute('height', totalHeight);
      svg.style.width = totalWidth + 'px';
      svg.style.height = totalHeight + 'px';

      // 1. Background Route Guide connecting all pins
      let fullPathD = `M ${pinPoints[0].x} ${pinPoints[0].y}`;
      for (let i = 1; i < pinPoints.length; i++) {
        fullPathD += ` L ${pinPoints[i].x} ${pinPoints[i].y}`;
      }
      baseLine.setAttribute('d', fullPathD);

      // Keep gradient aligned to the full track in userSpaceOnUse
      const grad = document.getElementById('journeyGlowGradient');
      if (grad && pinPoints.length > 1) {
        grad.setAttribute('x1', pinPoints[0].x);
        grad.setAttribute('x2', pinPoints[pinPoints.length - 1].x);
        grad.setAttribute('y1', pinPoints[0].y);
        grad.setAttribute('y2', pinPoints[0].y);
      }

      const maxIdx = pinPoints.length - 1;
      const clampedP = Math.max(0, Math.min(maxIdx, p));

      // Calculate current active node coordinate (cx, cy) along the route
      const baseIdx = Math.min(maxIdx - 1, Math.floor(clampedP));
      const frac = clampedP - baseIdx;
      const p1 = pinPoints[baseIdx];
      const p2 = pinPoints[baseIdx + 1] || p1;
      const cx = p1.x + (p2.x - p1.x) * frac;
      const cy = p1.y + (p2.y - p1.y) * frac;

      // 2. ACTIVE LINE: Drawn directly from start to (cx, cy) - ZERO LAG, ZERO GLITCH!
      let activeLineD = `M ${pinPoints[0].x} ${pinPoints[0].y}`;
      for (let i = 1; i <= baseIdx; i++) {
        activeLineD += ` L ${pinPoints[i].x} ${pinPoints[i].y}`;
      }
      activeLineD += ` L ${cx} ${cy}`;

      drawnLine.setAttribute('d', activeLineD);

      // 3. ACTIVE LIVE NODE (Comet): Positioned exactly at (cx, cy)
      if (comet) {
        comet.classList.add('is-active');
        comet.setAttribute('cx', cx);
        comet.setAttribute('cy', cy);
      }

      // 4. Physical Arrival Achievement Activation (clean midpoint switch):
      const activeNodeIdx = Math.max(0, Math.min(maxIdx, Math.round(clampedP)));

      if (activeNodeIdx !== currentFocusMilestoneIdx) {
        currentFocusMilestoneIdx = activeNodeIdx;
        palaceAudio.playChime();

        if (wrap && window.innerWidth > 768 && wrap.scrollWidth > wrap.clientWidth + 10) {
          const targetItem = items[activeNodeIdx];
          if (targetItem) {
            const scrollTarget = targetItem.offsetLeft - (wrap.clientWidth - targetItem.offsetWidth) / 2;
            wrap.scrollTo({ left: scrollTarget, behavior: 'smooth' });
          }
        }
      }

      items.forEach((item, idx) => {
        item.classList.remove('is-past', 'is-current', 'is-future');
        const tag = item.querySelector('.milestone-status-tag');
        if (idx === activeNodeIdx) {
          item.classList.add('is-current');
          if (tag) tag.textContent = '⚡ Current Milestone';
        } else if (idx < activeNodeIdx) {
          item.classList.add('is-past');
          if (tag) tag.textContent = '✓ Milestone Reached';
        } else {
          item.classList.add('is-future');
          if (tag) tag.textContent = '⏳ Upcoming';
        }
      });
    }

    // Smooth RAF Loop: Direct, snappy interpolation with immediate achievement stop
    function stepTimelineAnimation() {
      const diff = targetTimelineProgress - currentTimelineProgress;
      if (Math.abs(diff) > 0.003) {
        currentTimelineProgress += diff * 0.28; // responsive, buttery smooth glide
        renderTimelineProgress(currentTimelineProgress);
        timelineAnimFrameId = requestAnimationFrame(stepTimelineAnimation);
      } else {
        currentTimelineProgress = targetTimelineProgress;
        renderTimelineProgress(currentTimelineProgress);
        timelineAnimFrameId = null;

        // When arrived at an integer achievement stop:
        const reachedStop = Math.round(currentTimelineProgress);
        isStoppedAtMilestone = true;
        currentMilestoneStop = reachedStop;
        milestoneArrivalTime = performance.now();
      }
    }

    function queueTimelineProgress(targetP) {
      targetTimelineProgress = targetP;
      if (!timelineAnimFrameId) {
        timelineAnimFrameId = requestAnimationFrame(stepTimelineAnimation);
      }
    }

    function updateTimelineSvgGeometry(animateDraw = false) {
      renderTimelineProgress(currentTimelineProgress);
    }

    // Milestone Click Handler
    function onMilestoneClicked(targetIdx) {
      palaceAudio.init();
      palaceAudio.playChime();
      const items = palaceState.milestones || [];
      if (targetIdx < 0 || targetIdx >= items.length) return;
      currentMilestoneStop = targetIdx;
      isStoppedAtMilestone = false;
      isWheelSilent = true;
      milestoneStepStartTime = performance.now();
      if (milestoneSilenceTimer) clearTimeout(milestoneSilenceTimer);
      queueTimelineProgress(targetIdx);

      // On mobile vertical timeline, smoothly scroll clicked milestone into view
      if (window.innerWidth <= 768) {
        const wrap = document.getElementById('horizontalTimelineTrackWrap');
        const milestoneEls = document.querySelectorAll('.horizontal-milestone-item');
        const targetEl = milestoneEls[targetIdx];
        if (wrap && targetEl) {
          const scrollTarget = targetEl.offsetTop - (wrap.clientHeight - targetEl.offsetHeight) / 2;
          wrap.scrollTo({ top: scrollTarget, behavior: 'smooth' });
        }
      }
    }

    // Reset Camera View (Kept for compatibility)
    function resetCameraZoom() {
      // Stage remains completely steady and rock solid; no whole-stage zooming
    }

    // Setup reset button listener
    const btnResetCamEl = document.getElementById('btnResetCamera');
    if (btnResetCamEl) {
      btnResetCamEl.addEventListener('click', (e) => {
        e.stopPropagation();
        resetCameraZoom();
      });
    }

    // Room 01 Activation Hook (Triggered when entering Chamber 01)
    function activateRoom01Motion(startFromLast = false) {
      resetCameraZoom();
      if (timelineAnimFrameId) {
        cancelAnimationFrame(timelineAnimFrameId);
        timelineAnimFrameId = null;
      }
      room01ScrollReady = false;

      const items = palaceState.milestones || [];
      const maxIdx = items.length > 0 ? items.length - 1 : 0;
      currentFocusMilestoneIdx = (startFromLast && items.length > 0) ? maxIdx : 0;
      currentMilestoneStop = currentFocusMilestoneIdx;
      isStoppedAtMilestone = true;
      isWheelSilent = true;
      milestoneArrivalTime = performance.now();
      milestoneStepStartTime = performance.now();
      if (milestoneSilenceTimer) clearTimeout(milestoneSilenceTimer);

      targetTimelineProgress = currentFocusMilestoneIdx;
      currentTimelineProgress = currentFocusMilestoneIdx;

      // Only render DOM if items list is empty; avoid DOM reconstruction during transition
      const list = document.getElementById('journeyMilestonesList');
      if (!list || list.children.length === 0) {
        renderMilestones();
      }

      if (window.innerWidth <= 768) {
        const wrap = document.getElementById('horizontalTimelineTrackWrap');
        if (wrap) {
          wrap.scrollTo({ top: startFromLast ? wrap.scrollHeight : 0, behavior: 'auto' });
        }
      }

      renderTimelineProgress(currentTimelineProgress);

      // Unlock scroll only AFTER room transition completes smoothly
      setTimeout(() => {
        room01ScrollReady = true;
        updateTimelineSvgGeometry(false);
      }, ROOM_TRANSITION_MS + 60);
    }

    window.addEventListener('resize', () => {
      if (isCurrentRoom('chamber-0')) {
        updateTimelineSvgGeometry(false);
      }
    });

    // Update active milestone dynamically on mobile finger scroll without triggering programmatic jumps
    function updateMobileActiveMilestoneOnScroll() {
      const wrap = document.getElementById('horizontalTimelineTrackWrap');
      if (!wrap || window.innerWidth > 768) return;
      const items = wrap.querySelectorAll('.horizontal-milestone-item');
      if (items.length === 0) return;

      const maxScroll = wrap.scrollHeight - wrap.clientHeight;
      let closestIdx = 0;

      // 1. Extreme Top Boundary Check: Always activate the first milestone at the top
      if (wrap.scrollTop <= 45) {
        closestIdx = 0;
      }
      // 2. Extreme Bottom Boundary Check: Always activate the last milestone at the bottom
      else if (maxScroll > 0 && wrap.scrollTop >= maxScroll - 60) {
        closestIdx = items.length - 1;
      }
      // 3. Dynamic Viewing Center in between
      else {
        const wrapRect = wrap.getBoundingClientRect();
        // Dynamic target line shifts smoothly from 22% near top to 70% near bottom
        const progress = maxScroll > 0 ? Math.max(0, Math.min(1, wrap.scrollTop / maxScroll)) : 0.5;
        const targetPercent = 0.22 + progress * 0.48;
        const targetY = wrapRect.top + wrapRect.height * targetPercent;

        let minDistance = Infinity;
        items.forEach((item, idx) => {
          const rect = item.getBoundingClientRect();
          const itemCenterY = rect.top + rect.height / 2;
          const dist = Math.abs(itemCenterY - targetY);
          if (dist < minDistance) {
            minDistance = dist;
            closestIdx = idx;
          }
        });
      }

      if (closestIdx !== currentFocusMilestoneIdx) {
        currentFocusMilestoneIdx = closestIdx;
        currentMilestoneStop = closestIdx;
        items.forEach((item, idx) => {
          item.classList.remove('is-past', 'is-current', 'is-future');
          const tag = item.querySelector('.milestone-status-tag');
          if (idx === closestIdx) {
            item.classList.add('is-current');
            if (tag) tag.textContent = '⚡ Current Milestone';
          } else if (idx < closestIdx) {
            item.classList.add('is-past');
            if (tag) tag.textContent = '✓ Milestone Reached';
          } else {
            item.classList.add('is-future');
            if (tag) tag.textContent = '⏳ Upcoming';
          }
        });
      }
    }

    const hTrackWrapEl = document.getElementById('horizontalTimelineTrackWrap');
    if (hTrackWrapEl) {
      let isHScrollTicking = false;
      hTrackWrapEl.addEventListener('scroll', () => {
        if (window.innerWidth > 768) return;
        if (!isHScrollTicking) {
          requestAnimationFrame(() => {
            updateMobileActiveMilestoneOnScroll();
            isHScrollTicking = false;
          });
          isHScrollTicking = true;
        }
      }, { passive: true });
    }


        // Helper to check if a specific chamber ID is the currently displayed room
    function isCurrentRoom(roomId) {
      if (typeof currentStage === 'undefined' || currentStage <= 0) return false;
      if (!chambers || chambers.length === 0) return false;
      const r = chambers[currentStage - 1];
      return r ? r.id === roomId : false;
    }

    // ==========================================================================
    // COHESIVE VECTOR SVG ICON FAMILY & UPLOAD ENGINE FOR WHAT YOU LEARNED
    // ==========================================================================
    const EVOLUTION_PRESET_ICONS = {
      globe: '<svg class="point-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20"/><path d="M12 2a14.5 14.5 0 0 1 0 20"/><path d="M2 12h20"/></svg>',
      box: '<svg class="point-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
      compass: '<svg class="point-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
      shield: '<svg class="point-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
      target: '<svg class="point-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
      crown: '<svg class="point-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>',
      rocket: '<svg class="point-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
      zap: '<svg class="point-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
      award: '<svg class="point-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="m15.477 12.89 2.523 8.11-6-3-6 3 2.523-8.11"/></svg>',
      users: '<svg class="point-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      star: '<svg class="point-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      check: '<svg class="point-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      book: '<svg class="point-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
      chart: '<svg class="point-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect width="4" height="7" x="7" y="10" rx="1"/><rect width="4" height="12" x="15" y="5" rx="1"/></svg>',
      growth: '<svg class="point-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect width="4" height="7" x="7" y="10" rx="1"/><rect width="4" height="12" x="15" y="5" rx="1"/></svg>'
    };

    function renderIconContent(iconData, fallbackKey) {
      if (!iconData) {
        return EVOLUTION_PRESET_ICONS[fallbackKey] || '';
      }
      const rawStr = String(iconData).trim();
      const key = rawStr.toLowerCase();
      if (EVOLUTION_PRESET_ICONS[key]) {
        return EVOLUTION_PRESET_ICONS[key];
      }
      if (rawStr.startsWith('<svg')) {
        return rawStr;
      }
      if (rawStr.startsWith('data:image') || rawStr.endsWith('.png') || rawStr.endsWith('.svg') || rawStr.endsWith('.jpg') || rawStr.endsWith('.webp') || rawStr.startsWith('http')) {
        return `<img src="${rawStr}" class="point-icon-img" alt="icon">`;
      }
      const emojiMap = {
        '🌐': 'globe',
        '📦': 'box',
        '🧭': 'compass',
        '🛡️': 'shield',
        '🎯': 'target',
        '👑': 'crown',
        '⚡': 'zap',
        '🚀': 'rocket',
        '🏆': 'award',
        '👥': 'users',
        '⭐': 'star'
      };
      if (emojiMap[rawStr]) {
        return EVOLUTION_PRESET_ICONS[emojiMap[rawStr]];
      }
      return rawStr;
    }

    // Direct click-to-upload SVG or PNG icon from device
    window.triggerEvolutionIconUpload = function(type, idx) {
      if (typeof palaceAccessMode !== 'undefined' && palaceAccessMode === 'view') return;
      let fileInput = document.getElementById('evolutionIconFileInput');
      if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'evolutionIconFileInput';
        fileInput.accept = 'image/png, image/svg+xml, image/jpeg, image/webp';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
      }

      fileInput.onchange = function(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
          const iconUrl = evt.target.result;
          palaceState.evolution = palaceState.evolution || {};
          const pointsKey = type === 'then' ? 'thenPoints' : 'nowPoints';
          palaceState.evolution[pointsKey] = palaceState.evolution[pointsKey] || [];
          if (!palaceState.evolution[pointsKey][idx]) {
            palaceState.evolution[pointsKey][idx] = {};
          }
          palaceState.evolution[pointsKey][idx].icon = iconUrl;

          persistPalaceState();
          renderEvolutionRoom();
          if (typeof populateAdminEvolution === 'function') {
            populateAdminEvolution();
          }
          showPalaceToast("✨ Icon successfully updated!", 3000);
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
      };

      fileInput.click();
    };

    window.onAdminIconPresetChange = function(type, idx, value) {
      if (value === 'custom') {
        triggerEvolutionIconUpload(type, idx);
        return;
      }
      palaceState.evolution = palaceState.evolution || {};
      const pointsKey = type === 'then' ? 'thenPoints' : 'nowPoints';
      palaceState.evolution[pointsKey] = palaceState.evolution[pointsKey] || [];
      if (!palaceState.evolution[pointsKey][idx]) {
        palaceState.evolution[pointsKey][idx] = {};
      }
      palaceState.evolution[pointsKey][idx].icon = value;

      persistPalaceState();
      renderEvolutionRoom();
      const preview = document.getElementById(type === 'then' ? `adminEvolThenPreview${idx}` : `adminEvolNowPreview${idx}`);
      if (preview) {
        preview.innerHTML = renderIconContent(value, value);
      }
    };

    // 2. Render Chamber 1 Evolution (What You Learned)
    function renderEvolutionRoom() {
      const evo = palaceState.evolution;
      if (!evo) return;

      // Update 3 Horizontal Capsule / Pill Cards UI
      const pillCards = document.querySelectorAll('.evolution-pill-card');
      if (pillCards && pillCards.length > 0) {
        const thenFallbacks = ['globe', 'box', 'compass'];
        const nowFallbacks = ['shield', 'target', 'crown'];
        pillCards.forEach((card, idx) => {
          const thenEl = card.querySelector('.evolution-then-text');
          const nowEl = card.querySelector('.evolution-now-text');
          if (thenEl && evo.thenPoints && evo.thenPoints[idx] && evo.thenPoints[idx].text !== undefined) {
            thenEl.textContent = evo.thenPoints[idx].text;
          }
          if (nowEl && evo.nowPoints && evo.nowPoints[idx] && evo.nowPoints[idx].text !== undefined) {
            nowEl.textContent = evo.nowPoints[idx].text;
          }

          const thenIconBox = card.querySelector('.evolution-then-icon');
          const nowIconBox = card.querySelector('.evolution-now-icon');
          if (thenIconBox && evo.thenPoints && evo.thenPoints[idx]) {
            thenIconBox.innerHTML = renderIconContent(evo.thenPoints[idx].icon, thenFallbacks[idx] || 'globe');
          }
          if (nowIconBox && evo.nowPoints && evo.nowPoints[idx]) {
            nowIconBox.innerHTML = renderIconContent(evo.nowPoints[idx].icon, nowFallbacks[idx] || 'shield');
          }
        });
      }

      // Legacy support for two-column card layout if present
      const thenTitle = document.querySelector('.evolution-then .evolution-heading');
      if (thenTitle && evo.thenTitle) thenTitle.textContent = evo.thenTitle;

      const thenFallbacks = ['globe', 'box', 'compass'];
      const thenItems = document.querySelectorAll('.evolution-then .evolution-point-item');
      if (thenItems && evo.thenPoints) {
        thenItems.forEach((item, idx) => {
          const p = evo.thenPoints[idx];
          if (!p) return;
          const iconBox = item.querySelector('.point-icon-box');
          const textBox = item.querySelector('.point-text');
          if (iconBox) {
            iconBox.innerHTML = renderIconContent(p.icon, thenFallbacks[idx] || 'globe');
          }
          if (textBox && p.text !== undefined) textBox.textContent = p.text;
        });
      }

      const conduitLbl = document.querySelector('.conduit-lbl');
      if (conduitLbl && evo.growthLabel) conduitLbl.textContent = evo.growthLabel;

      const nowTitle = document.querySelector('.evolution-now .evolution-heading');
      if (nowTitle && evo.nowTitle) nowTitle.textContent = evo.nowTitle;

      const nowFallbacks = ['shield', 'target', 'crown'];
      const nowItems = document.querySelectorAll('.evolution-now .evolution-point-item');
      if (nowItems && evo.nowPoints) {
        nowItems.forEach((item, idx) => {
          const p = evo.nowPoints[idx];
          if (!p) return;
          const iconBox = item.querySelector('.point-icon-box');
          const textBox = item.querySelector('.point-text');
          if (iconBox) {
            iconBox.innerHTML = renderIconContent(p.icon, nowFallbacks[idx] || 'shield');
          }
          if (textBox && p.text !== undefined) textBox.textContent = p.text;
        });
      }
    }

    // 2. Render Chamber 2 Visual Skill Pillars
    function renderSkills() {
      const container = document.getElementById('skillCardsContainer');
      if (!container) return;
      const skills = (palaceState.skills && palaceState.skills.length > 0) ? palaceState.skills : [
        { title: "Knowledge", desc: "Product & Architecture", pct: 98, icon: "🧠", tag: "Product Mastery" },
        { title: "Communication", desc: "Cross-Team Synergy", pct: 95, icon: "💬", tag: "Team Alignment" },
        { title: "Problem Solving", desc: "First-Principles Triage", pct: 96, icon: "🧩", tag: "Rapid Resolution" },
        { title: "Confidence", desc: "Autonomous Ownership", pct: 98, icon: "🛡️", tag: "High Autonomy" }
      ];

      container.innerHTML = skills.map((s, idx) => `
        <div class="visual-skill-pill-card" data-skill-index="${idx}">
          <div class="skill-icon-halo">
            <span class="skill-large-icon" data-editable="true">${s.icon || '⚡'}</span>
          </div>
          <div class="skill-card-text">
            <div class="skill-card-title" data-editable="true">${s.title}</div>
            <div class="skill-card-tag" data-editable="true">${s.tag || s.desc || 'Mastered'}</div>
          </div>
          <div class="skill-metric-badge">
            <span class="skill-metric-pct" data-editable="true">${s.pct || 98}%</span>
            <span class="skill-metric-lbl">Growth</span>
          </div>
        </div>
      `).join('');
      if (window.updateSkillsFadeMask) {
        setTimeout(window.updateSkillsFadeMask, 80);
      }
    }

        // Helper to safely escape attribute strings
    function escapeHtmlAttr(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    // 3. Render Chamber 3: Visual Creations Cards with Images & Story Modal
    const defaultProjectImages = [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&auto=format&fit=crop&q=80", // SLA Enterprise Analytics
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=700&auto=format&fit=crop&q=80", // SOP Guides & Workshop
      "https://images.unsplash.com/photo-1524522173746-f628baad3644?w=700&auto=format&fit=crop&q=80", // Fleet Telematics & Map
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&auto=format&fit=crop&q=80", // Client Advocacy & Partnerships
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&auto=format&fit=crop&q=80"  // Milestone Product Delivery
    ];

    let currentProjectModalIndex = 0;

    function renderProjects() {
      const grid = document.getElementById('creationsCardsGrid');
      const tableBody = document.getElementById('impactTableBody');
      const rowsCounter = document.getElementById('tableRowsCounter');
      const contributions = palaceState.contributions || [];

      if (rowsCounter) {
        rowsCounter.textContent = `${contributions.length} ${contributions.length === 1 ? 'Project' : 'Projects'} Logged`;
      }

      const accents = [
        { theme: 'cyan', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.35)', glow: 'rgba(56, 189, 248, 0.22)', badgeBg: 'rgba(56, 189, 248, 0.12)', badgeBorder: 'rgba(56, 189, 248, 0.35)', badgeColor: '#38bdf8' },
        { theme: 'gold', color: '#f5c065', border: 'rgba(245, 192, 101, 0.38)', glow: 'rgba(245, 192, 101, 0.22)', badgeBg: 'rgba(245, 192, 101, 0.12)', badgeBorder: 'rgba(245, 192, 101, 0.38)', badgeColor: '#f5c065' },
        { theme: 'emerald', color: '#34d399', border: 'rgba(52, 211, 153, 0.35)', glow: 'rgba(52, 211, 153, 0.22)', badgeBg: 'rgba(52, 211, 153, 0.12)', badgeBorder: 'rgba(52, 211, 153, 0.35)', badgeColor: '#34d399' },
        { theme: 'violet', color: '#a78bfa', border: 'rgba(167, 139, 250, 0.35)', glow: 'rgba(167, 139, 250, 0.22)', badgeBg: 'rgba(167, 139, 250, 0.12)', badgeBorder: 'rgba(167, 139, 250, 0.35)', badgeColor: '#a78bfa' },
        { theme: 'amber', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.35)', glow: 'rgba(251, 191, 36, 0.22)', badgeBg: 'rgba(251, 191, 36, 0.12)', badgeBorder: 'rgba(251, 191, 36, 0.35)', badgeColor: '#fbbf24' }
      ];

      if (grid) {
        if (contributions.length === 0) {
          grid.innerHTML = `
            <div style="width: 100%; text-align:center; padding: 36px 20px; color: #64748b; font-style: italic;">
              No creations listed yet. Use the Admin Panel to add tasks.
            </div>
          `;
        } else {
          grid.innerHTML = contributions.map((c, idx) => {
            const accent = accents[idx % accents.length];
            const taskNumStr = String(idx + 1).padStart(2, '0');
            const imgSrc = c.image || defaultProjectImages[idx % defaultProjectImages.length] || 'assets/images/portal/where_it_started.png';
            const pTitle = c.project?.title || `Project ${idx + 1}`;
            const pDesc = (c.project?.desc || '').trim();
            const cTitle = (c.contribution?.title || '').trim();
            const cDesc = (c.contribution?.desc || '').trim();
            const iTitle = (c.impact?.title || '').trim();

            let summaryText = cDesc || pDesc || 'Delivered mission-critical technical milestones and high customer satisfaction.';

            let rawVal = (c.impact?.metricVal1 || '').trim();
            let rawLbl = (c.impact?.metricLbl1 || '').trim();

            let mVal = rawVal;
            let mLbl = rawLbl;

            if (!mVal) {
              if (idx === 0) { mVal = '99.8%'; mLbl = 'SLA Maintained'; }
              else if (idx === 1) { mVal = '60+'; mLbl = 'Guides Authored'; }
              else if (idx === 2) { mVal = '150+'; mLbl = 'Fleets Safeguarded'; }
              else if (idx === 3) { mVal = '500+'; mLbl = 'Breakthroughs'; }
              else { mVal = '100%'; mLbl = 'Success Rate'; }
            }

            if (mVal.includes(' ') && (!mLbl || mLbl.toLowerCase().includes('key impact'))) {
              const sp = mVal.indexOf(' ');
              mLbl = mVal.substring(sp + 1).trim();
              mVal = mVal.substring(0, sp).trim();
            }

            if (!mLbl || mLbl.toLowerCase().includes('key impact')) {
              if (idx === 0) mLbl = 'SLA Maintained';
              else if (idx === 1) mLbl = 'Guides Authored';
              else if (idx === 2) mLbl = 'Fleets Safeguarded';
              else if (idx === 3) mLbl = 'Breakthroughs';
              else mLbl = 'Impact Achieved';
            }

            return `
              <div class="creation-visual-card" data-card-index="${idx}" style="--card-accent-color: ${accent.color}; --card-accent-border: ${accent.border}; --card-accent-glow: ${accent.glow};" onclick="openProjectLightbox(${idx})">
                
                <div class="creation-card-img-wrap" title="Click to view full project story">
                  <img src="${escapeHtmlAttr(imgSrc)}" alt="${escapeHtmlAttr(pTitle)}" class="creation-card-img" onerror="this.src='assets/images/portal/where_it_started.png'">
                  <div class="creation-img-gradient-overlay"></div>
                  <div class="creation-img-top-row">
                    <span class="creation-task-badge" style="background: ${accent.badgeBg}; border-color: ${accent.badgeBorder}; color: ${accent.badgeColor};">PROJECT ${taskNumStr}</span>
                  </div>
                </div>

                <div class="creation-card-content">
                  <div class="creation-card-top-row">
                    <span class="creation-metric-lbl">${mLbl}</span>
                    <span class="creation-stat-pill" data-editable="true" onclick="event.stopPropagation()">${mVal}</span>
                  </div>

                  <h3 class="creation-project-title" data-editable="true" onclick="event.stopPropagation()" title="${escapeHtmlAttr(pTitle)}">${pTitle}</h3>
                  <p class="creation-project-summary" data-editable="true" onclick="event.stopPropagation()" title="${escapeHtmlAttr(summaryText)}">${summaryText}</p>

                  <div class="creation-card-footer-pills">
                    ${cTitle ? `
                      <div class="creation-highlight-pill" data-editable="true" onclick="event.stopPropagation()" title="${escapeHtmlAttr(cTitle)}">
                        <span class="creation-pill-dot" style="background: ${accent.color}; box-shadow: 0 0 6px ${accent.color};"></span>
                        <span class="creation-contrib-title">${cTitle}</span>
                      </div>
                    ` : ''}
                    <span class="creation-explore-btn">Story ↗</span>
                  </div>
                </div>

              </div>
            `;
          }).join('');
        }
      }

      initCreationsScrollControls();

      // Legacy table fallback
      if (tableBody) {
        if (contributions.length === 0) {
          tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 24px; color: #64748b;">No contributions listed yet.</td></tr>`;
        } else {
          tableBody.innerHTML = contributions.map((c, idx) => {
            const pTitle = c.project?.title || '';
            const cTitle = c.contribution?.title || '';
            const iTitle = c.impact?.title || '';
            const mVal1 = (c.impact?.metricVal1 || '').trim();
            const mLbl1 = (c.impact?.metricLbl1 || '').trim();
            const metricDisplay = mVal1 ? `${mVal1} ${mLbl1}`.trim() : '';
            return `
              <tr class="impact-table-row" data-row-index="${idx}">
                <td class="col-project"><span class="tbl-title tbl-project-title" data-editable="true">${pTitle}</span></td>
                <td class="col-contrib"><span class="tbl-title tbl-contrib-title" data-editable="true">${cTitle}</span></td>
                <td class="col-impact">${metricDisplay ? `<span class="tbl-impact-badge" data-editable="true">${metricDisplay}</span> ` : ''}<span class="tbl-title tbl-impact-title" data-editable="true">${iTitle}</span></td>
              </tr>
            `;
          }).join('');
        }
      }
    }

    // Interactive Project Lightbox Engine
    let currentProjectModalSource = 1; // 1: contributions, 2: contributions2

    function openProjectLightbox(idx, source = 1) {
      const modal = document.getElementById('projectLightboxModal');
      if (!modal) return;
      currentProjectModalSource = source;
      const list = currentProjectModalSource === 2 ? (palaceState.contributions2 || []) : (palaceState.contributions || []);
      if (list.length === 0) return;

      currentProjectModalIndex = (idx + list.length) % list.length;
      updateProjectModalContent();
      modal.classList.add('active');
    }

    function closeProjectLightbox() {
      const modal = document.getElementById('projectLightboxModal');
      if (modal) modal.classList.remove('active');
    }

    function navigateProjectModal(step) {
      const list = currentProjectModalSource === 2 ? (palaceState.contributions2 || []) : (palaceState.contributions || []);
      if (list.length === 0) return;
      currentProjectModalIndex = (currentProjectModalIndex + step + list.length) % list.length;
      updateProjectModalContent();
    }

    function updateProjectModalContent() {
      const list = currentProjectModalSource === 2 ? (palaceState.contributions2 || []) : (palaceState.contributions || []);
      if (list.length === 0) return;
      const c = list[currentProjectModalIndex] || list[0];

      const img = document.getElementById('projLightboxImg');
      const badge = document.getElementById('projLightboxBadge');
      const metric = document.getElementById('projLightboxMetric');
      const title = document.getElementById('projLightboxTitle');
      const desc = document.getElementById('projLightboxDesc');
      const contrib = document.getElementById('projLightboxContrib');
      const impact = document.getElementById('projLightboxImpact');
      const counter = document.getElementById('projModalCounter');

      const imgSrc = c.image || defaultProjectImages[currentProjectModalIndex % defaultProjectImages.length] || 'assets/images/portal/where_it_started.png';
      if (img) img.src = imgSrc;
      if (badge) badge.textContent = `PROJECT ${String(currentProjectModalIndex + 1).padStart(2, '0')}`;
      
      const mVal = (c.impact?.metricVal1 || '100%').trim();
      const mLbl = (c.impact?.metricLbl1 || '').trim();
      if (metric) metric.textContent = `${mVal} ${mLbl}`.trim();
      
      if (title) title.textContent = c.project?.title || `Project ${currentProjectModalIndex + 1}`;
      if (desc) desc.textContent = c.project?.desc || 'Delivering mission-critical technical support and customer satisfaction.';
      if (contrib) contrib.textContent = c.contribution?.desc || c.contribution?.title || 'Owned execution, triage, and cross-functional fixes.';
      if (impact) impact.textContent = (c.impact?.desc || '') ? `${c.impact.title ? c.impact.title + ' — ' : ''}${c.impact.desc}` : (c.impact?.title || 'Maintained top quality and customer retention throughout Year 1.');
      if (counter) counter.textContent = `${currentProjectModalIndex + 1} / ${list.length}`;
    }

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeProjectLightbox();
      }
    });

    // Initialize horizontal scroll arrows for creations showcase
    function initCreationsScrollControls() {
      const grid = document.getElementById('creationsCardsGrid');
      const btnPrev = document.getElementById('btnCreationsPrev');
      const btnNext = document.getElementById('btnCreationsNext');
      if (!grid) return;

      if (btnPrev && !btnPrev.dataset.initialized) {
        btnPrev.dataset.initialized = 'true';
        btnPrev.addEventListener('click', (e) => {
          e.stopPropagation();
          grid.scrollBy({ left: -536, behavior: 'smooth' });
        });
      }

      if (btnNext && !btnNext.dataset.initialized) {
        btnNext.dataset.initialized = 'true';
        btnNext.addEventListener('click', (e) => {
          e.stopPropagation();
          grid.scrollBy({ left: 536, behavior: 'smooth' });
        });
      }

      function updateArrows() {
        const wrapper = document.getElementById('creationsCardsWrapper');
        const isScrolled = grid.scrollLeft > 18;

        if (wrapper) {
          if (isScrolled) {
            wrapper.classList.add('has-scrolled-left');
          } else {
            wrapper.classList.remove('has-scrolled-left');
          }
        }

        if (!btnPrev || !btnNext) return;
        const maxScroll = grid.scrollWidth - grid.clientWidth;

        if (maxScroll <= 8) {
          btnPrev.style.display = 'none';
          btnNext.style.display = 'none';
        } else {
          btnPrev.style.display = isScrolled ? 'flex' : 'none';
          btnNext.style.display = (grid.scrollLeft < maxScroll - 15) ? 'flex' : 'none';
        }
      }

      if (grid.removeEventListener && grid._updateArrowsListener) {
        grid.removeEventListener('scroll', grid._updateArrowsListener);
      }
      grid._updateArrowsListener = updateArrows;
      if (grid.addEventListener) {
        grid.addEventListener('scroll', updateArrows, { passive: true });
      }
      window.addEventListener('resize', updateArrows);
      setTimeout(updateArrows, 150);
    }

    // Chamber 2b: Split View Creations Showcase (4 Themed Floating Cards & Globe Showcase)
    const CREATION_THEMES = [
      {
        themeClass: 'theme-blue',
        iconSvg: `<svg class="split-card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>`
      },
      {
        themeClass: 'theme-blue',
        iconSvg: `<svg class="split-card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>`
      },
      {
        themeClass: 'theme-blue',
        iconSvg: `<svg class="split-card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>`
      },
      {
        themeClass: 'theme-blue',
        iconSvg: `<svg class="split-card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
          <line x1="2" y1="20" x2="22" y2="20"></line>
        </svg>`
      }
    ];

    function renderProjects2() {
      const grid = document.getElementById('creationsCardsGrid2');
      const contributions = palaceState.contributions2 || [];

      if (grid) {
        if (contributions.length === 0) {
          grid.classList.remove('has-many-projects');
          grid.innerHTML = `
            <div style="text-align:center; padding: 48px 20px; color: #64748b; font-style: italic;">
              No creations listed yet for this employee.<br>
              <span style="font-size: 12px; color: #475569;">Use Admin Panel to add projects, or Hide this room in Rooms Manager.</span>
            </div>
          `;
        } else {
          if (contributions.length > 5) {
            grid.classList.add('has-many-projects');
          } else {
            grid.classList.remove('has-many-projects');
          }

          grid.innerHTML = contributions.map((c, idx) => {
            const pTitle = c.project?.title || `Project ${idx + 1}`;
            const theme = CREATION_THEMES[idx % CREATION_THEMES.length];

            return `
              <div class="split-creation-card ${theme.themeClass}" data-card-index="${idx}" onclick="openProjectLightbox(${idx}, 2)">
                <div class="split-card-icon-col">
                  ${theme.iconSvg}
                </div>
                <div class="split-card-content-col">
                  <h3 class="split-card-title" data-editable="true" onclick="event.stopPropagation()" title="${escapeHtmlAttr(pTitle)}">${escapeHtml(pTitle)}</h3>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      resetChamber2bCommonImage();
    }

    function resetChamber2bCommonImage() {
      const commonImg = document.getElementById('chamber2bCommonImg');
      const commonBadge = document.getElementById('chamber2bCommonBadge');
      const commonTitle = document.getElementById('chamber2bCommonTitle');
      const commonDesc = document.getElementById('chamber2bCommonDesc');
      if (!commonImg) return;

      const defaultImg = palaceState.chamber2bCommonImage || "assets/images/chambers/creations_showcase_common.png";
      commonImg.src = defaultImg;
      if (commonBadge) commonBadge.textContent = `🚀 KEY DELIVERABLES`;
      if (commonTitle) commonTitle.textContent = palaceState.chamber2bCommonTitle || "Innovation & Systems In Action";
      if (commonDesc) commonDesc.textContent = palaceState.chamber2bCommonDesc || "Real-time architecture, proactive incident workflows, and high-impact partner success.";
    }

    function openAdminPanelToTab(tabName) {
      if (typeof palaceAccessMode !== 'undefined' && palaceAccessMode === 'view') return;
      if (typeof openAdminPanel === 'function') openAdminPanel();
      if (tabName === 'tab-projects') tabName = 'tab-projects-2';
      if (tabName === 'tab-memories') tabName = 'tab-memories-2';
      const targetTab = document.querySelector(`.admin-tab-btn[data-tab="${tabName}"]`);
      if (targetTab) {
        setTimeout(() => {
          targetTab.click();
        }, 50);
      }
    }

    // 4. Render Chamber 4 Sticky Notes with Author Photos
    const defaultStickyPhotos = [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80"
    ];

    window.triggerStickyPhotoUpload = function(idx) {
      if (typeof palaceAccessMode !== 'undefined' && palaceAccessMode === 'view') return;
      let fileInput = document.getElementById('stickyPhotoFileInput');
      if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'stickyPhotoFileInput';
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
          if (palaceState.stickyNotes && palaceState.stickyNotes[idx]) {
            palaceState.stickyNotes[idx].photo = dataUrl;
            persistPalaceState();
            renderStickyNotes();
          }
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
      };
      fileInput.click();
    };

    function renderStickyNotes() {
      const stickyNotesBoard = document.getElementById('stickyNotesBoard');
      if (!stickyNotesBoard) return;
      stickyNotesBoard.innerHTML = (palaceState.stickyNotes || []).map((note, idx) => {
        const photoSrc = note.photo || defaultStickyPhotos[idx % defaultStickyPhotos.length];
        let authorName = note.author || 'Teammate';
        let authorRole = note.role || '';
        if (!authorRole && authorName.includes('•')) {
          const parts = authorName.split('•');
          authorName = parts[0].trim();
          authorRole = parts.slice(1).join('•').trim();
        } else if (!authorRole && authorName.includes('—')) {
          const parts = authorName.split('—');
          authorName = parts[0].trim();
          authorRole = parts.slice(1).join('—').trim();
        }

        return `
          <div class="sticky-note ${escapeHtml(note.color || 'yellow')}" data-note-index="${idx}">
            <div class="pin-top"></div>
            <p class="sticky-note-text" data-editable="true">"${escapeHtml(note.text)}"</p>
            <div class="note-author-footer">
              <div class="note-author-avatar-wrap" onclick="triggerStickyPhotoUpload(${idx})" title="Click to change photo">
                <img src="${escapeHtml(photoSrc)}" class="note-author-avatar" alt="${escapeHtml(authorName)}" loading="lazy">
              </div>
              <div class="note-author-meta">
                <div class="note-author-name" data-editable="true">${escapeHtml(authorName)}</div>
                ${authorRole ? `<div class="note-author-role" data-editable="true">${escapeHtml(authorRole)}</div>` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }


    // ==========================================================================
    // ==========================================================================
    // ==========================================================================
    // 4.6. RENDER YOUR VALUES ORBITAL CONSTELLATION ROOM (COHESIVE VECTOR SVG FAMILY)
    // ==========================================================================
    const VALUES_PRESET_ICONS = {
      shield: '<svg class="value-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
      sprout: '<svg class="value-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>',
      users: '<svg class="value-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      target: '<svg class="value-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
      diamond: '<svg class="value-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/></svg>',
      star: '<svg class="value-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      heart: '<svg class="value-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
      zap: '<svg class="value-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
      crown: '<svg class="value-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>',
      award: '<svg class="value-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="m15.477 12.89 2.523 8.11-6-3-6 3 2.523-8.11"/></svg>',
      rocket: '<svg class="value-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
      compass: '<svg class="value-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>'
    };

    function renderValueIconContent(iconData, fallbackKey) {
      if (!iconData) {
        return VALUES_PRESET_ICONS[fallbackKey] || VALUES_PRESET_ICONS['diamond'] || '';
      }
      const rawStr = String(iconData).trim();
      const key = rawStr.toLowerCase();
      if (VALUES_PRESET_ICONS[key]) {
        return VALUES_PRESET_ICONS[key];
      }
      if (rawStr.startsWith('<svg')) {
        return rawStr;
      }
      if (rawStr.startsWith('data:image') || rawStr.endsWith('.png') || rawStr.endsWith('.svg') || rawStr.endsWith('.jpg') || rawStr.endsWith('.webp') || rawStr.startsWith('http')) {
        return `<img src="${rawStr}" class="value-icon-img" alt="icon">`;
      }
      const emojiMap = {
        '🛡️': 'shield',
        '🌱': 'sprout',
        '🤝': 'users',
        '🎯': 'target',
        '💎': 'diamond',
        '⭐': 'star',
        '❤️': 'heart',
        '⚡': 'zap',
        '👑': 'crown',
        '🏆': 'award',
        '🚀': 'rocket',
        '🧭': 'compass'
      };
      if (emojiMap[rawStr]) {
        return VALUES_PRESET_ICONS[emojiMap[rawStr]];
      }
      return rawStr;
    }

    // Direct click-to-upload SVG or PNG icon for a Value Card
    window.triggerValueIconUpload = function(idx) {
      if (typeof palaceAccessMode !== 'undefined' && palaceAccessMode === 'view') return;
      let fileInput = document.getElementById('valueIconFileInput');
      if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'valueIconFileInput';
        fileInput.accept = 'image/png, image/svg+xml, image/jpeg, image/webp';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
      }

      fileInput.onchange = function(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
          const dataUrl = evt.target.result;
          palaceState.values = palaceState.values || [];
          if (!palaceState.values[idx]) {
            palaceState.values[idx] = {};
          }
          palaceState.values[idx].icon = dataUrl;

          persistPalaceState();
          renderValuesRoom();
          if (typeof populateAdminValues === 'function') {
            populateAdminValues();
          }
          showPalaceToast("✨ Value icon updated!", 3000);
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
      };

      fileInput.click();
    };

    window.onAdminValuePresetChange = function(idx, value) {
      if (value === 'custom') {
        triggerValueIconUpload(idx);
        return;
      }
      palaceState.values = palaceState.values || [];
      if (!palaceState.values[idx]) {
        palaceState.values[idx] = {};
      }
      palaceState.values[idx].icon = value;

      persistPalaceState();
      renderValuesRoom();
      const prev = document.getElementById(`adminValIconPreview${idx}`);
      if (prev) {
        prev.innerHTML = renderValueIconContent(value, value);
      }
    };

    function renderValuesRoom() {
      const stage = document.getElementById('valuesOrbitalStage');
      if (!stage) return;
      const chamber = document.getElementById('chamber-values');

      // Safeguard: Capture existing placard before overwriting stage innerHTML
      let placard = (chamber ? chamber.querySelector('.chamber-placard') : null) || stage.querySelector('.chamber-placard');
      if (!placard) {
        placard = document.createElement('div');
        placard.className = 'chamber-placard';
        const cVal = (typeof getChamber === 'function') ? getChamber('chamber-values') : null;
        const titleText = (cVal && cVal.title) ? toSentenceCase(cVal.title) : 'The values you bring';
        const subText = (cVal && cVal.sub) ? cVal.sub : 'The values you bring — how your everyday actions define our culture';
        placard.innerHTML = `
          <h2 class="chamber-name" id="chamberValuesTitle">${escapeHtml(titleText)}</h2>
          <p class="chamber-desc" id="chamberValuesDesc">${escapeHtml(subText)}</p>
        `;
      }

      // Detach placard before updating stage innerHTML so it is never destroyed
      if (placard.parentElement) {
        placard.parentElement.removeChild(placard);
      }

      const emp = palaceState.employee || {};
      const values = palaceState.values || [];

      const leftValues = values.slice(0, Math.ceil(values.length / 2));
      const rightValues = values.slice(Math.ceil(values.length / 2));

      stage.innerHTML = `
        <div class="values-center-nucleus">
          <div class="orbit-ring-outer"></div>
          <div class="orbit-ring-inner"></div>
          <div class="values-avatar-frame" onclick="openAdminPanelToValuesTab()" title="Click to manage employee values">
            <img src="${emp.photo || 'assets/images/profiles/manushi_hero.jpg'}" alt="${escapeHtml(emp.name || 'Employee')}" class="values-nucleus-avatar" onerror="this.src='assets/images/profiles/manushi_hero.jpg'">
          </div>
        </div>

        <div class="values-cards-scroll-stage" id="valuesCardsScrollStage">
          <div class="values-constellation-col values-col-left">
            ${leftValues.map((v, idx) => renderValueCardHtml(v, idx)).join('')}
          </div>

          <div class="values-constellation-col values-col-right">
            ${rightValues.map((v, idx) => renderValueCardHtml(v, idx + leftValues.length)).join('')}
          </div>
        </div>
      `;

      // Re-attach placard: on mobile prepend to stage so it scrolls naturally with content, on desktop insert before chamber-content
      if (window.innerWidth <= 768) {
        stage.prepend(placard);
      } else if (chamber) {
        const content = chamber.querySelector('.chamber-content');
        if (content) {
          chamber.insertBefore(placard, content);
        } else {
          chamber.prepend(placard);
        }
      }

      stage.scrollTop = 0;
      const cStage = document.getElementById('valuesCardsScrollStage');
      if (cStage) cStage.scrollTop = 0;
      if (typeof syncMobilePlacards === 'function') syncMobilePlacards();
    }

    function renderValueCardHtml(v, idx) {
      const fallbackKeys = ['shield', 'sprout', 'users', 'target'];
      const fallback = fallbackKeys[idx % fallbackKeys.length] || 'diamond';
      const iconHtml = renderValueIconContent(v.icon, fallback);

      return `
        <div class="value-card" data-val-idx="${idx}">
          <div class="value-card-header">
            <div class="value-icon-box" onclick="triggerValueIconUpload(${idx})" title="Click to upload custom SVG or PNG icon" style="cursor:pointer;">
              ${iconHtml}
            </div>
            <div class="value-title-wrap">
              <h3 class="value-title" data-editable="true">${escapeHtml(v.title || 'VALUE')}</h3>
            </div>
          </div>
          <div class="value-quote-text" data-editable="true">“${escapeHtml(v.quote || '')}”</div>
        </div>
      `;
    }

    window.openAdminPanelToValuesTab = function() {
      if (typeof palaceAccessMode !== 'undefined' && palaceAccessMode === 'view') return;
      openAdminPanel();
      const valTabBtn = document.querySelector('.admin-tab-btn[data-tab="tab-values"]');
      if (valTabBtn) valTabBtn.click();
    };

    // ==========================================================================
    // JOURNEY COMMEMORATIVE SOUVENIR CERTIFICATE MODAL ENGINE
    // ==========================================================================
    function drawCertificate() {
      const certificateCanvas = document.getElementById('certificateCanvas');
      if (!certificateCanvas) return;
      const certCtx = certificateCanvas.getContext('2d');
      if (!certCtx) return;

      const w = certificateCanvas.width;
      const h = certificateCanvas.height;

      const grad = certCtx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(1, '#111827');
      certCtx.fillStyle = grad;
      certCtx.fillRect(0, 0, w, h);

      certCtx.strokeStyle = '#f5c065';
      certCtx.lineWidth = 4;
      certCtx.strokeRect(20, 20, w - 40, h - 40);

      certCtx.strokeStyle = 'rgba(245, 192, 101, 0.4)';
      certCtx.lineWidth = 1;
      certCtx.strokeRect(28, 28, w - 56, h - 56);

      certCtx.fillStyle = '#f5c065';
      certCtx.font = '400 28px "DM Serif Display", serif';
      certCtx.textAlign = 'center';
      certCtx.fillText('DIGITAL MEMORY PALACE', w / 2, 85);

      certCtx.fillStyle = '#94a3b8';
      certCtx.font = '600 13px "Helvetica", "Helvetica Neue", Arial, sans-serif';
      certCtx.fillText('ANNUAL JOURNEY & CONTRIBUTION CITATION', w / 2, 110);

      const empName = (palaceState.employee && palaceState.employee.name) || "Dhara Patel";
      const empRole = (palaceState.employee && palaceState.employee.role) || "Customer Support";
      const empDate = (palaceState.employee && palaceState.employee.date) || "01 September 2025";

      certCtx.fillStyle = '#ffe8b5';
      certCtx.font = '400 38px "Ephesis", "Alex Brush", cursive, sans-serif';
      certCtx.fillText(empName, w / 2, 180);

      certCtx.fillStyle = '#f5c065';
      certCtx.font = '500 15px Plus Jakarta Sans, sans-serif';
      certCtx.fillText(empRole, w / 2, 210);

      certCtx.fillStyle = '#cbd5e1';
      certCtx.font = '14px Plus Jakarta Sans, sans-serif';
      certCtx.fillText("For walking across the chambers of learning, creating impactful architectures,", w / 2, 260);
      certCtx.fillText("lifting teammates, and stepping boldly toward the future horizon.", w / 2, 285);

      certCtx.fillStyle = '#f5c065';
      certCtx.font = '700 13px "Helvetica", "Helvetica Neue", Arial, sans-serif';
      certCtx.fillText('480+ HRS LEARNING   •   150+ PRS SHIPPED   •   99.98% RELIABILITY', w / 2, 340);

      certCtx.fillStyle = '#94a3b8';
      certCtx.font = '11px "Helvetica", "Helvetica Neue", Arial, sans-serif';
      certCtx.fillText('VERIFIED BY DIGITAL MEMORY PALACE', w / 4 + 20, 420);
      certCtx.fillText(`JOINED: ${empDate.toUpperCase()}`, (w * 3) / 4 - 20, 420);

      certCtx.strokeStyle = '#f5c065';
      certCtx.lineWidth = 1;
      certCtx.beginPath();
      certCtx.moveTo(w / 4 - 60, 400);
      certCtx.lineTo(w / 4 + 100, 400);
      certCtx.moveTo((w * 3) / 4 - 100, 400);
      certCtx.lineTo((w * 3) / 4 + 60, 400);
      certCtx.stroke();
    }

    function openCertificateModal() {
      const modal = document.getElementById('certModalBackdrop');
      if (!modal) return;
      drawCertificate();
      modal.classList.add('active');
    }

    function closeCertificateModal() {
      const modal = document.getElementById('certModalBackdrop');
      if (modal) modal.classList.remove('active');
    }

    window.openCertificateModal = openCertificateModal;
    window.closeCertificateModal = closeCertificateModal;

    // ==========================================================================
    // FINAL CHAMBER: THANK YOU ROOM CONTROLLER & RENDER ENGINE
    // ==========================================================================
    function renderThankYouRoom() {
      const ty = palaceState.thankYou || {
        headerBadge: "✨ HEARTFELT APPRECIATION • 1 YEAR MILESTONE ✨",
        title: "Thank You, Dhara!",
        subtitle: "",
        message: "Thank you for your dedication, energy, and spirit at Uffizio. Your contributions strengthen our team, and we’re proud of your growth and journey with us.",
        signature: "— With heartfelt gratitude & best wishes, Team Uffizio 🌟",
        actionBtn1: "🎉 Shower Confetti & Applause",
        actionBtn2: "📜 View Souvenir Card",
        actionBtn3: "🏛️ Revisit Palace From Start"
      };

      const emp = palaceState.employee || {};
      const stage = document.getElementById('thankYouContentStage');
      if (!stage) return;

      const titleText = ty.title || (emp.name ? `Thank You, ${emp.name}!` : 'Thank You!');
      const photoUrl = emp.photo || 'assets/images/profiles/manushi_hero.jpg';

      stage.innerHTML = `
        <div class="thankyou-card-monument">
          <div class="thankyou-hero-header">
            <div class="thankyou-avatar-halo" onclick="window.switchAdminTab('tab-profile'); openAdminPanel();" title="Click to view employee profile">
              <img src="${photoUrl}" alt="${escapeHtml(emp.name || 'Employee')}" class="thankyou-avatar-img" onerror="this.src='assets/images/profiles/manushi_hero.jpg'">
              <div class="thankyou-avatar-glow"></div>
              <div class="thankyou-wreath-icon">🏆</div>
            </div>
            <h1 class="thankyou-main-title" contenteditable="true" data-editable="true" title="Click to edit title">${escapeHtml(titleText)}</h1>
            ${(ty.subtitle && ty.subtitle !== "For an extraordinary year of passion, impact, and shared success with Uffizio.") ? `<p class="thankyou-subtitle" contenteditable="true" data-editable="true" title="Click to edit subtitle">${escapeHtml(ty.subtitle)}</p>` : ''}
          </div>

          <div class="thankyou-message-card">
            <div class="thankyou-quote-decor">“</div>
            <p class="thankyou-letter-text" contenteditable="true" data-editable="true" title="Click to edit letter">${escapeHtml(ty.message || '')}</p>
            <div class="thankyou-signature-line" contenteditable="true" data-editable="true" title="Click to edit signature">${escapeHtml(ty.signature || '')}</div>
          </div>
        </div>
      `;
    }

    // ==========================================================================
    // ROOM 07 (CHAMBER 4): YOUR PROUD MOMENTS CONTROLLER & UPLOAD ENGINE
    // ==========================================================================
    function renderFutureRoom() {
      const fut = palaceState.future || {
        title: "The Future",
        image: "assets/images/chambers/future_vision_board.png",
        cards: [
          { title: "What skills do you want to build?", sub: "Share the skills or knowledge you want to develop to grow in your career." },
          { title: "What new challenges do you want to take on?", sub: "Tell us about the kind of opportunities or responsibilities you would like to explore." },
          { title: "What impact do you want to create?", sub: "How do you see yourself contributing more to your team and Uffizio?" },
          { title: "Where do you see yourself growing?", sub: "Envision your long-term goals, milestones, and leadership journey ahead." }
        ]
      };

      const placard = document.querySelector('#chamber-5 .chamber-name');
      const ch5Room = (palaceState.chambers || []).find(c => c.id === 'chamber-5');
      if (placard) {
        placard.textContent = fut.title || (ch5Room && ch5Room.title) || "The Future";
      }

      const cardEls = document.querySelectorAll('#chamber-5 .future-card');
      if (cardEls && fut.cards) {
        cardEls.forEach((card, idx) => {
          const cData = fut.cards[idx];
          if (!cData) return;
          const tEl = card.querySelector('.future-card-title');
          const sEl = card.querySelector('.future-card-sub');
          if (tEl && cData.title) tEl.textContent = cData.title;
          if (sEl && cData.sub) sEl.textContent = cData.sub;
        });
      }

      const futImg = document.getElementById('futureArtworkImg') || document.querySelector('#chamber-5 .future-artwork-img');
      if (futImg) {
        futImg.src = (fut && fut.image) || "assets/images/chambers/future_vision_board.png";
      }
    }

    function populateAdminFuture() {
      const fut = palaceState.future || {
        title: "The Future",
        image: "assets/images/chambers/future_vision_board.png",
        cards: [
          { title: "What skills do you want to build?", sub: "Share the skills or knowledge you want to develop to grow in your career." },
          { title: "What new challenges do you want to take on?", sub: "Tell us about the kind of opportunities or responsibilities you would like to explore." },
          { title: "What impact do you want to create?", sub: "How do you see yourself contributing more to your team and Uffizio?" },
          { title: "Where do you see yourself growing?", sub: "Envision your long-term goals, milestones, and leadership journey ahead." }
        ]
      };

      const titleInp = document.getElementById('adminFutureTitle');
      if (titleInp) titleInp.value = fut.title || "The Future";

      const imgInp = document.getElementById('adminFutureImage');
      const imgPrev = document.getElementById('adminFutureImgPreview');
      const curImg = (fut && fut.image) || "assets/images/chambers/future_vision_board.png";
      if (imgInp) imgInp.value = curImg;
      if (imgPrev) imgPrev.src = curImg;

      const defCards = [
        { title: "What skills do you want to build?", sub: "Share the skills or knowledge you want to develop to grow in your career." },
        { title: "What new challenges do you want to take on?", sub: "Tell us about the kind of opportunities or responsibilities you would like to explore." },
        { title: "What impact do you want to create?", sub: "How do you see yourself contributing more to your team and Uffizio?" },
        { title: "Where do you see yourself growing?", sub: "Envision your long-term goals, milestones, and leadership journey ahead." }
      ];

      for (let i = 0; i < 4; i++) {
        const c = (fut.cards && fut.cards[i]) || defCards[i];
        const tInp = document.getElementById(`adminFutureCardTitle${i}`);
        const sInp = document.getElementById(`adminFutureCardSub${i}`);
        if (tInp) tInp.value = (c && c.title) || defCards[i].title;
        if (sInp) sInp.value = (c && c.sub) || defCards[i].sub;
      }
    }

    function renderProudRoom() {
      const proud = palaceState.proud || {
        plaqueTitle: "INNOVATOR OF THE YEAR",
        plaqueSubtitle: "2025 - 2026 ANNUAL HONORS",
        trophyImg: "assets/images/chambers/golden_trophy.png",
        polaroids: [
          { image: "assets/images/chambers/universe_poster.jpg", caption: "v4.0 Launch Night! 🚀" },
          { image: "assets/images/profiles/manushi_avatar.jpg", caption: "Hackathon Runners-up 🏆" },
          { image: "assets/images/profiles/manushi_portrait.jpg", caption: "All-Hands Demo Day 🎤" }
        ],
        celebrateTitle: "Celebrate This Milestone",
        celebrateDesc: "Trigger the palace confetti cannon and commemorate your incredible achievements.",
        celebrateBtn: "🎉 Fire Confetti!"
      };

      const trophyImgEl = document.getElementById('goldenTrophyImg');
      if (trophyImgEl && proud.trophyImg) {
        trophyImgEl.src = proud.trophyImg;
      }

      const plaqueEl = document.querySelector('#chamber-4 .pedestal-plaque');
      if (plaqueEl && proud.plaqueTitle) {
        plaqueEl.textContent = proud.plaqueTitle;
      }

      const subtitleEl = document.querySelector('#chamber-4 .pedestal-subtitle');
      if (subtitleEl && proud.plaqueSubtitle) {
        subtitleEl.textContent = proud.plaqueSubtitle;
      }

      const defaultPolaroids = [
        { image: "assets/images/chambers/proud_polaroid_1.png", caption: "v4.0 Launch Night! 🚀" },
        { image: "assets/images/chambers/proud_polaroid_2.png", caption: "Hackathon Runners-up 🏆" },
        { image: "assets/images/chambers/proud_polaroid_3.png", caption: "All-Hands Demo Day 🎤" }
      ];

      const polaroidFrames = document.querySelectorAll('#chamber-4 .polaroids-row .polaroid-frame');
      if (polaroidFrames) {
        polaroidFrames.forEach((frame, idx) => {
          const p = (proud.polaroids && proud.polaroids[idx]) || defaultPolaroids[idx];
          if (!p) return;
          const img = frame.querySelector('.polaroid-img-box img');
          const cap = frame.querySelector('.polaroid-caption');
          if (img && p.image) img.src = p.image;
          if (cap && p.caption !== undefined) cap.textContent = p.caption;
        });
      }

      const celebH4 = document.querySelector('#chamber-4 .celebration-text h4');
      if (celebH4 && proud.celebrateTitle) celebH4.textContent = proud.celebrateTitle;

      const celebP = document.querySelector('#chamber-4 .celebration-text p');
      if (celebP && proud.celebrateDesc) celebP.textContent = proud.celebrateDesc;

      const celebBtn = document.querySelector('#chamber-4 #btnFireConfetti span');
      if (celebBtn && proud.celebrateBtn) celebBtn.textContent = proud.celebrateBtn;

      const ch4Placard = document.querySelector('#chamber-4 .chamber-name');
      const ch4Room = (palaceState.chambers || []).find(c => c.id === 'chamber-4');
      if (ch4Placard && ch4Room && ch4Room.title) {
        ch4Placard.textContent = ch4Room.title;
      }
    }

    function populateAdminProud() {
      const proud = palaceState.proud || {
        plaqueTitle: "INNOVATOR OF THE YEAR",
        plaqueSubtitle: "2025 - 2026 ANNUAL HONORS",
        trophyImg: "assets/images/chambers/golden_trophy.png",
        polaroids: [
          { image: "assets/images/chambers/universe_poster.jpg", caption: "v4.0 Launch Night! 🚀" },
          { image: "assets/images/profiles/manushi_avatar.jpg", caption: "Hackathon Runners-up 🏆" },
          { image: "assets/images/profiles/manushi_portrait.jpg", caption: "All-Hands Demo Day 🎤" }
        ],
        celebrateTitle: "Celebrate This Milestone",
        celebrateDesc: "Trigger the palace confetti cannon and commemorate your incredible achievements.",
        celebrateBtn: "🎉 Fire Confetti!"
      };

      const plaqueT = document.getElementById('adminProudPlaqueTitle');
      if (plaqueT) plaqueT.value = proud.plaqueTitle || "INNOVATOR OF THE YEAR";
      const plaqueS = document.getElementById('adminProudPlaqueSubtitle');
      if (plaqueS) plaqueS.value = proud.plaqueSubtitle || "2025 - 2026 ANNUAL HONORS";

      const trophyImgInp = document.getElementById('adminProudTrophyImg');
      const trophyPrev = document.getElementById('adminProudTrophyPreview');
      if (trophyImgInp) trophyImgInp.value = proud.trophyImg || "assets/images/chambers/golden_trophy.png";
      if (trophyPrev) trophyPrev.src = proud.trophyImg || "assets/images/chambers/golden_trophy.png";

      const defaultPolaroids = [
        { image: "assets/images/chambers/proud_polaroid_1.png", caption: "v4.0 Launch Night! 🚀" },
        { image: "assets/images/chambers/proud_polaroid_2.png", caption: "Hackathon Runners-up 🏆" },
        { image: "assets/images/chambers/proud_polaroid_3.png", caption: "All-Hands Demo Day 🎤" }
      ];

      for (let i = 0; i < 3; i++) {
        const p = (proud.polaroids && proud.polaroids[i]) || defaultPolaroids[i];
        const photoInp = document.getElementById(`adminProudPhoto${i}`);
        const capInp = document.getElementById(`adminProudCaption${i}`);
        const prev = document.getElementById(`adminProudPreview${i}`);
        if (photoInp) photoInp.value = p.image || defaultPolaroids[i].image;
        if (capInp) capInp.value = p.caption !== undefined ? p.caption : defaultPolaroids[i].caption;
        if (prev) prev.src = p.image || defaultPolaroids[i].image;
      }

      const celebT = document.getElementById('adminProudCelebTitle');
      if (celebT) celebT.value = proud.celebrateTitle || "Celebrate This Milestone";
      const celebD = document.getElementById('adminProudCelebDesc');
      if (celebD) celebD.value = proud.celebrateDesc || "Trigger the palace confetti cannon and commemorate your incredible achievements.";
      const celebB = document.getElementById('adminProudCelebBtn');
      if (celebB) celebB.value = proud.celebrateBtn || "🎉 Fire Confetti!";
    }

    // Direct click-to-upload Polaroid Photo
    window.triggerProudPhotoUpload = function(idx) {
      if (typeof palaceAccessMode !== 'undefined' && palaceAccessMode === 'view') return;
      let fileInput = document.getElementById('proudPhotoFileInput');
      if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'proudPhotoFileInput';
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
          palaceState.proud = palaceState.proud || {};
          palaceState.proud.polaroids = palaceState.proud.polaroids || [
            { image: "assets/images/chambers/universe_poster.jpg", caption: "v4.0 Launch Night! 🚀" },
            { image: "assets/images/profiles/manushi_avatar.jpg", caption: "Hackathon Runners-up 🏆" },
            { image: "assets/images/profiles/manushi_portrait.jpg", caption: "All-Hands Demo Day 🎤" }
          ];
          if (!palaceState.proud.polaroids[idx]) {
            palaceState.proud.polaroids[idx] = {};
          }
          palaceState.proud.polaroids[idx].image = dataUrl;

          persistPalaceState();
          renderProudRoom();
          if (typeof populateAdminProud === 'function') {
            populateAdminProud();
          }
          showPalaceToast("✨ Polaroid photo updated!", 3000);
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
      };

      fileInput.click();
    };

    // Direct click-to-upload Trophy Image
    window.triggerProudTrophyUpload = function() {
      if (typeof palaceAccessMode !== 'undefined' && palaceAccessMode === 'view') return;
      let fileInput = document.getElementById('proudTrophyFileInput');
      if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'proudTrophyFileInput';
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
          palaceState.proud = palaceState.proud || {};
          palaceState.proud.trophyImg = dataUrl;

          persistPalaceState();
          renderProudRoom();
          if (typeof populateAdminProud === 'function') {
            populateAdminProud();
          }
          showPalaceToast("✨ Trophy image updated!", 3000);
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
      };

      fileInput.click();
    };

    // 5. Render Chamber Headings
    
    // 4.5. Render Annual Photo Collage Memories & Interactive Lightbox Zoom Engine
    let currentLightboxIndex = 0;
    let currentLightboxIsPart2 = false;

    function renderMemories() {
      const grid = document.getElementById('collageMosaicGrid');
      if (!grid) return;
      if (!grid._hasScrollListener) {
        grid._hasScrollListener = true;
        grid.addEventListener('scroll', () => {
          grid._isInternalScrolling = true;
          clearTimeout(grid._scrollGestureTimer);
          grid._scrollGestureTimer = setTimeout(() => {
            grid._isInternalScrolling = false;
          }, 320);
        }, { passive: true });
      }
      grid.innerHTML = '';

      const items = palaceState.memories || [];
      items.forEach((m, idx) => {
        const card = document.createElement('div');
        card.className = 'collage-photo-card';
        card.dataset.idx = idx;
        card.setAttribute('title', 'Click to zoom photo');
        card.innerHTML = `
          <div class="collage-pin"></div>
          <div class="collage-img-wrap">
            <img src="${m.image || 'assets/images/portal/where_it_started.png'}" alt="Memory Photo ${idx + 1}" class="collage-img" onerror="this.src='assets/images/portal/where_it_started.png'">
            <div class="collage-zoom-badge" title="Click to zoom">🔍</div>
          </div>
        `;

        // Lightbox Zoom Trigger on click
        card.addEventListener('click', () => {
          openCollageLightbox(idx, false);
        });

        grid.appendChild(card);
      });
    }

    function renderMemories2() {
      const singleStage = document.getElementById('memories2SingleStage');
      const unevenStage = document.getElementById('memories2UnevenStage');
      const gridStage = document.getElementById('memories2GridStage');
      const mode = (palaceState.memories2Mode === 'uneven' || !palaceState.memories2Mode) ? 'grid' : palaceState.memories2Mode;

      if (mode === 'grid') {
        if (singleStage) singleStage.style.display = 'none';
        if (unevenStage) unevenStage.style.display = 'none';
        if (gridStage) {
          gridStage.style.display = 'flex';
          renderMemories2Grid();
        }
      } else if (mode === 'single') {
        if (unevenStage) unevenStage.style.display = 'none';
        if (gridStage) gridStage.style.display = 'none';
        if (singleStage) {
          singleStage.style.display = 'flex';
          const imgEl = document.getElementById('memories2CollageImg');
          if (imgEl) {
            let src = palaceState.memories2CollageImage || 
              (palaceState.memories2 && palaceState.memories2[0] && palaceState.memories2[0].image) ||
              'assets/images/memories/memories_collage_part2.png';
            if (src === 'assets/images/memories/memories_collage_part2.jpg') src = 'assets/images/memories/memories_collage_part2.png';
            imgEl.src = src;
          }
        }
      } else {
        // Mode 2: Uneven White-Frame Collage (Default / Recommended)
        if (singleStage) singleStage.style.display = 'none';
        if (gridStage) gridStage.style.display = 'none';
        if (unevenStage) {
          unevenStage.style.display = 'flex';
          renderMemories2Uneven();
        }
      }
    }

    function getUnevenLayoutSlots(count) {
      if (count <= 1) {
        return [{ left: 25, top: 12, width: 50, height: 76, rot: -1, z: 1 }];
      }
      if (count === 2) {
        return [
          { left: 8,  top: 16, width: 44, height: 68, rot: -5.5, z: 2 },
          { left: 48, top: 18, width: 44, height: 68, rot: 4.5,  z: 3 }
        ];
      }
      if (count === 3) {
        return [
          { left: 4,  top: 18, width: 33, height: 64, rot: -7,   z: 2 },
          { left: 33, top: 14, width: 34, height: 68, rot: 2,    z: 4 },
          { left: 63, top: 20, width: 33, height: 64, rot: -5.5, z: 3 }
        ];
      }
      if (count === 4) {
        return [
          { left: 8,  top: 5,  width: 41, height: 43, rot: -6.5, z: 2 },
          { left: 51, top: 4,  width: 41, height: 43, rot: 5,    z: 3 },
          { left: 6,  top: 50, width: 41, height: 43, rot: 4,    z: 4 },
          { left: 53, top: 52, width: 41, height: 43, rot: -5.5, z: 5 }
        ];
      }
      if (count === 5) {
        return [
          { left: 4,  top: 4,  width: 33, height: 42, rot: -7.5, z: 2 },
          { left: 63, top: 4,  width: 33, height: 42, rot: 6,    z: 2 },
          { left: 32, top: 28, width: 36, height: 44, rot: -1.5, z: 5 },
          { left: 4,  top: 54, width: 33, height: 42, rot: 5,    z: 3 },
          { left: 63, top: 54, width: 33, height: 42, rot: -6,   z: 4 }
        ];
      }
      if (count === 6) {
        return [
          { left: 4,  top: 4,  width: 30, height: 42, rot: -8,   z: 2 },
          { left: 35, top: 2,  width: 30, height: 42, rot: 3,    z: 3 },
          { left: 66, top: 4,  width: 30, height: 42, rot: -6.5, z: 2 },
          { left: 3,  top: 52, width: 30, height: 42, rot: 5,    z: 4 },
          { left: 34, top: 54, width: 30, height: 42, rot: -3,   z: 5 },
          { left: 67, top: 52, width: 30, height: 42, rot: 7,    z: 4 }
        ];
      }
      if (count === 7) {
        return [
          { left: 4,  top: 2,  width: 29, height: 38, rot: -8.5, z: 2 },
          { left: 35, top: 0,  width: 31, height: 38, rot: 3.5,  z: 3 },
          { left: 67, top: 2,  width: 29, height: 38, rot: -7,   z: 2 },
          { left: 33, top: 32, width: 35, height: 40, rot: -2,   z: 5 },
          { left: 2,  top: 54, width: 28, height: 38, rot: 5.5,  z: 4 },
          { left: 35, top: 60, width: 30, height: 38, rot: -4,   z: 6 },
          { left: 68, top: 54, width: 28, height: 38, rot: 7,    z: 4 }
        ];
      }
      if (count === 8) {
        // Exact reference collage layout from media_1789647671540.jpg
        return [
          { left: 3,  top: 2,  width: 27, height: 35, rot: -9.5, z: 2 },
          { left: 32, top: 0,  width: 34, height: 36, rot: 3.5,  z: 3 },
          { left: 67, top: 2,  width: 29, height: 35, rot: -7,   z: 2 },
          { left: 0,  top: 38, width: 26, height: 33, rot: 2,    z: 4 },
          { left: 33, top: 31, width: 35, height: 38, rot: -2,   z: 5 },
          { left: 70, top: 38, width: 28, height: 34, rot: 6.5,  z: 3 },
          { left: 18, top: 58, width: 28, height: 35, rot: -8,   z: 6 },
          { left: 49, top: 60, width: 26, height: 34, rot: 3.5,  z: 7 }
        ];
      }
      if (count === 9) {
        return [
          { left: 3,  top: 2,  width: 27, height: 35, rot: -9.5, z: 2 },
          { left: 32, top: 0,  width: 34, height: 36, rot: 3.5,  z: 3 },
          { left: 67, top: 2,  width: 29, height: 35, rot: -7,   z: 2 },
          { left: 0,  top: 38, width: 26, height: 33, rot: 2,    z: 4 },
          { left: 33, top: 31, width: 35, height: 38, rot: -2,   z: 5 },
          { left: 70, top: 38, width: 28, height: 34, rot: 6.5,  z: 3 },
          { left: 16, top: 58, width: 27, height: 35, rot: -8,   z: 6 },
          { left: 45, top: 60, width: 26, height: 34, rot: 3.5,  z: 7 },
          { left: 73, top: 56, width: 25, height: 34, rot: -5.5, z: 6 }
        ];
      }
      if (count === 10) {
        return [
          { left: 2,  top: 2,  width: 26, height: 34, rot: -9.5, z: 2 },
          { left: 29, top: 0,  width: 27, height: 34, rot: 3.5,  z: 3 },
          { left: 57, top: 1,  width: 26, height: 34, rot: -6,   z: 2 },
          { left: 75, top: 12, width: 24, height: 32, rot: 7,    z: 3 },
          { left: 0,  top: 36, width: 25, height: 32, rot: 2,    z: 4 },
          { left: 28, top: 31, width: 32, height: 36, rot: -2,   z: 5 },
          { left: 63, top: 35, width: 26, height: 32, rot: 5.5,  z: 3 },
          { left: 12, top: 58, width: 26, height: 34, rot: -8,   z: 6 },
          { left: 40, top: 60, width: 26, height: 34, rot: 3.5,  z: 7 },
          { left: 68, top: 57, width: 26, height: 34, rot: -5,   z: 6 }
        ];
      }
      if (count <= 12) {
        return [
          { left: 2,  top: 1,  width: 25, height: 32, rot: -9,   z: 2 },
          { left: 28, top: 0,  width: 26, height: 33, rot: 3,    z: 3 },
          { left: 55, top: 1,  width: 25, height: 32, rot: -6,   z: 2 },
          { left: 76, top: 8,  width: 23, height: 31, rot: 7.5,  z: 3 },
          { left: 0,  top: 34, width: 24, height: 31, rot: 2,    z: 4 },
          { left: 27, top: 30, width: 31, height: 35, rot: -2,   z: 5 },
          { left: 61, top: 33, width: 25, height: 31, rot: 5,    z: 4 },
          { left: 77, top: 39, width: 22, height: 30, rot: -4.5, z: 3 },
          { left: 8,  top: 57, width: 25, height: 33, rot: -8,   z: 6 },
          { left: 35, top: 59, width: 25, height: 33, rot: 3.5,  z: 7 },
          { left: 62, top: 57, width: 25, height: 33, rot: -5.5, z: 6 },
          { left: 76, top: 62, width: 22, height: 30, rot: 6,    z: 5 }
        ].slice(0, count);
      }
      // count > 12: Scrollable layout
      return null;
    }

    function adjustCardToImageAspect(card, imgEl, slot) {
      if (!imgEl || !card || !slot) return;
      if (window.innerWidth <= 768) {
        card.style.width = '';
        card.style.height = '';
        return;
      }
      const nw = imgEl.naturalWidth;
      const nh = imgEl.naturalHeight;
      if (!nw || !nh) return;

      const ratio = nw / nh; // width / height
      const board = document.getElementById('memoriesScatterBoard');
      const boardW = (board && board.clientWidth) ? board.clientWidth : 1050;
      const boardH = (board && board.clientHeight) ? board.clientHeight : 540;

      // Base slot bounds in px
      const slotW = (slot.width / 100) * boardW;
      const slotH = (slot.height / 100) * boardH;

      let targetW;
      if (ratio >= 1.25) {
        // Landscape / Wide photo: fit width, cap height to 1.15 * slotH
        targetW = slotW;
        const computedH = targetW / ratio;
        if (computedH > slotH * 1.15) {
          targetW = (slotH * 1.15) * ratio;
        }
      } else if (ratio <= 0.85) {
        // Portrait / Vertical photo: generous height (~1.18 * slotH)
        const targetH = Math.min(slotH * 1.18, boardH * 0.46);
        targetW = targetH * ratio;
        if (targetW < slotW * 0.62) {
          targetW = slotW * 0.62;
        }
      } else {
        // Square or near-square (0.85 < ratio < 1.25)
        targetW = Math.min(slotW * 0.92, slotH * 1.05 * ratio);
      }

      // Percentage width relative to board for responsive scaling
      const wPercent = (targetW / boardW) * 100;
      card.style.width = `${wPercent.toFixed(2)}%`;
      card.style.height = 'auto';
    }

    function renderMemories2Uneven() {
      const board = document.getElementById('memoriesScatterBoard');
      if (!board) return;
      board.innerHTML = '';

      const items = palaceState.memories2 || [];
      if (items.length === 0) {
        board.classList.remove('is-scrollable');
        board.innerHTML = `
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #94a3b8; background: rgba(15,23,42,0.85); padding: 28px 36px; border-radius: 12px; border: 1.5px dashed rgba(245,192,101,0.3);">
            <p style="font-size: 16px; margin-bottom: 8px; color: var(--gold-light);">📸 No photos in Memories 2 yet.</p>
            <p style="font-size: 13px; color: #94a3b8; margin: 0;">Open the Admin Panel to bulk-upload photos or add memories.</p>
          </div>
        `;
        return;
      }

      const count = items.length;
      const slots = getUnevenLayoutSlots(count);

      if (slots) {
        board.classList.remove('is-scrollable');
        items.forEach((m, idx) => {
          const slot = slots[idx] || slots[slots.length - 1];
          const card = document.createElement('div');
          card.className = 'memories-uneven-card';
          card.dataset.idx = idx;

          if (window.innerWidth > 768) {
            const cx = slot.left + slot.width / 2;
            // Scale cy so cards stay within board — min 40% ensures no heading overlap
            const rawCy = slot.top + slot.height / 2;
            const cy = Math.max(12 + rawCy * 0.68, 40);
            card.style.left = `${cx.toFixed(2)}%`;
            card.style.top = `${cy.toFixed(2)}%`;
            card.style.transform = `translate(-50%, -50%) rotate(${slot.rot}deg)`;
            card.style.zIndex = slot.z || 2;
            card.style.width = `${slot.width}%`;
            card.style.height = 'auto';
          }
          card.setAttribute('title', `${m.title || 'Memory Photo'} (Click to zoom)`);

          const imgEl = document.createElement('img');
          imgEl.src = m.image || 'assets/images/portal/where_it_started.png';
          imgEl.alt = m.title || 'Memory Photo';
          imgEl.onerror = function() {
            this.src = 'assets/images/portal/where_it_started.png';
          };

          const imgWrap = document.createElement('div');
          imgWrap.className = 'memories-uneven-img-wrap';
          imgWrap.appendChild(imgEl);

          const zoomBtn = document.createElement('div');
          zoomBtn.className = 'memories-uneven-zoom-btn';
          zoomBtn.textContent = '🔍';
          imgWrap.appendChild(zoomBtn);

          card.appendChild(imgWrap);

          // Dynamic frame adjustment based on image natural aspect ratio (height & width)
          const applyAspect = () => {
            adjustCardToImageAspect(card, imgEl, slot);
          };

          if (imgEl.complete && imgEl.naturalWidth > 0) {
            applyAspect();
          } else {
            imgEl.addEventListener('load', applyAspect);
          }

          card.addEventListener('click', () => {
            openCollageLightbox(idx, true);
          });

          board.appendChild(card);
        });

        if (window.innerWidth > 768) {
          // Boost z-index of the card closest to center so it appears on top
          const allCards = board.querySelectorAll('.memories-uneven-card');
          let minDist = Infinity, centerCard = null;
          allCards.forEach(c => {
            const cl = parseFloat(c.style.left);
            const ct = parseFloat(c.style.top);
            const dist = (cl - 50) * (cl - 50) + (ct - 50) * (ct - 50);
            if (dist < minDist) { minDist = dist; centerCard = c; }
          });
          if (centerCard) centerCard.style.zIndex = '9';
        }

      } else {
        // More than 12 photos: Organic scrollable scrapbook scatter-wall!
        board.classList.add('is-scrollable');
        const rotPattern = [-6, 4.5, -4, 5.5, -5, 3.5, -7, 4, -3.5, 6, -5.5, 4.5];
        items.forEach((m, idx) => {
          const rot = rotPattern[idx % rotPattern.length];
          const card = document.createElement('div');
          card.className = 'memories-uneven-card';
          card.dataset.idx = idx;
          card.style.transform = `rotate(${rot}deg)`;
          card.style.zIndex = (idx % 5) + 2;
          card.style.width = '100%';
          card.style.height = 'auto';
          card.setAttribute('title', `${m.title || 'Memory Photo'} (Click to zoom)`);

          const imgEl = document.createElement('img');
          imgEl.src = m.image || 'assets/images/portal/where_it_started.png';
          imgEl.alt = m.title || 'Memory Photo';
          imgEl.onerror = function() {
            this.src = 'assets/images/portal/where_it_started.png';
          };

          const imgWrap = document.createElement('div');
          imgWrap.className = 'memories-uneven-img-wrap';
          imgWrap.appendChild(imgEl);

          const zoomBtn = document.createElement('div');
          zoomBtn.className = 'memories-uneven-zoom-btn';
          zoomBtn.textContent = '🔍';
          imgWrap.appendChild(zoomBtn);

          card.appendChild(imgWrap);

          card.addEventListener('click', () => {
            openCollageLightbox(idx, true);
          });

          board.appendChild(card);
        });
      }
    }

    let _mem2ResizeDebounce = null;
    window.addEventListener('resize', () => {
      clearTimeout(_mem2ResizeDebounce);
      _mem2ResizeDebounce = setTimeout(() => {
        if (palaceState.memories2Mode === 'uneven') {
          renderMemories2Uneven();
        }
      }, 150);
    });

    function renderMemories2Grid() {
      const grid = document.getElementById('collageMosaicGrid2');
      if (!grid) return;
      if (!grid._hasScrollListener) {
        grid._hasScrollListener = true;
        grid.addEventListener('scroll', () => {
          grid._isInternalScrolling = true;
          clearTimeout(grid._scrollGestureTimer);
          grid._scrollGestureTimer = setTimeout(() => {
            grid._isInternalScrolling = false;
          }, 320);
        }, { passive: true });
      }
      grid.innerHTML = '';

      const items = palaceState.memories2 || [];
      if (items.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #94a3b8;">
            <p style="font-size: 16px; margin-bottom: 8px;">📸 No photos added to Memories 2 yet.</p>
            <p style="font-size: 13px; color: #64748b;">Open the Admin Panel to bulk-select or upload photos to create your collage.</p>
          </div>
        `;
        return;
      }

      items.forEach((m, idx) => {
        const card = document.createElement('div');
        card.className = 'collage-photo-card memories2-photo-card';
        card.dataset.idx = idx;
        card.setAttribute('title', 'Click to zoom photo');
        card.innerHTML = `
          <div class="collage-pin"></div>
          <div class="collage-img-wrap">
            <img src="${m.image || 'assets/images/portal/where_it_started.png'}" alt="Memory Photo ${idx + 1}" class="collage-img" onerror="this.src='assets/images/portal/where_it_started.png'">
            <div class="collage-zoom-badge" title="Click to zoom">🔍</div>
          </div>
        `;

        card.addEventListener('click', () => {
          openCollageLightbox(idx, true);
        });

        grid.appendChild(card);
      });
    }

    function openSingleCollageLightbox(src) {
      const modal = document.getElementById('collageLightboxModal');
      if (!modal) return;
      const img = document.getElementById('lightboxImg');
      const counter = document.getElementById('lightboxCounter');
      const title = document.getElementById('lightboxTitle');
      const tag = document.getElementById('lightboxTag');
      const desc = document.getElementById('lightboxDesc');
      const date = document.getElementById('lightboxDate');
      const footer = document.getElementById('lightboxFooter');
      const prevBtn = document.getElementById('btnPrevLightbox');
      const nextBtn = document.getElementById('btnNextLightbox');

      const targetSrc = src || palaceState.memories2CollageImage || (palaceState.memories2 && palaceState.memories2[0] && palaceState.memories2[0].image) || 'assets/images/memories/memories_collage_part2.png';

      if (img) {
        img.style.opacity = '0.3';
        img.src = targetSrc;
        img.onload = () => { img.style.opacity = '1'; };
        setTimeout(() => { img.style.opacity = '1'; }, 100);
      }
      if (counter) counter.textContent = 'Collage Fullscreen View';
      if (title) {
        title.textContent = document.getElementById('chamberMemories2Title')?.textContent || 'Year in Memories (Part 2)';
        title.style.display = 'inline-block';
      }
      if (tag) tag.style.display = 'none';
      if (desc) desc.textContent = '';
      if (date) date.textContent = '';
      if (footer) footer.style.display = 'none';
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';

      modal.classList.add('active');
      if (typeof palaceAudio !== 'undefined' && palaceAudio.playPaperSnap) {
        palaceAudio.playPaperSnap();
      }
    }

    // Interactive Fullscreen Lightbox Engine
    function openCollageLightbox(target, isPart2 = false) {
      const modal = document.getElementById('collageLightboxModal');
      if (!modal) return;
      const prevBtn = document.getElementById('btnPrevLightbox');
      const nextBtn = document.getElementById('btnNextLightbox');
      if (prevBtn) prevBtn.style.display = '';
      if (nextBtn) nextBtn.style.display = '';
      currentLightboxIsPart2 = !!isPart2;
      const items = (currentLightboxIsPart2 ? palaceState.memories2 : palaceState.memories) || [];
      if (items.length === 0) return;

      if (typeof target === 'number') {
        currentLightboxIndex = (target + items.length) % items.length;
      } else if (target && typeof target === 'object') {
        const found = items.indexOf(target);
        currentLightboxIndex = found >= 0 ? found : 0;
      } else {
        currentLightboxIndex = 0;
      }

      updateLightboxContent();
      modal.classList.add('active');
      if (typeof palaceAudio !== 'undefined' && palaceAudio.playPaperSnap) {
        palaceAudio.playPaperSnap();
      }
    }

    function updateLightboxContent() {
      const items = (currentLightboxIsPart2 ? palaceState.memories2 : palaceState.memories) || [];
      if (items.length === 0) return;
      const m = items[currentLightboxIndex] || items[0];

      const img = document.getElementById('lightboxImg');
      const counter = document.getElementById('lightboxCounter');
      const title = document.getElementById('lightboxTitle');
      const tag = document.getElementById('lightboxTag');
      const desc = document.getElementById('lightboxDesc');
      const date = document.getElementById('lightboxDate');
      const footer = document.getElementById('lightboxFooter');

      if (img) {
        img.style.opacity = '0.3';
        img.src = m.image || 'assets/images/portal/where_it_started.png';
        img.onload = () => { img.style.opacity = '1'; };
        setTimeout(() => { img.style.opacity = '1'; }, 100);
      }
      if (counter) counter.textContent = `${currentLightboxIndex + 1} of ${items.length}`;
      if (title) title.style.display = 'none';
      if (tag) tag.style.display = 'none';
      if (desc) desc.textContent = '';
      if (date) date.textContent = '';
      if (footer) footer.style.display = 'none';
    }

    function nextLightboxPhoto() {
      const items = (currentLightboxIsPart2 ? palaceState.memories2 : palaceState.memories) || [];
      if (items.length === 0) return;
      currentLightboxIndex = (currentLightboxIndex + 1) % items.length;
      updateLightboxContent();
      if (typeof palaceAudio !== 'undefined' && palaceAudio.playChime) {
        palaceAudio.playChime();
      }
    }

    function prevLightboxPhoto() {
      const items = (currentLightboxIsPart2 ? palaceState.memories2 : palaceState.memories) || [];
      if (items.length === 0) return;
      currentLightboxIndex = (currentLightboxIndex - 1 + items.length) % items.length;
      updateLightboxContent();
      if (typeof palaceAudio !== 'undefined' && palaceAudio.playChime) {
        palaceAudio.playChime();
      }
    }

    function closeCollageLightbox() {
      const modal = document.getElementById('collageLightboxModal');
      if (modal) modal.classList.remove('active');
    }

    // Attach Lightbox Controls
    const btnCloseLightbox = document.getElementById('btnCloseLightbox');
    const btnPrevLightbox = document.getElementById('btnPrevLightbox');
    const btnNextLightbox = document.getElementById('btnNextLightbox');
    const collageLightboxModal = document.getElementById('collageLightboxModal');

    if (btnCloseLightbox) {
      btnCloseLightbox.addEventListener('click', (e) => {
        e.stopPropagation();
        closeCollageLightbox();
      });
    }
    if (btnPrevLightbox) {
      btnPrevLightbox.addEventListener('click', (e) => {
        e.stopPropagation();
        prevLightboxPhoto();
      });
    }
    if (btnNextLightbox) {
      btnNextLightbox.addEventListener('click', (e) => {
        e.stopPropagation();
        nextLightboxPhoto();
      });
    }
    if (collageLightboxModal) {
      collageLightboxModal.addEventListener('click', (e) => {
        if (e.target === collageLightboxModal) closeCollageLightbox();
      });
    }

    // Keyboard navigation for Lightbox
    window.addEventListener('keydown', (e) => {
      const modal = document.getElementById('collageLightboxModal');
      if (!modal || !modal.classList.contains('active')) return;
      if (e.key === 'Escape') {
        closeCollageLightbox();
      } else if (e.key === 'ArrowRight') {
        nextLightboxPhoto();
      } else if (e.key === 'ArrowLeft') {
        prevLightboxPhoto();
      }
    });

    function renderPlacards() {
      const chambersList = palaceState.chambers || [];
      const getChamber = (id) => chambersList.find(c => c.id === id);

      // Chamber 0: First Day
      const c0 = getChamber('chamber-0');
      const ch0Title = document.getElementById('chamber1Title');
      const ch0Desc = document.getElementById('chamber1Desc');
      if (ch0Title && c0 && c0.title) {
        if (c0.title.includes('<span')) {
          ch0Title.innerHTML = c0.title;
        } else if (c0.title.toLowerCase() === 'where your journey began') {
          ch0Title.innerHTML = 'Where your journey <span class="serif-accent">began</span>';
        } else {
          ch0Title.innerHTML = toSentenceCase(c0.title);
        }
      }
      if (ch0Desc && c0) ch0Desc.textContent = c0.sub || '';

      // Chamber 1: Learned / Evolution
      const c1 = getChamber('chamber-1');
      const ch1Placard = document.querySelector('#chamber-1 .chamber-name');
      const ch1Desc = document.querySelector('#chamber-1 .chamber-desc');
      if (ch1Placard && c1 && c1.title) ch1Placard.textContent = toSentenceCase(c1.title);
      if (ch1Desc && c1) ch1Desc.textContent = c1.sub || '';

      // Chamber 2: Legacy What You Created
      const c2 = getChamber('chamber-2');
      const ch2Placard = document.querySelector('#chamber-2 .chamber-name');
      const ch2Desc = document.querySelector('#chamber-2 .chamber-desc');
      if (ch2Placard && c2 && c2.title) ch2Placard.textContent = toSentenceCase(c2.title);
      if (ch2Desc && c2) ch2Desc.textContent = c2.sub || '';

      // Chamber 2b: Created Part 2 / Innovation
      const c2b = getChamber('chamber-2b');
      const ch2bPlacard = document.querySelector('#chamber-2b .chamber-name');
      const ch2bDesc = document.querySelector('#chamber-2b .chamber-desc');
      if (ch2bPlacard && c2b && c2b.title) ch2bPlacard.textContent = toSentenceCase(c2b.title);
      if (ch2bDesc && c2b) ch2bDesc.textContent = c2b.sub || '';

      // Chamber 3: People
      const c3 = getChamber('chamber-3');
      const ch3Placard = document.querySelector('#chamber-3 .chamber-name');
      const ch3Desc = document.querySelector('#chamber-3 .chamber-desc');
      if (ch3Placard && c3 && c3.title) ch3Placard.textContent = toSentenceCase(c3.title);
      if (ch3Desc && c3) ch3Desc.textContent = c3.sub || '';

      // Chamber Memories: Legacy
      const cMem = getChamber('chamber-memories');
      const chMemTitle = document.getElementById('chamberMemoriesTitle');
      const chMemDesc = document.getElementById('chamberMemoriesDesc');
      if (chMemTitle && cMem && cMem.title) chMemTitle.textContent = toSentenceCase(cMem.title);
      if (chMemDesc && cMem) chMemDesc.textContent = cMem.sub || '';

      // Chamber Memories 2: Celebrating a year of memories
      const cMem2 = getChamber('chamber-memories-2');
      const chMem2Title = document.getElementById('chamberMemories2Title') || document.querySelector('#chamber-memories-2 .chamber-name');
      const chMem2Desc = document.getElementById('chamberMemories2Desc') || document.querySelector('#chamber-memories-2 .chamber-desc');
      if (chMem2Title && cMem2 && cMem2.title) chMem2Title.textContent = toSentenceCase(cMem2.title);
      if (chMem2Desc && cMem2) chMem2Desc.textContent = cMem2.sub || '';

      // Chamber Values: The values you bring
      const cVal = getChamber('chamber-values');
      const chValTitle = document.getElementById('chamberValuesTitle') || document.querySelector('#chamber-values .chamber-name');
      const chValDesc = document.getElementById('chamberValuesDesc') || document.querySelector('#chamber-values .chamber-desc');
      if (chValTitle && cVal && cVal.title) chValTitle.textContent = toSentenceCase(cVal.title);
      if (chValDesc && cVal) chValDesc.textContent = cVal.sub || '';

      // Chamber 4: Proud Moments
      const c4 = getChamber('chamber-4');
      const ch4Placard = document.querySelector('#chamber-4 .chamber-name');
      const ch4Desc = document.querySelector('#chamber-4 .chamber-desc');
      if (ch4Placard && c4 && c4.title) ch4Placard.textContent = toSentenceCase(c4.title);
      if (ch4Desc && c4) ch4Desc.textContent = c4.sub || '';

      // Chamber 5: Future
      const c5 = getChamber('chamber-5');
      const ch5Title = document.getElementById('chamberFutureTitle') || document.querySelector('#chamber-5 .chamber-name');
      const ch5Desc = document.getElementById('chamberFutureDesc') || document.querySelector('#chamber-5 .chamber-desc');
      if (ch5Title && c5 && c5.title) ch5Title.textContent = toSentenceCase(c5.title);
      if (ch5Desc && c5) ch5Desc.textContent = c5.sub || '';

      // Chamber Milestone: Celebration
      const cM = getChamber('chamber-milestone');
      if (cM && cM.title) {
        const celebFormatted = typeof escapeHtml === 'function' ? escapeHtml(toSentenceCase(cM.title)).replace(/\r?\n/g, '<br>') : toSentenceCase(cM.title).replace(/\r?\n/g, '<br>');
        const cTitle = document.querySelector('.celebration-main-title');
        if (cTitle) cTitle.innerHTML = celebFormatted;
        const dTitle = document.querySelector('.doorway-main-title');
        if (dTitle) dTitle.innerHTML = celebFormatted;
      }

      // Chamber Thank You:
      const cTy = getChamber('chamber-thankyou');
      if (cTy && cTy.title) {
        const tyMainTitle = document.querySelector('#chamber-thankyou .thankyou-main-title');
        if (tyMainTitle && (!palaceState.thankYou || !palaceState.thankYou.title)) tyMainTitle.textContent = toSentenceCase(cTy.title);
      }

      // Backward sync palaceState.chamberStories
      if (palaceState.chamberStories) {
        if (c0) { palaceState.chamberStories.ch1Title = c0.title; palaceState.chamberStories.ch1Sub = c0.sub || ''; }
        if (c1) { palaceState.chamberStories.ch2Title = c1.title; palaceState.chamberStories.ch2Sub = c1.sub || ''; }
        if (c2b) { palaceState.chamberStories.ch3Title = c2b.title; palaceState.chamberStories.ch2bTitle = c2b.title; palaceState.chamberStories.ch3Sub = c2b.sub || ''; }
        if (c3) { palaceState.chamberStories.ch4Title = c3.title; palaceState.chamberStories.ch4Sub = c3.sub || ''; }
        if (cVal) { palaceState.chamberStories.chValTitle = cVal.title; palaceState.chamberStories.chValDesc = cVal.sub || ''; }
      }

      if (typeof syncMobilePlacards === 'function') {
        syncMobilePlacards();
      }
    }

    // Responsive Mobile Placards Engine:
    // Moves .chamber-placard inside the scroll container of each chamber on mobile so it scrolls naturally with content with an exact 50px gap.
    // On desktop, restores .chamber-placard before .chamber-content in .palace-chamber.
    function syncMobilePlacards() {
      const isMobile = window.innerWidth <= 768;
      const chamberConfigs = [
        { id: 'chamber-0', container: '#horizontalTimelineTrackWrap' },
        { id: 'chamber-1', container: '#chamber-1 .evolution-comparison-stage' },
        { id: 'chamber-2b', container: '#chamber-2b .creations-split-container' },
        { id: 'chamber-3', container: '#chamber-3 .room-people' },
        { id: 'chamber-memories-2', container: '#chamber-memories-2 .memories2-uneven-stage' },
        { id: 'chamber-values', container: '#valuesOrbitalStage' },
        { id: 'chamber-4', container: '#chamber-4 .room-proud' },
        { id: 'chamber-5', container: '#chamber-5 .room-future' }
      ];

      chamberConfigs.forEach(cfg => {
        const chamber = document.getElementById(cfg.id);
        if (!chamber) return;
        let placard = chamber.querySelector('.chamber-placard');
        if (!placard) {
          const container = document.querySelector(cfg.container);
          if (container) placard = container.querySelector('.chamber-placard');
        }
        if (!placard && cfg.id === 'chamber-values') {
          placard = document.createElement('div');
          placard.className = 'chamber-placard';
          const cVal = (typeof getChamber === 'function') ? getChamber('chamber-values') : null;
          const titleText = (cVal && cVal.title) ? toSentenceCase(cVal.title) : 'The values you bring';
          const subText = (cVal && cVal.sub) ? cVal.sub : 'The values you bring — how your everyday actions define our culture';
          placard.innerHTML = `
            <h2 class="chamber-name" id="chamberValuesTitle">${escapeHtml(titleText)}</h2>
            <p class="chamber-desc" id="chamberValuesDesc">${escapeHtml(subText)}</p>
          `;
          chamber.prepend(placard);
        }
        if (!placard) return;

        if (isMobile) {
          const container = document.querySelector(cfg.container);
          if (container && placard.parentElement !== container) {
            container.prepend(placard);
          }
        } else {
          const content = chamber.querySelector('.chamber-content');
          if (content && placard.parentElement !== chamber) {
            chamber.insertBefore(placard, content);
          }
        }
      });
      if (typeof updateTimelineSvgGeometry === 'function') {
        updateTimelineSvgGeometry(false);
      }
    }

    window.addEventListener('resize', syncMobilePlacards);

    // 6. Universal Update Function
    
    /* ==========================================================================
       DYNAMIC CHAMBERS & NAVIGATION ENGINE
       ========================================================================== */
    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    // Helper: Generate Custom Chamber DOM Element
    function createCustomChamberElement(chamber) {
      const sec = document.createElement('section');
      sec.className = 'palace-chamber waiting-depth';
      sec.id = chamber.id;
      sec.dataset.custom = 'true';
      sec.dataset.type = chamber.type || 'custom';

      let innerContentHtml = '';
      const data = chamber.customData || {};

      if (chamber.type === 'timeline') {
        const items = data.items || [
          { date: 'Quarter 1', title: 'Major Breakthrough', desc: 'Pioneered new workflows and elevated team impact.' },
          { date: 'Quarter 2', title: 'Milestone Execution', desc: 'Delivered cross-functional projects with excellence.' }
        ];
        innerContentHtml = `
          <div class="room-shell">
            <div class="room-wall" style="background: radial-gradient(ellipse at 50% 30%, rgba(0, 44, 107, 0.45) 0%, rgba(10, 15, 29, 0.85) 65%, rgba(6, 9, 19, 0.98) 100%);"></div>
            <div class="room-floor"></div>
            <div class="room-spotlight" style="background: radial-gradient(circle, rgba(0, 44, 107, 0.8) 0%, transparent 60%);"></div>
          </div>
          <div class="chamber-placard">
            <h2 class="chamber-name">${escapeHtml(chamber.title)}</h2>
            <p class="chamber-desc" style="color: #94a3b8; font-size: 13px; max-width: 620px; margin: 4px auto 0;">${escapeHtml(chamber.sub || '')}</p>
          </div>
          <div class="chamber-content">
            <div class="journey-milestones-list" style="max-width: 680px; margin: 0 auto;">
              ${items.map((it, idx) => `
                <div class="milestone-item ${idx === items.length - 1 ? 'active-milestone' : ''}">
                  <div class="milestone-node-col"><div class="milestone-node-ring"></div></div>
                  <div class="milestone-card-content">
                    <span class="milestone-date-badge">${escapeHtml(it.date)}</span>
                    <h4 class="milestone-title-text">${escapeHtml(it.title)}</h4>
                    <p class="milestone-sub-text">${escapeHtml(it.desc)}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (chamber.type === 'skills') {
        const skills = data.skills || [
          { title: 'Technical Mastery', pct: 96, icon: '⚡', desc: 'Rapid execution, proactive troubleshooting & system depth' },
          { title: 'Leadership & Collaboration', pct: 94, icon: '🤝', desc: 'Cross-functional teamwork and reliable communication' }
        ];
        innerContentHtml = `
          <div class="room-shell">
            <div class="room-wall" style="background: radial-gradient(ellipse at 50% 30%, rgba(0, 44, 107, 0.45) 0%, rgba(10, 15, 29, 0.85) 65%, rgba(6, 9, 19, 0.98) 100%);"></div>
            <div class="room-floor"></div>
            <div class="room-spotlight" style="background: radial-gradient(circle, rgba(0, 44, 107, 0.8) 0%, transparent 60%);"></div>
          </div>
          <div class="chamber-placard">
            <h2 class="chamber-name">${escapeHtml(chamber.title)}</h2>
            <p class="chamber-desc" style="color: #94a3b8; font-size: 13px; max-width: 620px; margin: 4px auto 0;">${escapeHtml(chamber.sub || '')}</p>
          </div>
          <div class="chamber-content">
            <div class="skills-showcase-container" style="max-width: 720px; margin: 0 auto; display: grid; gap: 14px;">
              ${skills.map(s => `
                <div style="background: rgba(10, 18, 38, 0.75); border: 1px solid rgba(245, 192, 101, 0.25); border-radius: 12px; padding: 16px 20px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                    <span style="font-size:16px; font-weight:700; color:#fff;">${escapeHtml(s.icon || '⚡')} ${escapeHtml(s.title)}</span>
                    <span style="font-size:14px; font-weight:700; color:var(--gold-light);">${s.pct}%</span>
                  </div>
                  <p style="font-size:13.5px; color:#cbd5e1; margin-bottom:8px; line-height:1.45;">${escapeHtml(s.desc || '')}</p>
                  <div style="background:rgba(255,255,255,0.1); height:6px; border-radius:3px; overflow:hidden;">
                    <div style="background:linear-gradient(90deg, var(--gold-dark), var(--gold-light)); height:100%; width:${s.pct}%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (chamber.type === 'people') {
        const notes = data.notes || [
          { text: "Your dedication, warmth, and resilience shine bright every single day!", author: "Team Lead", color: "yellow" },
          { text: "Always helpful, collaborative, and lifting the entire team spirit. Thank you!", author: "Colleague", color: "mint" }
        ];
        innerContentHtml = `
          <div class="room-shell">
            <div class="room-wall" style="background: radial-gradient(ellipse at 50% 30%, rgba(0, 44, 107, 0.45) 0%, rgba(10, 15, 29, 0.85) 65%, rgba(6, 9, 19, 0.98) 100%);"></div>
            <div class="room-floor"></div>
            <div class="room-spotlight" style="background: radial-gradient(circle, rgba(0, 44, 107, 0.8) 0%, transparent 60%);"></div>
          </div>
          <div class="chamber-placard">
            <h2 class="chamber-name">${escapeHtml(chamber.title)}</h2>
            <p class="chamber-desc" style="color: #94a3b8; font-size: 13px; max-width: 620px; margin: 4px auto 0;">${escapeHtml(chamber.sub || '')}</p>
          </div>
          <div class="chamber-content">
            <div class="wall-sticky-canvas" style="max-width: 760px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 16px; justify-content: center;">
              ${notes.map((n, i) => `
                <div class="sticky-note-card ${escapeHtml(n.color || 'yellow')}" style="width: 240px; transform: rotate(${i % 2 === 0 ? '-2deg' : '2.5deg'});">
                  <div class="pin-tack"></div>
                  <p class="sticky-note-body">“${escapeHtml(n.text)}”</p>
                  <div class="sticky-note-sender">— ${escapeHtml(n.author)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (chamber.type === 'memories') {
        const photos = data.photos || [
          { title: "Team Milestones & Celebration", image: "assets/images/profiles/manushi_hero.jpg", desc: "Cherished moments celebrating collective impact." }
        ];
        innerContentHtml = `
          <div class="room-shell">
            <div class="room-wall" style="background: radial-gradient(ellipse at 50% 30%, rgba(0, 44, 107, 0.45) 0%, rgba(10, 15, 29, 0.85) 65%, rgba(6, 9, 19, 0.98) 100%);"></div>
            <div class="room-floor"></div>
            <div class="room-spotlight" style="background: radial-gradient(circle, rgba(0, 44, 107, 0.8) 0%, transparent 60%);"></div>
          </div>
          <div class="chamber-placard">
            <h2 class="chamber-name">${escapeHtml(chamber.title)}</h2>
            <p class="chamber-desc" style="color: #94a3b8; font-size: 13px; max-width: 620px; margin: 4px auto 0;">${escapeHtml(chamber.sub || '')}</p>
          </div>
          <div class="chamber-content">
            <div class="collage-mosaic-grid" style="max-width: 800px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
              ${photos.map(p => `
                <div class="mosaic-tile-card" style="background: rgba(10, 18, 38, 0.85); border: 1px solid rgba(245, 192, 101, 0.3); border-radius: 12px; overflow: hidden; padding: 12px;">
                  <img src="${escapeHtml(p.image)}" style="width: 100%; height: 170px; object-fit: cover; border-radius: 8px;">
                  <h4 style="font-size: 14px; color: #fff; margin-top: 10px;">${escapeHtml(p.title)}</h4>
                  <p style="font-size: 13.5px; color: #cbd5e1; margin-top: 4px; line-height: 1.45;">${escapeHtml(p.desc || '')}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        // Projects / Achievements / Future / Custom
        const cards = data.cards || [
          { title: chamber.title, badge: 'Milestone', desc: chamber.sub || 'Key highlights, projects, and proud moments created at Uffizio.', metric: '100%' },
          { title: 'Continuous Excellence', badge: 'Impact', desc: 'Setting higher standards and empowering team growth with dedication.', metric: '★ 5.0' }
        ];
        innerContentHtml = `
          <div class="room-shell">
            <div class="room-wall" style="background: radial-gradient(ellipse at 50% 30%, rgba(0, 44, 107, 0.45) 0%, rgba(10, 15, 29, 0.85) 65%, rgba(6, 9, 19, 0.98) 100%);"></div>
            <div class="room-floor"></div>
            <div class="room-spotlight" style="background: radial-gradient(circle, rgba(0, 44, 107, 0.8) 0%, transparent 60%);"></div>
          </div>
          <div class="chamber-placard">
            <h2 class="chamber-name">${escapeHtml(chamber.title)}</h2>
            <p class="chamber-desc" style="color: #94a3b8; font-size: 13px; max-width: 620px; margin: 4px auto 0;">${escapeHtml(chamber.sub || '')}</p>
          </div>
          <div class="chamber-content">
            <div style="max-width: 780px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
              ${cards.map(c => `
                <div style="background: rgba(10, 18, 38, 0.75); border: 1px solid rgba(245, 192, 101, 0.28); border-radius: 14px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--gold-light); background: rgba(245,192,101,0.12); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(245,192,101,0.25);">${escapeHtml(c.badge || 'Highlight')}</span>
                    <span style="font-size: 16px; font-weight: 700; color: #fff;">${escapeHtml(c.metric || '✨')}</span>
                  </div>
                  <h3 style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">${escapeHtml(c.title)}</h3>
                  <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">${escapeHtml(c.desc)}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      sec.innerHTML = innerContentHtml;
      return sec;
    }

    // Render & sync DOM chamber elements matching activeChambers
    function renderDynamicChambers(activeChambers) {
      const palaceStageEl = document.getElementById('palaceStage');
      if (!palaceStageEl) return;

      const activeIds = new Set(activeChambers.map(c => c.id));
      const registeredIds = new Set((palaceState.chambers || []).map(c => c.id));

      // 1. Hide/remove any chamber in the DOM that has been removed or disabled
      document.querySelectorAll('.palace-chamber').forEach(el => {
        if (!activeIds.has(el.id)) {
          el.classList.add('chamber-hidden', 'pdf-page-hidden');
          el.classList.remove('active', 'waiting-depth', 'exited-forward', 'pdf-page-active');
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          // Detach custom rooms that were completely deleted
          if ((el.dataset && el.dataset.customRoom === 'true') && !registeredIds.has(el.id)) {
            el.remove();
          }
        } else {
          el.classList.remove('chamber-hidden', 'pdf-page-hidden');
          el.style.display = '';
          el.style.visibility = '';
          el.style.opacity = '';
          el.style.pointerEvents = '';
        }
      });

      // 2. Ensure custom chambers exist in DOM
      activeChambers.forEach(c => {
        let el = document.getElementById(c.id);
        if (!el) {
          el = createCustomChamberElement(c);
          palaceStageEl.appendChild(el);
        } else {
          el.classList.remove('chamber-hidden', 'pdf-page-hidden');
          el.style.display = '';
          el.style.visibility = '';
          // Update placard if present
          const titleEl = el.querySelector('.chamber-name');
          const descEl = el.querySelector('.chamber-desc');
          if (c.id === 'chamber-0') {
            if (titleEl) {
              if (c.title && c.title.toLowerCase() === 'where your journey began') {
                titleEl.innerHTML = 'Where your journey <span class="serif-accent">began</span>';
              } else {
                titleEl.textContent = toSentenceCase(c.title);
              }
            }
            if (descEl) descEl.textContent = c.sub || '';
          } else if (c.id === 'chamber-milestone') {
            const formatted = typeof escapeHtml === 'function' ? escapeHtml(toSentenceCase(c.title || '')).replace(/\r?\n/g, '<br>') : toSentenceCase(c.title || '').replace(/\r?\n/g, '<br>');
            const cTitle = el.querySelector('.celebration-main-title');
            if (cTitle) cTitle.innerHTML = formatted;
            const dTitle = document.querySelector('.doorway-main-title');
            if (dTitle) dTitle.innerHTML = formatted;
          } else {
            if (titleEl) titleEl.textContent = toSentenceCase(c.title);
            if (descEl) descEl.textContent = c.sub || '';
          }
        }
      });

      // 3. Reorder DOM nodes in palaceStage matching activeChambers order
      activeChambers.forEach(c => {
        const el = document.getElementById(c.id);
        if (el && el.parentNode === palaceStageEl) {
          palaceStageEl.appendChild(el);
        }
      });
    }

    // Render dynamic floorplan navigation buttons
    function renderDynamicFloorplanNav(activeChambers) {
      const navContainer = document.querySelector('.floorplan-nav');
      if (!navContainer) return;

      navContainer.innerHTML = activeChambers.map((c, idx) => {
        const stageIdx = idx + 1;
        const isActive = (currentStage === stageIdx) ? 'active' : '';
        const isVisited = (currentStage >= stageIdx) ? 'visited' : '';
        return `
          <button class="chamber-node ${isActive} ${isVisited}" data-stage="${stageIdx}" data-room-id="${c.id}" title="${escapeHtml(c.title)}">
            <span>${escapeHtml(c.navLabel)}</span>
          </button>
        `;
      }).join('');

      chamberNodes = navContainer.querySelectorAll('.chamber-node');
      chamberNodes.forEach(node => {
        node.addEventListener('click', (e) => {
          e.stopPropagation();
          const st = parseInt(node.dataset.stage, 10);
          goToStage(st);
        });
      });
    }

    // Render dynamic step dots
    function renderDynamicStepDots(activeChambers) {
      const dotsContainer = document.querySelector('.corridor-step-dots');
      if (!dotsContainer) return;

      dotsContainer.innerHTML = activeChambers.map((c, idx) => {
        const stageIdx = idx + 1;
        const isActive = (currentStage === stageIdx) ? 'active' : '';
        const isVisited = (currentStage >= stageIdx) ? 'visited' : '';
        return `<div class="step-dot ${isActive} ${isVisited}" data-stage="${stageIdx}" title="${escapeHtml(c.navLabel)}"></div>`;
      }).join('');

      stepDots = dotsContainer.querySelectorAll('.step-dot');
      stepDots.forEach(dot => {
        dot.addEventListener('click', () => {
          const st = parseInt(dot.dataset.stage, 10);
          goToStage(st);
        });
      });
    }

    // Master sync function: updates chambers array, totalStages, stageTitles, DOM nav & 3D positioning
    function syncPalaceNavigation() {
      if (!palaceState.chambers || palaceState.chambers.length === 0) {
        palaceState.chambers = JSON.parse(JSON.stringify(defaultChambers));
      }

      // Filter active chambers
      const activeChambers = palaceState.chambers.filter(c => c.enabled !== false);

      // Re-index navigation numbers
      let numCounter = 1;
      activeChambers.forEach(c => {
        if (c.type === 'celebration') {
          c.navNum = '★';
        } else {
          c.navNum = String(numCounter).padStart(2, '0');
          numCounter++;
        }
      });

      // Render & arrange chamber DOM elements
      renderDynamicChambers(activeChambers);

      // Rebuild chambers array in exact active order
      chambers = activeChambers.map(c => document.getElementById(c.id)).filter(Boolean);

      // Update totalStages (Stage 0 is doorway/portal + 1 for each active chamber)
      totalStages = chambers.length + 1;

      // Update stageTitles
      stageTitles = [
        "PALACE ENTRANCE: SCROLL OR CLICK TO ENTER",
        ...activeChambers.map(c => c.navNum === '★' ? c.title.toUpperCase() : `CHAMBER ${c.navNum}: ${c.title.toUpperCase()}`)
      ];

      // Render Floorplan Navigation Nodes
      renderDynamicFloorplanNav(activeChambers);

      // Render Step Dots
      renderDynamicStepDots(activeChambers);

      // Clamp current stage if totalStages changed
      if (currentStage >= totalStages) {
        currentStage = Math.max(0, totalStages - 1);
      }

      // Synchronize 3D stage chamber positions with currentStage
      if (currentStage <= 0) {
        chambers.forEach(c => {
          if (c) {
            c.classList.remove('active', 'exited-forward');
            c.classList.add('waiting-depth');
          }
        });
      } else {
        const targetRoomIdx = currentStage - 1;
        chambers.forEach((c, idx) => {
          if (!c) return;
          if (idx < targetRoomIdx) {
            c.classList.remove('active', 'waiting-depth');
            c.classList.add('exited-forward');
          } else if (idx === targetRoomIdx) {
            c.classList.remove('waiting-depth', 'exited-forward');
            c.classList.add('active');
          } else {
            c.classList.remove('active', 'exited-forward');
            c.classList.add('waiting-depth');
          }
        });
        const targetChamber = chambers[targetRoomIdx];
        if (targetChamber) {
          if (targetChamber.id === 'chamber-0') {
            activateRoom01Motion(false);
          } else if (targetChamber.id === 'chamber-1') {
            if (window.updateSkillsFadeMask) window.updateSkillsFadeMask();
          } else if (targetChamber.id === 'chamber-2b') {
            if (typeof resetChamber2bCommonImage === 'function') resetChamber2bCommonImage();
          }
        }
      }

      // Update HUD
      updateHUD(currentStage);

      // Keep PDF active print chamber classes in sync
      const printActiveIds = new Set(activeChambers.map(c => c.id));
      document.querySelectorAll('.palace-chamber').forEach(ch => {
        if (printActiveIds.has(ch.id) && ch.style.display !== 'none' && !ch.classList.contains('chamber-hidden')) {
          ch.classList.add('pdf-page-active');
          ch.classList.remove('pdf-page-hidden');
        } else {
          ch.classList.remove('pdf-page-active');
          ch.classList.add('pdf-page-hidden');
        }
      });
    }


    function updatePalaceFromState() {
      if (palaceState.chambers) {
        palaceState.chambers.forEach(c => {
          if (c.title) c.title = toSentenceCase(c.title);
        });
      }
      if (palaceState.celebration && palaceState.celebration.title) {
        palaceState.celebration.title = toSentenceCase(palaceState.celebration.title);
      }
      applyThemeTier(palaceState.milestoneTier || '1yr');
      syncPalaceNavigation();
      const emp = palaceState.employee;
      const celeb = palaceState.celebration || {};

      // First Screen / Grand Entrance (Stage 0)
      const ent = palaceState.entrance || {};
      const portalLogo = document.getElementById('portalArchLogo');
      if (portalLogo && ent.logo) portalLogo.src = ent.logo;
      const portalTitle = document.querySelector('.portal-arch-title');
      if (portalTitle) portalTitle.textContent = ent.title || "WELCOME TO YOUR JOURNEY";
      const portalSub = document.querySelector('.portal-arch-sub');
      if (portalSub) portalSub.textContent = ent.subtitle || "WALK THROUGH YOUR YEAR • 2025 → 2026";
      const portalPrompt = document.getElementById('portalPromptText');
      if (portalPrompt && !isDoorOpen) portalPrompt.textContent = ent.prompt || "Scroll Down or Click Door to Enter";

      // Doorway & Door Wings
      const doorSealLeft = document.getElementById('doorSealLeft');
      if (doorSealLeft) doorSealLeft.textContent = palaceState.doorWingLeft || "UFFIZIO";
      const doorSealRight = document.getElementById('doorSealRight');
      if (doorSealRight) doorSealRight.textContent = palaceState.doorWingRight || (palaceState.employee && palaceState.employee.years) || "2025 → 2026";

      const doorwayEmpName = document.getElementById('doorwayEmpName');
      if (doorwayEmpName) doorwayEmpName.textContent = emp.name;
      const doorwayPortraitImg = document.getElementById('doorwayPortraitImg');
      if (doorwayPortraitImg && emp.photo) doorwayPortraitImg.src = emp.photo;
      const c0Celeb = (palaceState.chambers || []).find(c => c.id === 'chamber-milestone');
      const celebRawTitle = (c0Celeb && c0Celeb.title) || (celeb && celeb.title) || 'Celebrating Your First Year With Uffizio';
      const formattedCelebTitle = typeof escapeHtml === 'function' ? escapeHtml(celebRawTitle).replace(/\r?\n/g, '<br>') : celebRawTitle.replace(/\r?\n/g, '<br>');

      const doorwayMainTitle = document.querySelector('.doorway-main-title');
      if (doorwayMainTitle) {
        doorwayMainTitle.innerHTML = formattedCelebTitle;
      }

      // Celebration Screen
      const celebrationEmpName = document.getElementById('celebrationEmpName');
      if (celebrationEmpName) celebrationEmpName.textContent = emp.name;
      const celebrationPortraitImg = document.getElementById('celebrationPortraitImg');
      if (celebrationPortraitImg && emp.photo) celebrationPortraitImg.src = emp.photo;
      const celebMainTitle = document.querySelector('.celebration-main-title');
      if (celebMainTitle) {
        celebMainTitle.innerHTML = formattedCelebTitle;
      }
      const celebQuote = document.querySelector('.celebration-quote-text');
      if (celebQuote && celeb.quote) celebQuote.textContent = celeb.quote;

      // Render all chambers dynamically
      renderMilestones();
      renderEvolutionRoom();
      renderSkills();
      renderProjects();
      renderProjects2();
      renderStickyNotes();
      renderMemories();
      renderMemories2();
      renderValuesRoom();
      renderProudRoom();
      renderFutureRoom();
      renderThankYouRoom();
      renderPlacards();
    }


    /* ==========================================================================
       6. BADGE 3D TILT
       ========================================================================== */
    // Milestone Celebration 3D Tilt & Begin Button
    const celebrationPortraitFrame = document.getElementById('celebrationPortraitFrame');
    if (celebrationPortraitFrame) {
      celebrationPortraitFrame.addEventListener('mousemove', (e) => {
        const rect = celebrationPortraitFrame.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        celebrationPortraitFrame.style.transform = `perspective(800px) rotateY(${x * 0.08}deg) rotateX(${-y * 0.08}deg) scale(1.02)`;
      });
      celebrationPortraitFrame.addEventListener('mouseleave', () => {
        celebrationPortraitFrame.style.transform = 'none';
      });
    }

    const btnBeginPalace = document.getElementById('btnBeginPalace');
    if (btnBeginPalace) {
      btnBeginPalace.addEventListener('click', () => goToStage(2));
    }

    const badgeCard = document.getElementById('badgeCard');
    if (badgeCard) {
      badgeCard.addEventListener('mousemove', (e) => {
        const rect = badgeCard.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        badgeCard.style.transform = `perspective(600px) rotateY(${x * 0.12}deg) rotateX(${-y * 0.12}deg) translateY(-5px)`;
      });
      badgeCard.addEventListener('mouseleave', () => {
        badgeCard.style.transform = 'none';
      });
    }

    /* ==========================================================================
       7. ROOM 02 INTERACTIONS (VISUAL SKILL PILLARS & EVOLUTION)
       ========================================================================== */
    const laptopTabs = document.querySelectorAll('.laptop-tab-btn');
    const laptopScreenContent = document.getElementById('laptopScreenContent');

    if (laptopScreenContent && laptopTabs.length > 0) {
      const laptopData = {
        terminal: ``,
        certs: ``,
        books: ``
      };
      function setLaptopTab(tabKey) {
        laptopTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabKey));
        laptopScreenContent.innerHTML = laptopData[tabKey] || '';
        palaceAudio.init();
        palaceAudio.playPaperSnap();
      }
      laptopTabs.forEach(t => t.addEventListener('click', () => setLaptopTab(t.dataset.tab)));
    }

    // Render Chamber 2 visual skills dynamically & bind horizontal scrolling
    renderSkills();

    const skillsWrapper = document.getElementById('skillsTrackWrapper');
    const skillsTrack = document.getElementById('skillCardsContainer');
    const skillsPrevBtn = document.getElementById('skillsScrollPrev');
    const skillsNextBtn = document.getElementById('skillsScrollNext');

    function updateSkillsFadeMask() {
      if (!skillsTrack || !skillsWrapper) return;
      const scrollLeft = skillsTrack.scrollLeft;
      const maxScroll = skillsTrack.scrollWidth - skillsTrack.clientWidth;

      if (maxScroll <= 6) {
        skillsWrapper.style.webkitMaskImage = 'none';
        skillsWrapper.style.maskImage = 'none';
        if (skillsPrevBtn) skillsPrevBtn.style.opacity = '0.35';
        if (skillsNextBtn) skillsNextBtn.style.opacity = '0.35';
        return;
      }

      const hasLeft = scrollLeft > 10;
      const hasRight = scrollLeft < (maxScroll - 10);

      if (skillsPrevBtn) skillsPrevBtn.style.opacity = hasLeft ? '1' : '0.35';
      if (skillsNextBtn) skillsNextBtn.style.opacity = hasRight ? '1' : '0.35';

      if (hasLeft && hasRight) {
        const mask = 'linear-gradient(to right, transparent 0%, black 50px, black calc(100% - 70px), transparent 100%)';
        skillsWrapper.style.webkitMaskImage = mask;
        skillsWrapper.style.maskImage = mask;
      } else if (hasLeft && !hasRight) {
        const mask = 'linear-gradient(to right, transparent 0%, black 50px, black 100%)';
        skillsWrapper.style.webkitMaskImage = mask;
        skillsWrapper.style.maskImage = mask;
      } else {
        const mask = 'linear-gradient(to right, black 0%, black calc(100% - 70px), transparent 100%)';
        skillsWrapper.style.webkitMaskImage = mask;
        skillsWrapper.style.maskImage = mask;
      }
    }
    window.updateSkillsFadeMask = updateSkillsFadeMask;

    if (skillsTrack) {
      skillsTrack.addEventListener('scroll', updateSkillsFadeMask, { passive: true });
      window.addEventListener('resize', updateSkillsFadeMask);
      setTimeout(updateSkillsFadeMask, 120);

      if (skillsPrevBtn) {
        skillsPrevBtn.addEventListener('click', () => {
          skillsTrack.scrollBy({ left: -290, behavior: 'smooth' });
          palaceAudio.init();
          palaceAudio.playSwoosh();
          setTimeout(updateSkillsFadeMask, 320);
        });
      }
      if (skillsNextBtn) {
        skillsNextBtn.addEventListener('click', () => {
          skillsTrack.scrollBy({ left: 290, behavior: 'smooth' });
          palaceAudio.init();
          palaceAudio.playSwoosh();
          setTimeout(updateSkillsFadeMask, 320);
        });
      }

      // Mouse wheel horizontal scroll
      skillsTrack.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          skillsTrack.scrollLeft += e.deltaY;
          updateSkillsFadeMask();
        }
      }, { passive: false });

      // Drag to scroll
      let isSkillsDown = false;
      let skillsStartX = 0;
      let skillsScrollLeft = 0;

      skillsTrack.addEventListener('mousedown', (e) => {
        isSkillsDown = true;
        skillsTrack.classList.add('grabbing');
        skillsStartX = e.pageX - skillsTrack.offsetLeft;
        skillsScrollLeft = skillsTrack.scrollLeft;
      });
      window.addEventListener('mouseup', () => {
        isSkillsDown = false;
        skillsTrack.classList.remove('grabbing');
      });
      skillsTrack.addEventListener('mouseleave', () => {
        isSkillsDown = false;
        skillsTrack.classList.remove('grabbing');
      });
      skillsTrack.addEventListener('mousemove', (e) => {
        if (!isSkillsDown) return;
        e.preventDefault();
        const x = e.pageX - skillsTrack.offsetLeft;
        const walk = (x - skillsStartX) * 1.5;
        skillsTrack.scrollLeft = skillsScrollLeft - walk;
        updateSkillsFadeMask();
      });
    }

    /* ==========================================================================
       8. ROOM 03 INTERACTIONS (THE DIFFERENCE YOU STARTED MAKING)
       ========================================================================== */
    // Initialized dynamically by renderProjects()
    
    /* ==========================================================================
       9. ROOM 04 INTERACTIONS (STICKY NOTES)
       ========================================================================== */
    const stickyNotesBoard = document.getElementById('stickyNotesBoard');
    const btnPinSticky = document.getElementById('btnPinSticky');
    const newNoteText = document.getElementById('newNoteText');
    const newNoteAuthor = document.getElementById('newNoteAuthor');
    const colorSwatches = document.querySelectorAll('.color-swatch-btn');
    let selectedStickyColor = 'yellow';

    colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        colorSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        selectedStickyColor = swatch.dataset.color;
      });
    });

    renderStickyNotes();
      renderMemories();

    if (btnPinSticky) {
      btnPinSticky.addEventListener('click', () => {
        const text = newNoteText ? newNoteText.value.trim() : '';
        const author = (newNoteAuthor ? newNoteAuthor.value.trim() : '') || "Teammate";
        if (!text) { alert("Please write a short note before pinning!"); return; }

        palaceAudio.init();
        palaceAudio.playPaperSnap();

        palaceState.stickyNotes.unshift({ text, author, color: selectedStickyColor });
        localStorage.setItem('palace_sticky_notes', JSON.stringify(palaceState.stickyNotes));
        renderStickyNotes();
        renderMemories();

        if (newNoteText) newNoteText.value = '';
        if (newNoteAuthor) newNoteAuthor.value = '';
      });
    }

    /* ==========================================================================
       10. ROOM 05 INTERACTIONS (TROPHY & CONFETTI)
       ========================================================================== */
    const goldenTrophy = document.getElementById('goldenTrophy');
    let isDraggingTrophy = false;
    let trophyAngle = 0;
    let startX = 0;

    if (goldenTrophy) {
      goldenTrophy.addEventListener('mousedown', (e) => {
        isDraggingTrophy = true;
        startX = e.clientX;
        goldenTrophy.style.cursor = 'grabbing';
        palaceAudio.init();
        palaceAudio.playChime();
      });

      goldenTrophy.addEventListener('dragstart', (e) => e.preventDefault());

      window.addEventListener('mousemove', (e) => {
        if (!isDraggingTrophy) return;
        const dx = e.clientX - startX;
        trophyAngle += dx * 0.7;
        goldenTrophy.style.transform = `rotateY(${trophyAngle}deg)`;
        startX = e.clientX;
      });

      window.addEventListener('mouseup', () => {
        if (isDraggingTrophy) {
          isDraggingTrophy = false;
          goldenTrophy.style.cursor = 'grab';
        }
      });

      // Touch support for dragging trophy on mobile / tablet
      goldenTrophy.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          isDraggingTrophy = true;
          startX = e.touches[0].clientX;
          palaceAudio.init();
          palaceAudio.playChime();
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (!isDraggingTrophy || e.touches.length !== 1) return;
        const dx = e.touches[0].clientX - startX;
        trophyAngle += dx * 0.7;
        goldenTrophy.style.transform = `rotateY(${trophyAngle}deg)`;
        startX = e.touches[0].clientX;
      }, { passive: true });

      window.addEventListener('touchend', () => {
        isDraggingTrophy = false;
      });
    }


    /* ==========================================================================
       11. ROOM 08 INTERACTIONS (FUTURE VISION & SOUVENIR)
       ========================================================================== */
    

    const certModalBackdrop = document.getElementById('certModalBackdrop');
    const closeCertModal = document.getElementById('closeCertModal');
    const btnDownloadCertPng = document.getElementById('btnDownloadCertPng');

    if (closeCertModal) {
      closeCertModal.addEventListener('click', closeCertificateModal);
    }

    if (btnDownloadCertPng) {
      btnDownloadCertPng.addEventListener('click', () => {
        const certificateCanvas = document.getElementById('certificateCanvas');
        if (!certificateCanvas) return;
        const empName = (palaceState.employee && palaceState.employee.name) || 'Dhara_Patel';
        const link = document.createElement('a');
        link.download = `${empName.replace(/\s+/g, '_')}_Memory_Palace_Certificate.png`;
        link.href = certificateCanvas.toDataURL('image/png');
        link.click();
      });
    }


// Global chambers exports
window.updatePalaceFromState = updatePalaceFromState;
window.renderPlacards = renderPlacards;
window.syncMobilePlacards = syncMobilePlacards;
window.renderMilestones = renderMilestones;
window.renderSkills = renderSkills;
window.renderProjects = renderProjects;
window.renderProjects2 = renderProjects2;
window.renderStickyNotes = renderStickyNotes;
window.renderValuesRoom = renderValuesRoom;
window.renderProudRoom = renderProudRoom;
window.renderFutureRoom = renderFutureRoom;
window.renderMemories = renderMemories;
window.renderMemories2 = renderMemories2;
window.renderThankYouRoom = renderThankYouRoom;
window.openCertificateModal = openCertificateModal;
window.closeCertificateModal = closeCertificateModal;
window.drawCertificate = drawCertificate;
window.escapeHtml = escapeHtml;
window.syncPalaceNavigation = syncPalaceNavigation;
