/* ==========================================================================
   SHARE MODAL, RBAC ACCESS CONTROL, PDF GENERATION & HTML BAKING ENGINE
   ========================================================================== */
    /* ==========================================================================
       SHARE LINKS & ROLE-BASED ACCESS CONTROL (RBAC) ENGINE
       ========================================================================== */
    let palaceAccessMode = 'edit';
    var isLiveEditActive = false;

    // (compressStateToHash and decompressStateFromHash are powered by LZString above)

    // Apply Access Mode (View vs Edit)
    function applyAccessMode(mode) {
      palaceAccessMode = mode;
      try {
        localStorage.setItem('palace_user_access_mode', mode);
      } catch (e) {}

      const modeBadge = document.getElementById('palaceModeBadge');
      const modeBadgeIcon = document.getElementById('modeBadgeIcon');
      const modeBadgeText = document.getElementById('modeBadgeText');
      const profileEditBtn = document.getElementById('profileEditBtn');
      const floatingAdminBtn = document.getElementById('floatingAdminBtn');
      const liveEditToggleBtn = document.getElementById('liveEditToggleBtn');
      const saveDownloadBtn = document.getElementById('saveDownloadBtn');

      if (mode === 'view') {
        document.body.classList.add('view-mode-active');
        document.body.classList.remove('edit-mode-active');

        // Hide edit tools in View Mode
        if (profileEditBtn) profileEditBtn.style.display = 'none';
        if (floatingAdminBtn) floatingAdminBtn.style.display = 'none';
        if (liveEditToggleBtn) liveEditToggleBtn.style.display = 'none';
        if (saveDownloadBtn) saveDownloadBtn.style.display = 'none';

        // Check if this is a shared recipient view (baked defaultAccessMode === 'view' or url ?access=view)
        const urlParams = (typeof window !== 'undefined' && window.location) ? new URLSearchParams(window.location.search) : null;
        const requestedAccess = urlParams ? (urlParams.get('access') || urlParams.get('mode')) : null;
        if (palaceState.defaultAccessMode === 'view' || requestedAccess === 'view') {
          // Strictly hide mode badge for recipients of shared presentation
          if (modeBadge) modeBadge.style.display = 'none';
        } else {
          // Keep mode badge for local author so author can click to return to Edit Mode
          if (modeBadgeIcon) modeBadgeIcon.textContent = '👁️';
          if (modeBadgeText) modeBadgeText.textContent = 'View Mode';
          if (modeBadge) {
            modeBadge.style.display = '';
            modeBadge.title = 'View Mode Active. Click to switch to Edit Mode.';
            modeBadge.className = 'action-pill mode-badge-pill badge-view';
          }
        }

        if (typeof disableLiveEditMode === 'function') {
          disableLiveEditMode();
        }
        document.querySelectorAll('[contenteditable]').forEach(el => el.setAttribute('contenteditable', 'false'));
      } else {
        document.body.classList.remove('view-mode-active');
        document.body.classList.add('edit-mode-active');

        if (modeBadgeIcon) modeBadgeIcon.textContent = '✏️';
        if (modeBadgeText) modeBadgeText.textContent = 'Edit Mode';
        if (modeBadge) {
          modeBadge.style.display = '';
          modeBadge.title = 'Edit Mode Active. Click to switch to View Mode.';
          modeBadge.className = 'action-pill mode-badge-pill badge-edit';
        }

        if (profileEditBtn) profileEditBtn.style.display = '';
        if (floatingAdminBtn) floatingAdminBtn.style.display = '';
        if (liveEditToggleBtn) liveEditToggleBtn.style.display = '';
        if (saveDownloadBtn) saveDownloadBtn.style.display = '';
        document.querySelectorAll('[data-editable="true"]').forEach(el => el.setAttribute('contenteditable', 'true'));
      }
    }

    function promptUnlockEditor() {
      // Passcode verification removed per user request: unlocks editing directly
      applyAccessMode('edit');
    }

    // Initialize access mode and payload from URL
    function initAccessModeAndPayload() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const requestedAccess = urlParams.get('access') || urlParams.get('mode');

        // Check if hash has embedded data payload
        if (window.location.hash && window.location.hash.includes('data=')) {
          const hashParts = window.location.hash.split('data=');
          if (hashParts[1]) {
            const decoded = decompressStateFromHash(hashParts[1]);
            if (decoded && typeof decoded === 'object') {
              Object.keys(decoded).forEach(k => {
                if (decoded[k] !== undefined && decoded[k] !== null) {
                  if (typeof decoded[k] === 'object' && !Array.isArray(decoded[k])) {
                    palaceState[k] = { ...palaceState[k], ...decoded[k] };
                  } else {
                    palaceState[k] = decoded[k];
                  }
                }
              });

              try {
                localStorage.setItem('palace_full_profile', JSON.stringify(palaceState));
              } catch (e) {}

              // Re-render whole palace with the decoded data
              if (typeof updatePalaceFromState === 'function') {
                updatePalaceFromState();
              }
            }
          }
        }

        if (requestedAccess === 'view') {
          applyAccessMode('view');
        } else if (requestedAccess === 'edit') {
          // Passcode verification removed per user request: open directly in Edit Mode
          applyAccessMode('edit');
        } else if (palaceState.defaultAccessMode === 'view') {
          // Exported presentation opened by recipient -> lock in View Mode
          applyAccessMode('view');
        } else {
          // Default directly to Edit Mode for fast testing and changes without passcode
          applyAccessMode('edit');
        }
      } catch (e) {
        console.warn("Could not init access mode", e);
        if (palaceState && palaceState.defaultAccessMode === 'view') {
          applyAccessMode('view');
        } else {
          applyAccessMode('edit');
        }
      }
    }

    // Copy to clipboard helper
    function copyToClipboard(text, feedbackEl, defaultText) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          if (feedbackEl) {
            feedbackEl.textContent = "✅ Link copied to clipboard!";
            feedbackEl.style.color = "var(--gold-light)";
            setTimeout(() => {
              feedbackEl.textContent = defaultText || "Ready to share";
              feedbackEl.style.color = "#64748b";
            }, 3000);
          }
        }).catch(() => fallbackCopy(text, feedbackEl, defaultText));
      } else {
        fallbackCopy(text, feedbackEl, defaultText);
      }
    }

    function fallbackCopy(text, feedbackEl, defaultText) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        if (feedbackEl) {
          feedbackEl.textContent = "✅ Link copied to clipboard!";
          feedbackEl.style.color = "var(--gold-light)";
          setTimeout(() => {
            feedbackEl.textContent = defaultText || "Ready to share";
            feedbackEl.style.color = "#64748b";
          }, 3000);
        }
      } catch (err) {
        alert("Please manually select and copy the link from the input box.");
      }
      document.body.removeChild(ta);
    }

    // Share Modal Controller & Dynamic Clean URL Shortener Engine
    function getCleanPublicBaseUrl() {
      if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
        return window.location.origin + window.location.pathname.replace(/\/+$/, '') + '/';
      }
      return 'https://hineshvarma-uffizio.github.io/Employee-Journey/';
    }

    function getCleanViewUrl() {
      const base = getCleanPublicBaseUrl();
      const slug = (typeof currentEmpSlug !== 'undefined' && currentEmpSlug && currentEmpSlug !== 'dhara_patel')
        ? encodeURIComponent(currentEmpSlug)
        : '';
      return slug ? `${base}?emp=${slug}&access=view` : `${base}?access=view`;
    }

    function getCleanEditUrl() {
      const base = getCleanPublicBaseUrl();
      const slug = (typeof currentEmpSlug !== 'undefined' && currentEmpSlug && currentEmpSlug !== 'dhara_patel')
        ? encodeURIComponent(currentEmpSlug)
        : '';
      return slug ? `${base}?emp=${slug}&access=edit` : `${base}?access=edit`;
    }

    function getShareBaseUrl() {
      return window.location.href.split('?')[0].split('#')[0];
    }

    let cachedTinyUrl = null;
    let isFetchingTinyUrl = false;

    function fetchTinyUrlForShare(longUrl, callback) {
      if (cachedTinyUrl && cachedTinyUrl.long === longUrl) {
        if (callback) callback(cachedTinyUrl.short);
        return;
      }
      if (isFetchingTinyUrl) return;
      isFetchingTinyUrl = true;

      // Use public TinyURL API
      const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`;
      fetch(apiUrl)
        .then(res => {
          if (!res.ok) throw new Error("TinyURL network response was not ok");
          return res.text();
        })
        .then(shortLink => {
          isFetchingTinyUrl = false;
          if (shortLink && shortLink.startsWith('http')) {
            cachedTinyUrl = { long: longUrl, short: shortLink.trim() };
            if (callback) callback(shortLink.trim());
          } else {
            if (callback) callback(longUrl);
          }
        })
        .catch(err => {
          isFetchingTinyUrl = false;
          console.warn("TinyURL shortener fetch error, falling back to clean short URL:", err);
          if (callback) callback(longUrl);
        });
    }

    function generateShareUrls() {
      const cleanViewUrl = getCleanViewUrl();
      const cleanEditUrl = getCleanEditUrl();
      const photo = palaceState.employee && palaceState.employee.photo;

      const finishGenerate = () => {
        const shareViewUrlInput = document.getElementById('shareViewUrlInput');
        const shareEditUrlInput = document.getElementById('shareEditUrlInput');
        const shareTinyInp = document.getElementById('shareTinyUrlInput');
        const inputEditorPasscode = document.getElementById('inputEditorPasscode');
        const shareDataPayloadUrlInput = document.getElementById('shareDataPayloadUrlInput');

        // 1. Direct clean web view link (~65 chars)
        if (shareViewUrlInput) {
          shareViewUrlInput.value = cleanViewUrl;
        }

        // 2. Short Link (TinyURL / WhatsApp friendly - 28 chars)
        const defaultShortLink = "https://tinyurl.com/27q648db";
        if (shareTinyInp) {
          shareTinyInp.value = (cachedTinyUrl && cachedTinyUrl.long === cleanViewUrl)
            ? cachedTinyUrl.short
            : defaultShortLink;
          // Asynchronously fetch fresh TinyURL in background
          fetchTinyUrlForShare(cleanViewUrl, (shortLink) => {
            if (shareTinyInp) shareTinyInp.value = shortLink;
          });
        }

        // 3. Edit link (~65 chars)
        if (palaceAccessMode === 'view') {
          if (shareEditUrlInput) shareEditUrlInput.value = '';
          if (inputEditorPasscode) inputEditorPasscode.value = '';
        } else {
          if (shareEditUrlInput) {
            shareEditUrlInput.value = cleanEditUrl;
          }
          if (inputEditorPasscode) {
            inputEditorPasscode.value = palaceState.editorPasscode || "uffizio";
          }
        }

        // 4. Advanced: full data payload link (if user opened the advanced details drawer)
        if (shareDataPayloadUrlInput) {
          try {
            const encodedData = compressStateToHash(palaceState);
            const baseUrl = getShareBaseUrl();
            const slug = currentEmpSlug;
            const empQuery = slug ? `?emp=${encodeURIComponent(slug)}&` : '?';
            const dataHash = encodedData ? `#data=${encodedData}` : '';
            shareDataPayloadUrlInput.value = `${baseUrl}${empQuery}access=view&v=${Date.now()}${dataHash}`;
          } catch(e) {}
        }
      };

      // If photo was previously saved as an uncompressed raw base64 string (>35KB), optimize it now
      if (photo && photo.startsWith('data:') && photo.length > 35000) {
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
          palaceState.employee.photo = canvas.toDataURL('image/jpeg', 0.78);
          try {
            localStorage.setItem('palace_full_profile', JSON.stringify(palaceState));
          } catch(e) {}
          finishGenerate();
        };
        img.onerror = finishGenerate;
        img.src = photo;
      } else {
        finishGenerate();
      }
    }

    function openShareModal() {
      captureLiveEditsToState();
      generateShareUrls();
      const shareModalBackdrop = document.getElementById('shareModalBackdrop');
      const shareTabsNav = document.querySelector('.share-tabs-nav');
      const btnTabShareView = document.getElementById('btnTabShareView');
      const btnTabShareEdit = document.getElementById('btnTabShareEdit');
      const panelShareView = document.getElementById('panelShareView');
      const panelShareEdit = document.getElementById('panelShareEdit');
      const btnTestViewLink = document.getElementById('btnTestViewLink');
      const btnTestEditLink = document.getElementById('btnTestEditLink');
      const modalTitle = shareModalBackdrop ? shareModalBackdrop.querySelector('.modal-title') : null;
      const modalSubtitle = shareModalBackdrop ? shareModalBackdrop.querySelector('.modal-subtitle') : null;

      if (palaceAccessMode === 'view') {
        if (shareTabsNav) shareTabsNav.style.display = 'none';
        if (btnTabShareEdit) btnTabShareEdit.style.display = 'none';
        if (panelShareEdit) panelShareEdit.style.display = 'none';
        if (panelShareView) panelShareView.style.display = 'block';
        if (btnTabShareView) btnTabShareView.classList.add('active');
        if (btnTestViewLink) btnTestViewLink.style.display = 'none';
        if (btnTestEditLink) btnTestEditLink.style.display = 'none';
        if (modalTitle) modalTitle.textContent = '🔗 Share Presentation';
        if (modalSubtitle) modalSubtitle.textContent = 'Share this memory palace presentation with your colleagues and team.';
      } else {
        if (shareTabsNav) shareTabsNav.style.display = 'flex';
        if (btnTabShareEdit) btnTabShareEdit.style.display = '';
        if (btnTestViewLink) btnTestViewLink.style.display = '';
        if (btnTestEditLink) btnTestEditLink.style.display = '';
        if (modalTitle) modalTitle.textContent = '🔗 Share Presentation & Permissions';
        if (modalSubtitle) modalSubtitle.textContent = 'Generate shareable links with dedicated View or Edit rights.';
      }

      if (shareModalBackdrop) shareModalBackdrop.classList.add('active');
    }

    function closeShareModalDialog() {
      const shareModalBackdrop = document.getElementById('shareModalBackdrop');
      if (shareModalBackdrop) shareModalBackdrop.classList.remove('active');
    }

    // Initialize Share Dialog Listeners
    function setupShareDialogListeners() {
      const shareJourneyBtn = document.getElementById('shareJourneyBtn');
      const closeShareModal = document.getElementById('closeShareModal');
      const shareModalBackdrop = document.getElementById('shareModalBackdrop');
      const adminOpenShareModal = document.getElementById('adminOpenShareModal');
      const palaceModeBadge = document.getElementById('palaceModeBadge');

      if (shareJourneyBtn) shareJourneyBtn.addEventListener('click', openShareModal);
      if (closeShareModal) closeShareModal.addEventListener('click', closeShareModalDialog);
      if (adminOpenShareModal) {
        adminOpenShareModal.addEventListener('click', () => {
          closeAdminPanel();
          openShareModal();
        });
      }
      if (shareModalBackdrop) {
        shareModalBackdrop.addEventListener('click', (e) => {
          if (e.target === shareModalBackdrop) closeShareModalDialog();
        });
      }

      // Mode badge click in top bar
      if (palaceModeBadge) {
        palaceModeBadge.addEventListener('click', () => {
          if (palaceAccessMode === 'view') {
            applyAccessMode('edit');
          } else {
            if (confirm("Switch to View-Only Presentation Mode?\n(This cleanly hides all admin and edit buttons for presentation).")) {
              applyAccessMode('view');
            }
          }
        });
      }

      // Share Modal Tab Switching
      const btnTabShareView = document.getElementById('btnTabShareView');
      const btnTabShareEdit = document.getElementById('btnTabShareEdit');
      const panelShareView = document.getElementById('panelShareView');
      const panelShareEdit = document.getElementById('panelShareEdit');

      if (btnTabShareView && btnTabShareEdit) {
        btnTabShareView.addEventListener('click', () => {
          btnTabShareView.classList.add('active');
          btnTabShareEdit.classList.remove('active');
          if (panelShareView) panelShareView.style.display = 'block';
          if (panelShareEdit) panelShareEdit.style.display = 'none';
        });
        btnTabShareEdit.addEventListener('click', () => {
          btnTabShareEdit.classList.add('active');
          btnTabShareView.classList.remove('active');
          if (panelShareEdit) panelShareEdit.style.display = 'block';
          if (panelShareView) panelShareView.style.display = 'none';
        });
      }

      // Copy buttons
      const btnCopyViewLink = document.getElementById('btnCopyViewLink');
      const btnCopyEditLink = document.getElementById('btnCopyEditLink');
      const copyViewFeedback = document.getElementById('copyViewFeedback');
      const copyEditFeedback = document.getElementById('copyEditFeedback');

      const btnCopyTinyLink = document.getElementById('btnCopyTinyLink');
      if (btnCopyTinyLink) {
        btnCopyTinyLink.addEventListener('click', () => {
          const url = document.getElementById('shareTinyUrlInput')?.value || "https://tinyurl.com/27q648db";
          if (url) copyToClipboard(url, copyViewFeedback, "Ready to share");
        });
      }

      if (btnCopyViewLink) {
        btnCopyViewLink.addEventListener('click', () => {
          const url = document.getElementById('shareViewUrlInput')?.value;
          if (url) copyToClipboard(url, copyViewFeedback, "Ready to share");
        });
      }
      if (btnCopyEditLink) {
        btnCopyEditLink.addEventListener('click', () => {
          const url = document.getElementById('shareEditUrlInput')?.value;
          if (url) copyToClipboard(url, copyEditFeedback, "Ready to share");
        });
      }

      const btnCopyDataPayloadLink = document.getElementById('btnCopyDataPayloadLink');
      if (btnCopyDataPayloadLink) {
        btnCopyDataPayloadLink.addEventListener('click', () => {
          const url = document.getElementById('shareDataPayloadUrlInput')?.value;
          if (url) copyToClipboard(url, copyViewFeedback, "Data payload link copied");
        });
      }

      const btnShareDownloadHtml = document.getElementById('btnShareDownloadHtml');
      if (btnShareDownloadHtml) {
        btnShareDownloadHtml.addEventListener('click', () => {
          const empSafeName = (palaceState.employee && palaceState.employee.name)
            ? (palaceState.employee.name.trim().replace(/[^a-zA-Z0-9_-]/g, '_') + '_Journey.html')
            : 'Employee_Journey.html';
          downloadUpdatedHtml(empSafeName);
        });
      }

      // Test Mode buttons inside dialog
      const btnTestViewLink = document.getElementById('btnTestViewLink');
      const btnTestEditLink = document.getElementById('btnTestEditLink');

      if (btnTestViewLink) {
        btnTestViewLink.addEventListener('click', () => {
          closeShareModalDialog();
          applyAccessMode('view');
          alert("👁️ Switched to View-Only Presentation Mode!\nAdmin buttons are now cleanly hidden. Click the '👁️ View Mode' badge in the top bar anytime to switch back to Edit Mode.");
        });
      }
      if (btnTestEditLink) {
        btnTestEditLink.addEventListener('click', () => {
          closeShareModalDialog();
          applyAccessMode('edit');
          alert("✏️ Switched to Edit Mode!\nFull administrative and editing tools are now active.");
        });
      }

      // Editor Passcode input
      const inputEditorPasscode = document.getElementById('inputEditorPasscode');
      if (inputEditorPasscode) {
        inputEditorPasscode.addEventListener('change', () => {
          palaceState.editorPasscode = inputEditorPasscode.value.trim() || "uffizio";
          try {
            localStorage.setItem('palace_full_profile', JSON.stringify(palaceState));
          } catch (e) {}
          generateShareUrls();
        });
      }
    }

    // ==========================================================================
    // SOCIAL MEDIA SHARING & PDF EXPORT CONTROLLERS
    // ==========================================================================

    window.getSocialShareUrl = function() {
      const shareTinyInp = document.getElementById('shareTinyUrlInput');
      if (shareTinyInp && shareTinyInp.value && shareTinyInp.value.startsWith('http') && shareTinyInp.value.length < 200) {
        return shareTinyInp.value;
      }
      const shareViewInp = document.getElementById('shareViewUrlInput');
      if (shareViewInp && shareViewInp.value && shareViewInp.value.startsWith('http') && shareViewInp.value.length < 200) {
        return shareViewInp.value;
      }
      return (typeof getCleanViewUrl === 'function') ? getCleanViewUrl() : (getCleanPublicBaseUrl() + '?access=view');
    };

    function preparePrintMode() {
      document.body.classList.add('printing-journey-pdf');

      // Close all active modals/lightboxes
      const shareModal = document.getElementById('shareModalBackdrop');
      if (shareModal) shareModal.classList.remove('active');
      const adminModal = document.getElementById('adminModalBackdrop');
      if (adminModal) adminModal.classList.remove('active');
      const certModal = document.getElementById('certModalBackdrop');
      if (certModal) certModal.classList.remove('active');
      const collageModal = document.getElementById('collageLightboxBackdrop');
      if (collageModal) collageModal.classList.remove('active');

      // Ensure all chambers are freshly rendered with latest text/photos
      try {
        if (typeof renderAllChambers === 'function') renderAllChambers();
        if (typeof renderThankYouRoom === 'function') renderThankYouRoom();
        if (typeof renderFutureRoom === 'function') renderFutureRoom();
        if (typeof renderValuesRoom === 'function') renderValuesRoom();
        if (typeof renderMemories === 'function') renderMemories();
        if (typeof renderMemories2 === 'function') renderMemories2();
      } catch(e) {
        console.warn("Print prep render error:", e);
      }

      // Identify strictly the active, enabled chambers
      const activeIds = new Set((palaceState.chambers || [])
        .filter(c => c.enabled !== false)
        .map(c => c.id));

      document.querySelectorAll('.palace-chamber').forEach(ch => {
        if (activeIds.has(ch.id) && ch.style.display !== 'none' && !ch.classList.contains('chamber-hidden')) {
          ch.classList.add('pdf-page-active');
          ch.classList.remove('pdf-page-hidden');
        } else {
          ch.classList.remove('pdf-page-active');
          ch.classList.add('pdf-page-hidden');
        }
      });

      const portal = document.getElementById('portalStage');
      if (portal) portal.classList.add('pdf-page-hidden');
    }

    function cleanupPrintMode() {
      document.body.classList.remove('printing-journey-pdf');
      document.querySelectorAll('.palace-chamber').forEach(ch => {
        ch.classList.remove('pdf-page-active', 'pdf-page-hidden');
      });
      const portal = document.getElementById('portalStage');
      if (portal) portal.classList.remove('pdf-page-hidden');
    }

    window.addEventListener('beforeprint', preparePrintMode);
    window.addEventListener('afterprint', cleanupPrintMode);

    // ==========================================================================
    // CLIENT-SIDE HIGH-RESOLUTION JPEG MULTI-PAGE PRESENTATION PDF ENGINE
    // ==========================================================================
    window.cachedSlideJpegs = [];

    window.exportJourneyPDF = async function() {
      // 1. Check library availability
      const hasHtml2Canvas = typeof html2canvas !== 'undefined' || typeof window.html2canvas !== 'undefined';
      const jsPDFModule = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;

      if (!hasHtml2Canvas || !jsPDFModule) {
        console.warn("High-res canvas/PDF engine still loading, falling back to browser print...");
        preparePrintMode();
        setTimeout(() => { window.focus(); window.print(); }, 200);
        return;
      }

      const h2c = window.html2canvas || html2canvas;
      const jsPDFClass = jsPDFModule;

      // 2. Open Progress Modal
      const modal = document.getElementById('pdfExportProgressModal');
      const bar = document.getElementById('pdfExportProgressBar');
      const title = document.getElementById('pdfExportProgressText');
      const sub = document.getElementById('pdfExportProgressSub');
      const actions = document.getElementById('pdfExportActionBtns');

      if (actions) actions.style.display = 'none';
      if (bar) bar.style.width = '5%';
      if (title) title.textContent = 'Initializing slide capture engine...';
      if (sub) sub.textContent = 'Preparing live themes and high-res rooms...';
      if (modal) modal.classList.add('active');

      // Close all open dialogs & toast
      if (typeof closeShareModalDialog === 'function') closeShareModalDialog();
      if (typeof closeAdminPanel === 'function') closeAdminPanel();
      const toast = document.getElementById('palaceToast');
      if (toast) toast.classList.remove('show');

      // Ensure dynamic chambers are rendered
      try {
        if (typeof renderAllChambers === 'function') renderAllChambers();
        if (typeof renderThankYouRoom === 'function') renderThankYouRoom();
        if (typeof renderFutureRoom === 'function') renderFutureRoom();
        if (typeof renderValuesRoom === 'function') renderValuesRoom();
        if (typeof renderMemories === 'function') renderMemories();
        if (typeof renderMemories2 === 'function') renderMemories2();
      } catch (e) {
        console.warn("Render pre-pass warning:", e);
      }

      // Wait for fonts
      if (document.fonts && document.fonts.ready) {
        try { await document.fonts.ready; } catch(e){}
      }

      // 3. Filter active chambers strictly in sequence
      const activeChambers = (palaceState.chambers || []).filter(c => c.enabled !== false);
      if (activeChambers.length === 0) {
        alert("No active chambers found to export.");
        if (modal) modal.classList.remove('active');
        return;
      }

      const originalStage = (typeof currentStage !== 'undefined') ? currentStage : 0;
      window.cachedSlideJpegs = [];

      // Enter PDF capturing mode
      document.body.classList.add('pdf-capturing-mode');

      // Setup jsPDF (A4 Landscape)
      const pdf = new jsPDFClass({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const totalSlides = activeChambers.length;

      // === PREPARE ROYAL DAMASK VECTOR PATTERN ONCE FOR ALL SLIDES ===
      let damaskPattern = null;
      try {
        const damaskImg = await new Promise((res) => {
          const img = new Image();
          let resolved = false;
          const timer = setTimeout(() => {
            if (!resolved) { resolved = true; res(null); }
          }, 1200);
          img.onload = () => {
            if (!resolved) { resolved = true; clearTimeout(timer); res(img); }
          };
          img.onerror = () => {
            if (!resolved) { resolved = true; clearTimeout(timer); res(null); }
          };
          img.src = 'assets/images/branding/royal_damask_mask_512.png';
          if (img.complete && img.naturalWidth > 0) {
            resolved = true;
            clearTimeout(timer);
            res(img);
          }
        });

        const tileSize = Math.round(320 * 1.5);
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = tileSize;
        tileCanvas.height = tileSize;
        const tileCtx = tileCanvas.getContext('2d');

        if (damaskImg && damaskImg.naturalWidth > 0) {
          // Authentic royal gradient from live website: #70a9fc -> #589df6 -> #7db6ff
          const patGrad = tileCtx.createLinearGradient(0, 0, tileSize, tileSize);
          patGrad.addColorStop(0, '#70a9fc');
          patGrad.addColorStop(0.5, '#589df6');
          patGrad.addColorStop(1, '#7db6ff');
          tileCtx.fillStyle = patGrad;
          tileCtx.fillRect(0, 0, tileSize, tileSize);
          tileCtx.globalCompositeOperation = 'destination-in';
          tileCtx.drawImage(damaskImg, 0, 0, tileSize, tileSize);
          tileCtx.globalCompositeOperation = 'source-over';
        } else {
          // Procedural royal damask lattice vector pattern fallback
          tileCtx.strokeStyle = 'rgba(112, 169, 252, 0.85)';
          tileCtx.lineWidth = 3;
          const half = tileSize / 2;
          const drawDiamond = (cx, cy, r) => {
            tileCtx.beginPath();
            tileCtx.moveTo(cx, cy - r);
            tileCtx.quadraticCurveTo(cx + r * 0.45, cy - r * 0.45, cx + r, cy);
            tileCtx.quadraticCurveTo(cx + r * 0.45, cy + r * 0.45, cx, cy + r);
            tileCtx.quadraticCurveTo(cx - r * 0.45, cy + r * 0.45, cx - r, cy);
            tileCtx.quadraticCurveTo(cx - r * 0.45, cy - r * 0.45, cx, cy - r);
            tileCtx.stroke();
            tileCtx.beginPath();
            tileCtx.arc(cx, cy, r * 0.28, 0, Math.PI * 2);
            tileCtx.stroke();
          };
          drawDiamond(half, half, half * 0.82);
          drawDiamond(0, 0, half * 0.82);
          drawDiamond(tileSize, 0, half * 0.82);
          drawDiamond(0, tileSize, half * 0.82);
          drawDiamond(tileSize, tileSize, half * 0.82);
        }

        const dummy = document.createElement('canvas');
        damaskPattern = dummy.getContext('2d').createPattern(tileCanvas, 'repeat');
      } catch (err) {
        console.warn("Damask pattern preparation error:", err);
      }

      try {
        for (let i = 0; i < totalSlides; i++) {
          const chConfig = activeChambers[i];
          const pct = Math.round(10 + ((i / totalSlides) * 80));
          if (bar) bar.style.width = pct + '%';
          if (title) title.textContent = `Capturing Slide ${i + 1} of ${totalSlides}: ${chConfig.title}`;
          if (sub) sub.textContent = `Processing high-resolution JPEG graphics...`;

          // Deactivate all chambers
          document.querySelectorAll('.palace-chamber').forEach(el => {
            el.classList.remove('capture-target-active', 'active');
            el.style.display = 'none';
          });

          // Activate target chamber
          const targetEl = document.getElementById(chConfig.id);
          if (!targetEl) continue;

          // Remove state classes that force opacity:0 / visibility:hidden
          targetEl.classList.remove('waiting-depth', 'exited-forward', 'chamber-hidden');
          // Add BOTH capture-target-active AND active so child CSS rules (opacity:0 -> opacity:1) fire correctly
          targetEl.classList.add('capture-target-active', 'active');
          // Force inline style to override any remaining inline display:none
          targetEl.style.cssText = 'display: flex !important; opacity: 1 !important; visibility: visible !important; transform: none !important;';

          // Trigger custom room motion/render updates
          try {
            if (chConfig.id === 'chamber-0' && typeof activateRoom01Motion === 'function') {
              activateRoom01Motion(false);
            } else if (chConfig.id === 'chamber-1' && typeof window.updateSkillsFadeMask === 'function') {
              window.updateSkillsFadeMask();
            } else if (chConfig.id === 'chamber-2b' && typeof resetChamber2bCommonImage === 'function') {
              resetChamber2bCommonImage();
            } else if (chConfig.id === 'chamber-values' && typeof renderValuesRoom === 'function') {
              renderValuesRoom();
            } else if (chConfig.id === 'chamber-thankyou' && typeof renderThankYouRoom === 'function') {
              renderThankYouRoom();
            }
          } catch(e) {}

          // Ensure images inside targetEl are fully loaded
          const imgs = Array.from(targetEl.querySelectorAll('img'));
          await Promise.all(imgs.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(res => {
              img.onload = res;
              img.onerror = res;
            });
          }));

          // Allow DOM to settle (150ms — enough for .active CSS rules to apply after class change)
          await new Promise(r => setTimeout(r, 150));

          // ── STEP 1: Capture chamber content on TRANSPARENT background ──
          // Use onclone to inject CSS into the cloned document:
          // - Forces chamber to position:fixed top:0 left:0 1440x1018 (exact A4 landscape 297:210 ratio)
          // - Makes all children opacity:1 / visible (overrides waiting-depth states)
          // - Flattens 3D containers (html2canvas doesn't support preserve-3d)
          // - Zero aspect distortion: pre-crops all photos to exact container aspect ratio
          const chamberCanvas = await h2c(targetEl, {
            width: 1440,
            height: 1018,
            scale: 1.5,
            backgroundColor: null,
            useCORS: true,
            allowTaint: true,
            logging: false,
            windowWidth: 1440,
            windowHeight: 1018,
            onclone: async (clonedDoc, clonedEl) => {
              const injectStyle = clonedDoc.createElement('style');
              const cid = clonedEl.id ? ('#' + clonedEl.id) : '.capture-target-active';
              injectStyle.textContent = `
                * { animation: none !important; transition: none !important; }
                ${cid} {
                  position: fixed !important;
                  top: 0 !important; left: 0 !important;
                  width: 1440px !important; height: 1018px !important;
                  display: flex !important;
                  flex-direction: column !important;
                  align-items: center !important;
                  justify-content: center !important;
                  transform: none !important;
                  transform-style: flat !important;
                  padding: 30px 48px !important;
                  margin: 0 !important;
                  box-sizing: border-box !important;
                  overflow: hidden !important;
                  opacity: 1 !important;
                  visibility: visible !important;
                  background: transparent !important;
                  z-index: 99999 !important;
                }
                ${cid} * {
                  opacity: 1 !important;
                  visibility: visible !important;
                  transform-style: flat !important;
                }
                ${cid} .chamber-content,
                ${cid} .celebration-stage-container,
                ${cid} .values-orbital-stage,
                ${cid} .horizontal-journey-hall,
                ${cid} .horizontal-milestones-list,
                ${cid} .collage-board-container,
                ${cid} .team-wall-board,
                ${cid} .creations-split-container,
                ${cid} .creations-split-left,
                ${cid} .creations-split-cards-grid,
                ${cid} .creations-split-right,
                ${cid} .creations-common-image-card,
                ${cid} .split-creation-card {
                  transform: none !important;
                }
                /* Hide all 3D environment shells, spotlights, and unblurred glows */
                ${cid} .room-shell,
                ${cid} .room-wall,
                ${cid} .room-wall::before,
                ${cid} .room-wall::after,
                ${cid} .room-floor,
                ${cid} .room-spotlight,
                ${cid} .celebration-portrait-glow,
                ${cid} .chamber-confetti-sparkles {
                  display: none !important;
                  opacity: 0 !important;
                  visibility: hidden !important;
                }
              `;
              clonedDoc.head.appendChild(injectStyle);

              // ── ZERO-DISTORTION CANVAS PRE-CROP (ELIMINATES ALL PHOTO STRETCHING) ──
              // html2canvas ignores CSS object-fit and stretches raw images into element bounding boxes.
              // Here, we pre-crop each image onto an offscreen canvas at the exact rendered bounding box
              // aspect ratio using the exact object-fit (cover / contain) & object-position rules.
              // When html2canvas draws this pre-cropped data URL, aspect ratio distortion is mathematically 0.00%!
              try {
                const realImgs = Array.from(targetEl.querySelectorAll('img'));
                const clonedImgs = Array.from(clonedEl.querySelectorAll('img'));

                for (let idx = 0; idx < clonedImgs.length; idx++) {
                  const cImg = clonedImgs[idx];
                  const rImg = realImgs[idx];
                  if (!rImg) continue;

                  const nw = rImg.naturalWidth || cImg.naturalWidth || 0;
                  const nh = rImg.naturalHeight || cImg.naturalHeight || 0;
                  if (!nw || !nh) continue;

                  // Get actual rendered bounding box from live DOM
                  const rRect = rImg.getBoundingClientRect();
                  let bw = Math.round(rRect.width);
                  let bh = Math.round(rRect.height);

                  // Fallback to parent box if img rect is 0 (or unrendered yet)
                  if ((!bw || !bh) && rImg.parentElement) {
                    const pRect = rImg.parentElement.getBoundingClientRect();
                    bw = Math.round(pRect.width);
                    bh = Math.round(pRect.height);
                  }
                  if (!bw) bw = nw;
                  if (!bh) bh = nh;

                  // Read computed style for object-fit & object-position
                  const cs = window.getComputedStyle(rImg);
                  const objFit = (cs.objectFit || '').toLowerCase();
                  const objPos = (cs.objectPosition || '').toLowerCase();

                  // Parse object-position (X and Y percentage)
                  let px = 0.5;
                  let py = 0.5;
                  if (objPos) {
                    const parts = objPos.trim().split(/\s+/);
                    if (parts.length >= 2) {
                      if (parts[0] === 'left') px = 0;
                      else if (parts[0] === 'right') px = 1;
                      else if (parts[0] === 'center') px = 0.5;
                      else if (parts[0].endsWith('%')) px = parseFloat(parts[0]) / 100;

                      if (parts[1] === 'top') py = 0;
                      else if (parts[1] === 'bottom') py = 1;
                      else if (parts[1] === 'center') py = 0.5;
                      else if (parts[1].endsWith('%')) py = parseFloat(parts[1]) / 100;
                    }
                  }
                  // Top-bias portrait faces so heads are never cut off
                  if (cImg.classList.contains('celebration-portrait-img') || 
                      cImg.classList.contains('doorway-portrait-img') ||
                      cImg.id === 'celebrationPortraitImg' ||
                      cImg.id === 'doorwayPortraitImg') {
                    py = 0.15;
                  }

                  // 2x Retina sharpness offscreen crop canvas
                  const cw = Math.max(1, Math.round(bw * 2));
                  const ch = Math.max(1, Math.round(bh * 2));
                  const cropCanvas = document.createElement('canvas');
                  cropCanvas.width = cw;
                  cropCanvas.height = ch;
                  const cropCtx = cropCanvas.getContext('2d');
                  cropCtx.imageSmoothingEnabled = true;
                  cropCtx.imageSmoothingQuality = 'high';

                  if (objFit === 'contain') {
                    // CONTAIN: scale to fit inside without cropping
                    const s = Math.min(cw / nw, ch / nh);
                    const rw = nw * s;
                    const rh = nh * s;
                    const dx = (cw - rw) * px;
                    const dy = (ch - rh) * py;
                    cropCtx.clearRect(0, 0, cw, ch);
                    cropCtx.drawImage(rImg, dx, dy, rw, rh);
                  } else {
                    // COVER (default): scale to cover entire box, zero distortion
                    const s = Math.max(cw / nw, ch / nh);
                    const rw = nw * s;
                    const rh = nh * s;
                    const dx = (cw - rw) * px;
                    const dy = (ch - rh) * py;
                    cropCtx.drawImage(rImg, dx, dy, rw, rh);
                  }

                  // Safely set pre-cropped base64 data URL
                  try {
                    const isPng = objFit === 'contain' || (rImg.currentSrc || rImg.src || '').toLowerCase().includes('.png');
                    const croppedDataUrl = isPng ? cropCanvas.toDataURL('image/png') : cropCanvas.toDataURL('image/jpeg', 0.96);
                    cImg.src = croppedDataUrl;
                    cImg.style.setProperty('width', bw + 'px', 'important');
                    cImg.style.setProperty('height', bh + 'px', 'important');
                    cImg.style.setProperty('max-width', '100%', 'important');
                    cImg.style.setProperty('max-height', '100%', 'important');
                    cImg.style.setProperty('object-fit', 'fill', 'important');
                    cImg.style.setProperty('display', 'block', 'important');
                    cImg.style.setProperty('opacity', '1', 'important');
                    cImg.style.setProperty('visibility', 'visible', 'important');
                  } catch (dataUrlErr) {
                    console.warn("Pre-crop dataURL generation fallback:", dataUrlErr);
                  }
                }

                // Wait for any updated image data URLs to decode
                await Promise.all(clonedImgs.map(img => {
                  if (img.complete && img.naturalWidth > 0) return Promise.resolve();
                  return new Promise(res => {
                    img.onload = res;
                    img.onerror = res;
                    setTimeout(res, 60);
                  });
                }));
              } catch (imgErr) {
                console.warn("Photo pre-crop error:", imgErr);
              }
            }
          });

          // ── STEP 2: Build background canvas: deep dark navy + vignetted royal vector pattern + soft vignette ──
          const finalW = Math.round(1440 * 1.5);
          const finalH = Math.round(1018 * 1.5);
          const finalCanvas = document.createElement('canvas');
          finalCanvas.width = finalW;
          finalCanvas.height = finalH;
          const ctx = finalCanvas.getContext('2d');

          // a) Clean dark luxury navy base (matches live background-color: #030712)
          ctx.fillStyle = '#030712';
          ctx.fillRect(0, 0, finalW, finalH);

          // b) Vignetted Royal Damask Vector Pattern (Cinematic Radial Mask Falloff)
          // Matches live site -webkit-mask-image: radial-gradient(ellipse at 50% 50%, #000 18%, ... transparent 92%)
          if (damaskPattern) {
            const patLayerCanvas = document.createElement('canvas');
            patLayerCanvas.width = finalW;
            patLayerCanvas.height = finalH;
            const patCtx = patLayerCanvas.getContext('2d');

            // 1. Tile the damask pattern across the layer
            patCtx.fillStyle = damaskPattern;
            patCtx.fillRect(0, 0, finalW, finalH);

            // 2. Apply smooth radial vignette mask directly onto vector pattern
            // Pattern is visible in center, then smoothly and seamlessly fades to 0% in corners/edges
            patCtx.globalCompositeOperation = 'destination-in';
            const patVignette = patCtx.createRadialGradient(
              finalW / 2, finalH / 2, finalH * 0.16,
              finalW / 2, finalH / 2, finalW * 0.54
            );
            patVignette.addColorStop(0, 'rgba(0, 0, 0, 1)');
            patVignette.addColorStop(0.35, 'rgba(0, 0, 0, 0.85)');
            patVignette.addColorStop(0.65, 'rgba(0, 0, 0, 0.38)');
            patVignette.addColorStop(0.88, 'rgba(0, 0, 0, 0.08)');
            patVignette.addColorStop(1, 'rgba(0, 0, 0, 0)');
            patCtx.fillStyle = patVignette;
            patCtx.fillRect(0, 0, finalW, finalH);

            // 3. Composite vignetted pattern at gentle, softened luxury opacity (0.040)
            ctx.globalAlpha = 0.038;
            ctx.drawImage(patLayerCanvas, 0, 0);
            ctx.globalAlpha = 1.0;
          }

          // c) Atmospheric corner vignette — smoothly deepens canvas corners into midnight velvet
          const vig = ctx.createRadialGradient(
            finalW / 2, finalH / 2, finalW * 0.24,
            finalW / 2, finalH / 2, finalW * 0.74
          );
          vig.addColorStop(0, 'rgba(3, 7, 18, 0)');
          vig.addColorStop(0.55, 'rgba(3, 7, 18, 0.30)');
          vig.addColorStop(0.85, 'rgba(3, 7, 18, 0.75)');
          vig.addColorStop(1, 'rgba(3, 7, 18, 0.95)');
          ctx.fillStyle = vig;
          ctx.fillRect(0, 0, finalW, finalH);

          // ── STEP 3: Composite chamber content on top ──
          ctx.drawImage(chamberCanvas, 0, 0);

          const canvas = finalCanvas;

          const jpegData = canvas.toDataURL('image/jpeg', 0.95);
          window.cachedSlideJpegs.push({
            num: String(i + 1).padStart(2, '0'),
            id: chConfig.id,
            title: chConfig.title || `Slide_${i + 1}`,
            dataUrl: jpegData
          });

          if (i > 0) {
            pdf.addPage('a4', 'landscape');
          }
          pdf.addImage(jpegData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
        }

        // Finalize PDF
        if (bar) bar.style.width = '95%';
        if (title) title.textContent = 'Assembling Multi-Page PDF Document...';
        if (sub) sub.textContent = 'Optimizing compression and metadata...';
        await new Promise(r => setTimeout(r, 100));

        const emp = palaceState.employee || {};
        const safeName = (emp.name || 'Employee_Journey').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
        const pdfFileName = `${safeName}_Memory_Palace_Journey.pdf`;
        pdf.save(pdfFileName);

        if (bar) bar.style.width = '100%';
        if (title) title.textContent = '🎉 PDF Download Complete!';
        if (sub) sub.textContent = `All ${totalSlides} slides successfully saved to ${pdfFileName}`;
        if (actions) actions.style.display = 'flex';

      } catch (err) {
        console.error("PDF Export failed:", err);
        alert("An error occurred during high-res PDF generation: " + (err.message || err) + "\nFalling back to browser print.");
        document.body.classList.remove('pdf-capturing-mode');
        if (modal) modal.classList.remove('active');
        preparePrintMode();
        setTimeout(() => { window.focus(); window.print(); }, 200);
      } finally {
        // Clean up all capture classes and restore inline styles
        document.querySelectorAll('.palace-chamber').forEach(el => {
          el.classList.remove('capture-target-active', 'active');
          el.style.cssText = '';
        });
        document.body.classList.remove('pdf-capturing-mode');
        if (typeof syncPalaceNavigation === 'function') {
          syncPalaceNavigation();
        }
      }
    };

    window.downloadSlideJpegs = function() {
      if (!window.cachedSlideJpegs || window.cachedSlideJpegs.length === 0) {
        window.exportJourneyPDF();
        return;
      }
      const emp = palaceState.employee || {};
      const safeName = (emp.name || 'Employee').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      window.cachedSlideJpegs.forEach((slide, idx) => {
        setTimeout(() => {
          const a = document.createElement('a');
          a.download = `${safeName}_Slide_${slide.num}_${(slide.title || 'room').replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`;
          a.href = slide.dataUrl;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, idx * 250);
      });
    };

    // Alias for backwards compatibility with top bar and buttons
    window.printJourneyPDF = window.exportJourneyPDF;

    // Listeners for progress modal actions
    document.addEventListener('DOMContentLoaded', () => {
      const btnDone = document.getElementById('btnPdfExportDone');
      if (btnDone) {
        btnDone.addEventListener('click', () => {
          const modal = document.getElementById('pdfExportProgressModal');
          if (modal) modal.classList.remove('active');
          document.body.classList.remove('pdf-capturing-mode');
        });
      }
      const btnJpegs = document.getElementById('btnDownloadJpegsDirect');
      if (btnJpegs) {
        btnJpegs.addEventListener('click', () => {
          if (typeof window.downloadSlideJpegs === 'function') window.downloadSlideJpegs();
        });
      }
    });

    window.shareToLinkedIn = function() {
      const shareUrl = window.getSocialShareUrl();
      const emp = palaceState.employee || {};
      const name = emp.name || 'My';
      const years = emp.milestoneYears || '1';
      const caption = `Proud to celebrate my ${years}-Year Work Anniversary journey at Uffizio! 🌟\n\nExplore my interactive 3D memory palace and career milestones here: ${shareUrl}\n\n#Uffizio #WorkAnniversary #CareerJourney #LifeAtUffizio #Milestone`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(caption).catch(() => {});
      }
      showPalaceToast("💼 Celebration text copied! Opening LinkedIn...", 3500);

      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      window.open(linkedInUrl, '_blank', 'noopener,noreferrer,width=650,height=600');
    };

    window.shareToTwitter = function() {
      const shareUrl = window.getSocialShareUrl();
      const emp = palaceState.employee || {};
      const years = emp.milestoneYears || '1';
      const tweetText = `Proud to celebrate my ${years}-Year Work Anniversary journey at @Uffizio! 🌟 Explore my interactive 3D digital memory palace:`;

      showPalaceToast("🐦 Opening Twitter / X...", 2500);
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}&hashtags=Uffizio,WorkAnniversary,CareerMilestone`;
      window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    };

    window.shareToFacebook = function() {
      const shareUrl = window.getSocialShareUrl();
      showPalaceToast("📘 Opening Facebook share...", 2500);
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      window.open(fbUrl, '_blank', 'noopener,noreferrer,width=650,height=550');
    };

    window.shareToWhatsApp = function() {
      const shareUrl = window.getSocialShareUrl();
      const emp = palaceState.employee || {};
      const name = emp.name || 'My';
      const years = emp.milestoneYears || '1';
      const msg = `🎉 Celebrating ${name}'s ${years}-Year Work Anniversary Journey at Uffizio! ✨\n\nExplore the interactive 3D digital memory palace here:\n${shareUrl}`;

      showPalaceToast("💬 Opening WhatsApp...", 2500);
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    };

    window.downloadInstagramCard = function() {
      showPalaceToast("🎨 Rendering high-res Instagram celebration card...", 3000);

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        showPalaceToast("Canvas not supported.", 3000);
        return;
      }

      const emp = palaceState.employee || {};
      const ty = palaceState.thankYou || {};
      const empName = emp.name || "Dhara Hirpara";
      const empRole = emp.role || "Technical Content Writer";
      const milestoneYears = emp.milestoneYears || "1";
      const photoUrl = emp.photo || 'assets/images/profiles/manushi_hero.jpg';

      const renderCardGraphics = (imgObj) => {
        // 1. Dark Luxury Gradient Background
        const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
        bgGrad.addColorStop(0, '#030712');
        bgGrad.addColorStop(0.5, '#0a192f');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1080, 1080);

        // 2. Radial Ambient Glow behind Avatar
        const glowGrad = ctx.createRadialGradient(540, 350, 40, 540, 350, 360);
        glowGrad.addColorStop(0, 'rgba(245, 192, 101, 0.18)');
        glowGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.08)');
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, 1080, 1080);

        // 3. Double Luxury Border Frame
        ctx.strokeStyle = '#f5c065';
        ctx.lineWidth = 4;
        ctx.strokeRect(36, 36, 1008, 1008);

        ctx.strokeStyle = 'rgba(245, 192, 101, 0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(48, 48, 984, 984);

        // Corner Ornaments
        const cornerSize = 12;
        const corners = [
          [36, 36], [1044, 36], [36, 1044], [1044, 1044]
        ];
        ctx.fillStyle = '#f5c065';
        corners.forEach(([cx, cy]) => {
          ctx.fillRect(cx - cornerSize/2, cy - cornerSize/2, cornerSize, cornerSize);
        });

        // 4. Header Branding
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f5c065';
        ctx.font = '700 16px "Helvetica", "Helvetica Neue", Arial, sans-serif';
        ctx.fillText('✦   U F F I Z I O   •   M E M O R Y   P A L A C E   ✦', 540, 95);

        // Milestone Badge Pill
        const badgeText = `🏆  ${milestoneYears.toUpperCase()} YEAR WORK ANNIVERSARY  🏆`;
        ctx.fillStyle = 'rgba(245, 192, 101, 0.12)';
        ctx.strokeStyle = 'rgba(245, 192, 101, 0.4)';
        ctx.lineWidth = 1.5;
        const pillW = 420;
        const pillH = 38;
        const pillX = 540 - pillW / 2;
        const pillY = 120;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(pillX, pillY, pillW, pillH, 19);
        } else {
          ctx.rect(pillX, pillY, pillW, pillH);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffe8b5';
        ctx.font = '700 14px "Helvetica", "Helvetica Neue", Arial, sans-serif';
        ctx.fillText(badgeText, 540, 144);

        // 5. Circular Avatar Frame
        const avatarCenterX = 540;
        const avatarCenterY = 345;
        const avatarRadius = 145;

        // Outer Golden Ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#f5c065';
        ctx.lineWidth = 5;
        ctx.shadowColor = 'rgba(245, 192, 101, 0.6)';
        ctx.shadowBlur = 24;
        ctx.stroke();
        ctx.restore();

        // Clip circle and draw Image or Monogram
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
        ctx.clip();

        if (imgObj && imgObj.width > 0) {
          const iw = imgObj.width;
          const ih = imgObj.height;
          const diameter = avatarRadius * 2;
          const scale = Math.max(diameter / iw, diameter / ih);
          const dw = iw * scale;
          const dh = ih * scale;
          const dx = avatarCenterX - dw / 2;
          const dy = avatarCenterY - dh / 2;
          ctx.drawImage(imgObj, dx, dy, dw, dh);
        } else {
          const monoGrad = ctx.createLinearGradient(0, avatarCenterY - avatarRadius, 0, avatarCenterY + avatarRadius);
          monoGrad.addColorStop(0, '#1e293b');
          monoGrad.addColorStop(1, '#0f172a');
          ctx.fillStyle = monoGrad;
          ctx.fillRect(avatarCenterX - avatarRadius, avatarCenterY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
          ctx.fillStyle = '#f5c065';
          ctx.font = '700 80px "DM Serif Display", serif';
          ctx.textAlign = 'center';
          ctx.fillText((empName[0] || 'U').toUpperCase(), avatarCenterX, avatarCenterY + 28);
        }
        ctx.restore();

        // 6. Employee Name & Role Typography
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 44px "DM Serif Display", Georgia, serif';
        ctx.fillText(empName, 540, 560);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(empRole, 540, 600);

        const subInfo = (emp.department ? `${emp.department} • ` : '') + (emp.date ? `Joined ${emp.date}` : 'Team Uffizio');
        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 15px "Helvetica", "Helvetica Neue", Arial, sans-serif';
        ctx.fillText(subInfo, 540, 630);

        // 7. Appreciation Message Box
        const boxW = 820;
        const boxH = 190;
        const boxX = 540 - boxW / 2;
        const boxY = 675;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.strokeStyle = 'rgba(245, 192, 101, 0.28)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(boxX, boxY, boxW, boxH, 16);
        } else {
          ctx.rect(boxX, boxY, boxW, boxH);
        }
        ctx.fill();
        ctx.stroke();

        // Decorative quote mark
        ctx.font = '700 48px "DM Serif Display", serif';
        ctx.fillStyle = 'rgba(245, 192, 101, 0.4)';
        ctx.fillText('“', 540, 715);

        // Appreciation letter snippet
        const msgText = ty.message || "Thank you for your dedication, energy, and spirit at Uffizio. Your contributions strengthen our team, and we’re proud of your growth and journey with us.";
        ctx.font = '16px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#e2e8f0';

        function wrapCardText(text, x, y, maxWidth, lineHeight, maxLines) {
          const words = text.split(' ');
          let line = '';
          let curY = y;
          let count = 0;
          for (let n = 0; n < words.length; n++) {
            const test = line + words[n] + ' ';
            if (ctx.measureText(test).width > maxWidth && n > 0) {
              count++;
              if (count >= maxLines) {
                ctx.fillText(line.trim() + '...', x, curY);
                return curY;
              }
              ctx.fillText(line.trim(), x, curY);
              line = words[n] + ' ';
              curY += lineHeight;
            } else {
              line = test;
            }
          }
          ctx.fillText(line.trim(), x, curY);
          return curY;
        }

        const lastY = wrapCardText(msgText, 540, 745, 740, 24, 3);

        // Signature
        const sigText = ty.signature || "— With heartfelt gratitude & best wishes, Team Uffizio 🌟";
        ctx.font = 'italic 500 15px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#f5c065';
        ctx.fillText(sigText, 540, lastY + 34);

        // 8. Footer Citations
        ctx.fillStyle = '#64748b';
        ctx.font = '600 12px "Helvetica", "Helvetica Neue", Arial, sans-serif';
        ctx.fillText('UFFIZIO DIGITAL MEMORY PALACE • OFFICIALLY CELEBRATED', 540, 930);

        ctx.fillStyle = 'rgba(245, 192, 101, 0.5)';
        ctx.font = '11px "Helvetica", "Helvetica Neue", Arial, sans-serif';
        ctx.fillText('www.uffizio.com  •  CONNECTING DEDICATION TO SUCCESS', 540, 955);

        // 9. Trigger Download
        try {
          canvas.toBlob((blob) => {
            if (!blob) {
              showPalaceToast("Could not generate image blob.", 3500);
              return;
            }
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const safeName = empName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
            a.download = `Uffizio_${safeName}_Instagram_Card.png`;
            a.href = blobUrl;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
            showPalaceToast("📸 Instagram celebration card downloaded! Ready to share on Instagram Feed or Story.", 4500);
          }, 'image/png');
        } catch(err) {
          console.error("Canvas blob error:", err);
          showPalaceToast("Error downloading Instagram card: " + err.message, 4000);
        }
      };

      if (photoUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => renderCardGraphics(img);
        img.onerror = () => {
          console.warn("Avatar image could not be loaded on canvas, using monogram fallback.");
          renderCardGraphics(null);
        };
        img.src = photoUrl;
      } else {
        renderCardGraphics(null);
      }
    };



    function downloadUpdatedHtml(filename) {
      const empSafeName = (palaceState.employee && palaceState.employee.name)
        ? `${palaceState.employee.name.trim().replace(/[^a-zA-Z0-9_-]/g, '_')}_Journey.html`
        : 'index.html';
      const targetFilename = filename || empSafeName;
      try {
        // 1. Capture current live edits and persist
        captureLiveEditsToState();
        persistPalaceState();

        // 2. Prepare export state with defaultAccessMode set to 'view' so it is guaranteed locked in View Mode for recipients
        const exportState = JSON.parse(JSON.stringify(palaceState));
        exportState.defaultAccessMode = 'view';
        exportState.isStandalone = true;
        exportState.profileVersion = (exportState.profileVersion || 5) + 1;

        // 3. Safe JSON string (prevent closing script tag from breaking HTML parser)
        const closeScriptPattern = new RegExp('<' + '/script', 'gi');
        const stateJson = JSON.stringify(exportState, null, 2).replace(closeScriptPattern, () => '<\\/' + 'script');

        // 4. Get entire outer HTML
        let fullHtml = '<!DOCTYPE html>\n<html lang="en">\n' + document.documentElement.outerHTML + '\n</html>';

        // 5. Clean open modal classes and set body to view-mode-active in exported file
        fullHtml = fullHtml.replace(/class="palace-modal-backdrop active"/g, 'class="palace-modal-backdrop"');
        fullHtml = fullHtml.replace(/class="collage-lightbox-backdrop active"/g, 'class="collage-lightbox-backdrop"');
        fullHtml = fullHtml.replace(/live-edit-mode/g, '');
        fullHtml = fullHtml.replace(/edit-mode-active/g, 'view-mode-active');

        // 6. Inject or replace initialPalaceState script tag safely using dynamic RegExp (single match in head)
        const stateRegex = new RegExp('<' + 'script\\s+id=["\']initialPalaceState["\'][^>]*>[\\s\\S]*?<\\/' + 'script>', 'i');
        const newScriptTag = '<' + 'script id="initialPalaceState" type="application/json">\n' + stateJson + '\n<' + '/script>';

        if (stateRegex.test(fullHtml)) {
          fullHtml = fullHtml.replace(stateRegex, () => newScriptTag);
        } else {
          fullHtml = fullHtml.replace('</head>', () => '  ' + newScriptTag + '\n</head>');
        }

        // 8. Trigger download
        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = targetFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);

        showPalaceToast('💾 "' + targetFilename + '" saved with latest edits & locked in View Mode!', 4500);
      } catch (err) {
        console.error("Error downloading updated HTML:", err);
        showPalaceToast("Error downloading file: " + err.message, 5000);
      }
    }

    function copyPalaceDataToClipboard() {
      try {
        captureLiveEditsToState();
        const jsonStr = JSON.stringify(palaceState, null, 2);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(jsonStr).then(() => {
            showPalaceToast("📋 Data copied to clipboard!", 3500);
          }).catch(() => {
            prompt("Copy this JSON data:", jsonStr);
          });
        } else {
          prompt("Copy this JSON data:", jsonStr);
        }
      } catch (err) {
        showPalaceToast("Error copying data: " + err.message, 4000);
      }
    }

    function applyPastedJson() {
      const area = document.getElementById('directJsonPasteArea');
      if (!area || !(area.value || '').trim()) {
        showPalaceToast("Please paste valid JSON data first.", 3500);
        return;
      }
      try {
        const imported = JSON.parse(area.value.trim());
        if (imported.employee) palaceState.employee = imported.employee;
        if (imported.celebration) palaceState.celebration = imported.celebration;
        if (imported.milestones) palaceState.milestones = imported.milestones;
        if (imported.skills) palaceState.skills = imported.skills;
        if (imported.projects) palaceState.projects = imported.projects;
        if (imported.contributions) palaceState.contributions = imported.contributions;
        if (imported.stickyNotes) palaceState.stickyNotes = imported.stickyNotes;
        if (imported.memories && Array.isArray(imported.memories)) palaceState.memories = imported.memories;
        if (imported.values && Array.isArray(imported.values)) palaceState.values = imported.values;
        if (imported.chamberStories) palaceState.chamberStories = imported.chamberStories;
        if (imported.doorWingLeft) palaceState.doorWingLeft = imported.doorWingLeft;
        if (imported.doorWingRight) palaceState.doorWingRight = imported.doorWingRight;
        if (imported.chambers && Array.isArray(imported.chambers) && imported.chambers.length > 0) {
          palaceState.chambers = imported.chambers;
        }

        persistPalaceState();
        populateAdminInputs();
        updatePalaceFromState();
        area.value = '';
        showPalaceToast('✅ Profile for ' + palaceState.employee.name + ' applied!', 3500);
      } catch (e) {
        showPalaceToast("Invalid JSON format. Please check the pasted text.", 3500);
      }
    }

    // Attach Event Listeners
    const saveDownloadBtn = document.getElementById('saveDownloadBtn');
    if (saveDownloadBtn) {
      saveDownloadBtn.addEventListener('click', () => downloadUpdatedHtml('index.html'));
    }

    const btnAdminDownloadHtml = document.getElementById('btnAdminDownloadHtml');
    if (btnAdminDownloadHtml) {
      btnAdminDownloadHtml.addEventListener('click', () => downloadUpdatedHtml());
    }

    const btnAdminDownloadPalaceHtml = document.getElementById('btnAdminDownloadPalaceHtml');
    if (btnAdminDownloadPalaceHtml) {
      btnAdminDownloadPalaceHtml.addEventListener('click', () => downloadUpdatedHtml('memory_palace.html'));
    }

    const btnCopyJsonClipboard = document.getElementById('btnCopyJsonClipboard');
    if (btnCopyJsonClipboard) {
      btnCopyJsonClipboard.addEventListener('click', copyPalaceDataToClipboard);
    }

    const btnApplyPastedJson = document.getElementById('btnApplyPastedJson');
    if (btnApplyPastedJson) {
      btnApplyPastedJson.addEventListener('click', applyPastedJson);
    }


// Global export & share exports
window.applyAccessMode = applyAccessMode;
window.promptUnlockEditor = promptUnlockEditor;
window.initAccessModeAndPayload = initAccessModeAndPayload;
window.openShareModal = openShareModal;
window.closeShareModalDialog = closeShareModalDialog;
window.setupShareDialogListeners = setupShareDialogListeners;
window.downloadUpdatedHtml = downloadUpdatedHtml;
window.copyPalaceDataToClipboard = copyPalaceDataToClipboard;
window.applyPastedJson = applyPastedJson;
