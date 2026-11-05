/* ==========================================================================
   PALACE STATE, ASSET RESOLUTION, DUAL PERSISTENCE & MULTI-EMPLOYEE ENGINE
   ========================================================================== */

// Global Asset Mapping for Seamless Backward Compatibility
window.ASSET_PATH_MAP = {
  // Branding
  'royal_damask_mask_512.png': 'assets/images/branding/royal_damask_mask_512.png',
  'damask_pattern_3yr.png': 'assets/images/branding/damask_pattern_3yr.png',
  'damask_mask_3yr.png': 'assets/images/branding/damask_mask_3yr.png',
  'uffizio_logo.png': 'assets/images/branding/uffizio_logo.png',
  'uffizio_logo_white.png': 'assets/images/branding/uffizio_logo_white.png',
  
  // Chambers
  'creations_showcase_common.png': 'assets/images/chambers/creations_showcase_common.png',
  'creations_showcase_team.png': 'assets/images/chambers/creations_showcase_team.png',
  'creations_showcase_tech.png': 'assets/images/chambers/creations_showcase_tech.png',
  'future_vision_board.png': 'assets/images/chambers/future_vision_board.png',
  'golden_trophy.png': 'assets/images/chambers/golden_trophy.png',
  'proud_polaroid_1.png': 'assets/images/chambers/proud_polaroid_1.png',
  'proud_polaroid_2.png': 'assets/images/chambers/proud_polaroid_2.png',
  'proud_polaroid_3.png': 'assets/images/chambers/proud_polaroid_3.png',
  'universe_poster.jpg': 'assets/images/chambers/universe_poster.jpg',
  'celebration_arch_vector_3yr.png': 'assets/images/chambers/celebration_arch_vector_3yr.png',

  // Memories
  'memories_collage_part2.jpg': 'assets/images/memories/memories_collage_part2.jpg',
  'memories_collage_part2.png': 'assets/images/memories/memories_collage_part2.png',
  'memories_photo_1.png': 'assets/images/memories/memories_photo_1.png',
  'memories_photo_2.png': 'assets/images/memories/memories_photo_2.png',
  'memories_photo_3.png': 'assets/images/memories/memories_photo_3.png',
  'memories_photo_4.png': 'assets/images/memories/memories_photo_4.png',
  'memories_photo_5.png': 'assets/images/memories/memories_photo_5.png',
  'memories_photo_6.png': 'assets/images/memories/memories_photo_6.png',
  'memories_photo_7.png': 'assets/images/memories/memories_photo_7.png',
  'memories_photo_8.png': 'assets/images/memories/memories_photo_8.png',
  'memories_photo_9.png': 'assets/images/memories/memories_photo_9.png',
  'memory_1_photo.jpg': 'assets/images/memories/memory_1_photo.jpg',
  'memory_6_photo.jpg': 'assets/images/memories/memory_6_photo.jpg',

  // Portal
  'palace_door_frame.png': 'assets/images/portal/palace_door_frame.png',
  'palace_door_frame_3yr.png': 'assets/images/portal/palace_door_frame_3yr.png',
  'palace_door_left.png': 'assets/images/portal/palace_door_left.png',
  'palace_door_right.png': 'assets/images/portal/palace_door_right.png',
  'palace_door_left_3yr.png': 'assets/images/portal/palace_door_left_3yr.png',
  'palace_door_right_3yr.png': 'assets/images/portal/palace_door_right_3yr.png',
  'palace_door_left_silver.png': 'assets/images/portal/palace_door_left_silver.png',
  'palace_door_right_silver.png': 'assets/images/portal/palace_door_right_silver.png',
  'where_it_started.png': 'assets/images/portal/where_it_started.png',

  // Profiles
  'dhara_profile.jpg': 'assets/images/profiles/dhara_profile.jpg',
  'manushi_avatar.jpg': 'assets/images/profiles/manushi_avatar.jpg',
  'manushi_hero.jpg': 'assets/images/profiles/manushi_hero.jpg',
  'manushi_portrait.jpg': 'assets/images/profiles/manushi_portrait.jpg'
};

