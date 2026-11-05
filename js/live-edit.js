/* ==========================================================================
   LIVE ON-SCREEN CLICK-TO-EDIT ENGINE (WYSIWYG)
   ========================================================================== */
    /* ==========================================================================
       LIVE ON-SCREEN CLICK-TO-EDIT ENGINE (WYSIWYG)
       ========================================================================== */
    const liveEditToggleBtn = document.getElementById('liveEditToggleBtn');
    const liveEditToolbar = document.getElementById('liveEditToolbar');
    const btnLiveCancel = document.getElementById('btnLiveCancel');
    const btnLiveSave = document.getElementById('btnLiveSave');
    isLiveEditActive = false;

    function enableLiveEditMode() {
      if (typeof palaceAccessMode !== 'undefined' && palaceAccessMode === 'view') return;
      isLiveEditActive = true;
      document.body.classList.add('live-edit-mode');
      if (liveEditToolbar) liveEditToolbar.classList.add('active');

      // Make all editorial headings, titles, descriptions, and quotes editable
      const editableSelectors = [
        '[data-editable="true"]',
        '.evolution-pill-text',
        '.evolution-then-text',
        '.evolution-now-text',
        '.evolution-heading',
        '.point-text',
        '.conduit-lbl',
        '.point-icon-box',
        '.celebration-main-title',
        '.celebration-employee-name',
        '.celebration-quote-text',
        '.chamber-name',
        '.chamber-desc',
        '#chamberMemoriesTitle',
        '#chamberMemoriesDesc',
        '#chamberMemories2Title',
        '#chamberMemories2Desc',
        '.collage-caption',
        '.collage-date',
        '.collage-tag-pill',
        '.collage-desc',
        '.pedestal-plaque',
        '.pedestal-subtitle',
        '.polaroid-caption',
        '.celebration-text h4',
        '.celebration-text p',
        '.milestone-date',
        '.milestone-title',
        '.milestone-subtext',
        '.skill-title-grp h4',
        '.skill-title-grp p',
        '.project-title',
        '.project-desc',
        '.tbl-primary-title',
        '.tbl-secondary-desc',
        '.tbl-metric-chip',
        '.sticky-note p',
        '.sticky-note-text',
        '.note-author-name',
        '.note-author-role',
        '.author-sign',
        '.doorway-main-title',
        '.doorway-emp-name',
        '.door-back-seal',
        '.portal-arch-title',
        '.portal-arch-sub',
        '#portalPromptText'
      ];

      document.querySelectorAll(editableSelectors.join(',')).forEach(el => {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('data-editable', 'true');
      });
    }

    function disableLiveEditMode() {
      if (typeof isLiveEditActive !== 'undefined') isLiveEditActive = false;
      if (document.body && document.body.classList) document.body.classList.remove('live-edit-mode');
      const toolbar = document.getElementById('liveEditToolbar');
      if (toolbar && toolbar.classList) toolbar.classList.remove('active');
      document.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable');
      });
    }

    if (liveEditToggleBtn) {
      liveEditToggleBtn.addEventListener('click', () => {
        if (!isLiveEditActive) enableLiveEditMode();
        else disableLiveEditMode();
      });
    }

    if (btnLiveCancel) btnLiveCancel.addEventListener('click', disableLiveEditMode);

    if (btnLiveSave) {
      btnLiveSave.addEventListener('click', () => {
        // 0. First Screen & Door Wings Seals
        const liveEntTitleSave = document.querySelector('.portal-arch-title');
        const liveEntSubSave = document.querySelector('.portal-arch-sub');
        const liveEntPromptSave = document.getElementById('portalPromptText');
        const liveEntLogoSave = document.getElementById('portalArchLogo');

        if (liveEntTitleSave || liveEntSubSave || liveEntPromptSave) {
          palaceState.entrance = palaceState.entrance || {};
          if (liveEntTitleSave) palaceState.entrance.title = liveEntTitleSave.textContent.trim();
          if (liveEntSubSave) palaceState.entrance.subtitle = liveEntSubSave.textContent.trim();
          if (liveEntPromptSave && !isDoorOpen) palaceState.entrance.prompt = liveEntPromptSave.textContent.trim();
          if (liveEntLogoSave && liveEntLogoSave.getAttribute('src')) palaceState.entrance.logo = liveEntLogoSave.getAttribute('src');
        }

        const sLeft = document.getElementById('doorSealLeft');
        if (sLeft) palaceState.doorWingLeft = sLeft.textContent.trim();
        const sRight = document.getElementById('doorSealRight');
        if (sRight) palaceState.doorWingRight = sRight.textContent.trim();

        // Evolution (What You Learned) - Pill Cards UI & Legacy
        const liveThenPills = document.querySelectorAll('.evolution-pill-card .evolution-then-text');
        const liveNowPills = document.querySelectorAll('.evolution-pill-card .evolution-now-text');
        if (liveThenPills.length > 0 || liveNowPills.length > 0) {
          palaceState.evolution = palaceState.evolution || {};
          if (liveThenPills.length > 0) {
            palaceState.evolution.thenPoints = Array.from(liveThenPills).map((el, i) => ({
              icon: (palaceState.evolution.thenPoints && palaceState.evolution.thenPoints[i] && palaceState.evolution.thenPoints[i].icon) || ['globe', 'box', 'compass'][i] || 'globe',
              text: el.textContent.trim()
            }));
          }
          if (liveNowPills.length > 0) {
            palaceState.evolution.nowPoints = Array.from(liveNowPills).map((el, i) => ({
              icon: (palaceState.evolution.nowPoints && palaceState.evolution.nowPoints[i] && palaceState.evolution.nowPoints[i].icon) || ['shield', 'target', 'crown'][i] || 'shield',
              text: el.textContent.trim(),
              colorClass: (palaceState.evolution.nowPoints && palaceState.evolution.nowPoints[i] && palaceState.evolution.nowPoints[i].colorClass) || ''
            }));
          }
        } else if (liveThenTitle || liveNowTitle) {
          palaceState.evolution = palaceState.evolution || {};
          if (liveThenTitle) palaceState.evolution.thenTitle = liveThenTitle.textContent.trim();
          if (liveGrowthLbl) palaceState.evolution.growthLabel = liveGrowthLbl.textContent.trim();
          if (liveNowTitle) palaceState.evolution.nowTitle = liveNowTitle.textContent.trim();

          if (liveThenItems && liveThenItems.length > 0) {
            palaceState.evolution.thenPoints = Array.from(liveThenItems).map((item, i) => ({
              icon: (palaceState.evolution.thenPoints && palaceState.evolution.thenPoints[i] && palaceState.evolution.thenPoints[i].icon) || ['globe', 'box', 'compass'][i] || 'globe',
              text: (item.querySelector('.point-text')?.textContent || '').trim()
            }));
          }

          if (liveNowItems && liveNowItems.length > 0) {
            palaceState.evolution.nowPoints = Array.from(liveNowItems).map((item, i) => ({
              icon: (palaceState.evolution.nowPoints && palaceState.evolution.nowPoints[i] && palaceState.evolution.nowPoints[i].icon) || ['shield', 'target', 'crown'][i] || 'shield',
              text: (item.querySelector('.point-text')?.textContent || '').trim(),
              colorClass: item.querySelector('.point-text')?.classList.contains('highlight-gold') ? 'highlight-gold' :
                          item.querySelector('.point-text')?.classList.contains('highlight-cyan') ? 'highlight-cyan' :
                          item.querySelector('.point-text')?.classList.contains('highlight-emerald') ? 'highlight-emerald' : ''
            }));
          }
        }

        // 1. Employee Name
        const empNameEl = document.getElementById('celebrationEmpName');
        if (empNameEl) palaceState.employee.name = empNameEl.textContent.trim();

        // 2. Celebration Quote
        const quoteEl = document.querySelector('.celebration-quote-text');
        if (quoteEl) palaceState.celebration.quote = quoteEl.textContent.trim();

        // 3. Milestones
        const mElements = document.querySelectorAll('#journeyMilestonesList .horizontal-milestone-item');
        if (mElements.length > 0) {
          palaceState.milestones = [];
          mElements.forEach(mEl => {
            const date = mEl.querySelector('.milestone-date')?.textContent.trim() || '';
            const title = mEl.querySelector('.milestone-title')?.textContent.trim() || '';
            const sub = mEl.querySelector('.milestone-subtext')?.textContent.trim() || '';
            palaceState.milestones.push({ date, title, sub });
          });
        }

        // Collect edited creation cards
        const liveCreationCards = document.querySelectorAll('#creationsCardsGrid .creation-visual-card');
        if (liveCreationCards && liveCreationCards.length > 0) {
          palaceState.contributions = palaceState.contributions || [];
          liveCreationCards.forEach((card, idx) => {
            const pTitle = (card.querySelector('.creation-project-title')?.textContent || '').trim() || (`Project ${idx + 1}`);
            const mVal = (card.querySelector('.creation-stat-pill, .creation-metric-val')?.textContent || '').trim();
            const mLbl = (card.querySelector('.creation-metric-lbl')?.textContent || '').trim();
            const pSummary = (card.querySelector('.creation-project-summary')?.textContent || '').trim();
            const cTitle = (card.querySelector('.creation-contrib-title')?.textContent || '').trim();
            const iTitle = (card.querySelector('.creation-impact-title')?.textContent || '').trim();

            const existing = palaceState.contributions[idx] || {};
            palaceState.contributions[idx] = {
              ...existing,
              id: idx,
              image: existing.image || (typeof defaultProjectImages !== 'undefined' ? defaultProjectImages[idx % defaultProjectImages.length] : ''),
              project: { ...(existing.project || {}), title: pTitle, desc: (existing.project?.desc || pSummary) },
              contribution: { ...(existing.contribution || {}), title: cTitle, desc: (existing.contribution?.desc || pSummary) },
              impact: { ...(existing.impact || {}), title: iTitle || existing.impact?.title || '', metricVal1: mVal, metricLbl1: mLbl }
            };
          });
        }

        const liveCreationCards2 = document.querySelectorAll('#creationsCardsGrid2 .split-creation-card, #creationsCardsGrid2 .creation-visual-card');
        if (liveCreationCards2 && liveCreationCards2.length > 0) {
          palaceState.contributions2 = palaceState.contributions2 || [];
          liveCreationCards2.forEach((card, idx) => {
            const pTitle = (card.querySelector('.split-card-title, .creation-project-title')?.textContent || '').trim() || (`Project ${idx + 1}`);
            const mVal = (card.querySelector('.split-card-stat-pill, .creation-stat-pill')?.textContent || '').trim();
            const pSummary = (card.querySelector('.split-card-summary, .creation-project-summary')?.textContent || '').trim();
            const cTitle = (card.querySelector('.split-card-contrib-text, .creation-contrib-title')?.textContent || '').trim();

            const existing = palaceState.contributions2[idx] || {};
            palaceState.contributions2[idx] = {
              ...existing,
              id: idx,
              image: existing.image || (typeof defaultProjectImages !== 'undefined' ? defaultProjectImages[idx % defaultProjectImages.length] : ''),
              project: { ...(existing.project || {}), title: pTitle, desc: (existing.project?.desc || pSummary) },
              contribution: { ...(existing.contribution || {}), title: cTitle, desc: (existing.contribution?.desc || pSummary) },
              impact: { ...(existing.impact || {}), metricVal1: mVal }
            };
          });
        }

        const commonTitleEl = document.getElementById('chamber2bCommonTitle');
        if (commonTitleEl) palaceState.chamber2bCommonTitle = commonTitleEl.textContent.trim();
        const commonDescEl = document.getElementById('chamber2bCommonDesc');
        if (commonDescEl) palaceState.chamber2bCommonDesc = commonDescEl.textContent.trim();

        if (false) {
          const liveRows = document.querySelectorAll('#impactTableBody .impact-table-row');
          if (liveRows.length > 0) {
            palaceState.contributions = [];
            liveRows.forEach((row, idx) => {
              const pTitle = row.querySelector('.col-project .tbl-project-title, .col-project .tbl-primary-title')?.textContent.trim() || `Project ${idx + 1}`;
              const pDesc = row.querySelector('.col-project .tbl-project-desc, .col-project .tbl-secondary-desc')?.textContent.trim() || '';
              const cTitle = row.querySelector('.col-contrib .tbl-contrib-title, .col-contrib .tbl-primary-title')?.textContent.trim() || '';
              const cDesc = row.querySelector('.col-contrib .tbl-contrib-desc, .col-contrib .tbl-secondary-desc')?.textContent.trim() || '';
              const iTitle = row.querySelector('.col-impact .tbl-impact-title, .col-impact .tbl-primary-title')?.textContent.trim() || '';
              const iDesc = row.querySelector('.col-impact .tbl-impact-desc, .col-impact .tbl-secondary-desc')?.textContent.trim() || '';
              const metricVal = row.querySelector('.col-impact .tbl-impact-badge, .col-impact .tbl-metric-chip')?.textContent.trim() || '';

              palaceState.contributions.push({
                id: idx,
                project: { title: pTitle, desc: pDesc },
                contribution: { title: cTitle, desc: cDesc },
                impact: { title: iTitle, desc: iDesc, metricVal1: metricVal, metricLbl1: '' }
              });
            });
          }
        }

        // 4. Chamber Placards
        const ch1T = document.getElementById('chamber1Title');
        const ch1D = document.getElementById('chamber1Desc');
        if (ch1T) palaceState.chamberStories.ch1Title = ch1T.textContent.trim();
        if (ch1D) palaceState.chamberStories.ch1Sub = ch1D.textContent.trim();

        
        // Collect edited collage texts
        const liveCards = document.querySelectorAll('.collage-photo-card');
        liveCards.forEach((card, idx) => {
          if (palaceState.memories && palaceState.memories[idx]) {
            const cap = card.querySelector('.collage-caption');
            const dt = card.querySelector('.collage-date');
            const tg = card.querySelector('.collage-tag-pill');
            const ds = card.querySelector('.collage-desc');
            if (cap) palaceState.memories[idx].title = cap.textContent.trim();
            if (dt) palaceState.memories[idx].date = dt.textContent.trim();
            if (tg) palaceState.memories[idx].tag = tg.textContent.trim();
            if (ds) palaceState.memories[idx].desc = ds.textContent.trim();
          }
        });

        // Collect edited values texts
        const liveValCards = document.querySelectorAll('.value-card');
        liveValCards.forEach((card, idx) => {
          if (palaceState.values && palaceState.values[idx]) {
            const vt = card.querySelector('.value-title');
            const vq = card.querySelector('.value-quote-text');
            const vd = card.querySelector('.value-desc-text');
            const vb = card.querySelector('.value-badge-pill');
            if (vt) palaceState.values[idx].title = vt.textContent.trim();
            if (vq) palaceState.values[idx].quote = vq.textContent.replace(/^“|”$/g, '').trim();
            if (vd) palaceState.values[idx].desc = vd.textContent.trim();
            if (vb) palaceState.values[idx].badge = vb.textContent.trim();
          }
        });

        const chValT = document.getElementById('chamberValuesTitle');
        const chValD = document.getElementById('chamberValuesDesc');
        if (chValT) palaceState.chamberStories.chValTitle = chValT.textContent.trim();
        if (chValD) palaceState.chamberStories.chValDesc = chValD.textContent.trim();

        const chMemT = document.getElementById('chamberMemoriesTitle');
        const chMemD = document.getElementById('chamberMemoriesDesc');
        if (chMemT) palaceState.chamberStories.chMemTitle = chMemT.textContent.trim();
        if (chMemD) palaceState.chamberStories.chMemDesc = chMemD.textContent.trim();

        // Save to localStorage
        persistPalaceState();
        disableLiveEditMode();
        updatePalaceFromState();
        alert("✅ All on-screen text edits saved successfully!");
      });
    }

    // Auto-save on blur for live-edited elements
    document.addEventListener('focusout', (e) => {
      const profileModalBackdrop = document.getElementById('profileModalBackdrop');
      if (profileModalBackdrop && profileModalBackdrop.classList.contains('active')) return;
      if (typeof isLiveEditActive === 'undefined' || !isLiveEditActive) return;
      if (e.target && (
        (e.target.closest && (e.target.closest('.evolution-comparison-stage') || e.target.closest('.room-proud') || e.target.closest('#chamber-4'))) ||
        e.target.hasAttribute('contenteditable') ||
        e.target.hasAttribute('data-editable')
      )) {
        captureLiveEditsToState();
        persistPalaceState();
      }
    });


    function captureLiveEditsToState(force = false) {
      const profileModalBackdrop = document.getElementById('profileModalBackdrop');
      if (profileModalBackdrop && profileModalBackdrop.classList.contains('active')) {
        return;
      }
      if (!force && (typeof isLiveEditActive === 'undefined' || !isLiveEditActive)) {
        return;
      }
      try {
        // 0. Door Wings Seals
        const sLeft = document.getElementById('doorSealLeft');
        if (sLeft) palaceState.doorWingLeft = (sLeft.textContent || '').trim();
        const sRight = document.getElementById('doorSealRight');
        if (sRight) palaceState.doorWingRight = (sRight.textContent || '').trim();

        // 1. Employee Name
        const empNameEl = document.getElementById('celebrationEmpName');
        if (empNameEl) palaceState.employee.name = (empNameEl.textContent || '').trim();

        // 2. Celebration Quote
        const quoteEl = document.querySelector('.celebration-quote-text');
        if (quoteEl) palaceState.celebration.quote = (quoteEl.textContent || '').trim();

        // 3. Milestones
        const mElements = document.querySelectorAll('#journeyMilestonesList .horizontal-milestone-item');
        if (mElements && mElements.length > 0) {
          palaceState.milestones = [];
          mElements.forEach(mEl => {
            const date = (mEl.querySelector('.milestone-date')?.textContent || '').trim();
            const title = (mEl.querySelector('.milestone-title')?.textContent || '').trim();
            const sub = (mEl.querySelector('.milestone-subtext')?.textContent || '').trim();
            palaceState.milestones.push({ date, title, sub });
          });
        }

        // 4. Contributions cards
        const liveCreationCards = document.querySelectorAll('#creationsCardsGrid .creation-visual-card');
        if (liveCreationCards && liveCreationCards.length > 0) {
          palaceState.contributions = palaceState.contributions || [];
          liveCreationCards.forEach((card, idx) => {
            const pTitle = (card.querySelector('.creation-project-title')?.textContent || '').trim() || ('Project ' + (idx + 1));
            const mVal = (card.querySelector('.creation-stat-pill, .creation-metric-val')?.textContent || '').trim();
            const mLbl = (card.querySelector('.creation-metric-lbl')?.textContent || '').trim();
            const pSummary = (card.querySelector('.creation-project-summary')?.textContent || '').trim();
            const cTitle = (card.querySelector('.creation-contrib-title')?.textContent || '').trim();
            const iTitle = (card.querySelector('.creation-impact-title')?.textContent || '').trim();

            const existing = palaceState.contributions[idx] || {};
            palaceState.contributions[idx] = {
              ...existing,
              id: idx,
              image: existing.image || (typeof defaultProjectImages !== 'undefined' ? defaultProjectImages[idx % defaultProjectImages.length] : ''),
              project: { ...(existing.project || {}), title: pTitle, desc: (existing.project?.desc || pSummary) },
              contribution: { ...(existing.contribution || {}), title: cTitle, desc: (existing.contribution?.desc || pSummary) },
              impact: { ...(existing.impact || {}), title: iTitle || existing.impact?.title || '', metricVal1: mVal, metricLbl1: mLbl }
            };
          });
        }

        const liveCreationCards2 = document.querySelectorAll('#creationsCardsGrid2 .split-creation-card, #creationsCardsGrid2 .creation-visual-card');
        if (liveCreationCards2 && liveCreationCards2.length > 0) {
          palaceState.contributions2 = palaceState.contributions2 || [];
          liveCreationCards2.forEach((card, idx) => {
            const pTitle = (card.querySelector('.split-card-title, .creation-project-title')?.textContent || '').trim() || ('Project ' + (idx + 1));
            const mVal = (card.querySelector('.split-card-stat-pill, .creation-stat-pill')?.textContent || '').trim();
            const pSummary = (card.querySelector('.split-card-summary, .creation-project-summary')?.textContent || '').trim();
            const cTitle = (card.querySelector('.split-card-contrib-text, .creation-contrib-title')?.textContent || '').trim();

            const existing = palaceState.contributions2[idx] || {};
            palaceState.contributions2[idx] = {
              ...existing,
              id: idx,
              image: existing.image || (typeof defaultProjectImages !== 'undefined' ? defaultProjectImages[idx % defaultProjectImages.length] : ''),
              project: { ...(existing.project || {}), title: pTitle, desc: (existing.project?.desc || pSummary) },
              contribution: { ...(existing.contribution || {}), title: cTitle, desc: (existing.contribution?.desc || pSummary) },
              impact: { ...(existing.impact || {}), metricVal1: mVal }
            };
          });
        }

        const commonTitleEl2 = document.getElementById('chamber2bCommonTitle');
        if (commonTitleEl2) palaceState.chamber2bCommonTitle = commonTitleEl2.textContent.trim();
        const commonDescEl2 = document.getElementById('chamber2bCommonDesc');
        if (commonDescEl2) palaceState.chamber2bCommonDesc = commonDescEl2.textContent.trim();

        // 4c. Evolution (What You Learned) Pill cards
        const capThenPills = document.querySelectorAll('.evolution-pill-card .evolution-then-text');
        const capNowPills = document.querySelectorAll('.evolution-pill-card .evolution-now-text');
        if (capThenPills.length > 0 || capNowPills.length > 0) {
          palaceState.evolution = palaceState.evolution || {};
          if (capThenPills.length > 0) {
            palaceState.evolution.thenPoints = Array.from(capThenPills).map((el, i) => ({
              icon: (palaceState.evolution.thenPoints && palaceState.evolution.thenPoints[i] && palaceState.evolution.thenPoints[i].icon) || ['globe', 'box', 'compass'][i] || 'globe',
              text: el.textContent.trim()
            }));
          }
          if (capNowPills.length > 0) {
            palaceState.evolution.nowPoints = Array.from(capNowPills).map((el, i) => ({
              icon: (palaceState.evolution.nowPoints && palaceState.evolution.nowPoints[i] && palaceState.evolution.nowPoints[i].icon) || ['shield', 'target', 'crown'][i] || 'shield',
              text: el.textContent.trim(),
              colorClass: (palaceState.evolution.nowPoints && palaceState.evolution.nowPoints[i] && palaceState.evolution.nowPoints[i].colorClass) || ''
            }));
          }
        }

        if (false) {
          const liveRows = document.querySelectorAll('#impactTableBody .impact-table-row');
          if (liveRows && liveRows.length > 0) {
            palaceState.contributions = [];
            liveRows.forEach((row, idx) => {
              const pTitle = (row.querySelector('.col-project .tbl-project-title, .col-project .tbl-primary-title')?.textContent || '').trim() || ('Project ' + (idx + 1));
              const pDesc = (row.querySelector('.col-project .tbl-project-desc, .col-project .tbl-secondary-desc')?.textContent || '').trim();
              const cTitle = (row.querySelector('.col-contrib .tbl-contrib-title, .col-contrib .tbl-primary-title')?.textContent || '').trim();
              const cDesc = (row.querySelector('.col-contrib .tbl-contrib-desc, .col-contrib .tbl-secondary-desc')?.textContent || '').trim();
              const iTitle = (row.querySelector('.col-impact .tbl-impact-title, .col-impact .tbl-primary-title')?.textContent || '').trim();
              const iDesc = (row.querySelector('.col-impact .tbl-impact-desc, .col-impact .tbl-secondary-desc')?.textContent || '').trim();
              const metricVal = (row.querySelector('.col-impact .tbl-impact-badge, .col-impact .tbl-metric-chip')?.textContent || '').trim();

              palaceState.contributions.push({
                id: idx,
                project: { title: pTitle, desc: pDesc },
                contribution: { title: cTitle, desc: cDesc },
                impact: { title: iTitle, desc: iDesc, metricVal1: metricVal, metricLbl1: '' }
              });
            });
          }
        }

        // 5. Chamber Placards
        const ch1T = document.getElementById('chamber1Title');
        const ch1D = document.getElementById('chamber1Desc');
        if (ch1T) palaceState.chamberStories.ch1Title = (ch1T.textContent || '').trim();
        if (ch1D) palaceState.chamberStories.ch1Sub = (ch1D.textContent || '').trim();

        // 6. Collage Memories
        const liveCards = document.querySelectorAll('.collage-photo-card');
        if (liveCards && liveCards.length > 0) {
          liveCards.forEach((card, idx) => {
            if (palaceState.memories && palaceState.memories[idx]) {
              const cap = card.querySelector('.collage-caption');
              const dt = card.querySelector('.collage-date');
              const tg = card.querySelector('.collage-tag-pill');
              const ds = card.querySelector('.collage-desc');
              if (cap) palaceState.memories[idx].title = (cap.textContent || '').trim();
              if (dt) palaceState.memories[idx].date = (dt.textContent || '').trim();
              if (tg) palaceState.memories[idx].tag = (tg.textContent || '').trim();
              if (ds) palaceState.memories[idx].desc = (ds.textContent || '').trim();
            }
          });
        }

        // 7. Values Cards
        const liveValCards = document.querySelectorAll('.value-card');
        if (liveValCards && liveValCards.length > 0) {
          liveValCards.forEach((card, idx) => {
            if (palaceState.values && palaceState.values[idx]) {
              const vt = card.querySelector('.value-title');
              const vq = card.querySelector('.value-quote-text');
              const vd = card.querySelector('.value-desc-text');
              const vb = card.querySelector('.value-badge-pill');
              if (vt) palaceState.values[idx].title = (vt.textContent || '').trim();
              if (vq) palaceState.values[idx].quote = (vq.textContent || '').replace(/^“|”$/g, '').trim();
              if (vd) palaceState.values[idx].desc = (vd.textContent || '').trim();
              if (vb) palaceState.values[idx].badge = (vb.textContent || '').trim();
            }
          });
        }

        // 0b. First Screen / Entrance Elements
        const liveEntTitle = document.querySelector('.portal-arch-title');
        const liveEntSub = document.querySelector('.portal-arch-sub');
        const liveEntPrompt = document.getElementById('portalPromptText');
        const liveEntLogo = document.getElementById('portalArchLogo');
        const liveDoorLeft = document.getElementById('doorSealLeft');
        const liveDoorRight = document.getElementById('doorSealRight');

        if (liveEntTitle || liveEntSub || liveEntPrompt) {
          palaceState.entrance = palaceState.entrance || {};
          if (liveEntTitle) palaceState.entrance.title = liveEntTitle.textContent.trim();
          if (liveEntSub) palaceState.entrance.subtitle = liveEntSub.textContent.trim();
          if (liveEntPrompt && !isDoorOpen) palaceState.entrance.prompt = liveEntPrompt.textContent.trim();
          if (liveEntLogo && liveEntLogo.getAttribute('src')) palaceState.entrance.logo = liveEntLogo.getAttribute('src');
        }
        if (liveDoorLeft) palaceState.doorWingLeft = liveDoorLeft.textContent.trim();
        if (liveDoorRight) palaceState.doorWingRight = liveDoorRight.textContent.trim();

        // 8c. Thank You Room (Final Chamber)
        palaceState.thankYou = palaceState.thankYou || {};
        const adminTyTitleInp = document.getElementById('adminThankYouTitle');
        const adminTySubInp = document.getElementById('adminThankYouSub');
        const adminTyMsgInp = document.getElementById('adminThankYouMsg');
        const adminTySigInp = document.getElementById('adminThankYouSig');

        if (adminTyTitleInp && adminTyTitleInp.value && adminTyTitleInp.value.trim()) {
          palaceState.thankYou.title = adminTyTitleInp.value.trim();
        } else {
          const capTyTitle = document.querySelector('#chamber-thankyou .thankyou-main-title');
          if (capTyTitle && capTyTitle.textContent.trim()) palaceState.thankYou.title = capTyTitle.textContent.trim();
        }

        if (adminTySubInp && adminTySubInp.value !== undefined && adminTySubInp.value !== null && adminTySubInp.value.trim()) {
          palaceState.thankYou.subtitle = adminTySubInp.value.trim();
        } else {
          const capTySub = document.querySelector('#chamber-thankyou .thankyou-subtitle');
          if (capTySub) palaceState.thankYou.subtitle = capTySub.textContent.trim();
        }

        if (adminTyMsgInp && adminTyMsgInp.value && adminTyMsgInp.value.trim()) {
          palaceState.thankYou.message = adminTyMsgInp.value.trim();
        } else {
          const capTyMsg = document.querySelector('#chamber-thankyou .thankyou-letter-text');
          if (capTyMsg && capTyMsg.textContent.trim()) palaceState.thankYou.message = capTyMsg.textContent.trim();
        }

        if (adminTySigInp && adminTySigInp.value && adminTySigInp.value.trim()) {
          palaceState.thankYou.signature = adminTySigInp.value.trim();
        } else {
          const capTySig = document.querySelector('#chamber-thankyou .thankyou-signature-line');
          if (capTySig && capTySig.textContent.trim()) palaceState.thankYou.signature = capTySig.textContent.trim();
        }

        // 8b. Proud Moments (Chamber 7 / Room 05)
        const livePlaque = document.querySelector('#chamber-4 .pedestal-plaque');
        const liveSubtitle = document.querySelector('#chamber-4 .pedestal-subtitle');
        const liveCelebH4 = document.querySelector('#chamber-4 .celebration-text h4');
        const liveCelebP = document.querySelector('#chamber-4 .celebration-text p');
        const liveCelebBtn = document.querySelector('#chamber-4 #btnFireConfetti span');
        const liveFrames = document.querySelectorAll('#chamber-4 .polaroids-row .polaroid-frame');

        if (livePlaque || liveSubtitle || liveCelebH4 || (liveFrames && liveFrames.length > 0)) {
          palaceState.proud = palaceState.proud || {};
          if (livePlaque) palaceState.proud.plaqueTitle = livePlaque.textContent.trim();
          if (liveSubtitle) palaceState.proud.plaqueSubtitle = liveSubtitle.textContent.trim();
          if (liveCelebH4) palaceState.proud.celebrateTitle = liveCelebH4.textContent.trim();
          if (liveCelebP) palaceState.proud.celebrateDesc = liveCelebP.textContent.trim();
          if (liveCelebBtn) palaceState.proud.celebrateBtn = liveCelebBtn.textContent.trim();

          if (liveFrames && liveFrames.length > 0) {
            palaceState.proud.polaroids = palaceState.proud.polaroids || [];
            liveFrames.forEach((frame, idx) => {
              const cap = frame.querySelector('.polaroid-caption');
              const img = frame.querySelector('.polaroid-img-box img');
              const existing = palaceState.proud.polaroids[idx] || {};
              palaceState.proud.polaroids[idx] = {
                image: (img && img.getAttribute('src')) || existing.image || '',
                caption: (cap && cap.textContent.trim()) || existing.caption || ''
              };
            });
          }
        }

        // 8d. The Future (Chamber 08 / Chamber 5)
        const liveFutPlacard = document.querySelector('#chamber-5 .chamber-name');
        const liveFutCards = document.querySelectorAll('#chamber-5 .future-card');
        const liveFutImg = document.getElementById('futureArtworkImg') || document.querySelector('#chamber-5 .future-artwork-img');
        const adminFutImgInp = document.getElementById('adminFutureImage');

        if (liveFutPlacard || (liveFutCards && liveFutCards.length > 0) || liveFutImg || adminFutImgInp) {
          palaceState.future = palaceState.future || {};
          if (liveFutPlacard) palaceState.future.title = liveFutPlacard.textContent.trim();
          if (adminFutImgInp && adminFutImgInp.value && adminFutImgInp.value.trim()) {
            palaceState.future.image = adminFutImgInp.value.trim();
          } else if (liveFutImg && liveFutImg.getAttribute('src')) {
            palaceState.future.image = liveFutImg.getAttribute('src');
          }

          if (liveFutCards && liveFutCards.length > 0) {
            palaceState.future.cards = palaceState.future.cards || [];
            liveFutCards.forEach((el, idx) => {
              const tEl = el.querySelector('.future-card-title');
              const sEl = el.querySelector('.future-card-sub');
              const existing = palaceState.future.cards[idx] || {};
              palaceState.future.cards[idx] = {
                title: (tEl && tEl.textContent.trim()) || existing.title || '',
                sub: (sEl && sEl.textContent.trim()) || existing.sub || ''
              };
            });
          }
        }

        // 8. Sticky Notes text
        const liveNotes = document.querySelectorAll('#stickyNotesBoard .sticky-note');
        if (liveNotes && liveNotes.length > 0 && palaceState.stickyNotes) {
          liveNotes.forEach((nEl, idx) => {
            if (palaceState.stickyNotes[idx]) {
              const pText = (nEl.querySelector('.sticky-note-text, p')?.textContent || '').trim();
              const aName = (nEl.querySelector('.note-author-name')?.textContent || '').trim();
              const aRole = (nEl.querySelector('.note-author-role')?.textContent || '').trim();
              if (pText) palaceState.stickyNotes[idx].text = pText;
              if (aName) palaceState.stickyNotes[idx].author = aRole ? (aName + ' • ' + aRole) : aName;
            }
          });
        }

        // Check staged photo
        if (typeof stagedPhotoData !== 'undefined' && stagedPhotoData) {
          palaceState.employee.photo = stagedPhotoData;
        }
      } catch (err) {
        console.warn("captureLiveEditsToState error:", err);
      }
    }


// Global live-edit exports
window.enableLiveEditMode = enableLiveEditMode;
window.disableLiveEditMode = disableLiveEditMode;
window.captureLiveEditsToState = captureLiveEditsToState;
