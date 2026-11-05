/* ==========================================================================
   STAGE-LOCKED 3D ZOOM, FADE & GESTURE NAVIGATION ENGINE
   ========================================================================== */
    /* ==========================================================================
       4. STAGE-LOCKED 3D ZOOM & FADE ENGINE (STOPS ON EVERY LEVEL)
       ========================================================================== */
    // Stages:
    // Stage 0: Grand Double Doors (Closed)
    // Stage 1: Room 01 (Your First Day)
    // Stage 2: Room 02 (What You Learned)
    // Stage 3: Room 03 (What You Created)
    // Stage 4: Room 04 (People)
    // Stage 5: Room 05 (Your Proud Moments)
    // Stage 6: Room 06 (The Future)
    let currentStage = 0;
    let isDoorOpen = false;
    let doorAutoAdvanceTimer = null;
    // totalStages set above
    let isTransitioning = false;
    let transitionCooldownTimer = null;

    const portalStage = document.getElementById('portalStage');
    const portalArch = document.getElementById('portalArch');
    const portalDoorsWrapper = document.getElementById('portalDoorsWrapper');
    const headerProgressLine = document.getElementById('headerProgressLine');
    const corridorLabel = document.getElementById('corridorLabel');

    let chambers = [
      document.getElementById('chamber-milestone'),
      document.getElementById('chamber-0'),
      document.getElementById('chamber-1'),
      document.getElementById('chamber-2b'),
      document.getElementById('chamber-3'),
      document.getElementById('chamber-memories-2'),
      document.getElementById('chamber-values'),
      document.getElementById('chamber-4'),
      document.getElementById('chamber-5'),
      document.getElementById('chamber-thankyou')
    ];

    let chamberNodes = document.querySelectorAll('.chamber-node');
    let stepDots = document.querySelectorAll('.step-dot');
    const btnWalkPrev = document.getElementById('btnWalkPrev');
    const btnWalkNext = document.getElementById('btnWalkNext');

    let totalStages = 10;
    let stageTitles = [
      "PALACE ENTRANCE: SCROLL OR CLICK TO ENTER",
      "CELEBRATING YOUR FIRST YEAR WITH UFFIZIO",
      "CHAMBER 01: WHERE YOUR JOURNEY BEGAN",
      "CHAMBER 02: WHAT YOU LEARNED",
      "CHAMBER 03: WHAT YOU CREATED",
      "CHAMBER 04: WHAT YOU CREATED (PART 2)",
      "CHAMBER 05: PEOPLE & TEAM SANCTUARY",
      "CHAMBER 06: ANNUAL MEMORIES COLLAGE",
      "CHAMBER 07: YOUR PROUD MOMENTS",
      "CHAMBER 08: THE FUTURE HORIZON"
    ];

    // Initialize all chambers to waiting state
    function initChamberPositions() {
      isDoorOpen = false;
      clearTimeout(doorAutoAdvanceTimer);
      portalStage.classList.remove('hidden-forward', 'zooming-through');
      portalArch.classList.remove('zooming-through', 'door-dissolving');
      const doorwayNextScreen = document.getElementById('doorwayNextScreen');
      if (doorwayNextScreen) {
        doorwayNextScreen.classList.remove('doorway-fade-out');
      }
      portalDoorsWrapper.classList.remove('portal-doors-open');

      chambers.forEach((chamber) => {
        chamber.classList.remove('active', 'exited-forward');
        chamber.classList.add('waiting-depth');
      });
      updateHUD(0);
    }
    if (typeof initAccessModeAndPayload === 'function') initAccessModeAndPayload();
    if (typeof setupShareDialogListeners === 'function') setupShareDialogListeners();
    if (typeof syncPalaceNavigation === 'function') syncPalaceNavigation();
    if (typeof initChamberPositions === 'function') initChamberPositions();

    function updateHUD(stage) {
      if (document.body && document.body.classList) {
        if (stage > 0) {
          document.body.classList.add('inside-palace-chambers');
          if (portalStage) {
            portalStage.style.display = 'none';
            portalStage.classList.add('hidden-forward');
          }
        } else {
          document.body.classList.remove('inside-palace-chambers');
          if (portalStage) {
            portalStage.style.display = '';
          }
        }
      }
      // Progress line
      const pct = (stage / (totalStages - 1)) * 100;
      headerProgressLine.style.width = `${pct}%`;

      // Label
      corridorLabel.textContent = stageTitles[stage];

      // Top floorplan nodes (0 to 5 map to chambers 0 to 5)
      chamberNodes.forEach((node, idx) => {
        const roomTargetStage = idx + 1;
        node.classList.toggle('active', stage === roomTargetStage);
        if (stage >= roomTargetStage) {
          node.classList.add('visited');
        }
      });

      // Bottom step dots
      stepDots.forEach((dot, idx) => {
        const roomTargetStage = idx + 1;
        dot.classList.toggle('active', stage === roomTargetStage);
        if (stage >= roomTargetStage) {
          dot.classList.add('visited');
        }
      });

      btnWalkPrev.disabled = (stage === 0);
      btnWalkNext.disabled = (stage === totalStages - 1);
      btnWalkNext.innerHTML = (stage === totalStages - 1) ? '<span>Journey Complete</span> <span>✨</span>' : '<span>Step Forward</span> <span>›</span>';
    }

    let lastTransitionTime = 0;
    const ROOM_TRANSITION_MS = 950; // Smooth, cinematic room transition
    const TRANSITION_LOCK_MS = 950; // Lockout to absorb inertia

    // ==============================================================
    // DOOR OPEN / CLOSE & STEP INSIDE CONTROLS (STAGE 0)
    // ==============================================================
    function openDoor() {
      if (isDoorOpen || isTransitioning) return;
      isDoorOpen = true;
      isTransitioning = true;
      lastTransitionTime = performance.now();

      portalDoorsWrapper.classList.add('portal-doors-open');
      portalArch.classList.add('door-open');
      palaceAudio.playDoorCreak();

      const promptText = document.getElementById('portalPromptText');
      if (promptText) {
        promptText.textContent = 'Scroll Down or Click to Step Inside Palace ↓';
      }

      // Ample reading time: auto-advance after 10s if user does not scroll
      clearTimeout(doorAutoAdvanceTimer);
      doorAutoAdvanceTimer = setTimeout(() => {
        if (currentStage === 0 && isDoorOpen && !isTransitioning) {
          stepInsidePalace();
        }
      }, 10000);

      setTimeout(() => {
        isTransitioning = false;
      }, 450);
    }

    function closeDoor() {
      if (!isDoorOpen || isTransitioning) return;
      clearTimeout(doorAutoAdvanceTimer);
      isDoorOpen = false;
      isTransitioning = true;
      lastTransitionTime = performance.now();

      portalDoorsWrapper.classList.remove('portal-doors-open');
      portalArch.classList.remove('door-open');
      palaceAudio.playDoorCreak();

      const promptText = document.getElementById('portalPromptText');
      if (promptText) {
        promptText.textContent = (palaceState.entrance && palaceState.entrance.prompt) || 'Scroll Down or Click Door to Enter';
      }

      setTimeout(() => {
        isTransitioning = false;
      }, 450);
    }

    function stepInsidePalace() {
      clearTimeout(doorAutoAdvanceTimer);
      if (currentStage !== 0 || isTransitioning) return;

      isTransitioning = true;
      currentStage = 1;
      lastTransitionTime = performance.now();

      const doorwayNextScreen = document.getElementById('doorwayNextScreen');
      const milestoneChamber = document.getElementById('chamber-milestone');

      // PHASE 1: Immediate in-place fade out of the inner preview visual (Zero Zoom!)
      portalArch.removeAttribute('title');
      portalArch.classList.add('door-dissolving');
      if (doorwayNextScreen) {
        doorwayNextScreen.classList.add('doorway-fade-out');
      }
      palaceAudio.playFootstep();

      // PHASE 2: After inner image dissolves in place (140ms), camera steps through the open door!
      setTimeout(() => {
        portalStage.classList.remove('hidden-forward');
        portalStage.classList.add('zooming-through');
        portalArch.classList.add('zooming-through');

        if (milestoneChamber) {
          milestoneChamber.classList.add('entering-from-door');
        }

        chambers.forEach((c, idx) => {
          if (idx === 0) {
            c.classList.remove('waiting-depth', 'exited-forward');
            c.classList.add('active');
          } else {
            c.classList.remove('active', 'exited-forward');
            c.classList.add('waiting-depth');
          }
        });
        updateHUD(1);
      }, 140);

      // PHASE 3: Complete transition after camera has fully passed through the door (820ms)
      setTimeout(() => {
        portalStage.classList.remove('zooming-through');
        portalArch.classList.remove('zooming-through', 'door-dissolving');
        if (doorwayNextScreen) {
          doorwayNextScreen.classList.remove('doorway-fade-out');
        }
        portalStage.classList.add('hidden-forward');
        portalStage.style.display = 'none';
        if (milestoneChamber) {
          milestoneChamber.classList.remove('entering-from-door');
        }
        isTransitioning = false;
      }, 820);
    }

    function goToStage(targetStage) {
      if (targetStage < 0 || targetStage >= totalStages) return;
      if (targetStage === currentStage || isTransitioning) return;

      const fromStage = currentStage;

      // ==============================================================
      // CASE 1: Moving from Stage 0 (Door) -> Stage 1 (Milestone Room)
      // ==============================================================
      if (fromStage === 0 && targetStage === 1) {
        stepInsidePalace();
        return;
      }

      currentStage = targetStage;
      isTransitioning = true;
      lastTransitionTime = performance.now();

      palaceAudio.init();

      // ==============================================================
      // CASE 2: Moving Back to Stage 0 (Door) from any Room
      // ==============================================================
      if (targetStage === 0) {
        clearTimeout(doorAutoAdvanceTimer);
        isDoorOpen = false;

        // Active room retreats into depth
        chambers.forEach(c => {
          c.classList.remove('active', 'exited-forward');
          c.classList.add('waiting-depth');
        });

        // Setup portal stage & arch at zoomed-in scale without transition, then glide back out to scale 1
        portalStage.style.display = '';
        portalStage.style.transition = 'none';
        portalArch.style.transition = 'none';
        portalStage.classList.remove('hidden-forward');
        portalStage.classList.add('zooming-through');
        portalArch.classList.add('zooming-through');
        portalDoorsWrapper.classList.add('portal-doors-open');
        portalArch.classList.add('door-open');
        void portalArch.offsetWidth; // force browser layout reflow

        // Restore transition and dolly camera back out to normal view
        portalStage.style.transition = '';
        portalArch.style.transition = '';
        portalStage.classList.remove('zooming-through');
        portalArch.classList.remove('zooming-through');
        palaceAudio.playFootstep();

        // Swing doors closed after camera steps back outside
        setTimeout(() => {
          portalDoorsWrapper.classList.remove('portal-doors-open');
          portalArch.classList.remove('door-open');
          palaceAudio.playDoorCreak();
          const promptText = document.getElementById('portalPromptText');
          if (promptText) {
            promptText.textContent = 'Scroll Down or Click Door to Enter';
          }
          updateHUD(0);
        }, 700);

        setTimeout(() => {
          isTransitioning = false;
        }, 1150);
        return;
      }

      // ==============================================================
      // CASE 3: Navigating between Chambers (Stages 1..6)
      // ==============================================================
      palaceAudio.playFootstep();

      // Ensure portal remains safely hidden
      portalDoorsWrapper.classList.add('portal-doors-open');
      portalStage.classList.add('hidden-forward');
      portalStage.style.display = 'none';

      const targetRoomIdx = targetStage - 1;
      chambers.forEach((c, idx) => {
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

      const prevChamber = (fromStage > 0) ? chambers[fromStage - 1] : null;
      const targetChamber = (targetStage > 0) ? chambers[targetStage - 1] : null;

      if (prevChamber && prevChamber.id === 'chamber-0' && targetStage !== fromStage) {
        if (timelineAnimFrameId) {
          cancelAnimationFrame(timelineAnimFrameId);
          timelineAnimFrameId = null;
        }
        room01BoundaryOverscroll = 0;
      }

      if (targetChamber) {
        if (typeof syncMobilePlacards === 'function') {
          syncMobilePlacards();
        }
        if (targetChamber.id === 'chamber-0') {
          const comingFromBack = fromStage > targetStage;
          activateRoom01Motion(comingFromBack);
        } else if (targetChamber.id === 'chamber-1') {
          const evoStage = document.querySelector('#chamber-1 .evolution-comparison-stage');
          if (evoStage && window.innerWidth <= 768) {
            evoStage.scrollTop = 0;
          }
          setTimeout(() => {
            if (window.updateSkillsFadeMask) window.updateSkillsFadeMask();
          }, 120);
        } else if (targetChamber.id === 'chamber-2') {
          setTimeout(() => {
            const cGrid = document.getElementById('creationsCardsGrid');
            if (cGrid) {
              cGrid.scrollLeft = 0;
              const cWrapper = document.getElementById('creationsCardsWrapper');
              if (cWrapper) cWrapper.classList.remove('has-scrolled-left');
              const bPrev = document.getElementById('btnCreationsPrev');
              if (bPrev) bPrev.style.display = 'none';
            }
          }, 80);
        } else if (targetChamber.id === 'chamber-2b') {
          setTimeout(() => {
            resetChamber2bCommonImage();
            const s2b = document.querySelector('#chamber-2b .creations-split-container');
            if (s2b && window.innerWidth <= 768) {
              s2b.scrollTop = (fromStage < targetStage) ? 0 : s2b.scrollHeight;
            }
          }, 60);
        } else if (targetChamber.id === 'chamber-3') {
          setTimeout(() => {
            const rPeople = document.querySelector('#chamber-3 .room-people');
            if (rPeople) {
              if (fromStage < targetStage) {
                rPeople.scrollTop = 0;
              } else {
                rPeople.scrollTop = rPeople.scrollHeight;
              }
            }
          }, 60);
        } else if (targetChamber.id === 'chamber-4' || targetChamber.id === 'chamber-memories') {
          setTimeout(() => palaceAudio.playChime(), 380);
          const grid = document.getElementById('collageMosaicGrid');
          if (grid) {
            grid._isInternalScrolling = false;
            clearTimeout(grid._scrollGestureTimer);
            if (fromStage < targetStage) {
              grid.scrollTop = 0;
            } else {
              grid.scrollTop = grid.scrollHeight;
            }
          }
          const rProud = document.querySelector('#chamber-4 .room-proud');
          if (rProud && window.innerWidth <= 768) {
            rProud.scrollTop = (fromStage < targetStage) ? 0 : rProud.scrollHeight;
          }
        } else if (targetChamber.id === 'chamber-memories-2') {
          setTimeout(() => palaceAudio.playChime(), 380);
          const grid2 = document.getElementById('collageMosaicGrid2');
          if (grid2) {
            grid2._isInternalScrolling = false;
            clearTimeout(grid2._scrollGestureTimer);
            if (fromStage < targetStage) {
              grid2.scrollTop = 0;
            } else {
              grid2.scrollTop = grid2.scrollHeight;
            }
          }
          const mem2Uneven = document.querySelector('#chamber-memories-2 .memories2-uneven-stage');
          if (mem2Uneven && window.innerWidth <= 768) {
            mem2Uneven.scrollTop = (fromStage < targetStage) ? 0 : mem2Uneven.scrollHeight;
          }
        } else if (targetChamber.id === 'chamber-values') {
          const resetValuesScroll = () => {
            const vStage = document.getElementById('valuesOrbitalStage');
            if (vStage) vStage.scrollTop = 0;
            const cStage = document.getElementById('valuesCardsScrollStage');
            if (cStage) cStage.scrollTop = 0;
          };
          resetValuesScroll();
          setTimeout(resetValuesScroll, 40);
          setTimeout(resetValuesScroll, 150);
          setTimeout(resetValuesScroll, 400);
          setTimeout(resetValuesScroll, 850);
          setTimeout(resetValuesScroll, 1000);
        } else if (targetChamber.id === 'chamber-5') {
          setTimeout(() => {
            const rFuture = document.querySelector('#chamber-5 .room-future');
            if (rFuture) {
              if (fromStage < targetStage) {
                rFuture.scrollTop = 0;
              } else {
                rFuture.scrollTop = rFuture.scrollHeight;
              }
            }
          }, 60);
        } else if (targetChamber.id === 'chamber-thankyou') {
          setTimeout(() => {
            palaceAudio.playChime();
            fireConfetti();
          }, 180);
          setTimeout(() => {
            fireConfetti();
          }, 650);
        }
      }

      updateHUD(targetStage);

      setTimeout(() => {
        isTransitioning = false;
      }, ROOM_TRANSITION_MS);
    }

    /* ==========================================================================
       5. GESTURE-LOCKED SCROLL & INPUT HANDLING (SMART BOUNDARY-AWARE CHAINING)
       ========================================================================== */
    let wheelDeltaAccumulator = 0;
    let wheelSilenceTimer = null;
    let lastMilestoneScrollTime = 0;
    const MILESTONE_SCROLL_COOLDOWN_MS = 380;
    const WHEEL_SENSITIVITY = 30; // responsive threshold for both trackpads and mouse wheels

    window.addEventListener('wheel', (e) => {
      // 1. If any modal or dialog is active, allow normal scrolling inside the modal and NEVER trigger background chamber navigation!
      const activeModal = document.querySelector('.palace-modal-backdrop.active, .collage-lightbox-backdrop.active, #collageLightboxModal.active, #adminModal.active, #editorPasscodeModal.active, #shareJourneyModal.active, #certModal.active, .modal.active');
      if (activeModal) {
        return;
      }

      // 2. Boundary-aware scroll detection inside scrollable containers:
      // When inside a scrollable box (photos in Room 05, skills in Room 02, sticky notes in Room 04,
      // terminal, projects, admin forms, etc.), let it scroll internally. Once it reaches the top or bottom edge,
      // allow the scroll gesture to naturally advance/retreat the chamber!
      const path = e.composedPath ? e.composedPath() : [];
      let internalScrollConsumed = false;

      for (const el of path) {
        if (!el || el === window || el === document || el === document.body || el === document.documentElement) continue;

        // Never trap or consume wheel events inside non-scrollable chambers like Your Values (on desktop)
        const isScrollableMobileChamber = window.innerWidth <= 768 && el.closest && (
          el.closest('#chamber-0') ||
          el.closest('#chamber-1') ||
          el.closest('#chamber-2b') ||
          el.closest('#chamber-3') ||
          el.closest('#chamber-memories-2') ||
          el.closest('#chamber-values') ||
          el.closest('#chamber-4') ||
          el.closest('#chamber-5')
        );
        if (!isScrollableMobileChamber && el.closest && (el.closest('#chamber-values') || el.closest('#chamber-milestone') || el.closest('#chamber-1') || el.closest('#chamber-4') || el.closest('#chamber-5') || el.closest('#chamber-thankyou'))) {
          continue;
        }

        const ov = window.getComputedStyle ? window.getComputedStyle(el).overflowY : '';
        const canScrollY = (ov === 'auto' || ov === 'scroll') || el.tagName === 'TEXTAREA';
        if (!canScrollY) continue;

        const hasVerticalOverflow = el.scrollHeight > (el.clientHeight + 4);
        if (hasVerticalOverflow) {
          let isScrollableBox = false;
          if (
            el.classList?.contains('collage-mosaic-grid') || 
            el.classList?.contains('skill-cards-grid') || 
            el.classList?.contains('laptop-screen-content') || 
            el.classList?.contains('wall-sticky-canvas') ||
            el.classList?.contains('project-wall-board') ||
            el.classList?.contains('creations-split-cards-grid') ||
            el.classList?.contains('creations-split-container') ||
            el.classList?.contains('memories2-uneven-stage') ||
            el.classList?.contains('journey-milestones-list') ||
            el.classList?.contains('horizontal-timeline-track-wrap') ||
            el.classList?.contains('horizontal-milestones-list') ||
            el.classList?.contains('evolution-comparison-stage') ||
            el.classList?.contains('evolution-stacked-stage') ||
            el.classList?.contains('values-cards-scroll-stage') ||
            el.classList?.contains('values-orbital-stage') ||
            el.classList?.contains('room-people') ||
            el.classList?.contains('room-proud') ||
            el.classList?.contains('room-future') ||
            el.classList?.contains('admin-tab-content') ||
            el.tagName === 'TEXTAREA'
          ) {
            isScrollableBox = true;
          } else if (canScrollY) {
            isScrollableBox = true;
          }

          if (isScrollableBox) {
            let wheelDelta = e.deltaY;
            if (e.deltaMode === 1) wheelDelta *= 32;
            else if (e.deltaMode === 2) wheelDelta *= 100;

            const isMemoriesGrid = el.classList?.contains('collage-mosaic-grid');
            const isTimelineWrap = (el.classList?.contains('horizontal-timeline-track-wrap') || el.closest?.('.horizontal-timeline-track-wrap')) && window.innerWidth <= 768;
            const isEvolutionStage = (el.classList?.contains('evolution-comparison-stage') || el.closest?.('.evolution-comparison-stage')) && window.innerWidth <= 768;
            const isCreationsSplitContainer = (el.classList?.contains('creations-split-container') || el.closest?.('.creations-split-container')) && window.innerWidth <= 768;
            const isMemoriesUnevenStage = (el.classList?.contains('memories2-uneven-stage') || el.closest?.('.memories2-uneven-stage')) && window.innerWidth <= 768;
            const isValuesStage = (el.classList?.contains('values-cards-scroll-stage') || el.closest?.('.values-cards-scroll-stage') || el.classList?.contains('values-orbital-stage') || el.closest?.('.values-orbital-stage')) && window.innerWidth <= 768;
            const isPeopleStage = (el.classList?.contains('room-people') || el.closest?.('.room-people')) && window.innerWidth <= 768;
            const isProudStage = (el.classList?.contains('room-proud') || el.closest?.('.room-proud')) && window.innerWidth <= 768;
            const isFutureStage = (el.classList?.contains('room-future') || el.closest?.('.room-future')) && window.innerWidth <= 768;

            if (isMemoriesGrid || isTimelineWrap || isEvolutionStage || isCreationsSplitContainer || isMemoriesUnevenStage || isValuesStage || isPeopleStage || isProudStage || isFutureStage) {
              const targetBox = isTimelineWrap
                ? (el.classList?.contains('horizontal-timeline-track-wrap') ? el : el.closest('.horizontal-timeline-track-wrap'))
                : (isEvolutionStage
                  ? (el.classList?.contains('evolution-comparison-stage') ? el : el.closest('.evolution-comparison-stage'))
                  : (isCreationsSplitContainer
                    ? (el.classList?.contains('creations-split-container') ? el : el.closest('.creations-split-container'))
                    : (isMemoriesUnevenStage
                      ? (el.classList?.contains('memories2-uneven-stage') ? el : el.closest('.memories2-uneven-stage'))
                      : (isValuesStage
                        ? (document.getElementById('valuesOrbitalStage') || document.getElementById('valuesCardsScrollStage') || el)
                        : (isPeopleStage
                          ? (el.classList?.contains('room-people') ? el : el.closest('.room-people'))
                          : (isProudStage
                            ? (el.classList?.contains('room-proud') ? el : el.closest('.room-proud'))
                            : (isFutureStage
                              ? (el.classList?.contains('room-future') ? el : el.closest('.room-future'))
                              : el)))))));
              const atBottom = targetBox.scrollTop + targetBox.clientHeight >= targetBox.scrollHeight - 6;
              const atTop = targetBox.scrollTop <= 6;

              if (wheelDelta > 0) { // Scrolling DOWN
                if (!atBottom) {
                  targetBox.scrollTop += wheelDelta;
                  targetBox._isInternalScrolling = true;
                  clearTimeout(targetBox._scrollGestureTimer);
                  targetBox._scrollGestureTimer = setTimeout(() => {
                    targetBox._isInternalScrolling = false;
                  }, 320);
                  internalScrollConsumed = true;
                  break;
                } else {
                  // At bottom boundary:
                  if (targetBox._isInternalScrolling) {
                    // Still part of the same scroll gesture that brought us to the bottom:
                    clearTimeout(targetBox._scrollGestureTimer);
                    targetBox._scrollGestureTimer = setTimeout(() => {
                      targetBox._isInternalScrolling = false;
                    }, 320);
                    internalScrollConsumed = true;
                    break;
                  }
                  // Not actively internal scrolling: user stopped and is now scrolling down a SECOND time!
                }
              } else if (wheelDelta < 0) { // Scrolling UP
                if (!atTop) {
                  targetBox.scrollTop += wheelDelta;
                  targetBox._isInternalScrolling = true;
                  clearTimeout(targetBox._scrollGestureTimer);
                  targetBox._scrollGestureTimer = setTimeout(() => {
                    targetBox._isInternalScrolling = false;
                  }, 320);
                  internalScrollConsumed = true;
                  break;
                } else {
                  // At top boundary:
                  if (targetBox._isInternalScrolling) {
                    // Still part of the same scroll gesture that brought us to the top:
                    clearTimeout(targetBox._scrollGestureTimer);
                    targetBox._scrollGestureTimer = setTimeout(() => {
                      targetBox._isInternalScrolling = false;
                    }, 320);
                    internalScrollConsumed = true;
                    break;
                  }
                  // User stopped and is now scrolling up a SECOND time!
                }
              }
            } else {
              // Standard scrolling for other scrollable panels
              if (wheelDelta > 0) {
                if (el.scrollTop + el.clientHeight < el.scrollHeight - 4) {
                  el.scrollTop += wheelDelta;
                  internalScrollConsumed = true;
                  break;
                }
              } else if (wheelDelta < 0) {
                if (el.scrollTop > 4) {
                  el.scrollTop += wheelDelta;
                  internalScrollConsumed = true;
                  break;
                }
              }
            }
          }
        }
      }

      if (internalScrollConsumed) {
        wheelDeltaAccumulator = 0;
        return;
      }

      const now = performance.now();
      // Absorb inertial events while transitioning
      if (isTransitioning || (now - lastTransitionTime < TRANSITION_LOCK_MS)) {
        wheelDeltaAccumulator = 0;
        return;
      }

      // In Room 01 (currentStage === 2), support both vertical and horizontal scroll gestures
      let effectiveDelta = e.deltaY;
      if (isCurrentRoom('chamber-0') && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        effectiveDelta = e.deltaX;
      }

      wheelDeltaAccumulator += effectiveDelta;
      clearTimeout(wheelSilenceTimer);
      wheelSilenceTimer = setTimeout(() => { wheelDeltaAccumulator = 0; }, 240);

      // Room 01: Timeline navigation - Guaranteed stop on each milestone, instant advance on next scroll!
      if (isCurrentRoom('chamber-0') && window.innerWidth > 768) {
        if (!room01ScrollReady) {
          wheelDeltaAccumulator = 0;
          return;
        }

        const milestones = palaceState.milestones || [];
        const maxIdx = milestones.length > 0 ? milestones.length - 1 : 0;
        let delta = e.deltaY;
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          delta = e.deltaX;
        }
        if (e.deltaMode === 1) delta *= 24;
        else if (e.deltaMode === 2) delta *= 80;

        // Filter out microscopic trackpad jitter
        if (Math.abs(delta) < 6) return;

        const now = performance.now();

        // Maintain gesture silence timer: 100ms with zero wheel events indicates user has finished their scroll flick
        clearTimeout(milestoneSilenceTimer);
        milestoneSilenceTimer = setTimeout(() => {
          isWheelSilent = true;
        }, 100);

        // Can only advance to next milestone if:
        // 1. Line is fully stopped at the current milestone (never allows skipping while in motion)
        // 2. AND previous scroll flick has ended (100ms silence), or continuous drag exceeded 550ms
        const canAdvance = isStoppedAtMilestone && (isWheelSilent || (now - milestoneStepStartTime > 550));

        if (!canAdvance) {
          // Locked to current milestone! Absorbs ALL remaining momentum/inertia so it NEVER skips!
          return;
        }

        // SCENARIO 1: SCROLLING FORWARD (DOWN / RIGHT)
        if (delta > 0) {
          if (currentMilestoneStop < maxIdx) {
            isStoppedAtMilestone = false;
            isWheelSilent = false;
            milestoneStepStartTime = now;
            currentMilestoneStop += 1;
            targetTimelineProgress = currentMilestoneStop;
            queueTimelineProgress(targetTimelineProgress);
            return;
          } else {
            // At final milestone -> advance into Room 02
            isStoppedAtMilestone = false;
            isWheelSilent = false;
            goToStage(currentStage + 1);
            return;
          }
        }

        // SCENARIO 2: SCROLLING BACKWARD (UP / LEFT)
        if (delta < 0) {
          if (currentMilestoneStop > 0) {
            isStoppedAtMilestone = false;
            isWheelSilent = false;
            milestoneStepStartTime = now;
            currentMilestoneStop -= 1;
            targetTimelineProgress = currentMilestoneStop;
            queueTimelineProgress(targetTimelineProgress);
            return;
          } else {
            // At first milestone -> return to Celebration
            isStoppedAtMilestone = false;
            isWheelSilent = false;
            goToStage(currentStage - 1);
            return;
          }
        }
        return;
      }

      if (wheelDeltaAccumulator > WHEEL_SENSITIVITY) {
        wheelDeltaAccumulator = 0;
        lastTransitionTime = performance.now();
        if (currentStage === 0) {
          if (!isDoorOpen) {
            openDoor();
          } else {
            stepInsidePalace();
          }
        } else if (currentStage < totalStages - 1) {
          goToStage(currentStage + 1);
        }
      } else if (wheelDeltaAccumulator < -WHEEL_SENSITIVITY) {
        wheelDeltaAccumulator = 0;
        lastTransitionTime = performance.now();
        if (currentStage === 0) {
          if (isDoorOpen) {
            closeDoor();
          }
        } else if (currentStage > 0) {
          goToStage(currentStage - 1);
        }
      }
    }, { passive: true });

    // Touch Swipes (Mobile & Tablets)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchStartTarget = null;
    window.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = performance.now();
      touchStartTarget = e.target;
      palaceAudio.init();
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      const activeModal = document.querySelector('#collageLightboxModal.active, #adminModal.active, #editorPasscodeModal.active, #shareJourneyModal.active, #certModal.active, .modal.active');
      if (activeModal) return;

      const now = performance.now();
      if (isTransitioning || (now - lastTransitionTime < TRANSITION_LOCK_MS)) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // Check if touch occurred inside an internal scrollable element that hasn't hit its boundary
      if (touchStartTarget) {
        let curr = touchStartTarget;
        while (curr && curr !== document.body && curr !== document.documentElement) {
          if (curr.scrollHeight > curr.clientHeight + 4) {
            if (diffY > 0 && curr.scrollTop + curr.clientHeight < curr.scrollHeight - 6) return;
            if (diffY < 0 && curr.scrollTop > 6) return;
          }
          curr = curr.parentElement;
        }
      }

      if (isCurrentRoom('chamber-0')) {
        if (window.innerWidth <= 768) {
          // On mobile responsive, Room 01 is a fluid vertical timeline scrolled with finger touch.
          const wrap = document.getElementById('horizontalTimelineTrackWrap');
          if (wrap) {
            const atBottom = wrap.scrollTop + wrap.clientHeight >= wrap.scrollHeight - 8;
            const atTop = wrap.scrollTop <= 8;
            // Only advance/retreat on intentional strong swipe when at the very edge of the timeline
            if (atBottom && diffY > 80 && Math.abs(diffY) > Math.abs(diffX) * 1.5) {
              goToStage(currentStage + 1);
              return;
            } else if (atTop && diffY < -80 && Math.abs(diffY) > Math.abs(diffX) * 1.5) {
              goToStage(currentStage - 1);
              return;
            }
          }
          return;
        }

        const milestones = palaceState.milestones || [];
        const maxIdx = milestones.length > 0 ? milestones.length - 1 : 0;
        const deltaTouch = Math.abs(diffX) > Math.abs(diffY) ? diffX : diffY;

        if (deltaTouch > 30) {
          milestoneGestureActive = false;
          if (milestoneSilenceTimer) clearTimeout(milestoneSilenceTimer);
          if (currentMilestoneStop < maxIdx) {
            currentMilestoneStop += 1;
            isStoppedAtMilestone = false;
            targetTimelineProgress = currentMilestoneStop;
            queueTimelineProgress(targetTimelineProgress);
            return;
          } else {
            goToStage(currentStage + 1);
            return;
          }
        } else if (deltaTouch < -30) {
          milestoneGestureActive = false;
          if (milestoneSilenceTimer) clearTimeout(milestoneSilenceTimer);
          if (currentMilestoneStop > 0) {
            currentMilestoneStop -= 1;
            isStoppedAtMilestone = false;
            targetTimelineProgress = currentMilestoneStop;
            queueTimelineProgress(targetTimelineProgress);
            return;
          } else {
            goToStage(currentStage - 1);
            return;
          }
        }
      }

      if (isCurrentRoom('chamber-1')) {
        if (window.innerWidth <= 768) {
          const stageEl = document.querySelector('#chamber-1 .evolution-comparison-stage');
          if (stageEl) {
            const atBottom = stageEl.scrollTop + stageEl.clientHeight >= stageEl.scrollHeight - 10;
            const atTop = stageEl.scrollTop <= 10;
            if (atBottom && diffY > 80 && Math.abs(diffY) > Math.abs(diffX) * 1.5) {
              goToStage(currentStage + 1);
              return;
            } else if (atTop && diffY < -80 && Math.abs(diffY) > Math.abs(diffX) * 1.5) {
              goToStage(currentStage - 1);
              return;
            }
          }
          return;
        }
      }

      if (isCurrentRoom('chamber-2b')) {
        if (window.innerWidth <= 768) {
          const rSplit = document.querySelector('#chamber-2b .creations-split-container');
          if (rSplit && rSplit.scrollHeight > rSplit.clientHeight + 8) {
            const atBottom = rSplit.scrollTop + rSplit.clientHeight >= rSplit.scrollHeight - 10;
            const atTop = rSplit.scrollTop <= 10;
            if (atBottom && diffY > 60 && Math.abs(diffY) > Math.abs(diffX) * 1.4) {
              goToStage(currentStage + 1);
              return;
            } else if (atTop && diffY < -60 && Math.abs(diffY) > Math.abs(diffX) * 1.4) {
              goToStage(currentStage - 1);
              return;
            }
            return;
          }
        }
      }

      if (isCurrentRoom('chamber-3')) {
        if (window.innerWidth <= 768) {
          const rPeople = document.querySelector('#chamber-3 .room-people');
          if (rPeople && rPeople.scrollHeight > rPeople.clientHeight + 8) {
            const atBottom = rPeople.scrollTop + rPeople.clientHeight >= rPeople.scrollHeight - 10;
            const atTop = rPeople.scrollTop <= 10;
            if (atBottom && diffY > 60 && Math.abs(diffY) > Math.abs(diffX) * 1.4) {
              goToStage(currentStage + 1);
              return;
            } else if (atTop && diffY < -60 && Math.abs(diffY) > Math.abs(diffX) * 1.4) {
              goToStage(currentStage - 1);
              return;
            }
            return;
          }
        }
      }

      if (isCurrentRoom('chamber-memories-2')) {
        if (window.innerWidth <= 768) {
          const rMem2 = document.querySelector('#chamber-memories-2 .memories2-uneven-stage');
          if (rMem2 && rMem2.scrollHeight > rMem2.clientHeight + 8) {
            const atBottom = rMem2.scrollTop + rMem2.clientHeight >= rMem2.scrollHeight - 10;
            const atTop = rMem2.scrollTop <= 10;
            if (atBottom && diffY > 60 && Math.abs(diffY) > Math.abs(diffX) * 1.4) {
              goToStage(currentStage + 1);
              return;
            } else if (atTop && diffY < -60 && Math.abs(diffY) > Math.abs(diffX) * 1.4) {
              goToStage(currentStage - 1);
              return;
            }
            return;
          }
        }
      }

      if (isCurrentRoom('chamber-values')) {
        if (window.innerWidth <= 768) {
          const vStage = document.getElementById('valuesOrbitalStage') || document.getElementById('valuesCardsScrollStage');
          if (vStage && vStage.scrollHeight > vStage.clientHeight + 8) {
            const atBottom = vStage.scrollTop + vStage.clientHeight >= vStage.scrollHeight - 10;
            const atTop = vStage.scrollTop <= 10;
            if (atBottom && diffY > 60 && Math.abs(diffY) > Math.abs(diffX) * 1.4) {
              goToStage(currentStage + 1);
              return;
            } else if (atTop && diffY < -60 && Math.abs(diffY) > Math.abs(diffX) * 1.4) {
              goToStage(currentStage - 1);
              return;
            }
            return;
          }
        }
      }

      if (isCurrentRoom('chamber-4')) {
        if (window.innerWidth <= 768) {
          const rProud = document.querySelector('#chamber-4 .room-proud');
          if (rProud && rProud.scrollHeight > rProud.clientHeight + 8) {
            const atBottom = rProud.scrollTop + rProud.clientHeight >= rProud.scrollHeight - 10;
            const atTop = rProud.scrollTop <= 10;
            if (atBottom && diffY > 60 && Math.abs(diffY) > Math.abs(diffX) * 1.4) {
              goToStage(currentStage + 1);
              return;
            } else if (atTop && diffY < -60 && Math.abs(diffY) > Math.abs(diffX) * 1.4) {
              goToStage(currentStage - 1);
              return;
            }
            return;
          }
        }
      }

      if (isCurrentRoom('chamber-5')) {
        if (window.innerWidth <= 768) {
          const rFuture = document.querySelector('#chamber-5 .room-future');
          if (rFuture && rFuture.scrollHeight > rFuture.clientHeight + 8) {
            const atBottom = rFuture.scrollTop + rFuture.clientHeight >= rFuture.scrollHeight - 10;
            const atTop = rFuture.scrollTop <= 10;
            if (atBottom && diffY > 60 && Math.abs(diffY) > Math.abs(diffX) * 1.4) {
              goToStage(currentStage + 1);
              return;
            } else if (atTop && diffY < -60 && Math.abs(diffY) > Math.abs(diffX) * 1.4) {
              goToStage(currentStage - 1);
              return;
            }
            return;
          }
        }
      }

      if (diffY > 38) {
        lastTransitionTime = performance.now();
        if (currentStage === 0) {
          if (!isDoorOpen) {
            openDoor();
          } else {
            stepInsidePalace();
          }
        } else if (currentStage < totalStages - 1) {
          goToStage(currentStage + 1);
        }
      } else if (diffY < -38) {
        lastTransitionTime = performance.now();
        if (currentStage === 0) {
          if (isDoorOpen) {
            closeDoor();
          }
        } else if (currentStage > 0) {
          goToStage(currentStage - 1);
        }
      }
    }, { passive: true });

    // Keyboard navigation & Shortcuts
    window.addEventListener('keydown', (e) => {
      // Shortcut: Ctrl+E or Cmd+E to toggle admin / unlock
      if ((e.ctrlKey || e.metaKey) && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        const urlParams = (typeof window !== 'undefined' && window.location) ? new URLSearchParams(window.location.search) : null;
        const isRecipientView = palaceState.defaultAccessMode === 'view' || (urlParams && (urlParams.get('access') === 'view' || urlParams.get('mode') === 'view'));
        if (palaceAccessMode === 'view' && isRecipientView) {
          return; // Strictly disabled for view mode recipients
        }
        if (palaceAccessMode === 'view') {
          applyAccessMode('edit');
        } else {
          openAdminPanel();
        }
        return;
      }

      if (e.key === 'Escape') {
        closeAdminPanel();
        closeShareModalDialog();
      }

      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'd' || e.key === 'D' || e.key === 's' || e.key === 'S' || e.key === ' ' || (isCurrentRoom('chamber-0') && e.key === 'ArrowRight')) {
        if (isCurrentRoom('chamber-0')) {
          milestoneGestureActive = false;
          if (milestoneSilenceTimer) clearTimeout(milestoneSilenceTimer);
          const maxIdx = (palaceState.milestones || []).length - 1;
          if (currentMilestoneStop < maxIdx) {
            currentMilestoneStop += 1;
            isStoppedAtMilestone = false;
            targetTimelineProgress = currentMilestoneStop;
            queueTimelineProgress(targetTimelineProgress);
            return;
          }
        }
        if (currentStage === 0) {
          if (!isDoorOpen) openDoor();
          else stepInsidePalace();
        } else if (currentStage < totalStages - 1) {
          goToStage(currentStage + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'a' || e.key === 'A' || e.key === 'w' || e.key === 'W' || (isCurrentRoom('chamber-0') && e.key === 'ArrowLeft')) {
        if (isCurrentRoom('chamber-0')) {
          milestoneGestureActive = false;
          if (milestoneSilenceTimer) clearTimeout(milestoneSilenceTimer);
          if (currentMilestoneStop > 0) {
            currentMilestoneStop -= 1;
            isStoppedAtMilestone = false;
            targetTimelineProgress = currentMilestoneStop;
            queueTimelineProgress(targetTimelineProgress);
            return;
          }
        }
        if (currentStage === 0) {
          if (isDoorOpen) closeDoor();
        } else if (currentStage > 0) {
          goToStage(currentStage - 1);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        toggleSound();
      }
    });

    // Floorplan Jump Nodes (Map chamber 0..6 to Stage 1..7)
    chamberNodes.forEach(node => {
      node.addEventListener('click', () => {
        const roomIdx = parseInt(node.dataset.room, 10);
        goToStage(roomIdx + 1);
      });
    });

    stepDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => goToStage(idx + 1));
    });

    // Walk forward / back buttons
    btnWalkNext.addEventListener('click', () => {
      if (currentStage === 0) {
        if (!isDoorOpen) {
          openDoor();
        } else {
          stepInsidePalace();
        }
        return;
      }
      if (isCurrentRoom('chamber-0')) {
        milestoneGestureActive = false;
        if (milestoneSilenceTimer) clearTimeout(milestoneSilenceTimer);
        const maxIdx = (palaceState.milestones || []).length - 1;
        if (currentMilestoneStop < maxIdx) {
          currentMilestoneStop += 1;
          isStoppedAtMilestone = false;
          targetTimelineProgress = currentMilestoneStop;
          queueTimelineProgress(targetTimelineProgress);
          if (window.innerWidth <= 768) {
            const wrap = document.getElementById('horizontalTimelineTrackWrap');
            const milestoneEls = document.querySelectorAll('.horizontal-milestone-item');
            const targetEl = milestoneEls[currentMilestoneStop];
            if (wrap && targetEl) {
              const scrollTarget = targetEl.offsetTop - (wrap.clientHeight - targetEl.offsetHeight) / 2;
              wrap.scrollTo({ top: scrollTarget, behavior: 'smooth' });
            }
          }
          return;
        }
      }
      if (currentStage >= totalStages - 1) {
        return; // Do not loop on last screen
      }
      goToStage(currentStage + 1);
    });

    btnWalkPrev.addEventListener('click', () => {
      if (currentStage === 0) {
        return; // Do not loop on first screen
      }
      if (isCurrentRoom('chamber-0')) {
        milestoneGestureActive = false;
        if (milestoneSilenceTimer) clearTimeout(milestoneSilenceTimer);
        if (currentMilestoneStop > 0) {
          currentMilestoneStop -= 1;
          isStoppedAtMilestone = false;
          targetTimelineProgress = currentMilestoneStop;
          queueTimelineProgress(targetTimelineProgress);
          if (window.innerWidth <= 768) {
            const wrap = document.getElementById('horizontalTimelineTrackWrap');
            const milestoneEls = document.querySelectorAll('.horizontal-milestone-item');
            const targetEl = milestoneEls[currentMilestoneStop];
            if (wrap && targetEl) {
              const scrollTarget = targetEl.offsetTop - (wrap.clientHeight - targetEl.offsetHeight) / 2;
              wrap.scrollTo({ top: scrollTarget, behavior: 'smooth' });
            }
          }
          return;
        }
      }
      goToStage(currentStage - 1);
    });

    // Top Panel Uffizio Brand Logo: Click to return to palace start
    const palaceHeaderBrand = document.getElementById('palaceHeaderBrand') || document.querySelector('.palace-header-brand');
    if (palaceHeaderBrand) {
      palaceHeaderBrand.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof closeAdminPanel === 'function') closeAdminPanel();
        if (typeof goToStage === 'function') {
          goToStage(0);
        }
      });
    }

    // Clicking Grand Door / Aperture opens and steps into Stage 1
    const handleDoorInteraction = () => {
      if (currentStage === 0 && !isTransitioning) {
        if (!isDoorOpen) {
          openDoor();
        } else {
          stepInsidePalace();
        }
      }
    };

    // Stop propagation on editable First Screen elements so clicks allow editing without opening door
    const entTitleEl = document.querySelector('.portal-arch-title');
    if (entTitleEl) entTitleEl.addEventListener('click', (e) => e.stopPropagation());
    const entSubEl = document.querySelector('.portal-arch-sub');
    if (entSubEl) entSubEl.addEventListener('click', (e) => e.stopPropagation());
    const entPromptEl = document.getElementById('portalPromptText');
    if (entPromptEl) entPromptEl.addEventListener('click', (e) => e.stopPropagation());
    const entArchHeader = document.querySelector('.portal-arch-header');
    if (entArchHeader) entArchHeader.addEventListener('click', (e) => e.stopPropagation());

    const dSealLeft = document.getElementById('doorSealLeft');
    if (dSealLeft) dSealLeft.addEventListener('click', (e) => e.stopPropagation());
    const dSealRight = document.getElementById('doorSealRight');
    if (dSealRight) dSealRight.addEventListener('click', (e) => e.stopPropagation());

    // Auto-save on blur & prevent Enter linebreaks for single-line entrance elements
    [entTitleEl, entSubEl, entPromptEl, dSealLeft, dSealRight].forEach(el => {
      if (!el) return;
      el.addEventListener('blur', () => {
        const profileModalBackdrop = document.getElementById('profileModalBackdrop');
        if (profileModalBackdrop && profileModalBackdrop.classList.contains('active')) return;
        if (typeof isLiveEditActive === 'undefined' || !isLiveEditActive) return;
        captureLiveEditsToState();
        persistPalaceState();
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          el.blur();
        }
      });
    });

    const leftLeaf = document.getElementById('doorLeafLeft');
    const rightLeaf = document.getElementById('doorLeafRight');
    if (leftLeaf) leftLeaf.addEventListener('click', handleDoorInteraction);
    if (rightLeaf) rightLeaf.addEventListener('click', handleDoorInteraction);

    const portalArchElem = document.getElementById('portalArch');
    if (portalArchElem) {
      portalArchElem.addEventListener('click', handleDoorInteraction);
    }

    const portalApertureElem = document.getElementById('portalAperture');
    if (portalApertureElem) {
      portalApertureElem.addEventListener('click', (e) => {
        e.stopPropagation();
        handleDoorInteraction(e);
      });
    }


// Global navigation exports
window.initChamberPositions = initChamberPositions;
window.updateHUD = updateHUD;
window.openDoor = openDoor;
window.closeDoor = closeDoor;
window.stepInsidePalace = stepInsidePalace;
window.goToStage = goToStage;
window.resetValuesScroll = resetValuesScroll;
window.handleDoorInteraction = handleDoorInteraction;