window.resolveAssetUrl = function(path) {
  if (!path || typeof path !== 'string') return path;
  if (path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const clean = path.replace(/^\.\//, '');
  if (window.ASSET_PATH_MAP[clean]) {
    return window.ASSET_PATH_MAP[clean];
  }
  const filename = clean.split('/').pop();
  if (window.ASSET_PATH_MAP[filename]) {
    return window.ASSET_PATH_MAP[filename];
  }
  return path;
};

// Global Toast Messenger (Declared early for all modules)
function showPalaceToast(msg, duration) {
  const toast = document.getElementById('palaceToast');
  const text = document.getElementById('palaceToastText');
  const d = duration || 3500;
  if (toast && text) {
    text.textContent = msg;
    toast.classList.add('active');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('active'), d);
  } else {
    console.log("Toast:", msg);
  }
}
window.showPalaceToast = showPalaceToast;

    /* ==========================================================================
       3. PALACE STATE & UNLIMITED DYNAMIC DATA ENGINE
       ========================================================================== */
    
        /* Universal Sentence Case Formatter for Room Headings: First word capitalized, rest lowercase */
    function toSentenceCase(str) {
      if (!str || typeof str !== 'string') return '';
      const trimmed = str.trim();
      if (!trimmed) return '';
      const lines = trimmed.split(/\r?\n/);
      const formattedLines = lines.map((line, idx) => {
        const l = line.trim();
        if (!l) return '';
        if (idx === 0) {
          let r = l.charAt(0).toUpperCase() + l.slice(1).toLowerCase();
          return r.replace(/\buffizio\b/gi, 'Uffizio');
        } else {
          let r = l.toLowerCase();
          return r.replace(/\buffizio\b/gi, 'Uffizio');
        }
      });
      return formattedLines.join('\n');
    }

const defaultChambers = [
      {
            "id": "chamber-milestone",
            "type": "celebration",
            "navNum": "★",
            "navLabel": "Year One",
            "title": "Celebrating your first year with Uffizio",
            "sub": "With Uffizio",
            "canDelete": false,
            "enabled": true,
            "tabTarget": "tab-celebration"
      },
      {
            "id": "chamber-0",
            "type": "timeline",
            "navNum": "01",
            "navLabel": "First Day",
            "title": "Where your journey began",
            "sub": "The beginning of your journey",
            "canDelete": true,
            "enabled": true,
            "tabTarget": "tab-milestones"
      },
      {
            "id": "chamber-1",
            "type": "skills",
            "navNum": "02",
            "navLabel": "Learned",
            "title": "The evolution of growth",
            "sub": "The breakthrough moments, technical mastery, and skills forged through dedication.",
            "canDelete": true,
            "enabled": true,
            "tabTarget": "tab-skills"
      },
      {
            "id": "chamber-2b",
            "type": "projects",
            "navNum": "03",
            "navLabel": "Created",
            "title": "Building impact through innovation",
            "sub": "Expanding horizons, specialized solutions, and next-level contributions.",
            "canDelete": true,
            "enabled": true,
            "tabTarget": "tab-projects-2"
      },
      {
            "id": "chamber-memories-2",
            "type": "memories",
            "navNum": "04",
            "navLabel": "Memories",
            "title": "Celebrating a year of memories",
            "sub": "More curated moments, team laughter, and workplace milestones.",
            "canDelete": true,
            "enabled": true,
            "tabTarget": "tab-memories-2"
      },
      {
            "id": "chamber-values",
            "type": "values",
            "navNum": "05",
            "navLabel": "Values",
            "title": "The values you bring",
            "sub": "The Values You Bring — How Your Everyday Actions Define Our Culture",
            "canDelete": true,
            "enabled": true,
            "tabTarget": "tab-values"
      },
      {
            "id": "chamber-3",
            "type": "people",
            "navNum": "06",
            "navLabel": "People",
            "title": "The people behind your journey",
            "sub": "Warm words, memories, and shared laughs with the team who walked with you.",
            "canDelete": true,
            "enabled": true,
            "tabTarget": "tab-notes"
      },
      {
            "id": "chamber-4",
            "type": "achievements",
            "navNum": "07",
            "navLabel": "Proud Moments",
            "title": "Moments that made you proud",
            "sub": "Milestones of recognition, awards, and breakthroughs celebrating your impact.",
            "canDelete": true,
            "enabled": true,
            "tabTarget": "tab-proud"
      },
      {
            "id": "chamber-5",
            "type": "future",
            "navNum": "08",
            "navLabel": "The Future",
            "title": "My vision for what’s next",
            "sub": "Looking ahead to the next summits, vision, and growth with Uffizio.",
            "canDelete": true,
            "enabled": true,
            "tabTarget": "tab-future"
      },
      {
            "id": "chamber-thankyou",
            "type": "thankyou",
            "navNum": "09",
            "navLabel": "Thank You",
            "title": "Thank you",
            "sub": "With Deepest Gratitude & Pride — Honoring Your 1 Year Journey With Uffizio",
            "canDelete": true,
            "enabled": true,
            "tabTarget": "tab-thankyou"
      }
];

    const palaceState = {
      "profileVersion": 6,
      "milestoneTier": "1yr",
      "chambers": [
        {
          "id": "chamber-milestone",
          "type": "celebration",
          "navNum": "★",
          "navLabel": "Year One",
          "title": "Celebrating your first year with Uffizio",
          "sub": "With Uffizio",
          "canDelete": false,
          "enabled": true,
          "tabTarget": "tab-celebration"
        },
        {
          "id": "chamber-0",
          "type": "timeline",
          "navNum": "01",
          "navLabel": "First Day",
          "title": "Where your journey began",
          "sub": "The beginning of your journey",
          "canDelete": true,
          "enabled": true,
          "tabTarget": "tab-milestones"
        },
        {
          "id": "chamber-1",
          "type": "skills",
          "navNum": "02",
          "navLabel": "Learned",
          "title": "The evolution of growth",
          "sub": "The breakthrough moments, technical mastery, and skills forged through dedication.",
          "canDelete": true,
          "enabled": true,
          "tabTarget": "tab-skills"
        },
        {
          "id": "chamber-2b",
          "type": "projects",
          "navNum": "03",
          "navLabel": "Created",
          "title": "Building impact through innovation",
          "sub": "Expanding horizons, specialized solutions, and next-level contributions.",
          "canDelete": true,
          "enabled": true,
          "tabTarget": "tab-projects-2"
        },
        {
          "id": "chamber-memories-2",
          "type": "memories",
          "navNum": "04",
          "navLabel": "Memories",
          "title": "Celebrating a year of memories",
          "sub": "More curated moments, team laughter, and workplace milestones.",
          "canDelete": true,
          "enabled": true,
          "tabTarget": "tab-memories-2"
        },
        {
          "id": "chamber-values",
          "type": "values",
          "navNum": "05",
          "navLabel": "Values",
          "title": "The values you bring",
          "sub": "The Values You Bring — How Your Everyday Actions Define Our Culture",
          "canDelete": true,
          "enabled": true,
          "tabTarget": "tab-values"
        },
        {
          "id": "chamber-3",
          "type": "people",
          "navNum": "06",
          "navLabel": "People",
          "title": "The people behind your journey",
          "sub": "Warm words, memories, and shared laughs with the team who walked with you.",
          "canDelete": true,
          "enabled": true,
          "tabTarget": "tab-notes"
        },
        {
          "id": "chamber-4",
          "type": "achievements",
          "navNum": "07",
          "navLabel": "Proud Moments",
          "title": "Moments that made you proud",
          "sub": "Milestones of recognition, awards, and breakthroughs celebrating your impact.",
          "canDelete": true,
          "enabled": true,
          "tabTarget": "tab-proud"
        },
        {
          "id": "chamber-5",
          "type": "future",
          "navNum": "08",
          "navLabel": "The Future",
          "title": "My vision for what’s next",
          "sub": "Looking ahead to the next summits, vision, and growth with Uffizio.",
          "canDelete": true,
          "enabled": true,
          "tabTarget": "tab-future"
        },
        {
          "id": "chamber-thankyou",
          "type": "thankyou",
          "navNum": "09",
          "navLabel": "Thank You",
          "title": "Thank you",
          "sub": "With Deepest Gratitude & Pride — Honoring Your 1 Year Journey With Uffizio",
          "canDelete": true,
          "enabled": true,
          "tabTarget": "tab-thankyou"
        }
      ],
      "doorWingLeft": "UFFIZIO",
      "doorWingRight": "2025 → 2026",
      "editorPasscode": "uffizio",
      "entrance": {
        "logo": "assets/images/branding/uffizio_logo_white.png",
        "title": "Welcome to your journey",
        "subtitle": "Walk through your year • 2025 → 2026",
        "prompt": "Scroll down or click door to enter"
      },
      "employee": {
        "name": "Dhara Patel",
        "role": "Software Engineer • Creative Systems",
        "date": "01 September 2025",
        "photo": "assets/images/profiles/dhara_profile.jpg",
        "years": "2025 → 2026"
      },
      "celebration": {
        "title": "Celebrating Your First Year With Uffizio",
        "sub": "With Uffizio",
        "quote": "“One year ago, a new chapter began. Today, we celebrate everything that made it meaningful.”"
      },
      "milestones": [
        {
          "date": "01 September 2025",
          "title": "Joined Uffizio",
          "sub": "Customer Support Journey Begins"
        },
        {
          "date": "March 2026",
          "title": "Successfully Completed Probation",
          "sub": "Confirmed Core Team Member"
        },
        {
          "date": "01 September 2026",
          "title": "Completed 1 Year Journey",
          "sub": "1 Year of Impact & Excellence"
        },
        {
          "date": "September 2026",
          "title": "Sr.Devloper",
          "sub": "Devloper journy began."
        }
      ],
      "evolution": {
        "thenTitle": "Day 01",
        "thenPoints": [
          {
            "icon": "globe",
            "text": "Learning the environment"
          },
          {
            "icon": "box",
            "text": "Understanding the product"
          },
          {
            "icon": "compass",
            "text": "Getting familiar with the role"
          }
        ],
        "growthLabel": "",
        "nowTitle": "Today",
        "nowPoints": [
          {
            "icon": "shield",
            "text": "More confidence",
            "colorClass": "highlight-gold"
          },
          {
            "icon": "target",
            "text": "Better understanding",
            "colorClass": "highlight-cyan"
          },
          {
            "icon": "crown",
            "text": "Greater ownership",
            "colorClass": "highlight-emerald"
          }
        ]
      },
      "thankYou": {
        "headerBadge": "",
        "title": "Thank You, Dhara!",
        "subtitle": "",
        "message": "Thank you for your dedication, energy, and spirit at Uffizio. Your contributions strengthen our team, and we’re proud of your growth and journey with us.",
        "signature": "— With heartfelt gratitude & best wishes, Team Uffizio 🌟",
        "actionBtn1": "🎉 Shower Confetti & Applause",
        "actionBtn2": "",
        "actionBtn3": "🏛️ Revisit Palace From Start",
        "badges": [
          {
            "icon": "star",
            "title": "365 Days of Excellence",
            "desc": "Dedication and resilience every single day"
          },
          {
            "icon": "heart",
            "title": "Cherished Teammate",
            "desc": "Bringing warmth, trust, and team spirit"
          },
          {
            "icon": "rocket",
            "title": "Limitless Horizons",
            "desc": "Ready to conquer the next summits together"
          }
        ]
      },
      "proud": {
        "plaqueTitle": "INNOVATOR OF THE YEAR",
        "plaqueSubtitle": "2025 - 2026 ANNUAL HONORS",
        "trophyImg": "assets/images/chambers/golden_trophy.png",
        "polaroids": [
      {
        "image": "assets/images/chambers/proud_polaroid_1.png",
        "caption": "v4.0 Launch Night! 🚀"
      },
      {
        "image": "assets/images/chambers/proud_polaroid_2.png",
        "caption": "Hackathon Runners-up 🏆"
      },
      {
        "image": "assets/images/chambers/proud_polaroid_3.png",
        "caption": "All-Hands Demo Day 🎤"
      }
    ]
      },
      "future": {
        "title": "My Vision for What's Next",
        "quoteText": "A goal without a plan is just a wish.",
        "quoteAuthor": "Antoine de Saint-Exupéry",
        "cards": [
          {
            "title": "What skills do you want to build?",
            "sub": "Share the skills or knowledge you want to develop to grow in your career."
          },
          {
            "title": "What new challenges do you want to take on?",
            "sub": "Tell us about the kind of opportunities or responsibilities you would like to explore."
          },
          {
            "title": "What impact do you want to create?",
            "sub": "How do you see yourself contributing more to your team and Uffizio?"
          },
          {
            "title": "Where do you see yourself growing?",
            "sub": "Envision your long-term goals, milestones, and leadership journey ahead."
          }
        ],
        "bottomQuote1": "Your journey doesn't end here.",
        "bottomQuote2": "It evolves with every step you take.",
        "btnSaveText": "Save My Vision"
      },
      "skills": [
        {
          "title": "Knowledge",
          "desc": "Product & Architecture",
          "pct": 98,
          "icon": "🧠",
          "tag": "Product Mastery"
        },
        {
          "title": "Communication",
          "desc": "Cross-Team Alignment",
          "pct": 95,
          "icon": "💬",
          "tag": "Team Synergy"
        },
        {
          "title": "Problem Solving",
          "desc": "First-Principles Triage",
          "pct": 96,
          "icon": "🧩",
          "tag": "Rapid Resolution"
        },
        {
          "title": "Confidence",
          "desc": "Autonomous Ownership",
          "pct": 98,
          "icon": "🛡️",
          "tag": "High Autonomy"
        }
      ],
      "contributions": [
        {
          "id": 0,
          "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&auto=format&fit=crop&q=80",
          "project": {
            "title": "Enterprise Support SLA 99.8%",
            "desc": "Delivering mission-critical technical support and rapid incident resolution for high-value enterprise fleet partners."
          },
          "contribution": {
            "title": "Direct Triage & Swift Resolution",
            "desc": "Owned tier-1/tier-2 incident lifecycle, coordinated cross-functional engineering fixes, and established a sub-15m initial response rhythm."
          },
          "impact": {
            "title": "Zero SLA Breaches & 99.8% CSAT",
            "desc": "Maintained an impeccable SLA track record throughout Year 1, earning stellar partner trust and high retention.",
            "metricVal1": "99.8%",
            "metricLbl1": "SLA Maintained"
          }
        },
        {
          "id": 1,
          "image": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=700&auto=format&fit=crop&q=80",
          "project": {
            "title": "Standard Operating Procedures v2",
            "desc": "Standardizing complex vehicle tracking hardware diagnostics and telematics platform onboarding SOPs."
          },
          "contribution": {
            "title": "Authoring 60+ Troubleshooting Guides",
            "desc": "Synthesized edge-case solutions into visual step-by-step documentation and conducted knowledge-transfer sessions."
          },
          "impact": {
            "title": "65% Faster Team Ramp-Up",
            "desc": "Reduced support query escalation turnaround by 3x and accelerated training for all newly onboarding teammates.",
            "metricVal1": "60+",
            "metricLbl1": "Guides Authored"
          }
        },
        {
          "id": 2,
          "image": "https://images.unsplash.com/photo-1524522173746-f628baad3644?w=700&auto=format&fit=crop&q=80",
          "project": {
            "title": "Proactive Fleet Anomaly Monitoring",
            "desc": "Early detection of sensor disconnections, device battery drain, and network latency before clients notice downtime."
          },
          "contribution": {
            "title": "Preventative Diagnostics Routine",
            "desc": "Implemented daily automated health checks and conducted outreach calls to pre-emptively calibrate vehicle tracking units."
          },
          "impact": {
            "title": "+48% Proactive Case Resolution",
            "desc": "Prevented hundreds of potential downtime hours and substantially elevated client confidence in platform stability.",
            "metricVal1": "150+",
            "metricLbl1": "Fleets Safeguarded"
          }
        },
        {
          "id": 3,
          "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&auto=format&fit=crop&q=80",
          "project": {
            "title": "Year-Round Client Advocacy",
            "desc": "Serving as the trusted face and reassuring voice of Uffizio across 500+ complex customer touchpoints."
          },
          "contribution": {
            "title": "Empathetic, End-to-End Ownership",
            "desc": "Turned frustrated users into brand champions through relentless follow-ups, patience, and clear technical communication."
          },
          "impact": {
            "title": "500+ Smiles & 4.9★ Rating",
            "desc": "Directly strengthened client loyalty, earning praise from team leads, customers, and management alike.",
            "metricVal1": "500+",
            "metricLbl1": "Breakthroughs"
          }
        },
        {
          "id": 4,
          "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&auto=format&fit=crop&q=80",
          "project": {
            "title": "Employee new  task",
            "desc": "Describe the key project scope, customer problem, or technical initiative."
          },
          "contribution": {
            "title": "Good",
            "desc": "Describe the direct action you took, solutions created, or fixes delivered."
          },
          "impact": {
            "title": "Measurable Business Result",
            "desc": "Explain the outcome, customer satisfaction, or efficiency achieved.",
            "metricVal1": "100%",
            "metricLbl1": "Success"
          }
        },
        {
          "id": 5,
          "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&auto=format&fit=crop&q=80",
          "project": {
            "title": "Project / Task 6",
            "desc": "Describe the key project scope, customer problem, or technical initiative."
          },
          "contribution": {
            "title": "Key Contribution & Ownership",
            "desc": "Describe the direct action you took, solutions created, or fixes delivered."
          },
          "impact": {
            "title": "Measurable Business Result",
            "desc": "Explain the outcome, customer satisfaction, or efficiency achieved.",
            "metricVal1": "100%",
            "metricLbl1": "Success"
          }
        },
        {
          "id": 6,
          "image": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=700&auto=format&fit=crop&q=80",
          "project": {
            "title": "Project / Task 7",
            "desc": "Describe the key project scope, customer problem, or technical initiative."
          },
          "contribution": {
            "title": "Key Contribution & Ownership",
            "desc": "Describe the direct action you took, solutions created, or fixes delivered."
          },
          "impact": {
            "title": "Measurable Business Result",
            "desc": "Explain the outcome, customer satisfaction, or efficiency achieved.",
            "metricVal1": "100%",
            "metricLbl1": "Success"
          }
        },
        {
          "id": 7,
          "image": "https://images.unsplash.com/photo-1524522173746-f628baad3644?w=700&auto=format&fit=crop&q=80",
          "project": {
            "title": "Project / Task 8",
            "desc": "Describe the key project scope, customer problem, or technical initiative."
          },
          "contribution": {
            "title": "Key Contribution & Ownership",
            "desc": "Describe the direct action you took, solutions created, or fixes delivered."
          },
          "impact": {
            "title": "Measurable Business Result",
            "desc": "Explain the outcome, customer satisfaction, or efficiency achieved.",
            "metricVal1": "100%",
            "metricLbl1": "Success"
          }
        }
      ],
      "contributions2": [
        {
          "id": 0,
          "tabLabel": "Telematics Sync",
          "tabIcon": "🛰️",
          "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
          "project": {
            "title": "Cross-Platform Telematics Sync",
            "desc": "Engineering high-throughput telemetry stream monitoring and synchronization across multi-vendor GPS hardware.",
            "tag": "IoT & Data Integrity • High Precision"
          },
          "contribution": {
            "title": "",
            "desc": "Architected real-time ingestion pipelines reconciling protocol discrepancies across 15+ IoT tracker models."
          },
          "impact": {
            "title": "Data Reliability & Precision",
            "desc": "Achieved 99.9% telematics accuracy, eliminating GPS packet drops and enabling live fleet tracking at scale.",
            "metricVal1": "",
            "metricLbl1": "Telematics Accuracy"
          }
        },
        {
          "id": 1,
          "tabLabel": "Incident Automation",
          "tabIcon": "⚡",
          "image": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop&q=80",
          "project": {
            "title": "Automated Incident Escalation",
            "desc": "Developing smart triage triggers and escalation workflows to accelerate critical issue response times.",
            "tag": "Workflow Automation • Operations"
          },
          "contribution": {
            "title": "",
            "desc": "Built rule-based dispatch scripts connecting customer priority tickets directly with specialized engineering pods."
          },
          "impact": {
            "title": "Swift MTTR Reduction",
            "desc": "Accelerated critical issue escalation by 35% and improved cross-departmental incident handoffs.",
            "metricVal1": "",
            "metricLbl1": "Faster Escalation"
          }
        },
        {
          "id": 2,
          "tabLabel": "Client Onboarding",
          "tabIcon": "🌐",
          "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80",
          "project": {
            "title": "Global Client Onboarding Hub",
            "desc": "Guiding enterprise fleet operators through bespoke onboarding architectures, device configuration, and staff training.",
            "tag": "Partner Success • Global Scale"
          },
          "contribution": {
            "title": "",
            "desc": "Facilitated over 120 live migration sessions, configuring geofences, alerts, and analytics dashboards for new clients."
          },
          "impact": {
            "title": "Accelerated Time-to-Value",
            "desc": "Onboarded 120+ commercial fleets smoothly with a 100% first-month retention milestone.",
            "metricVal1": "",
            "metricLbl1": "Fleets Onboarded"
          }
        },
        {
          "id": 3,
          "tabLabel": "Quality Loop",
          "tabIcon": "🔄",
          "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
          "project": {
            "title": "Quality Assurance & Feedback Loop",
            "desc": "Establishing direct feedback loops connecting real-world user pain points with product sprint planning.",
            "tag": "Product Excellence • Voice of Customer"
          },
          "contribution": {
            "title": "",
            "desc": "Analyzed frontline feedback trends and authored monthly usability insight reports for the engineering team."
          },
          "impact": {
            "title": "High First-Contact Resolution",
            "desc": "Helped drive first-contact fix rates to 98% and reduced repetitive feature-related inquiries.",
            "metricVal1": "",
            "metricLbl1": "First-Contact Fix"
          }
        }
      ],
      "chamber2bCommonImage": "assets/images/chambers/creations_showcase_common.png",
      "chamber2bCommonTitle": "Innovation & Systems In Action",
      "chamber2bCommonDesc": "Real-time architecture, proactive incident workflows, and high-impact partner success.",
      "projects": [
        {
          "title": "Platform Core v4.0",
          "subtitle": "Flagship Telematics & Engine Architecture",
          "gauge1": "99.98%",
          "gauge2": "+42%",
          "desc": "Architected the high-throughput ingestion pipeline processing real-time vehicle coordinates and alerts with sub-50ms round-trip synchronization."
        },
        {
          "title": "Design System 2.0",
          "subtitle": "Accessible Component Library",
          "gauge1": "50+",
          "gauge2": "3x",
          "desc": "Built a ground-up accessible enterprise UI system with dark/light themes, WCAG AA compliance, and rich spatial interaction primitives."
        },
        {
          "title": "Workflow Automation Engine",
          "subtitle": "Intelligent Operations & Dispatch",
          "gauge1": "18h",
          "gauge2": "12k+",
          "desc": "Engineered automated dispatch reconciliation, eliminating manual spreadsheets and reducing error margins to practically zero."
        },
        {
          "title": "150+ PRs Shipped",
          "subtitle": "Engineering Consistency & Velocity",
          "gauge1": "620+",
          "gauge2": "99.8%",
          "desc": "A full cycle of dependable delivery with thorough code reviews, zero regressions introduced in critical flows, and strong docs."
        }
      ],
      "memories": [
        {
          "id": 1,
          "title": "",
          "date": "",
          "tag": "",
          "image": "assets/images/memories/memory_1_photo.jpg",
          "desc": "Stepping into the Uffizio family on Day 1 with excitement, high aspirations, and warm welcomes."
        },
        {
          "id": 2,
          "title": "",
          "date": "",
          "tag": "",
          "image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
          "desc": "Collaborative problem-solving, whiteboard brainstorms, and late-night pizza coding sessions."
        },
        {
          "id": 3,
          "title": "",
          "date": "",
          "tag": "",
          "image": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80",
          "desc": "Unwinding outside the office with laughter, fun activities, and deep conversations."
        },
        {
          "id": 4,
          "title": "",
          "date": "",
          "tag": "",
          "image": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
          "desc": "Standing ovations and high fives across the floor when the system went live seamlessly."
        },
        {
          "id": 5,
          "title": "",
          "date": "",
          "tag": "",
          "image": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80",
          "desc": "Traditional attire, vibrant colors, sweets, and celebrating our rich diversity together."
        },
        {
          "id": 6,
          "title": "",
          "date": "",
          "tag": "",
          "image": "assets/images/memories/memory_6_photo.jpg",
          "desc": "Looking back at an incredible year of personal evolution, achievements, and strong bonds."
        }
      ],
      "memories2Mode": "uneven",
      "memories2CollageImage": "assets/images/memories/memories_collage_part2.png",
      "memories2": [
        {
          "id": 201,
          "title": "Beginning the Journey",
          "date": "2025",
          "tag": "📸 Moments",
          "image": "assets/images/portal/where_it_started.png",
          "desc": "Where the vision and energy first came together."
        },
        {
          "id": 202,
          "title": "Creative Collaboration",
          "date": "2025",
          "tag": "📸 Team",
          "image": "assets/images/chambers/creations_showcase_team.png",
          "desc": "Brainstorming and building cross-functional solutions."
        },
        {
          "id": 203,
          "title": "Sprint Milestones",
          "date": "2025",
          "tag": "📸 Milestone",
          "image": "assets/images/memories/memory_1_photo.jpg",
          "desc": "Dedicated sessions delivering impact on schedule."
        },
        {
          "id": 204,
          "title": "Team Leadership",
          "date": "2025",
          "tag": "📸 Core",
          "image": "assets/images/profiles/manushi_hero.jpg",
          "desc": "Empowering peers and driving impactful project outcomes."
        },
        {
          "id": 205,
          "title": "Looking to the Future",
          "date": "2026",
          "tag": "📸 Vision",
          "image": "assets/images/chambers/future_vision_board.png",
          "desc": "Mapping ambitious horizons and long-term milestones."
        },
        {
          "id": 206,
          "title": "Annual Celebrations",
          "date": "2025",
          "tag": "📸 Gala",
          "image": "assets/images/memories/memory_6_photo.jpg",
          "desc": "Unwinding and celebrating shared annual victories."
        },
        {
          "id": 207,
          "title": "Tech Innovations",
          "date": "2025",
          "tag": "📸 Tech",
          "image": "assets/images/chambers/creations_showcase_tech.png",
          "desc": "Architectural excellence and technical craftsmanship."
        },
        {
          "id": 208,
          "title": "Cherished Moments",
          "date": "2025 → 2026",
          "tag": "📸 Joy",
          "image": "assets/images/profiles/manushi_portrait.jpg",
          "desc": "Friendship, camaraderie, and smiles across the floor."
        }
      ],
      "values": [
        {
          "id": 1,
          "title": "OWNERSHIP",
          "icon": "shield",
          "quote": "You step forward when something needs to be done.",
          "desc": "Taking autonomous initiative, closing loops, and owning outcomes from start to finish.",
          "badge": ""
        },
        {
          "id": 2,
          "title": "LEARNING",
          "icon": "sprout",
          "quote": "You turn every challenge into an opportunity to improve.",
          "desc": "Embracing complex problems, mastering new systems, and turning feedback into growth.",
          "badge": ""
        },
        {
          "id": 3,
          "title": "COLLABORATION",
          "icon": "users",
          "quote": "You grow by working with and supporting others.",
          "desc": "Lifting teammates, fostering trust, and driving cross-functional alignment across all teams.",
          "badge": ""
        },
        {
          "id": 4,
          "title": "CUSTOMER FOCUS",
          "icon": "target",
          "quote": "You keep the people we serve at the centre of your work.",
          "desc": "Deep empathy for partner needs, swift resolution, and elevating customer experience.",
          "badge": ""
        }
      ],
      "stickyNotes": [
        {
          "text": "Thank you for staying back and untangling that telemetry cluster bug! You're a true rockstar.",
          "author": "Priya S. • Lead Architect",
          "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80",
          "color": "yellow"
        },
        {
          "text": "The dedication you show to every client inspires the entire team. Proud to work alongside you!",
          "author": "Rahul D. • Support Lead",
          "photo": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80",
          "color": "pink"
        },
        {
          "text": "Best coffee partner and problem solver. Always ready with an elegant solution and a smile.",
          "author": "Ankit M. • Fellow Teammate",
          "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
          "color": "mint"
        },
        {
          "text": "Incredible growth from Day 1. You handled high-pressure situations like a veteran. Keep soaring!",
          "author": "Vikram R. • Operations Director",
          "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
          "color": "sky"
        }
      ],
      "chamberStories": {
        "ch1Title": "Where Your Journey Began",
        "ch1Sub": "The beginning of your journey",
        "ch2Title": "What You Learned",
        "ch2Sub": "The breakthrough moments, technical mastery, and skills forged through dedication.",
        "ch3Title": "What You Created",
        "ch3Sub": "The achievements shipped, architectures scaled, and client milestones delivered.",
        "ch4Title": "The People & Bonds",
        "ch4Sub": "Warm words, memories, and shared laughs with the team who walked with you.",
        "chValTitle": "The Values You Bring",
        "chValDesc": "The Values You Bring — How Your Everyday Actions Define Our Culture",
        "ch6Wish": "To a year defined by bold initiatives, late-night breakthroughs, and continuous excellence. Happy 1st Work Anniversary!"
      }
    };

    // ==========================================================================
    // PERMANENT STORAGE ENGINE: LOCALSTORAGE + INDEXEDDB DUAL PERSISTENCE
    // ==========================================================================
    const DB_NAME = 'PalacePersistentStore';
    const DB_VERSION = 1;
    const STORE_NAME = 'profileData';

    function openPalaceDB() {
      return new Promise((resolve) => {
        if (!window.indexedDB) return resolve(null);
        try {
          const req = window.indexedDB.open(DB_NAME, DB_VERSION);
          req.onupgradeneeded = (e) => {
            try {
              const db = e.target.result;
              if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'key' });
              }
            } catch (err) {
              console.warn("IndexedDB upgrade error", err);
            }
          };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
          req.onblocked = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    }

    // Multi-Profile Embedded Catalog for 100% Offline & file:// Protocol Support
    window.BUILTIN_PROFILES = window.BUILTIN_PROFILES || {};
    window.BUILTIN_PROFILES["dhara"] = JSON.parse(JSON.stringify(palaceState));
    window.BUILTIN_PROFILES["rahul"] = JSON.parse(`{"profileVersion": 6, "chambers": [{"id": "chamber-milestone", "type": "celebration", "navNum": "\\u2605", "navLabel": "3 Years", "title": "Celebrating 3 Remarkable Years With Uffizio", "sub": "Core Pillar \\u2022 Telematics Systems", "canDelete": false, "enabled": true, "tabTarget": "tab-celebration"}, {"id": "chamber-0", "type": "timeline", "navNum": "01", "navLabel": "First Day", "title": "Where Your Journey Began", "sub": "The beginning of your journey", "canDelete": true, "enabled": true, "tabTarget": "tab-milestones"}, {"id": "chamber-1", "type": "skills", "navNum": "02", "navLabel": "Learned", "title": "The Evolution Of Growth", "sub": "The breakthrough moments, technical mastery, and skills forged through dedication.", "canDelete": true, "enabled": true, "tabTarget": "tab-skills"}, {"id": "chamber-2b", "type": "projects", "navNum": "03", "navLabel": "Created", "title": "Building Impact Through Innovation", "sub": "Expanding horizons, specialized solutions, and next-level contributions.", "canDelete": true, "enabled": true, "tabTarget": "tab-projects-2"}, {"id": "chamber-memories-2", "type": "memories", "navNum": "04", "navLabel": "Memories", "title": "Celebrating a Year of Memories", "sub": "More curated moments, team laughter, and workplace milestones.", "canDelete": true, "enabled": true, "tabTarget": "tab-memories-2"}, {"id": "chamber-values", "type": "values", "navNum": "05", "navLabel": "Values", "title": "The Values You Bring", "sub": "The Values You Bring \\u2014 How Your Everyday Actions Define Our Culture", "canDelete": true, "enabled": true, "tabTarget": "tab-values"}, {"id": "chamber-3", "type": "people", "navNum": "06", "navLabel": "People", "title": "The People Behind your Journey", "sub": "Warm words, memories, and shared laughs with the team who walked with you.", "canDelete": true, "enabled": true, "tabTarget": "tab-notes"}, {"id": "chamber-4", "type": "achievements", "navNum": "07", "navLabel": "Proud Moments", "title": "Moments That Made You Proud", "sub": "Milestones of recognition, awards, and breakthroughs celebrating your impact.", "canDelete": true, "enabled": true, "tabTarget": "tab-proud"}, {"id": "chamber-5", "type": "future", "navNum": "08", "navLabel": "The Future", "title": "My Vision for What\\u2019s Next", "sub": "Looking ahead to the next summits, vision, and growth with Uffizio.", "canDelete": true, "enabled": true, "tabTarget": "tab-future"}, {"id": "chamber-thankyou", "type": "thankyou", "navNum": "09", "navLabel": "Thank You", "title": "Thank You", "sub": "With Deepest Gratitude & Pride \\u2014 Honoring Your 1 Year Journey With Uffizio", "canDelete": true, "enabled": true, "tabTarget": "tab-thankyou"}], "doorWingLeft": "UFFIZIO", "doorWingRight": "2023 \\u2192 2026", "editorPasscode": "uffizio", "entrance": {"logo": "assets/images/branding/uffizio_logo_white.png", "title": "WELCOME TO YOUR JOURNEY", "subtitle": "WALK THROUGH YOUR YEAR \\u2022 2025 \\u2192 2026", "prompt": "Scroll Down or Click Door to Enter"}, "employee": {"name": "Rahul Sharma", "role": "Senior Fleet Telematics Engineer", "date": "15 October 2024", "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80", "years": "2023 \\u2192 2026"}, "celebration": {"title": "Celebrating 3 Remarkable Years With Uffizio", "sub": "Core Pillar \\u2022 With Uffizio", "quote": "\\u201cThree years of building trust, mastering telemetry challenges, and shaping success together.\\u201d"}, "milestones": [{"date": "15 October 2024", "title": "Joined Uffizio", "sub": "IoT & Telematics Journey Began"}, {"date": "15 April 2025", "title": "Completed Probation", "sub": "Confirmed Core Telematics Lead"}, {"date": "15 October 2025", "title": "1 Year Work Anniversary", "sub": "Honoring Excellence & Dedication"}, {"date": "15 October 2026", "title": "2 Years Work Anniversary", "sub": "Scaling Platforms Globally"}], "evolution": {"thenTitle": "Day 01 \\u2022 Starting Horizon", "thenPoints": [{"icon": "globe", "text": "Learning the environment"}, {"icon": "box", "text": "Understanding the product"}, {"icon": "compass", "text": "Getting familiar with the role"}], "growthLabel": "", "nowTitle": "Today", "nowPoints": [{"icon": "shield", "text": "More confidence", "colorClass": "highlight-gold"}, {"icon": "target", "text": "Better understanding", "colorClass": "highlight-cyan"}, {"icon": "crown", "text": "Greater ownership", "colorClass": "highlight-emerald"}]}, "thankYou": {"headerBadge": "\\u2728 3 YEARS OF IMPACT & LEADERSHIP \\u2728", "title": "Thank You, Rahul!", "subtitle": "", "message": "Thank you for bringing your dedication, energy, and brilliant spirit to Uffizio every single day. Your presence strengthens our team, elevates our culture, and turns every challenge into an inspiring milestone. We are deeply proud of your growth and honored to walk this journey together.", "signature": "\\u2014 With heartfelt gratitude & best wishes, Team Uffizio \\ud83c\\udf1f", "actionBtn1": "\\ud83c\\udf89 Shower Confetti & Applause", "actionBtn2": "\\ud83d\\udcdc View Souvenir Card", "actionBtn3": "\\ud83c\\udfdb\\ufe0f Revisit Palace From Start", "badges": [{"icon": "star", "title": "365 Days of Excellence", "desc": "Dedication and resilience every single day"}, {"icon": "heart", "title": "Cherished Teammate", "desc": "Bringing warmth, trust, and team spirit"}, {"icon": "rocket", "title": "Limitless Horizons", "desc": "Ready to conquer the next summits together"}]}, "proud": {"plaqueTitle": "INNOVATOR OF THE YEAR", "plaqueSubtitle": "2025 - 2026 ANNUAL HONORS", "trophyImg": "assets/images/chambers/golden_trophy.png", "polaroids": [{"image": "assets/images/chambers/proud_polaroid_1.png", "caption": "v4.0 Launch Night! \\ud83d\\ude80"}, {"image": "assets/images/chambers/proud_polaroid_2.png", "caption": "Hackathon Runners-up \\ud83c\\udfc6"}, {"image": "assets/images/chambers/proud_polaroid_3.png", "caption": "All-Hands Demo Day \\ud83c\\udfa4"}], "celebrateTitle": "Celebrate This Milestone", "celebrateDesc": "Trigger the palace confetti cannon and commemorate your incredible achievements.", "celebrateBtn": "\\ud83c\\udf89 Fire Confetti!"}, "future": {"title": "My Vision for What's Next", "quoteText": "A goal without a plan is just a wish.", "quoteAuthor": "Antoine de Saint-Exup\\u00e9ry", "cards": [{"title": "What skills do you want to build?", "sub": "Share the skills or knowledge you want to develop to grow in your career."}, {"title": "What new challenges do you want to take on?", "sub": "Tell us about the kind of opportunities or responsibilities you would like to explore."}, {"title": "What impact do you want to create?", "sub": "How do you see yourself contributing more to your team and Uffizio?"}, {"title": "Where do you see yourself growing?", "sub": "Envision your long-term goals, milestones, and leadership journey ahead."}], "bottomQuote1": "Your journey doesn't end here.", "bottomQuote2": "It evolves with every step you take.", "btnSaveText": "Save My Vision"}, "skills": [{"title": "Knowledge", "desc": "Product & Architecture", "pct": 98, "icon": "\\ud83e\\udde0", "tag": "Product Mastery"}, {"title": "Communication", "desc": "Cross-Team Alignment", "pct": 95, "icon": "\\ud83d\\udcac", "tag": "Team Synergy"}, {"title": "Problem Solving", "desc": "First-Principles Triage", "pct": 96, "icon": "\\ud83e\\udde9", "tag": "Rapid Resolution"}, {"title": "Confidence", "desc": "Autonomous Ownership", "pct": 98, "icon": "\\ud83d\\udee1\\ufe0f", "tag": "High Autonomy"}], "contributions": [{"id": 0, "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&auto=format&fit=crop&q=80", "project": {"title": "Enterprise Support SLA 99.8%", "desc": "Delivering mission-critical technical support and rapid incident resolution for high-value enterprise fleet partners."}, "contribution": {"title": "Direct Triage & Swift Resolution", "desc": "Owned tier-1/tier-2 incident lifecycle, coordinated cross-functional engineering fixes, and established a sub-15m initial response rhythm."}, "impact": {"title": "Zero SLA Breaches & 99.8% CSAT", "desc": "Maintained an impeccable SLA track record throughout Year 1, earning stellar partner trust and high retention.", "metricVal1": "99.8%", "metricLbl1": "SLA Maintained"}}, {"id": 1, "image": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=700&auto=format&fit=crop&q=80", "project": {"title": "Standard Operating Procedures v2", "desc": "Standardizing complex vehicle tracking hardware diagnostics and telematics platform onboarding SOPs."}, "contribution": {"title": "Authoring 60+ Troubleshooting Guides", "desc": "Synthesized edge-case solutions into visual step-by-step documentation and conducted knowledge-transfer sessions."}, "impact": {"title": "65% Faster Team Ramp-Up", "desc": "Reduced support query escalation turnaround by 3x and accelerated training for all newly onboarding teammates.", "metricVal1": "60+", "metricLbl1": "Guides Authored"}}, {"id": 2, "image": "https://images.unsplash.com/photo-1524522173746-f628baad3644?w=700&auto=format&fit=crop&q=80", "project": {"title": "Proactive Fleet Anomaly Monitoring", "desc": "Early detection of sensor disconnections, device battery drain, and network latency before clients notice downtime."}, "contribution": {"title": "Preventative Diagnostics Routine", "desc": "Implemented daily automated health checks and conducted outreach calls to pre-emptively calibrate vehicle tracking units."}, "impact": {"title": "+48% Proactive Case Resolution", "desc": "Prevented hundreds of potential downtime hours and substantially elevated client confidence in platform stability.", "metricVal1": "150+", "metricLbl1": "Fleets Safeguarded"}}, {"id": 3, "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&auto=format&fit=crop&q=80", "project": {"title": "Year-Round Client Advocacy", "desc": "Serving as the trusted face and reassuring voice of Uffizio across 500+ complex customer touchpoints."}, "contribution": {"title": "Empathetic, End-to-End Ownership", "desc": "Turned frustrated users into brand champions through relentless follow-ups, patience, and clear technical communication."}, "impact": {"title": "500+ Smiles & 4.9\\u2605 Rating", "desc": "Directly strengthened client loyalty, earning praise from team leads, customers, and management alike.", "metricVal1": "500+", "metricLbl1": "Breakthroughs"}}, {"id": 4, "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&auto=format&fit=crop&q=80", "project": {"title": "Employee new  task", "desc": "Describe the key project scope, customer problem, or technical initiative."}, "contribution": {"title": "Good", "desc": "Describe the direct action you took, solutions created, or fixes delivered."}, "impact": {"title": "Measurable Business Result", "desc": "Explain the outcome, customer satisfaction, or efficiency achieved.", "metricVal1": "100%", "metricLbl1": "Success"}}, {"id": 5, "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&auto=format&fit=crop&q=80", "project": {"title": "Project / Task 6", "desc": "Describe the key project scope, customer problem, or technical initiative."}, "contribution": {"title": "Key Contribution & Ownership", "desc": "Describe the direct action you took, solutions created, or fixes delivered."}, "impact": {"title": "Measurable Business Result", "desc": "Explain the outcome, customer satisfaction, or efficiency achieved.", "metricVal1": "100%", "metricLbl1": "Success"}}, {"id": 6, "image": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=700&auto=format&fit=crop&q=80", "project": {"title": "Project / Task 7", "desc": "Describe the key project scope, customer problem, or technical initiative."}, "contribution": {"title": "Key Contribution & Ownership", "desc": "Describe the direct action you took, solutions created, or fixes delivered."}, "impact": {"title": "Measurable Business Result", "desc": "Explain the outcome, customer satisfaction, or efficiency achieved.", "metricVal1": "100%", "metricLbl1": "Success"}}, {"id": 7, "image": "https://images.unsplash.com/photo-1524522173746-f628baad3644?w=700&auto=format&fit=crop&q=80", "project": {"title": "Project / Task 8", "desc": "Describe the key project scope, customer problem, or technical initiative."}, "contribution": {"title": "Key Contribution & Ownership", "desc": "Describe the direct action you took, solutions created, or fixes delivered."}, "impact": {"title": "Measurable Business Result", "desc": "Explain the outcome, customer satisfaction, or efficiency achieved.", "metricVal1": "100%", "metricLbl1": "Success"}}], "contributions2": [{"id": 0, "tabLabel": "Telematics Sync", "tabIcon": "\\ud83d\\udef0\\ufe0f", "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80", "project": {"title": "Cross-Platform Telematics Sync", "desc": "Engineering high-throughput telemetry stream monitoring and synchronization across multi-vendor GPS hardware.", "tag": "IoT & Data Integrity \\u2022 High Precision"}, "contribution": {"title": "", "desc": "Architected real-time ingestion pipelines reconciling protocol discrepancies across 15+ IoT tracker models."}, "impact": {"title": "Data Reliability & Precision", "desc": "Achieved 99.9% telematics accuracy, eliminating GPS packet drops and enabling live fleet tracking at scale.", "metricVal1": "", "metricLbl1": "Telematics Accuracy"}}, {"id": 1, "tabLabel": "Incident Automation", "tabIcon": "\\u26a1", "image": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop&q=80", "project": {"title": "Automated Incident Escalation", "desc": "Developing smart triage triggers and escalation workflows to accelerate critical issue response times.", "tag": "Workflow Automation \\u2022 Operations"}, "contribution": {"title": "", "desc": "Built rule-based dispatch scripts connecting customer priority tickets directly with specialized engineering pods."}, "impact": {"title": "Swift MTTR Reduction", "desc": "Accelerated critical issue escalation by 35% and improved cross-departmental incident handoffs.", "metricVal1": "", "metricLbl1": "Faster Escalation"}}, {"id": 2, "tabLabel": "Client Onboarding", "tabIcon": "\\ud83c\\udf10", "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80", "project": {"title": "Global Client Onboarding Hub", "desc": "Guiding enterprise fleet operators through bespoke onboarding architectures, device configuration, and staff training.", "tag": "Partner Success \\u2022 Global Scale"}, "contribution": {"title": "", "desc": "Facilitated over 120 live migration sessions, configuring geofences, alerts, and analytics dashboards for new clients."}, "impact": {"title": "Accelerated Time-to-Value", "desc": "Onboarded 120+ commercial fleets smoothly with a 100% first-month retention milestone.", "metricVal1": "", "metricLbl1": "Fleets Onboarded"}}, {"id": 3, "tabLabel": "Quality Loop", "tabIcon": "\\ud83d\\udd04", "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80", "project": {"title": "Quality Assurance & Feedback Loop", "desc": "Establishing direct feedback loops connecting real-world user pain points with product sprint planning.", "tag": "Product Excellence \\u2022 Voice of Customer"}, "contribution": {"title": "", "desc": "Analyzed frontline feedback trends and authored monthly usability insight reports for the engineering team."}, "impact": {"title": "High First-Contact Resolution", "desc": "Helped drive first-contact fix rates to 98% and reduced repetitive feature-related inquiries.", "metricVal1": "", "metricLbl1": "First-Contact Fix"}}], "chamber2bCommonImage": "assets/images/chambers/creations_showcase_common.png", "chamber2bCommonTitle": "Innovation & Systems In Action", "chamber2bCommonDesc": "Real-time architecture, proactive incident workflows, and high-impact partner success.", "projects": [{"title": "Platform Core v4.0", "subtitle": "Flagship Telematics & Engine Architecture", "gauge1": "99.98%", "gauge2": "+42%", "desc": "Architected the high-throughput ingestion pipeline processing real-time vehicle coordinates and alerts with sub-50ms round-trip synchronization."}, {"title": "Design System 2.0", "subtitle": "Accessible Component Library", "gauge1": "50+", "gauge2": "3x", "desc": "Built a ground-up accessible enterprise UI system with dark/light themes, WCAG AA compliance, and rich spatial interaction primitives."}, {"title": "Workflow Automation Engine", "subtitle": "Intelligent Operations & Dispatch", "gauge1": "18h", "gauge2": "12k+", "desc": "Engineered automated dispatch reconciliation, eliminating manual spreadsheets and reducing error margins to practically zero."}, {"title": "150+ PRs Shipped", "subtitle": "Engineering Consistency & Velocity", "gauge1": "620+", "gauge2": "99.8%", "desc": "A full cycle of dependable delivery with thorough code reviews, zero regressions introduced in critical flows, and strong docs."}], "memories": [{"id": 1, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_1.png", "desc": "Stepping into the Uffizio family on Day 1 with excitement, high aspirations, and warm welcomes."}, {"id": 2, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_2.png", "desc": "Collaborative problem-solving, whiteboard brainstorms, and late-night pizza coding sessions."}, {"id": 3, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_3.png", "desc": "Unwinding outside the office with laughter, fun activities, and deep conversations."}, {"id": 4, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_4.png", "desc": "Standing ovations and high fives across the floor when the system went live seamlessly."}, {"id": 5, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_5.png", "desc": "Traditional attire, vibrant colors, sweets, and celebrating our rich diversity together."}, {"id": 6, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_6.png", "desc": "Looking back at an incredible year of personal evolution, achievements, and strong bonds."}, {"id": 7, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_7.png", "desc": "Raising a glass to unforgettable milestones and celebrating our journey ahead together."}, {"id": 8, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_8.png", "desc": "Engaging in thoughtful project reviews, sharing insights, and refining our strategy together."}, {"id": 9, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_9.png", "desc": "Analyzing data charts, collaborating across teams, and steering our next milestones forward."}], "memories2Mode": "uneven", "memories2CollageImage": "assets/images/memories/memories_collage_part2.png", "memories2": [{"id": 201, "title": "Office Celebrations", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Celebrations", "image": "assets/images/memories/memories_photo_1.png", "desc": "Celebrating shared victories, festive joy, and memorable workplace milestones."}, {"id": 202, "title": "Creative Collaboration", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Teamwork", "image": "assets/images/memories/memories_photo_2.png", "desc": "Collaborative problem-solving, whiteboard brainstorms, and cross-functional synergy."}, {"id": 203, "title": "Beyond The Workplace", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Moments", "image": "assets/images/memories/memories_photo_3.png", "desc": "Unwinding outside the office, travel adventures, and creating cherished memories."}, {"id": 204, "title": "Outdoor Strategy & Synergy", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Synergy", "image": "assets/images/memories/memories_photo_4.png", "desc": "Brainstorming amidst nature, sharing vision, and aligning our team goals under open skies."}, {"id": 205, "title": "Music & Park Retreat", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Wellness", "image": "assets/images/memories/memories_photo_5.png", "desc": "Relaxing in the park, recharging energy with favorite tunes, and enjoying peaceful downtime."}, {"id": 206, "title": "Riverside Conversations", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Friendship", "image": "assets/images/memories/memories_photo_6.png", "desc": "Heart-to-heart chats, shared laughter, and meaningful friendships forged along the way."}, {"id": 207, "title": "Cheers to Milestones", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Milestones", "image": "assets/images/memories/memories_photo_7.png", "desc": "Raising a glass with party hats, joyful laughs, and commemorating our year of accomplishments."}, {"id": 208, "title": "Team Alignment & Discussions", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Alignment", "image": "assets/images/memories/memories_photo_8.png", "desc": "Engaging in thoughtful project reviews, sharing insights, and refining our strategy together."}, {"id": 209, "title": "Sprint Planning & Analytics", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Planning", "image": "assets/images/memories/memories_photo_9.png", "desc": "Analyzing data charts, collaborating across teams, and steering our next milestones forward."}], "values": [{"id": 1, "title": "OWNERSHIP", "icon": "shield", "quote": "You step forward when something needs to be done.", "desc": "Taking autonomous initiative, closing loops, and owning outcomes from start to finish.", "badge": ""}, {"id": 2, "title": "LEARNING", "icon": "sprout", "quote": "You turn every challenge into an opportunity to improve.", "desc": "Embracing complex problems, mastering new systems, and turning feedback into growth.", "badge": ""}, {"id": 3, "title": "COLLABORATION", "icon": "users", "quote": "You grow by working with and supporting others.", "desc": "Lifting teammates, fostering trust, and driving cross-functional alignment across all teams.", "badge": ""}, {"id": 4, "title": "CUSTOMER FOCUS", "icon": "target", "quote": "You keep the people we serve at the centre of your work.", "desc": "Deep empathy for partner needs, swift resolution, and elevating customer experience.", "badge": ""}], "stickyNotes": [{"text": "Thank you for staying back and untangling that telemetry cluster bug! You're a true rockstar.", "author": "Priya S. \\u2022 Lead Architect", "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80", "color": "yellow"}, {"text": "The dedication you show to every client inspires the entire team. Proud to work alongside you!", "author": "Rahul D. \\u2022 Support Lead", "photo": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80", "color": "pink"}, {"text": "Best coffee partner and problem solver. Always ready with an elegant solution and a smile.", "author": "Ankit M. \\u2022 Fellow Teammate", "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80", "color": "mint"}, {"text": "Incredible growth from Day 1. You handled high-pressure situations like a veteran. Keep soaring!", "author": "Vikram R. \\u2022 Operations Director", "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80", "color": "sky"}], "chamberStories": {"ch1Title": "Where Your Journey Began", "ch1Sub": "The beginning of your journey", "ch2Title": "What You Learned", "ch2Sub": "The breakthrough moments, technical mastery, and skills forged through dedication.", "ch3Title": "What You Created", "ch3Sub": "The achievements shipped, architectures scaled, and client milestones delivered.", "ch4Title": "The People & Bonds", "ch4Sub": "Warm words, memories, and shared laughs with the team who walked with you.", "chValTitle": "The Values You Bring", "chValDesc": "The Values You Bring \\u2014 How Your Everyday Actions Define Our Culture", "ch6Wish": "To a year defined by bold initiatives, late-night breakthroughs, and continuous excellence. Happy 1st Work Anniversary!"}, "milestoneTier": "3yr"}`);
    window.BUILTIN_PROFILES["template"] = JSON.parse(`{"profileVersion": 6, "chambers": [{"id": "chamber-milestone", "type": "celebration", "navNum": "\\u2605", "navLabel": "Year One", "title": "Celebrating Your First Year With Uffizio", "sub": "With Uffizio", "canDelete": false, "enabled": true, "tabTarget": "tab-celebration"}, {"id": "chamber-0", "type": "timeline", "navNum": "01", "navLabel": "First Day", "title": "Where Your Journey Began", "sub": "The beginning of your journey", "canDelete": true, "enabled": true, "tabTarget": "tab-milestones"}, {"id": "chamber-1", "type": "skills", "navNum": "02", "navLabel": "Learned", "title": "The Evolution Of Growth", "sub": "The breakthrough moments, technical mastery, and skills forged through dedication.", "canDelete": true, "enabled": true, "tabTarget": "tab-skills"}, {"id": "chamber-2b", "type": "projects", "navNum": "03", "navLabel": "Created", "title": "Building Impact Through Innovation", "sub": "Expanding horizons, specialized solutions, and next-level contributions.", "canDelete": true, "enabled": true, "tabTarget": "tab-projects-2"}, {"id": "chamber-memories-2", "type": "memories", "navNum": "04", "navLabel": "Memories", "title": "Celebrating a Year of Memories", "sub": "More curated moments, team laughter, and workplace milestones.", "canDelete": true, "enabled": true, "tabTarget": "tab-memories-2"}, {"id": "chamber-values", "type": "values", "navNum": "05", "navLabel": "Values", "title": "The Values You Bring", "sub": "The Values You Bring \\u2014 How Your Everyday Actions Define Our Culture", "canDelete": true, "enabled": true, "tabTarget": "tab-values"}, {"id": "chamber-3", "type": "people", "navNum": "06", "navLabel": "People", "title": "The People Behind your Journey", "sub": "Warm words, memories, and shared laughs with the team who walked with you.", "canDelete": true, "enabled": true, "tabTarget": "tab-notes"}, {"id": "chamber-4", "type": "achievements", "navNum": "07", "navLabel": "Proud Moments", "title": "Moments That Made You Proud", "sub": "Milestones of recognition, awards, and breakthroughs celebrating your impact.", "canDelete": true, "enabled": true, "tabTarget": "tab-proud"}, {"id": "chamber-5", "type": "future", "navNum": "08", "navLabel": "The Future", "title": "My Vision for What\\u2019s Next", "sub": "Looking ahead to the next summits, vision, and growth with Uffizio.", "canDelete": true, "enabled": true, "tabTarget": "tab-future"}, {"id": "chamber-thankyou", "type": "thankyou", "navNum": "09", "navLabel": "Thank You", "title": "Thank You", "sub": "With Deepest Gratitude & Pride \\u2014 Honoring Your 1 Year Journey With Uffizio", "canDelete": true, "enabled": true, "tabTarget": "tab-thankyou"}], "doorWingLeft": "UFFIZIO", "doorWingRight": "2025 \\u2192 2026", "editorPasscode": "uffizio", "entrance": {"logo": "assets/images/branding/uffizio_logo_white.png", "title": "WELCOME TO YOUR JOURNEY", "subtitle": "WALK THROUGH YOUR YEAR \\u2022 2025 \\u2192 2026", "prompt": "Scroll Down or Click Door to Enter"}, "employee": {"name": "New Employee", "role": "Role / Designation", "date": "01 January 2025", "photo": "assets/images/profiles/dhara_profile.jpg", "years": "2025 \\u2192 2026"}, "celebration": {"title": "Celebrating Your First Year With Uffizio", "sub": "With Uffizio", "quote": "\\u201cOne year ago, a new chapter began. Today, we celebrate everything that made it meaningful.\\u201d"}, "milestones": [{"date": "01 September 2025", "title": "Joined Uffizio", "sub": "Customer Support Journey Begins"}, {"date": "March 2026", "title": "Successfully Completed Probation", "sub": "Confirmed Core Team Member"}, {"date": "01 September 2026", "title": "Completed 1 Year Journey", "sub": "1 Year of Impact & Excellence"}, {"date": "September 2026", "title": "Sr.Devloper", "sub": "Devloper journy began."}], "evolution": {"thenTitle": "Day 01 \\u2022 Starting Horizon", "thenPoints": [{"icon": "globe", "text": "Learning the environment"}, {"icon": "box", "text": "Understanding the product"}, {"icon": "compass", "text": "Getting familiar with the role"}], "growthLabel": "", "nowTitle": "Today", "nowPoints": [{"icon": "shield", "text": "More confidence", "colorClass": "highlight-gold"}, {"icon": "target", "text": "Better understanding", "colorClass": "highlight-cyan"}, {"icon": "crown", "text": "Greater ownership", "colorClass": "highlight-emerald"}]}, "thankYou": {"headerBadge": "\\u2728 HEARTFELT APPRECIATION \\u2022 1 YEAR MILESTONE \\u2728", "title": "Thank You!", "subtitle": "", "message": "Thank you for bringing your dedication, energy, and brilliant spirit to Uffizio every single day. Your presence strengthens our team, elevates our culture, and turns every challenge into an inspiring milestone. We are deeply proud of your growth and honored to walk this journey together.", "signature": "\\u2014 With heartfelt gratitude & best wishes, Team Uffizio \\ud83c\\udf1f", "actionBtn1": "\\ud83c\\udf89 Shower Confetti & Applause", "actionBtn2": "\\ud83d\\udcdc View Souvenir Card", "actionBtn3": "\\ud83c\\udfdb\\ufe0f Revisit Palace From Start", "badges": [{"icon": "star", "title": "365 Days of Excellence", "desc": "Dedication and resilience every single day"}, {"icon": "heart", "title": "Cherished Teammate", "desc": "Bringing warmth, trust, and team spirit"}, {"icon": "rocket", "title": "Limitless Horizons", "desc": "Ready to conquer the next summits together"}]}, "proud": {"plaqueTitle": "INNOVATOR OF THE YEAR", "plaqueSubtitle": "2025 - 2026 ANNUAL HONORS", "trophyImg": "assets/images/chambers/golden_trophy.png", "polaroids": [{"image": "assets/images/chambers/proud_polaroid_1.png", "caption": "v4.0 Launch Night! \\ud83d\\ude80"}, {"image": "assets/images/chambers/proud_polaroid_2.png", "caption": "Hackathon Runners-up \\ud83c\\udfc6"}, {"image": "assets/images/chambers/proud_polaroid_3.png", "caption": "All-Hands Demo Day \\ud83c\\udfa4"}], "celebrateTitle": "Celebrate This Milestone", "celebrateDesc": "Trigger the palace confetti cannon and commemorate your incredible achievements.", "celebrateBtn": "\\ud83c\\udf89 Fire Confetti!"}, "future": {"title": "My Vision for What's Next", "quoteText": "A goal without a plan is just a wish.", "quoteAuthor": "Antoine de Saint-Exup\\u00e9ry", "cards": [{"title": "What skills do you want to build?", "sub": "Share the skills or knowledge you want to develop to grow in your career."}, {"title": "What new challenges do you want to take on?", "sub": "Tell us about the kind of opportunities or responsibilities you would like to explore."}, {"title": "What impact do you want to create?", "sub": "How do you see yourself contributing more to your team and Uffizio?"}, {"title": "Where do you see yourself growing?", "sub": "Envision your long-term goals, milestones, and leadership journey ahead."}], "bottomQuote1": "Your journey doesn't end here.", "bottomQuote2": "It evolves with every step you take.", "btnSaveText": "Save My Vision"}, "skills": [{"title": "Knowledge", "desc": "Product & Architecture", "pct": 98, "icon": "\\ud83e\\udde0", "tag": "Product Mastery"}, {"title": "Communication", "desc": "Cross-Team Alignment", "pct": 95, "icon": "\\ud83d\\udcac", "tag": "Team Synergy"}, {"title": "Problem Solving", "desc": "First-Principles Triage", "pct": 96, "icon": "\\ud83e\\udde9", "tag": "Rapid Resolution"}, {"title": "Confidence", "desc": "Autonomous Ownership", "pct": 98, "icon": "\\ud83d\\udee1\\ufe0f", "tag": "High Autonomy"}], "contributions": [{"id": 0, "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&auto=format&fit=crop&q=80", "project": {"title": "Enterprise Support SLA 99.8%", "desc": "Delivering mission-critical technical support and rapid incident resolution for high-value enterprise fleet partners."}, "contribution": {"title": "Direct Triage & Swift Resolution", "desc": "Owned tier-1/tier-2 incident lifecycle, coordinated cross-functional engineering fixes, and established a sub-15m initial response rhythm."}, "impact": {"title": "Zero SLA Breaches & 99.8% CSAT", "desc": "Maintained an impeccable SLA track record throughout Year 1, earning stellar partner trust and high retention.", "metricVal1": "99.8%", "metricLbl1": "SLA Maintained"}}, {"id": 1, "image": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=700&auto=format&fit=crop&q=80", "project": {"title": "Standard Operating Procedures v2", "desc": "Standardizing complex vehicle tracking hardware diagnostics and telematics platform onboarding SOPs."}, "contribution": {"title": "Authoring 60+ Troubleshooting Guides", "desc": "Synthesized edge-case solutions into visual step-by-step documentation and conducted knowledge-transfer sessions."}, "impact": {"title": "65% Faster Team Ramp-Up", "desc": "Reduced support query escalation turnaround by 3x and accelerated training for all newly onboarding teammates.", "metricVal1": "60+", "metricLbl1": "Guides Authored"}}, {"id": 2, "image": "https://images.unsplash.com/photo-1524522173746-f628baad3644?w=700&auto=format&fit=crop&q=80", "project": {"title": "Proactive Fleet Anomaly Monitoring", "desc": "Early detection of sensor disconnections, device battery drain, and network latency before clients notice downtime."}, "contribution": {"title": "Preventative Diagnostics Routine", "desc": "Implemented daily automated health checks and conducted outreach calls to pre-emptively calibrate vehicle tracking units."}, "impact": {"title": "+48% Proactive Case Resolution", "desc": "Prevented hundreds of potential downtime hours and substantially elevated client confidence in platform stability.", "metricVal1": "150+", "metricLbl1": "Fleets Safeguarded"}}, {"id": 3, "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&auto=format&fit=crop&q=80", "project": {"title": "Year-Round Client Advocacy", "desc": "Serving as the trusted face and reassuring voice of Uffizio across 500+ complex customer touchpoints."}, "contribution": {"title": "Empathetic, End-to-End Ownership", "desc": "Turned frustrated users into brand champions through relentless follow-ups, patience, and clear technical communication."}, "impact": {"title": "500+ Smiles & 4.9\\u2605 Rating", "desc": "Directly strengthened client loyalty, earning praise from team leads, customers, and management alike.", "metricVal1": "500+", "metricLbl1": "Breakthroughs"}}, {"id": 4, "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&auto=format&fit=crop&q=80", "project": {"title": "Employee new  task", "desc": "Describe the key project scope, customer problem, or technical initiative."}, "contribution": {"title": "Good", "desc": "Describe the direct action you took, solutions created, or fixes delivered."}, "impact": {"title": "Measurable Business Result", "desc": "Explain the outcome, customer satisfaction, or efficiency achieved.", "metricVal1": "100%", "metricLbl1": "Success"}}, {"id": 5, "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&auto=format&fit=crop&q=80", "project": {"title": "Project / Task 6", "desc": "Describe the key project scope, customer problem, or technical initiative."}, "contribution": {"title": "Key Contribution & Ownership", "desc": "Describe the direct action you took, solutions created, or fixes delivered."}, "impact": {"title": "Measurable Business Result", "desc": "Explain the outcome, customer satisfaction, or efficiency achieved.", "metricVal1": "100%", "metricLbl1": "Success"}}, {"id": 6, "image": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=700&auto=format&fit=crop&q=80", "project": {"title": "Project / Task 7", "desc": "Describe the key project scope, customer problem, or technical initiative."}, "contribution": {"title": "Key Contribution & Ownership", "desc": "Describe the direct action you took, solutions created, or fixes delivered."}, "impact": {"title": "Measurable Business Result", "desc": "Explain the outcome, customer satisfaction, or efficiency achieved.", "metricVal1": "100%", "metricLbl1": "Success"}}, {"id": 7, "image": "https://images.unsplash.com/photo-1524522173746-f628baad3644?w=700&auto=format&fit=crop&q=80", "project": {"title": "Project / Task 8", "desc": "Describe the key project scope, customer problem, or technical initiative."}, "contribution": {"title": "Key Contribution & Ownership", "desc": "Describe the direct action you took, solutions created, or fixes delivered."}, "impact": {"title": "Measurable Business Result", "desc": "Explain the outcome, customer satisfaction, or efficiency achieved.", "metricVal1": "100%", "metricLbl1": "Success"}}], "contributions2": [{"id": 0, "tabLabel": "Telematics Sync", "tabIcon": "\\ud83d\\udef0\\ufe0f", "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80", "project": {"title": "Cross-Platform Telematics Sync", "desc": "Engineering high-throughput telemetry stream monitoring and synchronization across multi-vendor GPS hardware.", "tag": "IoT & Data Integrity \\u2022 High Precision"}, "contribution": {"title": "", "desc": "Architected real-time ingestion pipelines reconciling protocol discrepancies across 15+ IoT tracker models."}, "impact": {"title": "Data Reliability & Precision", "desc": "Achieved 99.9% telematics accuracy, eliminating GPS packet drops and enabling live fleet tracking at scale.", "metricVal1": "", "metricLbl1": "Telematics Accuracy"}}, {"id": 1, "tabLabel": "Incident Automation", "tabIcon": "\\u26a1", "image": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop&q=80", "project": {"title": "Automated Incident Escalation", "desc": "Developing smart triage triggers and escalation workflows to accelerate critical issue response times.", "tag": "Workflow Automation \\u2022 Operations"}, "contribution": {"title": "", "desc": "Built rule-based dispatch scripts connecting customer priority tickets directly with specialized engineering pods."}, "impact": {"title": "Swift MTTR Reduction", "desc": "Accelerated critical issue escalation by 35% and improved cross-departmental incident handoffs.", "metricVal1": "", "metricLbl1": "Faster Escalation"}}, {"id": 2, "tabLabel": "Client Onboarding", "tabIcon": "\\ud83c\\udf10", "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80", "project": {"title": "Global Client Onboarding Hub", "desc": "Guiding enterprise fleet operators through bespoke onboarding architectures, device configuration, and staff training.", "tag": "Partner Success \\u2022 Global Scale"}, "contribution": {"title": "", "desc": "Facilitated over 120 live migration sessions, configuring geofences, alerts, and analytics dashboards for new clients."}, "impact": {"title": "Accelerated Time-to-Value", "desc": "Onboarded 120+ commercial fleets smoothly with a 100% first-month retention milestone.", "metricVal1": "", "metricLbl1": "Fleets Onboarded"}}, {"id": 3, "tabLabel": "Quality Loop", "tabIcon": "\\ud83d\\udd04", "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80", "project": {"title": "Quality Assurance & Feedback Loop", "desc": "Establishing direct feedback loops connecting real-world user pain points with product sprint planning.", "tag": "Product Excellence \\u2022 Voice of Customer"}, "contribution": {"title": "", "desc": "Analyzed frontline feedback trends and authored monthly usability insight reports for the engineering team."}, "impact": {"title": "High First-Contact Resolution", "desc": "Helped drive first-contact fix rates to 98% and reduced repetitive feature-related inquiries.", "metricVal1": "", "metricLbl1": "First-Contact Fix"}}], "chamber2bCommonImage": "assets/images/chambers/creations_showcase_common.png", "chamber2bCommonTitle": "Innovation & Systems In Action", "chamber2bCommonDesc": "Real-time architecture, proactive incident workflows, and high-impact partner success.", "projects": [{"title": "Platform Core v4.0", "subtitle": "Flagship Telematics & Engine Architecture", "gauge1": "99.98%", "gauge2": "+42%", "desc": "Architected the high-throughput ingestion pipeline processing real-time vehicle coordinates and alerts with sub-50ms round-trip synchronization."}, {"title": "Design System 2.0", "subtitle": "Accessible Component Library", "gauge1": "50+", "gauge2": "3x", "desc": "Built a ground-up accessible enterprise UI system with dark/light themes, WCAG AA compliance, and rich spatial interaction primitives."}, {"title": "Workflow Automation Engine", "subtitle": "Intelligent Operations & Dispatch", "gauge1": "18h", "gauge2": "12k+", "desc": "Engineered automated dispatch reconciliation, eliminating manual spreadsheets and reducing error margins to practically zero."}, {"title": "150+ PRs Shipped", "subtitle": "Engineering Consistency & Velocity", "gauge1": "620+", "gauge2": "99.8%", "desc": "A full cycle of dependable delivery with thorough code reviews, zero regressions introduced in critical flows, and strong docs."}], "memories": [{"id": 1, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_1.png", "desc": "Stepping into the Uffizio family on Day 1 with excitement, high aspirations, and warm welcomes."}, {"id": 2, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_2.png", "desc": "Collaborative problem-solving, whiteboard brainstorms, and late-night pizza coding sessions."}, {"id": 3, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_3.png", "desc": "Unwinding outside the office with laughter, fun activities, and deep conversations."}, {"id": 4, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_4.png", "desc": "Standing ovations and high fives across the floor when the system went live seamlessly."}, {"id": 5, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_5.png", "desc": "Traditional attire, vibrant colors, sweets, and celebrating our rich diversity together."}, {"id": 6, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_6.png", "desc": "Looking back at an incredible year of personal evolution, achievements, and strong bonds."}, {"id": 7, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_7.png", "desc": "Raising a glass to unforgettable milestones and celebrating our journey ahead together."}, {"id": 8, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_8.png", "desc": "Engaging in thoughtful project reviews, sharing insights, and refining our strategy together."}, {"id": 9, "title": "", "date": "", "tag": "", "image": "assets/images/memories/memories_photo_9.png", "desc": "Analyzing data charts, collaborating across teams, and steering our next milestones forward."}], "memories2Mode": "uneven", "memories2CollageImage": "assets/images/memories/memories_collage_part2.png", "memories2": [{"id": 201, "title": "Office Celebrations", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Celebrations", "image": "assets/images/memories/memories_photo_1.png", "desc": "Celebrating shared victories, festive joy, and memorable workplace milestones."}, {"id": 202, "title": "Creative Collaboration", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Teamwork", "image": "assets/images/memories/memories_photo_2.png", "desc": "Collaborative problem-solving, whiteboard brainstorms, and cross-functional synergy."}, {"id": 203, "title": "Beyond The Workplace", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Moments", "image": "assets/images/memories/memories_photo_3.png", "desc": "Unwinding outside the office, travel adventures, and creating cherished memories."}, {"id": 204, "title": "Outdoor Strategy & Synergy", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Synergy", "image": "assets/images/memories/memories_photo_4.png", "desc": "Brainstorming amidst nature, sharing vision, and aligning our team goals under open skies."}, {"id": 205, "title": "Music & Park Retreat", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Wellness", "image": "assets/images/memories/memories_photo_5.png", "desc": "Relaxing in the park, recharging energy with favorite tunes, and enjoying peaceful downtime."}, {"id": 206, "title": "Riverside Conversations", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Friendship", "image": "assets/images/memories/memories_photo_6.png", "desc": "Heart-to-heart chats, shared laughter, and meaningful friendships forged along the way."}, {"id": 207, "title": "Cheers to Milestones", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Milestones", "image": "assets/images/memories/memories_photo_7.png", "desc": "Raising a glass with party hats, joyful laughs, and commemorating our year of accomplishments."}, {"id": 208, "title": "Team Alignment & Discussions", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Alignment", "image": "assets/images/memories/memories_photo_8.png", "desc": "Engaging in thoughtful project reviews, sharing insights, and refining our strategy together."}, {"id": 209, "title": "Sprint Planning & Analytics", "date": "2025 \\u2192 2026", "tag": "\\ud83d\\udcf8 Planning", "image": "assets/images/memories/memories_photo_9.png", "desc": "Analyzing data charts, collaborating across teams, and steering our next milestones forward."}], "values": [{"id": 1, "title": "OWNERSHIP", "icon": "shield", "quote": "You step forward when something needs to be done.", "desc": "Taking autonomous initiative, closing loops, and owning outcomes from start to finish.", "badge": ""}, {"id": 2, "title": "LEARNING", "icon": "sprout", "quote": "You turn every challenge into an opportunity to improve.", "desc": "Embracing complex problems, mastering new systems, and turning feedback into growth.", "badge": ""}, {"id": 3, "title": "COLLABORATION", "icon": "users", "quote": "You grow by working with and supporting others.", "desc": "Lifting teammates, fostering trust, and driving cross-functional alignment across all teams.", "badge": ""}, {"id": 4, "title": "CUSTOMER FOCUS", "icon": "target", "quote": "You keep the people we serve at the centre of your work.", "desc": "Deep empathy for partner needs, swift resolution, and elevating customer experience.", "badge": ""}], "stickyNotes": [{"text": "Thank you for staying back and untangling that telemetry cluster bug! You're a true rockstar.", "author": "Priya S. \\u2022 Lead Architect", "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80", "color": "yellow"}, {"text": "The dedication you show to every client inspires the entire team. Proud to work alongside you!", "author": "Rahul D. \\u2022 Support Lead", "photo": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80", "color": "pink"}, {"text": "Best coffee partner and problem solver. Always ready with an elegant solution and a smile.", "author": "Ankit M. \\u2022 Fellow Teammate", "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80", "color": "mint"}, {"text": "Incredible growth from Day 1. You handled high-pressure situations like a veteran. Keep soaring!", "author": "Vikram R. \\u2022 Operations Director", "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80", "color": "sky"}], "chamberStories": {"ch1Title": "Where Your Journey Began", "ch1Sub": "The beginning of your journey", "ch2Title": "What You Learned", "ch2Sub": "The breakthrough moments, technical mastery, and skills forged through dedication.", "ch3Title": "What You Created", "ch3Sub": "The achievements shipped, architectures scaled, and client milestones delivered.", "ch4Title": "The People & Bonds", "ch4Sub": "Warm words, memories, and shared laughs with the team who walked with you.", "chValTitle": "The Values You Bring", "chValDesc": "The Values You Bring \\u2014 How Your Everyday Actions Define Our Culture", "ch6Wish": "To a year defined by bold initiatives, late-night breakthroughs, and continuous excellence. Happy 1st Work Anniversary!"}, "milestoneTier": "1yr"}`);

    // Multi-Profile URL Parameter & Storage Key Isolation
    const _urlParams = new URLSearchParams(window.location.search);
    let currentEmpSlug = (_urlParams.get('emp') || _urlParams.get('id') || _urlParams.get('profile') || '').toLowerCase().trim();

    function getStorageKeyForProfile(slug) {
      const s = (slug || '').toLowerCase().trim();
      if (!s) return 'palace_full_profile';
      return 'palace_profile_' + s;
    }

    function saveToIndexedDB(state, specificSlug) {
      const targetSlug = specificSlug !== undefined ? specificSlug : currentEmpSlug;
      openPalaceDB().then(db => {
        if (!db) return;
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const idbKey = targetSlug ? ('profile_' + targetSlug) : 'full_profile';
          store.put({ key: idbKey, data: JSON.parse(JSON.stringify(state)) });
        } catch (e) {
          console.warn('IndexedDB save error:', e);
        }
      });
    }

    function loadFromIndexedDB(specificSlug) {
      const targetSlug = specificSlug !== undefined ? specificSlug : currentEmpSlug;
      return openPalaceDB().then(db => {
        if (!db) return null;
        return new Promise((resolve) => {
          try {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const idbKey = targetSlug ? ('profile_' + targetSlug) : 'full_profile';
            const req = store.get(idbKey);
            req.onsuccess = () => resolve(req.result ? req.result.data : null);
            req.onerror = () => resolve(null);
          } catch (e) {
            resolve(null);
          }
        });
      });
    }

    function persistPalaceState() {
      const activeSlug = (currentEmpSlug || 'dhara').toLowerCase().trim();
      const key = getStorageKeyForProfile(currentEmpSlug);
      palaceState.profileVersion = Math.max(palaceState.profileVersion || 7, 7);
      try {
        const stateStr = JSON.stringify(palaceState);
        localStorage.setItem(key, stateStr);
        if (!currentEmpSlug || currentEmpSlug === 'dhara') {
          localStorage.setItem('palace_full_profile', stateStr);
          localStorage.setItem('palace_profile_dhara', stateStr);
        }
      } catch (e) {
        console.warn("Storage quota exceeded in localStorage, relying on IndexedDB", e);
      }
      saveToIndexedDB(palaceState);
      if (!currentEmpSlug || currentEmpSlug === 'dhara') {
        saveToIndexedDB(palaceState, 'dhara');
        saveToIndexedDB(palaceState, '');
      }
      if (window.BUILTIN_PROFILES) {
        window.BUILTIN_PROFILES[activeSlug] = JSON.parse(JSON.stringify(palaceState));
        if (!currentEmpSlug || currentEmpSlug === 'dhara') {
          window.BUILTIN_PROFILES['dhara'] = JSON.parse(JSON.stringify(palaceState));
        }
      }
    }

    // ==========================================================================
    // LZSTRING COMPRESSION ENGINE (URL-Safe State Payload for Zero-Server Sharing)
    // ==========================================================================
    const LZString = (function() {
      const f = String.fromCharCode;
      const keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
      const baseReverseDic = {};
      function getBaseValue(alphabet, character) {
        if (!baseReverseDic[alphabet]) {
          baseReverseDic[alphabet] = {};
          for (let i = 0; i < alphabet.length; i++) baseReverseDic[alphabet][alphabet.charAt(i)] = i;
        }
        return baseReverseDic[alphabet][character];
      }

      const LZString = {
        compressToEncodedURIComponent: function (input) {
          if (input == null) return "";
          return LZString._compress(input, 6, function(a){return keyStrUriSafe.charAt(a);});
        },
        decompressFromEncodedURIComponent: function (input) {
          if (input == null) return "";
          if (input === "") return null;
          input = input.replace(/ /g, "+");
          return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
        },
        _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
          if (uncompressed == null) return "";
          let i, value,
              context_dictionary = {},
              context_dictionaryToCreate = {},
              context_c = "",
              context_wc = "",
              context_w = "",
              context_enlargeIn = 2,
              context_dictSize = 3,
              context_numBits = 2,
              context_data = [],
              context_data_val = 0,
              context_data_position = 0,
              ii;

          for (ii = 0; ii < uncompressed.length; ii += 1) {
            context_c = uncompressed.charAt(ii);
            if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
              context_dictionary[context_c] = context_dictSize++;
              context_dictionaryToCreate[context_c] = true;
            }

            context_wc = context_w + context_c;
            if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
              context_w = context_wc;
            } else {
              if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                if (context_w.charCodeAt(0) < 256) {
                  for (i = 0; i < context_numBits; i++) {
                    context_data_val = (context_data_val << 1);
                    if (context_data_position === bitsPerChar - 1) {
                      context_data_position = 0;
                      context_data.push(getCharFromInt(context_data_val));
                      context_data_val = 0;
                    } else {
                      context_data_position++;
                    }
                  }
                  value = context_w.charCodeAt(0);
                  for (i = 0; i < 8; i++) {
                    context_data_val = (context_data_val << 1) | (value & 1);
                    if (context_data_position === bitsPerChar - 1) {
                      context_data_position = 0;
                      context_data.push(getCharFromInt(context_data_val));
                      context_data_val = 0;
                    } else {
                      context_data_position++;
                    }
                    value = value >> 1;
                  }
                } else {
                  value = 1;
                  for (i = 0; i < context_numBits; i++) {
                    context_data_val = (context_data_val << 1) | value;
                    if (context_data_position === bitsPerChar - 1) {
                      context_data_position = 0;
                      context_data.push(getCharFromInt(context_data_val));
                      context_data_val = 0;
                    } else {
                      context_data_position++;
                    }
                    value = 0;
                  }
                  value = context_w.charCodeAt(0);
                  for (i = 0; i < 16; i++) {
                    context_data_val = (context_data_val << 1) | (value & 1);
                    if (context_data_position === bitsPerChar - 1) {
                      context_data_position = 0;
                      context_data.push(getCharFromInt(context_data_val));
                      context_data_val = 0;
                    } else {
                      context_data_position++;
                    }
                    value = value >> 1;
                  }
                }
                context_enlargeIn--;
                if (context_enlargeIn === 0) {
                  context_enlargeIn = Math.pow(2, context_numBits);
                  context_numBits++;
                }
                delete context_dictionaryToCreate[context_w];
              } else {
                value = context_dictionary[context_w];
                for (i = 0; i < context_numBits; i++) {
                  context_data_val = (context_data_val << 1) | (value & 1);
                  if (context_data_position === bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = value >> 1;
                }
              }
              context_enlargeIn--;
              if (context_enlargeIn === 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
              }
              context_dictionary[context_wc] = context_dictSize++;
              context_w = String(context_c);
            }
          }

          if (context_w !== "") {
            if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
              if (context_w.charCodeAt(0) < 256) {
                for (i = 0; i < context_numBits; i++) {
                  context_data_val = (context_data_val << 1);
                  if (context_data_position === bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                }
                value = context_w.charCodeAt(0);
                for (i = 0; i < 8; i++) {
                  context_data_val = (context_data_val << 1) | (value & 1);
                  if (context_data_position === bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = value >> 1;
                }
              } else {
                value = 1;
                for (i = 0; i < context_numBits; i++) {
                  context_data_val = (context_data_val << 1) | value;
                  if (context_data_position === bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = 0;
                }
                value = context_w.charCodeAt(0);
                for (i = 0; i < 16; i++) {
                  context_data_val = (context_data_val << 1) | (value & 1);
                  if (context_data_position === bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = value >> 1;
                }
              }
              context_enlargeIn--;
              if (context_enlargeIn === 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
              }
              delete context_dictionaryToCreate[context_w];
            } else {
              value = context_dictionary[context_w];
              for (i = 0; i < context_numBits; i++) {
                context_data_val = (context_data_val << 1) | (value & 1);
                if (context_data_position === bitsPerChar - 1) {
                  context_data_position = 0;
                  context_data.push(getCharFromInt(context_data_val));
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
                value = value >> 1;
              }
            }
            context_enlargeIn--;
            if (context_enlargeIn === 0) {
              context_enlargeIn = Math.pow(2, context_numBits);
              context_numBits++;
            }
          }

          value = 2;
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position === bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }

          while (true) {
            context_data_val = (context_data_val << 1);
            if (context_data_position === bitsPerChar - 1) {
              context_data.push(getCharFromInt(context_data_val));
              break;
            } else {
              context_data_position++;
            }
          }
          return context_data.join('');
        },

        _decompress: function (length, resetValue, getNextValue) {
          let dictionary = [],
              next,
              enlargeIn = 4,
              dictSize = 4,
              numBits = 3,
              entry = "",
              result = [],
              i,
              w,
              bits, resb, maxpower, power,
              c,
              data = { val: getNextValue(0), position: resetValue, index: 1 };

          for (i = 0; i < 3; i += 1) dictionary[i] = i;

          bits = 0;
          maxpower = Math.pow(2, 2);
          power = 1;
          while (power !== maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position === 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }

          switch (next = bits) {
            case 0:
              bits = 0;
              maxpower = Math.pow(2, 8);
              power = 1;
              while (power !== maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position === 0) {
                  data.position = resetValue;
                  data.val = getNextValue(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
              }
              c = f(bits);
              break;
            case 1:
              bits = 0;
              maxpower = Math.pow(2, 16);
              power = 1;
              while (power !== maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position === 0) {
                  data.position = resetValue;
                  data.val = getNextValue(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
              }
              c = f(bits);
              break;
            case 2:
              return "";
          }
          dictionary[3] = c;
          w = c;
          result.push(c);
          while (true) {
            if (data.index > length) return "";

            bits = 0;
            maxpower = Math.pow(2, numBits);
            power = 1;
            while (power !== maxpower) {
              resb = data.val & data.position;
              data.position >>= 1;
              if (data.position === 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
              }
              bits |= (resb > 0 ? 1 : 0) * power;
              power <<= 1;
            }

            switch (c = bits) {
              case 0:
                bits = 0;
                maxpower = Math.pow(2, 8);
                power = 1;
                while (power !== maxpower) {
                  resb = data.val & data.position;
                  data.position >>= 1;
                  if (data.position === 0) {
                    data.position = resetValue;
                    data.val = getNextValue(data.index++);
                  }
                  bits |= (resb > 0 ? 1 : 0) * power;
                  power <<= 1;
                }
                dictionary[dictSize++] = f(bits);
                c = dictSize - 1;
                enlargeIn--;
                break;
              case 1:
                bits = 0;
                maxpower = Math.pow(2, 16);
                power = 1;
                while (power !== maxpower) {
                  resb = data.val & data.position;
                  data.position >>= 1;
                  if (data.position === 0) {
                    data.position = resetValue;
                    data.val = getNextValue(data.index++);
                  }
                  bits |= (resb > 0 ? 1 : 0) * power;
                  power <<= 1;
                }
                dictionary[dictSize++] = f(bits);
                c = dictSize - 1;
                enlargeIn--;
                break;
              case 2:
                return result.join('');
            }

            if (enlargeIn === 0) {
              enlargeIn = Math.pow(2, numBits);
              numBits++;
            }

            if (dictionary[c]) {
              entry = dictionary[c];
            } else {
              if (c === dictSize) {
                entry = w + w.charAt(0);
              } else {
                return null;
              }
            }
            result.push(entry);

            dictionary[dictSize++] = w + entry.charAt(0);
            enlargeIn--;

            w = entry;

            if (enlargeIn === 0) {
              enlargeIn = Math.pow(2, numBits);
              numBits++;
            }
          }
        }
      };
      return LZString;
    })();

    function compressStateToHash(state) {
      try {
        const clone = JSON.parse(JSON.stringify(state));
        delete clone.isStandalone;
        delete clone.defaultAccessMode;
        if (clone.chambers && Array.isArray(clone.chambers)) {
          clone.chambers = clone.chambers.map(c => ({
            id: c.id,
            enabled: c.enabled,
            title: c.title,
            sub: c.sub,
            navLabel: c.navLabel
          }));
        }
        const jsonStr = JSON.stringify(clone);
        if (typeof LZString !== 'undefined') {
          return LZString.compressToEncodedURIComponent(jsonStr);
        }
        return btoa(unescape(encodeURIComponent(jsonStr)));
      } catch (e) {
        console.warn("State compression failed", e);
        return "";
      }
    }

    function decompressStateFromHash(hashStr) {
      if (!hashStr) return null;
      try {
        if (typeof LZString !== 'undefined') {
          const decomp = LZString.decompressFromEncodedURIComponent(hashStr);
          if (decomp) return JSON.parse(decomp);
        }
      } catch (e) {}
      try {
        const jsonStr = decodeURIComponent(escape(atob(hashStr)));
        return JSON.parse(jsonStr);
      } catch (e) {
        console.warn("State decompression failed", e);
        return null;
      }
    }
    
    // 0. Load Embedded Palace State safely if baked directly into the HTML file
    try {
      const embeddedStateEl = document.getElementById('initialPalaceState');
      const embeddedText = embeddedStateEl ? (embeddedStateEl.textContent || embeddedStateEl.innerText || "").trim() : "";
      if (embeddedText) {
        const embedded = JSON.parse(embeddedText);
        if (embedded && typeof embedded === 'object') {
          Object.keys(embedded).forEach(k => {
            if (embedded[k] !== undefined && embedded[k] !== null) {
              if (typeof embedded[k] === 'object' && !Array.isArray(embedded[k])) {
                palaceState[k] = { ...palaceState[k], ...embedded[k] };
              } else {
                palaceState[k] = embedded[k];
              }
            }
          });
          console.log("Loaded embedded palace state from HTML file!");
        }
      }
    } catch (e) {
      console.warn("Failed to parse embedded initialPalaceState", e);
    }
    // 0. Check if URL hash has embedded #data= payload (e.g. from shared view link)
    try {
      if (typeof window !== 'undefined' && window.location && window.location.hash && window.location.hash.includes('data=')) {
        const hashParts = window.location.hash.split('data=');
        if (hashParts[1]) {
          const rawPayload = hashParts[1].split('&')[0];
          const decoded = decompressStateFromHash(rawPayload);
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
            palaceState.hasUrlData = true;
            palaceState.defaultAccessMode = 'view';
            try {
              const activeStorageKey = getStorageKeyForProfile(currentEmpSlug);
              localStorage.setItem(activeStorageKey || 'palace_full_profile', JSON.stringify(palaceState));
            } catch (e) {}
            console.log("Successfully loaded customized journey from URL hash payload!");
          }
        }
      }
    } catch(e) {
      console.warn("Early URL hash payload parsing error", e);
    }

    // Load from localStorage if present (only when not in baked view-only mode from an exported presentation)
    const activeStorageKey = getStorageKeyForProfile(currentEmpSlug);
    let savedFullProfile = localStorage.getItem(activeStorageKey);
    if (!savedFullProfile && (!currentEmpSlug || currentEmpSlug === 'dhara')) {
      savedFullProfile = localStorage.getItem('palace_full_profile') || localStorage.getItem('palace_profile_dhara');
    }
    const _reqAccess = _urlParams.get('access') || _urlParams.get('mode');
    if (savedFullProfile && !palaceState.isStandalone) {
      try {
        const parsed = JSON.parse(savedFullProfile);
        if (parsed && typeof parsed === 'object') {
          if (parsed.employee) {
            if (parsed.employee.name === 'Manushi Patel') parsed.employee.name = 'Dhara Patel';
            palaceState.employee = { ...palaceState.employee, ...parsed.employee };
          }
          if (parsed.celebration) palaceState.celebration = { ...palaceState.celebration, ...parsed.celebration };
          if (parsed.milestones) palaceState.milestones = parsed.milestones;
          if (parsed.evolution) {
            if (parsed.evolution.nowTitle === 'Year 01' || parsed.evolution.nowTitle === 'Year 01 • Proven Mastery') {
              parsed.evolution.nowTitle = 'Today';
            }
            parsed.evolution.growthLabel = '';
            palaceState.evolution = parsed.evolution;
          }
          if (parsed.entrance) {
            if (parsed.entrance.title === "Digital Memory Palace") {
              parsed.entrance.title = "WELCOME TO YOUR JOURNEY";
            }
            palaceState.entrance = { ...palaceState.entrance, ...parsed.entrance };
          }
          if (parsed.skills) palaceState.skills = parsed.skills;
          if (parsed.projects) palaceState.projects = parsed.projects;
          if (parsed.contributions) palaceState.contributions = parsed.contributions;
          if (parsed.contributions2) palaceState.contributions2 = parsed.contributions2;
          if (parsed.stickyNotes && Array.isArray(parsed.stickyNotes)) {
            const defaultPhotos = [
              "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80"
            ];
            palaceState.stickyNotes = parsed.stickyNotes.map((note, idx) => ({
              ...note,
              photo: note.photo || defaultPhotos[idx % defaultPhotos.length]
            }));
          }
          if (parsed.memories && Array.isArray(parsed.memories) && parsed.memories.length > 0) {
            palaceState.memories = parsed.memories;
          }
          if (parsed.memories2Mode) {
            palaceState.memories2Mode = parsed.memories2Mode;
          }
          if (parsed.memories2CollageImage) {
            palaceState.memories2CollageImage = parsed.memories2CollageImage === 'assets/images/memories/memories_collage_part2.jpg' ? 'assets/images/memories/memories_collage_part2.png' : parsed.memories2CollageImage;
          }
          if (parsed.memories2 && Array.isArray(parsed.memories2) && parsed.memories2.length > 0) {
            palaceState.memories2 = parsed.memories2;
            if (!palaceState.memories2CollageImage && parsed.memories2[0] && parsed.memories2[0].image) {
              palaceState.memories2CollageImage = parsed.memories2[0].image;
            }
          }
          if (parsed.values && Array.isArray(parsed.values) && parsed.values.length > 0) {
            palaceState.values = parsed.values;
          }
          if (parsed.proud) {
            palaceState.proud = { ...palaceState.proud, ...parsed.proud };
          }
          if (parsed.future) {
            palaceState.future = { ...palaceState.future, ...parsed.future };
          }
          if (parsed.thankYou) {
            palaceState.thankYou = { ...palaceState.thankYou, ...parsed.thankYou };
          }
          if (parsed.milestoneTier) {
            palaceState.milestoneTier = parsed.milestoneTier;
          }
          if (parsed.chamberStories) {
            palaceState.chamberStories = { ...palaceState.chamberStories, ...parsed.chamberStories };
          }
          if (parsed.doorWingLeft) palaceState.doorWingLeft = parsed.doorWingLeft;
          if (parsed.doorWingRight) palaceState.doorWingRight = parsed.doorWingRight;
          if (parsed.editorPasscode) palaceState.editorPasscode = parsed.editorPasscode;
          if (parsed.chamber2bCommonImage) palaceState.chamber2bCommonImage = parsed.chamber2bCommonImage;
          if (parsed.chamber2bCommonTitle) palaceState.chamber2bCommonTitle = parsed.chamber2bCommonTitle;
          if (parsed.chamber2bCommonDesc) palaceState.chamber2bCommonDesc = parsed.chamber2bCommonDesc;
          if (parsed.chambers && Array.isArray(parsed.chambers) && parsed.chambers.length > 0) {
            palaceState.chambers = parsed.chambers.filter(c => c.id !== 'chamber-2' && c.id !== 'chamber-memories');
            palaceState.chambers.forEach(c => {
              if (c.id === 'chamber-2b' && (c.navLabel === 'Created II' || !c.navLabel)) c.navLabel = 'Created';
              if (c.id === 'chamber-memories-2' && (c.navLabel === 'Memories II' || !c.navLabel)) c.navLabel = 'Memories';
            });
          }
          palaceState.profileVersion = Math.max(parsed.profileVersion || 7, palaceState.profileVersion || 7);
          if (window.BUILTIN_PROFILES) {
            window.BUILTIN_PROFILES[currentEmpSlug || 'dhara'] = JSON.parse(JSON.stringify(palaceState));
            window.BUILTIN_PROFILES['dhara'] = JSON.parse(JSON.stringify(palaceState));
          }
        }
      } catch(e) {
        console.warn("Could not parse saved palace profile", e);
      }
    }

    // Secondary restore from IndexedDB if localStorage was cleared or limited
    loadFromIndexedDB().then(idbData => {
      if (!idbData) return;
      if (!savedFullProfile) {
        if (idbData.memories && Array.isArray(idbData.memories) && idbData.memories.length > 0) {
          palaceState.memories = idbData.memories;
          renderMemories();
        }
        if (idbData.memories2Mode) {
          palaceState.memories2Mode = idbData.memories2Mode;
        }
        if (idbData.memories2CollageImage) {
          palaceState.memories2CollageImage = idbData.memories2CollageImage === 'assets/images/memories/memories_collage_part2.jpg' ? 'assets/images/memories/memories_collage_part2.png' : idbData.memories2CollageImage;
        }
        if (idbData.memories2 && Array.isArray(idbData.memories2) && idbData.memories2.length > 0) {
          palaceState.memories2 = idbData.memories2;
          if (!palaceState.memories2CollageImage && idbData.memories2[0] && idbData.memories2[0].image) {
            palaceState.memories2CollageImage = idbData.memories2[0].image;
          }
        }
        renderMemories2();
        if (idbData.values && Array.isArray(idbData.values) && idbData.values.length > 0) {
          if (!palaceState.values || palaceState.values.length === 0) {
            palaceState.values = idbData.values;
            if (typeof renderValuesRoom === 'function') renderValuesRoom();
          }
        }
        if (idbData.proud) {
          palaceState.proud = { ...palaceState.proud, ...idbData.proud };
          if (typeof renderProudRoom === 'function') renderProudRoom();
        }
        if (idbData.future) {
          palaceState.future = { ...palaceState.future, ...idbData.future };
          if (typeof renderFutureRoom === 'function') renderFutureRoom();
        }
        if (idbData.chambers && Array.isArray(idbData.chambers) && idbData.chambers.length > 0) {
          palaceState.chambers = idbData.chambers.filter(c => c.id !== 'chamber-2' && c.id !== 'chamber-memories');
          palaceState.chambers.forEach(c => {
            if (c.id === 'chamber-2b' && (c.navLabel === 'Created II' || !c.navLabel)) c.navLabel = 'Created';
            if (c.id === 'chamber-memories-2' && (c.navLabel === 'Memories II' || !c.navLabel)) c.navLabel = 'Memories';
          });
          syncPalaceNavigation();
          if (typeof renderAdminRoomsManager === 'function') renderAdminRoomsManager();
        }
      } else {
        // savedFullProfile exists in localStorage (primary source of truth)
        // Only recover base64 images that might have exceeded localStorage quota:
        if (idbData.memories && Array.isArray(idbData.memories) && palaceState.memories) {
          let restoredAny = false;
          idbData.memories.forEach((m, idx) => {
            if (palaceState.memories[idx] && !palaceState.memories[idx].image && m.image) {
              palaceState.memories[idx].image = m.image;
              restoredAny = true;
            }
          });
          if (restoredAny) renderMemories();
        }
        if (idbData.memories2 && Array.isArray(idbData.memories2) && palaceState.memories2) {
          let restoredAny2 = false;
          idbData.memories2.forEach((m, idx) => {
            if (palaceState.memories2[idx] && !palaceState.memories2[idx].image && m.image) {
              palaceState.memories2[idx].image = m.image;
              restoredAny2 = true;
            }
          });
          if (restoredAny2) renderMemories2();
        }
      }
    });


    // ==========================================================================
    // MULTI-EMPLOYEE PROFILE ENGINE: DYNAMIC JSON FETCHER & STATE SYNC
    // ==========================================================================

    // Apply Milestone Anniversary Theme Tier
    function applyThemeTier(tier) {
      const activeTier = tier || (palaceState && palaceState.milestoneTier) || '1yr';
      document.body.classList.remove('theme-tier-1yr', 'theme-tier-3yr', 'theme-tier-5yr', 'theme-tier-10yr', 'theme-tier-15yr', 'theme-tier-20yr');
      if (activeTier && activeTier !== '1yr') {
        document.body.classList.add(`theme-tier-${activeTier}`);
      }
    }

    function getBuiltinProfilesList() {
      return [
        { slug: 'dhara', name: 'Dhara Patel', isBuiltin: true },
        { slug: 'rahul', name: 'Rahul Sharma', isBuiltin: true }
      ];
    }

    function getCustomProfilesList() {
      try {
        const raw = localStorage.getItem('palace_custom_profiles_registry');
        return raw ? JSON.parse(raw) : [];
      } catch(e) {
        return [];
      }
    }

    async function getAllProfilesList() {
      const map = new Map();
      getBuiltinProfilesList().forEach(p => map.set(p.slug, { ...p }));

      try {
        const resp = await fetch(`profiles/index.json?v=${Date.now()}`);
        if (resp.ok) {
          const list = await resp.json();
          if (Array.isArray(list)) {
            list.forEach(item => {
              const s = item.slug || item.id;
              if (s) map.set(s, { slug: s, name: item.name || s, isBuiltin: true });
            });
          }
        }
      } catch(e) {}

      getCustomProfilesList().forEach(p => {
        if (p.slug) {
          map.set(p.slug, { slug: p.slug, name: p.name || p.slug, isBuiltin: false, tier: p.tier, role: p.role });
        }
      });

      return Array.from(map.values());
    }

    async function getProfileData(slug) {
      const s = (slug || 'dhara').toLowerCase().trim();
      const localKey = getStorageKeyForProfile(s);

      // 1. Check localStorage across all possible profile keys
      try {
        let cached = localStorage.getItem(localKey);
        if (!cached && (s === 'dhara' || !s)) {
          cached = localStorage.getItem('palace_full_profile') || localStorage.getItem('palace_profile_dhara');
        }
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.employee || parsed.chambers)) {
            return parsed;
          }
        }
      } catch(e) {}

      // 2. Check IndexedDB
      try {
        let idbData = await loadFromIndexedDB(s);
        if (!idbData && (s === 'dhara' || !s)) {
          idbData = await loadFromIndexedDB('palace_full_profile') || await loadFromIndexedDB('dhara') || await loadFromIndexedDB('');
        }
        if (idbData && (idbData.employee || idbData.chambers)) {
          return idbData;
        }
      } catch(e) {}

      // 3. Current active palaceState if matches current slug and already has customized data
      const currentActiveSlug = (currentEmpSlug || 'dhara').toLowerCase().trim();
      if (s === currentActiveSlug && palaceState && (palaceState.employee || palaceState.chambers)) {
        return JSON.parse(JSON.stringify(palaceState));
      }

      // 4. Check BUILTIN_PROFILES
      if (window.BUILTIN_PROFILES && window.BUILTIN_PROFILES[s]) {
        return JSON.parse(JSON.stringify(window.BUILTIN_PROFILES[s]));
      }

      // 5. Check fetch (if hosted on HTTP and not found locally)
      try {
        const resp = await fetch(`profiles/${encodeURIComponent(s)}.json?v=${Date.now()}`);
        if (resp.ok) {
          const netData = await resp.json();
          if (netData) return netData;
        }
      } catch(e) {}

      // 6. Fallback to Dhara
      if (window.BUILTIN_PROFILES && window.BUILTIN_PROFILES['dhara']) {
        return JSON.parse(JSON.stringify(window.BUILTIN_PROFILES['dhara']));
      }
      return JSON.parse(JSON.stringify(palaceState));
    }

    function applyLoadedProfile(data) {
      if (!data || typeof data !== 'object') return;
      if (data.evolution) {
        if (data.evolution.nowTitle === 'Year 01' || data.evolution.nowTitle === 'Year 01 • Proven Mastery') {
          data.evolution.nowTitle = 'Today';
        }
        data.evolution.growthLabel = '';
      }

      Object.keys(data).forEach(k => {
        if (data[k] !== undefined && data[k] !== null) {
          if (typeof data[k] === 'object' && !Array.isArray(data[k]) && palaceState[k] && typeof palaceState[k] === 'object' && !Array.isArray(palaceState[k])) {
            palaceState[k] = { ...palaceState[k], ...data[k] };
          } else {
            palaceState[k] = data[k];
          }
        }
      });

      // Explicitly guarantee milestoneTier is cleanly set
      palaceState.milestoneTier = data.milestoneTier || palaceState.milestoneTier || '1yr';

      updatePalaceFromState();
      renderPlacards();
      if (typeof populateAdminInputs === 'function') {
        populateAdminInputs();
      }
    }

    function updateSwitcherUI(slug) {
      const activeSlug = slug || currentEmpSlug || 'dhara';
      const select = document.getElementById('selectEmployeeProfile');
      if (select) {
        select.value = activeSlug;
      }
      const empName = (palaceState.employee && palaceState.employee.name) || activeSlug;
      const topBadgeName = document.getElementById('topActiveProfileName');
      if (topBadgeName) {
        topBadgeName.textContent = empName;
      }
      const switcherActiveBadge = document.getElementById('switcherActiveBadge');
      if (switcherActiveBadge) {
        switcherActiveBadge.textContent = 'Active: ' + empName;
      }
      const btnDelete = document.getElementById('btnDeleteCustomProfile');
      if (btnDelete) {
        const isBuiltin = activeSlug === 'dhara' || activeSlug === 'rahul';
        btnDelete.style.display = isBuiltin ? 'none' : 'inline-block';
      }
    }

    async function switchActiveProfile(slug, showToast = true) {
      const targetSlug = (slug || 'dhara').toLowerCase().trim();
      const profileData = await getProfileData(targetSlug);
      if (!profileData) {
        alert(`Could not load profile for "${targetSlug}".`);
        return;
      }

      currentEmpSlug = targetSlug;

      try {
        const url = new URL(window.location.href);
        if (targetSlug === 'dhara') {
          url.searchParams.delete('emp');
          url.searchParams.delete('id');
          url.searchParams.delete('profile');
        } else {
          url.searchParams.set('emp', targetSlug);
        }
        window.history.replaceState(null, '', url.toString());
      } catch(e) {}

      // Reset baseline only when switching to another profile
      if (window.BUILTIN_PROFILES && window.BUILTIN_PROFILES['template']) {
        const base = JSON.parse(JSON.stringify(window.BUILTIN_PROFILES['template']));
        Object.keys(palaceState).forEach(k => {
          if (!(k in base)) delete palaceState[k];
        });
        Object.keys(base).forEach(k => {
          palaceState[k] = base[k];
        });
      }

      applyLoadedProfile(profileData);
      updateSwitcherUI(targetSlug);

      const empName = (palaceState.employee && palaceState.employee.name) || targetSlug;
      if (showToast && typeof showPalaceToast === 'function') {
        showPalaceToast(`✨ Switched active journey to ${empName}`, 3000);
      }
    }

    async function populateProfileDropdown() {
      const select = document.getElementById('selectEmployeeProfile');
      if (!select) return;
      const list = await getAllProfilesList();
      select.innerHTML = '';
      list.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.slug;
        const icon = item.isBuiltin ? '👤' : '⭐';
        opt.textContent = `${icon} ${item.name} (${item.slug})`;
        select.appendChild(opt);
      });
      const activeSlug = currentEmpSlug || 'dhara';
      select.value = activeSlug;
      updateSwitcherUI(activeSlug);
    }

    async function initEmployeeProfile() {
      if (palaceState && (palaceState.isStandalone || palaceState.hasUrlData)) {
        updateSwitcherUI(currentEmpSlug || 'dhara');
        return;
      }
      const slug = currentEmpSlug || 'dhara';
      const data = await getProfileData(slug);
      if (data) {
        applyLoadedProfile(data);
      }
      updateSwitcherUI(slug);
    }



// Global state exports
window.palaceState = palaceState;
window.defaultChambers = defaultChambers;
window.toSentenceCase = toSentenceCase;
window.persistPalaceState = persistPalaceState;
window.saveToIndexedDB = saveToIndexedDB;
window.loadFromIndexedDB = loadFromIndexedDB;
window.compressStateToHash = compressStateToHash;
window.decompressStateFromHash = decompressStateFromHash;
window.applyThemeTier = applyThemeTier;
window.getBuiltinProfilesList = getBuiltinProfilesList;
window.getCustomProfilesList = getCustomProfilesList;
window.getAllProfilesList = getAllProfilesList;
window.getProfileData = getProfileData;
window.applyLoadedProfile = applyLoadedProfile;
window.updateSwitcherUI = updateSwitcherUI;
window.switchActiveProfile = switchActiveProfile;
window.populateProfileDropdown = populateProfileDropdown;
window.initEmployeeProfile = initEmployeeProfile;
