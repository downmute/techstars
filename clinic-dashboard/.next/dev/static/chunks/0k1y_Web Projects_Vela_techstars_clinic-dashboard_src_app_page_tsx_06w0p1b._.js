(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MockDashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockPatients = [
    {
        id: "1",
        name: "Patient 1",
        weeksPP: 4,
        status: "on-track",
        deliveryType: "Vaginal",
        feedingMethod: "Breastfeeding",
        returnToWork: "Jun 2, 2026",
        score: 82,
        scoreDelta: 4,
        streak: 12,
        lastOpened: "Today, 8:42 AM",
        lastCheckedIn: "Today, 8:42 AM",
        voiceSessions: 3,
        calendarConnected: true,
        physical: {
            score: 85,
            delta: 3,
            weight: 25
        },
        mental: {
            score: 80,
            delta: 5,
            weight: 45
        },
        sleep: {
            score: 82,
            delta: 2,
            weight: 30
        },
        support: {
            score: 78,
            delta: 1,
            weight: 0
        },
        todayCheckin: {
            mood: 4,
            anxiety: 2,
            hopelessness: 1,
            pain: 2,
            physicalFunction: 4,
            sleep: 4,
            fatigue: 2,
            support: 4,
            babyCareConfidence: 5,
            hardestTag: "Sleep deprivation"
        },
        todayReflection: "You've been steady and consistent this week. Your sleep scores are holding well at week 4, and your mood has lifted compared to last week. Keep building on your morning routine — it's clearly making a difference.",
        trend: [
            70,
            72,
            74,
            76,
            78,
            80,
            82
        ],
        journalSummaries: [
            {
                date: "Mar 29",
                score: 82,
                summary: "Strong physical recovery continues. Mental wellbeing improving with better sleep patterns. Support network active and responsive. Baby care confidence at highest level recorded."
            },
            {
                date: "Mar 28",
                score: 80,
                summary: "Good mood throughout the day. Mild fatigue noted but well within manageable range. Breastfeeding going smoothly. Partner support very positive today."
            },
            {
                date: "Mar 27",
                score: 79,
                summary: "Sleep interrupted twice but patient returned to sleep quickly. Anxiety low. Physical function good — walking distance increasing."
            },
            {
                date: "Mar 26",
                score: 78,
                summary: "Positive day overall. Social support from partner helping significantly with baby care tasks."
            },
            {
                date: "Mar 25",
                score: 76,
                summary: "Slight perineal discomfort but declining steadily. Mood stable. Fatigue improving week over week."
            },
            {
                date: "Mar 24",
                score: 74,
                summary: "First full week of structured daily check-ins complete. Overall scores trending upward. Patient engaged and motivated."
            },
            {
                date: "Mar 23",
                score: 72,
                summary: "Baseline check-in established. Some fatigue expected at week 4 postpartum. Physical recovery on track."
            }
        ],
        flags: [],
        clinicalNote: "Patient 1 is progressing well at 4 weeks postpartum. Both physical (85) and mental (80) scores are in the healthy range and trending consistently upward over 7 days (+4 pts). A 12-day check-in streak indicates exceptional app engagement. No clinical flags active. Baby care confidence is at its highest recorded level (5/5). Recommend continuing current support plan and scheduling routine 6-week postpartum appointment. Return to work date (Jun 2) provides ample recovery runway.",
        calendarEvents: [
            {
                title: "Pediatric check-up",
                time: "10:00 AM"
            },
            {
                title: "Postpartum yoga class",
                time: "2:30 PM"
            }
        ],
        voiceSessionSummary: "Patient discussed sleep improvements and feeling more connected with baby. Expressed mild, manageable anxiety about upcoming return-to-work date. Voice tone positive and engaged throughout session."
    },
    {
        id: "3",
        name: "Patient 3",
        weeksPP: 2,
        status: "flagged",
        deliveryType: "C-Section",
        feedingMethod: "Breastfeeding",
        returnToWork: "May 12, 2026",
        score: 38,
        scoreDelta: -12,
        streak: 7,
        lastOpened: "Today, 7:15 AM",
        lastCheckedIn: "Today, 7:15 AM",
        voiceSessions: 1,
        calendarConnected: false,
        physical: {
            score: 42,
            delta: -5,
            weight: 25
        },
        mental: {
            score: 28,
            delta: -14,
            weight: 45
        },
        sleep: {
            score: 45,
            delta: -2,
            weight: 30
        },
        support: {
            score: 35,
            delta: -6,
            weight: 0
        },
        todayCheckin: {
            mood: 1,
            anxiety: 5,
            hopelessness: 4,
            pain: 4,
            physicalFunction: 2,
            sleep: 2,
            fatigue: 5,
            support: 2,
            babyCareConfidence: 2,
            hardestTag: "Feeling overwhelmed"
        },
        todayReflection: "Today feels heavy, and that's okay to acknowledge. Your scores show you're under a lot of pressure right now. You don't have to carry this alone — please reach out to your care team today.",
        trend: [
            62,
            58,
            52,
            48,
            44,
            40,
            38
        ],
        journalSummaries: [
            {
                date: "Mar 29",
                score: 38,
                summary: "Mood at 1/5 for fourth consecutive day. Sleep quality critically low at 2/5. Anxiety and hopelessness both elevated. PPD screening urgently recommended. Patient checked in despite distress — engagement is a positive sign."
            },
            {
                date: "Mar 28",
                score: 40,
                summary: "Continued decline in mental scores. C-section incision pain reported as moderate. Baby care confidence dropping significantly. Partner support inadequate per patient report."
            },
            {
                date: "Mar 27",
                score: 44,
                summary: "Sleep severely interrupted. Patient notes feeling 'unable to cope.' Support network appears insufficient. Voice session attempted but ended early due to fatigue."
            },
            {
                date: "Mar 26",
                score: 48,
                summary: "Physical recovery from C-section slower than expected. Breastfeeding pain adding stress. Emotional support flagged as critically inadequate."
            },
            {
                date: "Mar 25",
                score: 52,
                summary: "Anxiety scores rising sharply. Patient reports feeling disconnected from baby. Early warning pattern detected."
            },
            {
                date: "Mar 24",
                score: 58,
                summary: "First signs of mental health decline noted. Physical pain above baseline for C-section recovery timeline."
            },
            {
                date: "Mar 23",
                score: 62,
                summary: "Initial check-in completed. Baseline established. Some fatigue and discomfort expected at 2 weeks post C-section."
            }
        ],
        flags: [
            {
                id: "f1",
                type: "PPD Risk",
                severity: "urgent",
                reason: "Mood scores 1–2/5 for 4+ consecutive days with concurrent sleep decline. Pattern consistent with PPD onset.",
                suggestedAction: "Administer EPDS screening today. Schedule 15-min phone check-in. Consider referral to perinatal mental health specialist.",
                createdAt: "Mar 28, 2026"
            },
            {
                id: "f2",
                type: "Sleep Disruption",
                severity: "high",
                reason: "Sleep quality below 2/5 for 5 consecutive days. Fatigue at maximum level (5/5). Co-occurring with mood decline.",
                suggestedAction: "Discuss sleep support options. Assess whether partner/family can assist with overnight care.",
                createdAt: "Mar 27, 2026"
            }
        ],
        clinicalNote: "URGENT: Patient 3 requires immediate clinical attention. Mood scores have been 1–2/5 for four consecutive days alongside a steep decline in sleep quality — this pattern is clinically consistent with PPD onset. At only 2 weeks postpartum with C-section recovery adding physical burden (pain score 4/5), the mental health component (45% weight) is driving the overall score to a critical low (38, -12 pts this week). Hopelessness score of 4/5 today warrants immediate follow-up. EPDS screening and a phone check-in are strongly recommended today. Assess support network adequacy and consider referral to perinatal mental health if EPDS score is ≥13.",
        calendarEvents: [],
        voiceSessionSummary: "Patient expressed feeling alone and struggling with breastfeeding pain. Mentioned feeling 'like a failure.' Voice session ended early — patient noted feeling too exhausted to continue. Tone was distressed throughout."
    },
    {
        id: "5",
        name: "Patient 5",
        weeksPP: 8,
        status: "watch",
        deliveryType: "Vaginal",
        feedingMethod: "Formula",
        returnToWork: "Apr 20, 2026",
        score: 56,
        scoreDelta: -3,
        streak: 3,
        lastOpened: "Yesterday, 9:20 PM",
        lastCheckedIn: "Yesterday",
        voiceSessions: 5,
        calendarConnected: true,
        physical: {
            score: 60,
            delta: -2,
            weight: 25
        },
        mental: {
            score: 52,
            delta: -4,
            weight: 45
        },
        sleep: {
            score: 58,
            delta: -1,
            weight: 30
        },
        support: {
            score: 55,
            delta: -3,
            weight: 0
        },
        todayCheckin: null,
        todayReflection: null,
        trend: [
            60,
            59,
            58,
            57,
            57,
            56,
            56
        ],
        journalSummaries: [
            {
                date: "Mar 28",
                score: 56,
                summary: "Pain at incision site noted — unusual at 8 weeks postpartum. Fatigue elevated above expected levels. Mental scores dipping with return-to-work anxiety increasing."
            },
            {
                date: "Mar 27",
                score: 57,
                summary: "Patient notes anxiety increasing as RTW date (Apr 20) approaches. Sleep slightly disrupted. Childcare logistics mentioned as a stressor."
            },
            {
                date: "Mar 26",
                score: 57,
                summary: "Stable but stagnant. No improvement this week despite expected 8-week recovery gains. Physical recovery plateau possible."
            },
            {
                date: "Mar 25",
                score: 58,
                summary: "Mild physical decline. Fatigue and pain together suggesting incomplete recovery at week 8. Monitor closely."
            },
            {
                date: "Mar 24",
                score: 58,
                summary: "Check-in completed. Some work transition anxiety mentioned in check-in notes. Support score declining."
            },
            {
                date: "Mar 23",
                score: 59,
                summary: "Overall stable. Mental health holding but watch status warranted as RTW date approaches quickly."
            },
            {
                date: "Mar 22",
                score: 60,
                summary: "Week started at reasonable baseline. Physical function adequate. Patient engaged with 5 voice sessions this week."
            }
        ],
        flags: [
            {
                id: "f3",
                type: "Physical Recovery Stall",
                severity: "medium",
                reason: "No improvement in physical scores for 7 days at 8 weeks PP. Pain reported at episiotomy site — atypical at this stage.",
                suggestedAction: "Assess wound healing at next visit. Rule out infection or delayed healing.",
                createdAt: "Mar 27, 2026"
            }
        ],
        clinicalNote: "Patient 5 at 8 weeks postpartum is showing a slow but persistent decline across all domains (-3 pts this week). Physical recovery has stalled — pain at the episiotomy site at this stage warrants physical assessment to rule out complications. Mental health scores are declining with the return-to-work date (Apr 20) 3 weeks away. The patient has a strong voice session history (5 this week) indicating good engagement, but today's missed check-in (first in 3 days) is worth noting. Recommend proactive outreach, RTW transition planning discussion, and wound check at next appointment.",
        calendarEvents: [
            {
                title: "Return-to-work prep call with HR",
                time: "11:00 AM"
            },
            {
                title: "Baby wellness check",
                time: "3:00 PM"
            }
        ],
        voiceSessionSummary: "Patient discussed work transition stress, childcare logistics, and lingering physical discomfort. Expressed concern about not feeling 'ready' to return. 5 voice sessions this week — highest engagement of any patient. Positive rapport established."
    }
];
// ─── Sub-components ───────────────────────────────────────────────────────────
function RecoveryRing({ score, size = 100 }) {
    const strokeWidth = size * 0.08;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - score / 100 * circumference;
    const color = score >= 70 ? "#5A8A6A" : score >= 50 ? "#C4925A" : "#B5404A";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: size,
        height: size,
        viewBox: `0 0 ${size} ${size}`,
        "aria-label": `Recovery score ${score}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: size / 2,
                cy: size / 2,
                r: radius,
                fill: "none",
                stroke: "#E8DDD4",
                strokeWidth: strokeWidth
            }, void 0, false, {
                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                lineNumber: 362,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: size / 2,
                cy: size / 2,
                r: radius,
                fill: "none",
                stroke: color,
                strokeWidth: strokeWidth,
                strokeLinecap: "round",
                strokeDasharray: circumference,
                strokeDashoffset: offset,
                transform: `rotate(-90 ${size / 2} ${size / 2})`
            }, void 0, false, {
                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                lineNumber: 370,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                x: size / 2,
                y: size / 2 - 4,
                textAnchor: "middle",
                dominantBaseline: "middle",
                fill: "#2C1F1A",
                fontSize: size * 0.26,
                fontWeight: "700",
                fontFamily: "var(--font-display)",
                children: score
            }, void 0, false, {
                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                lineNumber: 382,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                x: size / 2,
                y: size / 2 + size * 0.2,
                textAnchor: "middle",
                dominantBaseline: "middle",
                fill: "#B39B93",
                fontSize: size * 0.1,
                children: "/ 100"
            }, void 0, false, {
                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                lineNumber: 394,
                columnNumber: 4
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
        lineNumber: 356,
        columnNumber: 3
    }, this);
}
_c = RecoveryRing;
function SubScoreBar({ label, score, delta, weight }) {
    const barColor = score >= 70 ? "bg-success" : score >= 50 ? "bg-warning" : "bg-danger";
    const deltaColor = delta >= 0 ? "text-success" : "text-danger";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-2xl border border-border bg-surface p-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-semibold tracking-wider text-text-secondary uppercase",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 426,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-text-muted",
                        children: [
                            "Weight: ",
                            weight,
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 429,
                        columnNumber: 5
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                lineNumber: 425,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-2 flex items-baseline gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-display text-3xl text-text",
                        children: score
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 432,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `text-sm font-semibold ${deltaColor}`,
                        children: [
                            delta >= 0 ? "+" : "",
                            delta,
                            " this week"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 433,
                        columnNumber: 5
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                lineNumber: 431,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `h-full rounded-full ${barColor} transition-all`,
                    style: {
                        width: `${score}%`
                    }
                }, void 0, false, {
                    fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                    lineNumber: 439,
                    columnNumber: 5
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                lineNumber: 438,
                columnNumber: 4
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
        lineNumber: 424,
        columnNumber: 3
    }, this);
}
_c1 = SubScoreBar;
function RatingDots({ label, value, max = 5, invertBad = false }) {
    // invertBad: for anxiety/pain/hopelessness/fatigue, high = bad
    const getColor = (i)=>{
        if (i >= value) return "bg-surface-raised";
        if (invertBad) {
            if (value >= 4) return "bg-danger";
            if (value === 3) return "bg-warning";
            return "bg-success";
        }
        if (value <= 2) return "bg-danger";
        if (value === 3) return "bg-warning";
        return "bg-success";
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs font-medium text-text-secondary",
                children: label
            }, void 0, false, {
                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                lineNumber: 474,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1",
                children: [
                    Array.from({
                        length: max
                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `h-2.5 w-2.5 rounded-full ${getColor(i)} transition-colors`
                        }, i, false, {
                            fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                            lineNumber: 477,
                            columnNumber: 6
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "ml-1.5 text-xs font-semibold text-text",
                        children: [
                            value,
                            "/",
                            max
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 482,
                        columnNumber: 5
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                lineNumber: 475,
                columnNumber: 4
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
        lineNumber: 473,
        columnNumber: 3
    }, this);
}
_c2 = RatingDots;
function Sparkline7({ data, status }) {
    if (!data.length) return null;
    const width = 200;
    const height = 48;
    const pad = 4;
    const min = Math.min(...data) - 2;
    const max = Math.max(...data) + 2;
    const range = max - min || 1;
    const color = status === "on-track" ? "#5A8A6A" : status === "watch" ? "#C4925A" : "#B5404A";
    const points = data.map((v, i)=>{
        const x = i / (data.length - 1) * (width - pad * 2) + pad;
        const y = height - pad - (v - min) / range * (height - pad * 2);
        return `${x},${y}`;
    }).join(" ");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: width,
        height: height,
        className: "block w-full",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
            points: points,
            fill: "none",
            stroke: color,
            strokeWidth: "2.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
        }, void 0, false, {
            fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
            lineNumber: 521,
            columnNumber: 4
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
        lineNumber: 520,
        columnNumber: 3
    }, this);
}
_c3 = Sparkline7;
function StatusBadge({ status }) {
    const config = {
        "on-track": {
            dot: "bg-success",
            text: "text-success",
            bg: "bg-success/10",
            label: "On track"
        },
        watch: {
            dot: "bg-warning",
            text: "text-warning",
            bg: "bg-warning/10",
            label: "Watch"
        },
        flagged: {
            dot: "bg-danger",
            text: "text-danger",
            bg: "bg-danger/10",
            label: "Needs follow-up"
        }
    }[status];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${config.bg} ${config.text}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `h-2 w-2 rounded-full ${config.dot}`
            }, void 0, false, {
                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                lineNumber: 559,
                columnNumber: 4
            }, this),
            config.label
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
        lineNumber: 556,
        columnNumber: 3
    }, this);
}
_c4 = StatusBadge;
function SeverityBadge({ severity }) {
    const config = {
        urgent: {
            bg: "bg-danger",
            text: "text-white",
            label: "Urgent"
        },
        high: {
            bg: "bg-danger/15",
            text: "text-danger",
            label: "High"
        },
        medium: {
            bg: "bg-warning/15",
            text: "text-warning",
            label: "Medium"
        },
        low: {
            bg: "bg-success/10",
            text: "text-success",
            label: "Low"
        }
    }[severity];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase ${config.bg} ${config.text}`,
        children: config.label
    }, void 0, false, {
        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
        lineNumber: 574,
        columnNumber: 3
    }, this);
}
_c5 = SeverityBadge;
function ScorePill({ score }) {
    const color = score >= 70 ? "bg-success/10 text-success" : score >= 50 ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex h-7 min-w-[2.25rem] items-center justify-center rounded-full px-2 text-sm font-bold ${color}`,
        children: score
    }, void 0, false, {
        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
        lineNumber: 590,
        columnNumber: 3
    }, this);
}
_c6 = ScorePill;
// ─── Sidebar (inline for /mock, no auth) ─────────────────────────────────────
function MockSidebar({ selectedId, onSelect }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "flex h-full w-[220px] flex-shrink-0 flex-col bg-sidebar px-5 py-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "font-display text-xl text-sidebar-text",
                        children: "ReEntry"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 610,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs tracking-widest text-text-muted uppercase",
                        children: "Clinic Dashboard"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 611,
                        columnNumber: 5
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                lineNumber: 609,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "flex flex-1 flex-col gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-text/40 cursor-not-allowed select-none",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "18",
                                height: "18",
                                viewBox: "0 0 18 18",
                                fill: "none",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                        x: "1",
                                        y: "1",
                                        width: "7",
                                        height: "7",
                                        rx: "2",
                                        stroke: "#E8DDD4",
                                        strokeWidth: "1.5",
                                        opacity: "0.4"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 619,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                        x: "10",
                                        y: "1",
                                        width: "7",
                                        height: "7",
                                        rx: "2",
                                        stroke: "#E8DDD4",
                                        strokeWidth: "1.5",
                                        opacity: "0.4"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 620,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                        x: "1",
                                        y: "10",
                                        width: "7",
                                        height: "7",
                                        rx: "2",
                                        stroke: "#E8DDD4",
                                        strokeWidth: "1.5",
                                        opacity: "0.4"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 621,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                        x: "10",
                                        y: "10",
                                        width: "7",
                                        height: "7",
                                        rx: "2",
                                        stroke: "#E8DDD4",
                                        strokeWidth: "1.5",
                                        opacity: "0.4"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 622,
                                        columnNumber: 7
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 618,
                                columnNumber: 6
                            }, this),
                            "Patients"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 617,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-text/40 cursor-not-allowed select-none",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "18",
                                height: "18",
                                viewBox: "0 0 18 18",
                                fill: "none",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M9 2L16 15H2L9 2Z",
                                        stroke: "#E8DDD4",
                                        strokeWidth: "1.5",
                                        strokeLinejoin: "round",
                                        opacity: "0.4"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 628,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M9 7V10",
                                        stroke: "#E8DDD4",
                                        strokeWidth: "1.5",
                                        strokeLinecap: "round",
                                        opacity: "0.4"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 629,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                        cx: "9",
                                        cy: "12.5",
                                        r: "0.75",
                                        fill: "#E8DDD4",
                                        opacity: "0.4"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 630,
                                        columnNumber: 7
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 627,
                                columnNumber: 6
                            }, this),
                            "Alerts"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 626,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 mb-1.5 px-3",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[10px] font-semibold tracking-widest text-text-muted uppercase",
                            children: "Mock Preview"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                            lineNumber: 636,
                            columnNumber: 6
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 635,
                        columnNumber: 5
                    }, this),
                    mockPatients.map((p)=>{
                        const isActive = p.id === selectedId;
                        const dot = p.status === "on-track" ? "bg-success" : p.status === "watch" ? "bg-warning" : "bg-danger";
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>onSelect(p.id),
                            className: `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-left ${isActive ? "bg-sidebar-active text-white font-medium" : "text-sidebar-text hover:bg-sidebar-active/20"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `h-2 w-2 flex-shrink-0 rounded-full ${dot}`
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                    lineNumber: 659,
                                    columnNumber: 8
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "truncate",
                                    children: p.name
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                    lineNumber: 662,
                                    columnNumber: 8
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "ml-auto text-xs opacity-60",
                                    children: [
                                        p.weeksPP,
                                        "w PP"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                    lineNumber: 663,
                                    columnNumber: 8
                                }, this)
                            ]
                        }, p.id, true, {
                            fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                            lineNumber: 650,
                            columnNumber: 7
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                lineNumber: 616,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-white/10 pt-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-sidebar-text",
                        children: "Dr. Sarah Chen"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 672,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-text-muted",
                        children: "Pacific Women's Clinic"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 673,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-xs text-text-muted/60 italic",
                        children: "Mock preview mode"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 674,
                        columnNumber: 5
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                lineNumber: 671,
                columnNumber: 4
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
        lineNumber: 608,
        columnNumber: 3
    }, this);
}
_c7 = MockSidebar;
function MockDashboardPage() {
    _s();
    const [selectedId, setSelectedId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("1");
    const patient = mockPatients.find((p)=>p.id === selectedId);
    const circumference = 2 * Math.PI * 42;
    const ringOffset = circumference - patient.score / 100 * circumference;
    const ringColor = patient.score >= 70 ? "#5A8A6A" : patient.score >= 50 ? "#C4925A" : "#B5404A";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-screen bg-background",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MockSidebar, {
                selectedId: selectedId,
                onSelect: setSelectedId
            }, void 0, false, {
                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                lineNumber: 698,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex-1 overflow-auto px-8 py-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-5 flex items-center gap-2 text-sm text-text-muted",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-medium text-text-muted",
                                children: "Patients"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 703,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "/"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 704,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-text",
                                children: patient.name
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 705,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "/"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 706,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-text",
                                children: "App Overview"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 707,
                                columnNumber: 6
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 702,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-5 overflow-hidden rounded-2xl border border-border bg-surface",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `h-1 w-full ${patient.status === "on-track" ? "bg-success" : patient.status === "watch" ? "bg-warning" : "bg-danger"}`
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 713,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between px-8 py-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/20",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-display text-2xl text-primary",
                                                    children: [
                                                        "P",
                                                        patient.id
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                    lineNumber: 726,
                                                    columnNumber: 9
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 725,
                                                columnNumber: 8
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                                className: "text-xl font-semibold text-text",
                                                                children: patient.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 732,
                                                                columnNumber: 10
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusBadge, {
                                                                status: patient.status
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 735,
                                                                columnNumber: 10
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 731,
                                                        columnNumber: 9
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-0.5 text-sm text-text-secondary",
                                                        children: [
                                                            patient.weeksPP,
                                                            " weeks postpartum"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 737,
                                                        columnNumber: 9
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-3 flex flex-wrap gap-6",
                                                        children: [
                                                            {
                                                                label: "Delivery",
                                                                value: patient.deliveryType
                                                            },
                                                            {
                                                                label: "Feeding",
                                                                value: patient.feedingMethod
                                                            },
                                                            {
                                                                label: "Return to Work",
                                                                value: patient.returnToWork
                                                            },
                                                            {
                                                                label: "Last Check-in",
                                                                value: patient.lastCheckedIn
                                                            }
                                                        ].map(({ label, value })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-[10px] font-semibold tracking-wider text-text-muted uppercase",
                                                                        children: label
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                        lineNumber: 754,
                                                                        columnNumber: 12
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "mt-0.5 text-sm font-medium text-text",
                                                                        children: value
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                        lineNumber: 757,
                                                                        columnNumber: 12
                                                                    }, this)
                                                                ]
                                                            }, label, true, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 753,
                                                                columnNumber: 11
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 740,
                                                        columnNumber: 9
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 730,
                                                columnNumber: 8
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 724,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-8",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col gap-2.5 text-right",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-end gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-text-muted",
                                                                children: "Last opened"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 771,
                                                                columnNumber: 10
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "rounded-lg bg-surface-raised px-2.5 py-1 text-xs font-semibold text-text",
                                                                children: patient.lastOpened
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 772,
                                                                columnNumber: 10
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 770,
                                                        columnNumber: 9
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-end gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-text-muted",
                                                                children: "Check-in streak"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 777,
                                                                columnNumber: 10
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary",
                                                                children: [
                                                                    patient.streak,
                                                                    " days"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 778,
                                                                columnNumber: 10
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 776,
                                                        columnNumber: 9
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-end gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-text-muted",
                                                                children: "Voice sessions"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 783,
                                                                columnNumber: 10
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "rounded-lg bg-surface-raised px-2.5 py-1 text-xs font-semibold text-text",
                                                                children: [
                                                                    patient.voiceSessions,
                                                                    " this week"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 784,
                                                                columnNumber: 10
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 782,
                                                        columnNumber: 9
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-end gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-text-muted",
                                                                children: "Calendar"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 789,
                                                                columnNumber: 10
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `rounded-lg px-2.5 py-1 text-xs font-semibold ${patient.calendarConnected ? "bg-success/10 text-success" : "bg-surface-raised text-text-muted"}`,
                                                                children: patient.calendarConnected ? "Connected" : "Not connected"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 790,
                                                                columnNumber: 10
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 788,
                                                        columnNumber: 9
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 769,
                                                columnNumber: 8
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col items-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        width: "110",
                                                        height: "110",
                                                        viewBox: "0 0 96 96",
                                                        "aria-label": "Recovery score",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                                cx: "48",
                                                                cy: "48",
                                                                r: "42",
                                                                fill: "none",
                                                                stroke: "#E8DDD4",
                                                                strokeWidth: "7"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 810,
                                                                columnNumber: 10
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                                cx: "48",
                                                                cy: "48",
                                                                r: "42",
                                                                fill: "none",
                                                                stroke: ringColor,
                                                                strokeWidth: "7",
                                                                strokeLinecap: "round",
                                                                strokeDasharray: circumference,
                                                                strokeDashoffset: ringOffset,
                                                                transform: "rotate(-90 48 48)"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 818,
                                                                columnNumber: 10
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                                                x: "48",
                                                                y: "44",
                                                                textAnchor: "middle",
                                                                dominantBaseline: "middle",
                                                                fill: "#2C1F1A",
                                                                fontSize: "22",
                                                                fontWeight: "700",
                                                                fontFamily: "var(--font-display)",
                                                                children: patient.score
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 830,
                                                                columnNumber: 10
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                                                x: "48",
                                                                y: "60",
                                                                textAnchor: "middle",
                                                                dominantBaseline: "middle",
                                                                fill: "#B39B93",
                                                                fontSize: "9",
                                                                children: "Recovery"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 842,
                                                                columnNumber: 10
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 804,
                                                        columnNumber: 9
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-1 flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-sm font-bold ${patient.scoreDelta >= 0 ? "text-success" : "text-danger"}`,
                                                                children: [
                                                                    patient.scoreDelta >= 0 ? "+" : "",
                                                                    patient.scoreDelta,
                                                                    " pts"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 854,
                                                                columnNumber: 10
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-text-muted",
                                                                children: "this week"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 860,
                                                                columnNumber: 10
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 853,
                                                        columnNumber: 9
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 803,
                                                columnNumber: 8
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 767,
                                        columnNumber: 7
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 722,
                                columnNumber: 6
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 711,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-5 grid grid-cols-4 gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SubScoreBar, {
                                label: "Physical",
                                score: patient.physical.score,
                                delta: patient.physical.delta,
                                weight: patient.physical.weight
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 869,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SubScoreBar, {
                                label: "Mental",
                                score: patient.mental.score,
                                delta: patient.mental.delta,
                                weight: patient.mental.weight
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 875,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SubScoreBar, {
                                label: "Sleep",
                                score: patient.sleep.score,
                                delta: patient.sleep.delta,
                                weight: patient.sleep.weight
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 881,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SubScoreBar, {
                                label: "Support",
                                score: patient.support.score,
                                delta: patient.support.delta,
                                weight: 0
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 887,
                                columnNumber: 6
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 868,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-5 grid grid-cols-3 gap-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "col-span-2 flex flex-col gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `rounded-2xl p-6 ${patient.todayReflection ? "bg-primary" : "border border-border bg-surface"}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: `mb-3 text-xs font-bold tracking-widest uppercase ${patient.todayReflection ? "text-white/60" : "text-text-muted"}`,
                                                children: "Today's Reflection"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 907,
                                                columnNumber: 8
                                            }, this),
                                            patient.todayReflection ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "font-display text-lg leading-relaxed text-white",
                                                children: patient.todayReflection
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 917,
                                                columnNumber: 9
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex h-10 w-10 items-center justify-center rounded-full bg-surface-raised",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            width: "16",
                                                            height: "16",
                                                            viewBox: "0 0 16 16",
                                                            fill: "none",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                                    cx: "8",
                                                                    cy: "8",
                                                                    r: "6.5",
                                                                    stroke: "#B39B93",
                                                                    strokeWidth: "1.5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                    lineNumber: 929,
                                                                    columnNumber: 12
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                    d: "M8 5v3.5",
                                                                    stroke: "#B39B93",
                                                                    strokeWidth: "1.5",
                                                                    strokeLinecap: "round"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                    lineNumber: 936,
                                                                    columnNumber: 12
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                                    cx: "8",
                                                                    cy: "11",
                                                                    r: "0.75",
                                                                    fill: "#B39B93"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                    lineNumber: 942,
                                                                    columnNumber: 12
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                            lineNumber: 923,
                                                            columnNumber: 11
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 922,
                                                        columnNumber: 10
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-text-secondary",
                                                        children: "No check-in today — reflection will appear after patient completes their daily check-in."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 945,
                                                        columnNumber: 10
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 921,
                                                columnNumber: 9
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 900,
                                        columnNumber: 7
                                    }, this),
                                    patient.todayCheckin ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-2xl border border-border bg-surface p-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-4 flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        className: "font-display text-lg text-text",
                                                        children: "Today's Check-in"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 957,
                                                        columnNumber: 10
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "h-2 w-2 rounded-full bg-success"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 961,
                                                                columnNumber: 11
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs font-medium text-success",
                                                                children: [
                                                                    "Completed ",
                                                                    patient.lastCheckedIn
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 962,
                                                                columnNumber: 11
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 960,
                                                        columnNumber: 10
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 956,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-3 gap-x-8 gap-y-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RatingDots, {
                                                        label: "Mood",
                                                        value: patient.todayCheckin.mood
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 970,
                                                        columnNumber: 10
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RatingDots, {
                                                        label: "Anxiety",
                                                        value: patient.todayCheckin.anxiety,
                                                        invertBad: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 974,
                                                        columnNumber: 10
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RatingDots, {
                                                        label: "Hopelessness",
                                                        value: patient.todayCheckin.hopelessness,
                                                        invertBad: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 979,
                                                        columnNumber: 10
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RatingDots, {
                                                        label: "Pain",
                                                        value: patient.todayCheckin.pain,
                                                        invertBad: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 984,
                                                        columnNumber: 10
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RatingDots, {
                                                        label: "Physical Function",
                                                        value: patient.todayCheckin.physicalFunction
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 989,
                                                        columnNumber: 10
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RatingDots, {
                                                        label: "Sleep Quality",
                                                        value: patient.todayCheckin.sleep
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 993,
                                                        columnNumber: 10
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RatingDots, {
                                                        label: "Fatigue",
                                                        value: patient.todayCheckin.fatigue,
                                                        invertBad: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 997,
                                                        columnNumber: 10
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RatingDots, {
                                                        label: "Support",
                                                        value: patient.todayCheckin.support
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 1002,
                                                        columnNumber: 10
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RatingDots, {
                                                        label: "Baby Care Confidence",
                                                        value: patient.todayCheckin.babyCareConfidence
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 1006,
                                                        columnNumber: 10
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 969,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-4 border-t border-border pt-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-semibold text-text-muted uppercase tracking-wider",
                                                        children: "Hardest thing today"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 1014,
                                                        columnNumber: 10
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "ml-3 rounded-full bg-blush/40 px-3 py-1 text-sm font-medium text-primary",
                                                        children: patient.todayCheckin.hardestTag
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 1017,
                                                        columnNumber: 10
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1013,
                                                columnNumber: 9
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 955,
                                        columnNumber: 8
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-2xl border border-dashed border-border bg-surface/50 p-6 text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-text-secondary",
                                                children: "No check-in today yet"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1024,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 text-xs text-text-muted",
                                                children: [
                                                    "Last check-in: ",
                                                    patient.lastCheckedIn
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1027,
                                                columnNumber: 9
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 1023,
                                        columnNumber: 8
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 898,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-2xl border border-border bg-surface p-5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "mb-4 font-display text-lg text-text",
                                                children: "7-Day Trend"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1037,
                                                columnNumber: 8
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col gap-5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mb-1.5 flex items-center justify-between",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-xs font-semibold tracking-wider text-text-secondary uppercase",
                                                                        children: "Overall"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                        lineNumber: 1045,
                                                                        columnNumber: 11
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-1.5",
                                                                        children: patient.trend.map((v, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ScorePill, {
                                                                                score: v
                                                                            }, i, false, {
                                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                                lineNumber: 1050,
                                                                                columnNumber: 13
                                                                            }, this)).slice(-1)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                        lineNumber: 1048,
                                                                        columnNumber: 11
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 1044,
                                                                columnNumber: 10
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Sparkline7, {
                                                                data: patient.trend,
                                                                status: patient.status
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 1054,
                                                                columnNumber: 10
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-1 flex justify-between text-[10px] text-text-muted",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "Mar 23"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                        lineNumber: 1059,
                                                                        columnNumber: 11
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "Mar 29"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                        lineNumber: 1060,
                                                                        columnNumber: 11
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 1058,
                                                                columnNumber: 10
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 1043,
                                                        columnNumber: 9
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-px bg-border"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 1064,
                                                        columnNumber: 9
                                                    }, this),
                                                    [
                                                        {
                                                            label: "Physical",
                                                            data: patient.trend.map((v)=>Math.min(100, v + patient.physical.score - patient.score)),
                                                            color: "#D4856A"
                                                        },
                                                        {
                                                            label: "Mental",
                                                            data: patient.trend.map((v)=>Math.max(5, v + patient.mental.score - patient.score)),
                                                            color: "#B5404A"
                                                        },
                                                        {
                                                            label: "Sleep",
                                                            data: patient.trend.map((v)=>Math.max(5, v + patient.sleep.score - patient.score)),
                                                            color: "#B39B93"
                                                        }
                                                    ].map(({ label, data, color })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "mb-1.5 flex items-center justify-between",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex items-center gap-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "inline-block h-2.5 w-2.5 rounded-full",
                                                                                    style: {
                                                                                        backgroundColor: color
                                                                                    }
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                                    lineNumber: 1093,
                                                                                    columnNumber: 13
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-xs font-semibold tracking-wider text-text-secondary uppercase",
                                                                                    children: label
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                                    lineNumber: 1097,
                                                                                    columnNumber: 13
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                            lineNumber: 1092,
                                                                            columnNumber: 12
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-xs font-bold text-text",
                                                                            children: data[data.length - 1]
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                            lineNumber: 1101,
                                                                            columnNumber: 12
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                    lineNumber: 1091,
                                                                    columnNumber: 11
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                    width: "100%",
                                                                    height: "32",
                                                                    viewBox: "0 0 200 32",
                                                                    preserveAspectRatio: "none",
                                                                    className: "block",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                                        points: data.map((v, i)=>{
                                                                            const min = Math.min(...data) - 2;
                                                                            const max = Math.max(...data) + 2;
                                                                            const range = max - min || 1;
                                                                            const x = i / (data.length - 1) * 196 + 2;
                                                                            const y = 30 - (v - min) / range * 28;
                                                                            return `${x},${y}`;
                                                                        }).join(" "),
                                                                        fill: "none",
                                                                        stroke: color,
                                                                        strokeWidth: "2",
                                                                        strokeLinecap: "round",
                                                                        strokeLinejoin: "round"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                        lineNumber: 1112,
                                                                        columnNumber: 12
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                    lineNumber: 1105,
                                                                    columnNumber: 11
                                                                }, this)
                                                            ]
                                                        }, label, true, {
                                                            fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                            lineNumber: 1090,
                                                            columnNumber: 10
                                                        }, this))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1041,
                                                columnNumber: 8
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 1036,
                                        columnNumber: 7
                                    }, this),
                                    patient.calendarConnected && patient.calendarEvents.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-2xl border border-border bg-surface p-5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mb-3 text-xs font-bold tracking-widest text-text-muted uppercase",
                                                children: "Patient's Calendar Today"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1141,
                                                columnNumber: 10
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col",
                                                children: patient.calendarEvents.map((ev, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            i > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "my-2 h-px bg-border"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 1148,
                                                                columnNumber: 14
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "h-8 w-1 rounded-full bg-primary"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                        lineNumber: 1151,
                                                                        columnNumber: 14
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "text-sm font-medium text-text",
                                                                                children: ev.title
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                                lineNumber: 1153,
                                                                                columnNumber: 15
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "text-xs text-text-secondary",
                                                                                children: ev.time
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                                lineNumber: 1156,
                                                                                columnNumber: 15
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                        lineNumber: 1152,
                                                                        columnNumber: 14
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 1150,
                                                                columnNumber: 13
                                                            }, this)
                                                        ]
                                                    }, i, true, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 1146,
                                                        columnNumber: 12
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1144,
                                                columnNumber: 10
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 1140,
                                        columnNumber: 9
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 1035,
                                columnNumber: 6
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 896,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-5 grid grid-cols-3 gap-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "col-span-2 rounded-2xl border border-border bg-surface p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-4 flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "font-display text-lg text-text",
                                                children: "Journal — 7-Day History"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1174,
                                                columnNumber: 8
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-text-muted",
                                                children: "AI-generated daily summaries"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1177,
                                                columnNumber: 8
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 1173,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-3",
                                        children: patient.journalSummaries.map((entry, i)=>{
                                            const scoreColor = entry.score >= 70 ? "bg-success/10 text-success" : entry.score >= 50 ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger";
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `rounded-xl p-4 ${i === 0 ? "bg-surface-raised" : "border border-border"}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mb-2 flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs font-bold text-text-muted w-12",
                                                                children: entry.date
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 1195,
                                                                columnNumber: 12
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `rounded-full px-2.5 py-0.5 text-xs font-bold ${scoreColor}`,
                                                                children: entry.score
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 1198,
                                                                columnNumber: 12
                                                            }, this),
                                                            i === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary",
                                                                children: "Latest"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 1204,
                                                                columnNumber: 13
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 1194,
                                                        columnNumber: 11
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm leading-relaxed text-text-secondary",
                                                        children: entry.summary
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 1209,
                                                        columnNumber: 11
                                                    }, this)
                                                ]
                                            }, i, true, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1190,
                                                columnNumber: 10
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 1181,
                                        columnNumber: 7
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 1172,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-4",
                                children: [
                                    patient.voiceSessionSummary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-2xl border border-border bg-surface p-5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-3 flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex h-8 w-8 items-center justify-center rounded-full bg-primary/10",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            width: "16",
                                                            height: "16",
                                                            viewBox: "0 0 16 16",
                                                            fill: "none",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ellipse", {
                                                                    cx: "8",
                                                                    cy: "6.5",
                                                                    rx: "3",
                                                                    ry: "4.5",
                                                                    stroke: "#B5604F",
                                                                    strokeWidth: "1.5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                    lineNumber: 1231,
                                                                    columnNumber: 12
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                    d: "M3 9.5C3 12 5.24 14 8 14s5-2 5-4.5",
                                                                    stroke: "#B5604F",
                                                                    strokeWidth: "1.5",
                                                                    strokeLinecap: "round"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                    lineNumber: 1239,
                                                                    columnNumber: 12
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                    d: "M8 14v2",
                                                                    stroke: "#B5604F",
                                                                    strokeWidth: "1.5",
                                                                    strokeLinecap: "round"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                    lineNumber: 1245,
                                                                    columnNumber: 12
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                            lineNumber: 1225,
                                                            columnNumber: 11
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 1224,
                                                        columnNumber: 10
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs font-bold text-text",
                                                                children: "Voice Sessions"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 1254,
                                                                columnNumber: 11
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[10px] text-text-muted",
                                                                children: [
                                                                    patient.voiceSessions,
                                                                    " this week"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 1257,
                                                                columnNumber: 11
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 1253,
                                                        columnNumber: 10
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1223,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm leading-relaxed text-text-secondary",
                                                children: patient.voiceSessionSummary
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1262,
                                                columnNumber: 9
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 1222,
                                        columnNumber: 8
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-2xl border border-border bg-surface p-5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mb-3 text-xs font-bold tracking-widest text-text-muted uppercase",
                                                children: "App Engagement"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1270,
                                                columnNumber: 8
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col gap-3",
                                                children: [
                                                    {
                                                        label: "Check-in streak",
                                                        value: `${patient.streak} days`,
                                                        highlight: true
                                                    },
                                                    {
                                                        label: "Last app open",
                                                        value: patient.lastOpened,
                                                        highlight: false
                                                    },
                                                    {
                                                        label: "Voice sessions",
                                                        value: `${patient.voiceSessions} this week`,
                                                        highlight: false
                                                    },
                                                    {
                                                        label: "Calendar sync",
                                                        value: patient.calendarConnected ? "Active" : "Not set up",
                                                        highlight: patient.calendarConnected
                                                    }
                                                ].map(({ label, value, highlight })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-text-secondary",
                                                                children: label
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 1300,
                                                                columnNumber: 11
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-xs font-semibold ${highlight ? "text-primary" : "text-text"}`,
                                                                children: value
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                                lineNumber: 1303,
                                                                columnNumber: 11
                                                            }, this)
                                                        ]
                                                    }, label, true, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 1296,
                                                        columnNumber: 10
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1273,
                                                columnNumber: 8
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 1269,
                                        columnNumber: 7
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 1219,
                                columnNumber: 6
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 1170,
                        columnNumber: 5
                    }, this),
                    patient.flags.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-5 rounded-2xl border border-danger/20 bg-danger/5 p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4 flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "20",
                                        height: "20",
                                        viewBox: "0 0 18 18",
                                        fill: "none",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M9 2L16 15H2L9 2Z",
                                                stroke: "#B5404A",
                                                strokeWidth: "1.5",
                                                strokeLinejoin: "round"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1325,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M9 7V10",
                                                stroke: "#B5404A",
                                                strokeWidth: "1.5",
                                                strokeLinecap: "round"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1331,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                cx: "9",
                                                cy: "12.5",
                                                r: "0.75",
                                                fill: "#B5404A"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1337,
                                                columnNumber: 9
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 1319,
                                        columnNumber: 8
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "font-display text-lg text-danger",
                                        children: "Active Clinical Flags"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 1339,
                                        columnNumber: 8
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-auto rounded-full bg-danger/15 px-2.5 py-0.5 text-xs font-bold text-danger",
                                        children: [
                                            patient.flags.length,
                                            " active"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 1342,
                                        columnNumber: 8
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 1318,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-4",
                                children: patient.flags.map((flag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl border border-border bg-background p-5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-2 flex items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SeverityBadge, {
                                                        severity: flag.severity
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 1353,
                                                        columnNumber: 11
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-semibold text-text",
                                                        children: flag.type
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 1354,
                                                        columnNumber: 11
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "ml-auto text-xs text-text-muted",
                                                        children: [
                                                            "Flagged ",
                                                            flag.createdAt
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 1357,
                                                        columnNumber: 11
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1352,
                                                columnNumber: 10
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mb-3 text-sm leading-relaxed text-text-secondary",
                                                children: flag.reason
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1361,
                                                columnNumber: 10
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-lg bg-surface p-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-bold tracking-wider text-text-muted uppercase",
                                                        children: "Suggested action"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 1365,
                                                        columnNumber: 11
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-1 text-sm font-medium text-text",
                                                        children: flag.suggestedAction
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                        lineNumber: 1368,
                                                        columnNumber: 11
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                                lineNumber: 1364,
                                                columnNumber: 10
                                            }, this)
                                        ]
                                    }, flag.id, true, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 1348,
                                        columnNumber: 9
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 1346,
                                columnNumber: 7
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 1317,
                        columnNumber: 6
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-2xl bg-sidebar p-6 text-sidebar-text",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4 flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "font-display text-xl",
                                        children: "AI Clinical Summary"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 1381,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-sidebar-text/70 uppercase",
                                        children: "AI-Generated · For Review"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                        lineNumber: 1382,
                                        columnNumber: 7
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 1380,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-base leading-relaxed text-sidebar-text/85",
                                children: patient.clinicalNote
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 1386,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Programming$2f$Web__Projects$2f$Vela$2f$techstars$2f$clinic$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-4 text-xs text-sidebar-text/40",
                                children: "Generated from patient check-in data, recovery scores, and app activity. Always apply clinical judgment. Not a substitute for direct patient assessment."
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                                lineNumber: 1389,
                                columnNumber: 6
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                        lineNumber: 1379,
                        columnNumber: 5
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
                lineNumber: 700,
                columnNumber: 4
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Programming/Web Projects/Vela/techstars/clinic-dashboard/src/app/page.tsx",
        lineNumber: 697,
        columnNumber: 3
    }, this);
}
_s(MockDashboardPage, "W6rEfouQlC9zs4tZf8664wyF5sA=");
_c8 = MockDashboardPage;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8;
__turbopack_context__.k.register(_c, "RecoveryRing");
__turbopack_context__.k.register(_c1, "SubScoreBar");
__turbopack_context__.k.register(_c2, "RatingDots");
__turbopack_context__.k.register(_c3, "Sparkline7");
__turbopack_context__.k.register(_c4, "StatusBadge");
__turbopack_context__.k.register(_c5, "SeverityBadge");
__turbopack_context__.k.register(_c6, "ScorePill");
__turbopack_context__.k.register(_c7, "MockSidebar");
__turbopack_context__.k.register(_c8, "MockDashboardPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=0k1y_Web%20Projects_Vela_techstars_clinic-dashboard_src_app_page_tsx_06w0p1b._.js.map