/* ==========================================================================
   APPLICATION ENTRY POINT, MOBILE DRAWER & BOOTSTRAP ORCHESTRATOR
   ========================================================================== */

    // ==========================================================================
    // MOBILE 3-DOT NAVIGATION SIDEBAR CONTROLLER
    // ==========================================================================
    function openMobileNavSidebar() {
      const sidebar = document.getElementById('mobileNavSidebar');
      const backdrop = document.getElementById('mobileNavBackdrop');
      if (sidebar && backdrop) {
        updateSidebarStatus();
        sidebar.classList.add('open');
        backdrop.classList.add('open');
        document.body.classList.add('mobile-sidebar-open');
      }
    }

    function closeMobileNavSidebar() {
      const sidebar = document.getElementById('mobileNavSidebar');
      const backdrop = document.getElementById('mobileNavBackdrop');
      if (sidebar && backdrop) {
        sidebar.classList.remove('open');
        backdrop.classList.remove('open');
        document.body.classList.remove('mobile-sidebar-open');
      }
    }

    function updateSidebarStatus() {
      const isEdit = !document.body.classList.contains('view-mode-active');
      const sidebarModeTitle = document.getElementById('sidebarModeTitle');
      const sidebarModeBadge = document.getElementById('sidebarModeBadge');
      if (sidebarModeTitle) sidebarModeTitle.textContent = isEdit ? 'Edit Mode' : 'View Mode';
      if (sidebarModeBadge) {
        sidebarModeBadge.textContent = isEdit ? 'Active' : 'Locked';
        sidebarModeBadge.className = 'sidebar-action-badge ' + (isEdit ? 'badge-edit' : 'badge-view');
      }

      const isLiveEdit = document.body.classList.contains('live-edit-mode-active');
      const liveEditPill = document.getElementById('sidebarLiveEditPill');
      if (liveEditPill) {
        liveEditPill.textContent = isLiveEdit ? 'ON' : 'OFF';
        liveEditPill.className = 'sidebar-action-toggle-pill ' + (isLiveEdit ? 'pill-on' : 'pill-off');
      }

      const isMuted = typeof palaceAudio !== 'undefined' && palaceAudio.isMuted;
      const audioPill = document.getElementById('sidebarAudioPill');
      const audioDesc = document.getElementById('sidebarAudioDesc');
      if (audioPill) {
        audioPill.textContent = isMuted ? 'Muted' : 'Playing';
        audioPill.className = 'sidebar-action-toggle-pill ' + (isMuted ? 'pill-off' : 'pill-on');
      }
      if (audioDesc) audioDesc.textContent = isMuted ? 'Palace sound muted' : 'Playing ambient BGM';

      const emp = (typeof palaceState !== 'undefined' && palaceState.employee) || {};
      const nameEl = document.getElementById('sidebarEmpName');
      const avatarEl = document.getElementById('sidebarEmpAvatar');
      if (nameEl && emp.name) nameEl.textContent = emp.name;
      if (avatarEl && emp.photo) avatarEl.src = emp.photo;
    }

    function handleSidebarAction(action) {
      closeMobileNavSidebar();
      setTimeout(() => {
        switch (action) {
          case 'edit-mode':
            const modeBadge = document.getElementById('palaceModeBadge');
            if (modeBadge) modeBadge.click();
            break;
          case 'share':
            const shareBtn = document.getElementById('shareJourneyBtn');
            if (shareBtn) shareBtn.click();
            break;
          case 'export-pdf':
            if (typeof window.printJourneyPDF === 'function') {
              window.printJourneyPDF();
            }
            break;
          case 'save-download':
            const saveBtn = document.getElementById('saveDownloadBtn');
            if (saveBtn) saveBtn.click();
            break;
          case 'live-edit':
            const liveBtn = document.getElementById('liveEditToggleBtn');
            if (liveBtn) liveBtn.click();
            break;
          case 'admin':
            openAdminPanel();
            break;
          case 'audio':
            if (typeof palaceAudio !== 'undefined' && typeof palaceAudio.toggleMute === 'function') {
              palaceAudio.toggleMute();
            }
            break;
          case 'fullscreen':
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
            break;
        }
      }, 160);
    }

    window.openMobileNavSidebar = openMobileNavSidebar;
    window.closeMobileNavSidebar = closeMobileNavSidebar;
    window.handleSidebarAction = handleSidebarAction;



// Global Image 404 Auto-Resolver: Transparently resolves un-prefixed images
window.addEventListener('error', function(e) {
  if (e.target && e.target.tagName === 'IMG') {
    const src = e.target.getAttribute('src');
    if (src && !src.startsWith('data:') && !src.startsWith('blob:') && !src.startsWith('assets/images/')) {
      const resolved = window.resolveAssetUrl ? window.resolveAssetUrl(src) : src;
      if (resolved && resolved !== src) {
        e.target.src = resolved;
      }
    }
  }
}, true);

// Master DOMContentLoaded Bootstrap
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize canvas sizes & ambient loops
  if (typeof resizeCanvas === 'function') {
    resizeCanvas();
  }
  if (typeof renderAmbient === 'function') {
    renderAmbient();
  }
  if (typeof resizeConfetti === 'function') {
    resizeConfetti();
  }

  // 2. Initialize access mode and url payload
  if (typeof initAccessModeAndPayload === 'function') {
    initAccessModeAndPayload();
  }

  // 3. Chamber navigation and positions
  if (typeof syncPalaceNavigation === 'function') {
    syncPalaceNavigation();
  }
  if (typeof initChamberPositions === 'function') {
    initChamberPositions();
  }
  if (typeof setupShareDialogListeners === 'function') {
    setupShareDialogListeners();
  }

  // 4. Update palace from state and render all chambers
  if (typeof updatePalaceFromState === 'function') {
    updatePalaceFromState();
  }
  if (typeof setupAdminPanelLiveSync === 'function') {
    setupAdminPanelLiveSync();
  }

  // 5. Initialize employee profile & profile dropdown
  if (typeof initEmployeeProfile === 'function') {
    await initEmployeeProfile();
    if (typeof populateProfileDropdown === 'function') {
      populateProfileDropdown();
    }
  }
});
