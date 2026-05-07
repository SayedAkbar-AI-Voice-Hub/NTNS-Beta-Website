// scene.jsx — NTNS Voice Agent flow video (10s)
// Stage size: 1280x720

const { useState, useEffect, useMemo } = React;

// ── Color tokens (from NTNS) ──────────────────────────────────────────────
const C = {
  bg: '#0d0a1f',           // deep purple-black
  bgEnd: '#1a0d2e',
  inverse: '#283044',
  card: 'rgba(255,255,255,0.04)',
  cardHi: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.10)',
  primary: '#6063ee',
  primarySoft: '#8a8cff',
  secondary: '#fd56a7',
  secondaryDeep: '#b4136d',
  tertiary: '#00b4cf',
  text: '#eef0ff',
  textDim: 'rgba(238,240,255,0.65)',
  textMute: 'rgba(238,240,255,0.45)',
};

const FONT_DISPLAY = "'Space Grotesk', sans-serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

// ── Helpers ────────────────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => Math.max(0, Math.min(1, t));
const ease = {
  out: Easing.easeOutCubic,
  outBack: Easing.easeOutBack,
  inOut: Easing.easeInOutCubic,
  outExpo: Easing.easeOutExpo,
  outQuart: Easing.easeOutQuart,
};

// Window helper: progress 0..1 across [a,b], else clamped, with optional easing
const win = (t, a, b, e = Easing.linear) => e(clamp01((t - a) / (b - a)));

// ── Background: aura glows that drift ─────────────────────────────────────
function Aura() {
  const t = useTime();
  const drift1 = Math.sin(t * 0.6) * 30;
  const drift2 = Math.cos(t * 0.5) * 40;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* base gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 30% 20%, #1a0e3a 0%, ${C.bg} 55%, #06030f 100%)`,
      }} />
      {/* aura 1 — primary indigo */}
      <div style={{
        position: 'absolute',
        left: 100 + drift1, top: -150,
        width: 700, height: 700,
        background: 'radial-gradient(circle, rgba(96,99,238,0.55) 0%, rgba(96,99,238,0) 60%)',
        filter: 'blur(60px)',
      }} />
      {/* aura 2 — secondary pink */}
      <div style={{
        position: 'absolute',
        right: -100, bottom: -200 + drift2,
        width: 800, height: 800,
        background: 'radial-gradient(circle, rgba(253,86,167,0.35) 0%, rgba(253,86,167,0) 60%)',
        filter: 'blur(80px)',
      }} />
      {/* subtle noise via repeated gradients */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.4) 100%)',
      }} />
    </div>
  );
}

// ── Material icon helper ──────────────────────────────────────────────────
function Icon({ name, size = 24, color = '#fff', style = {} }) {
  return (
    <span className="material-symbols-outlined" style={{
      fontSize: size,
      color,
      lineHeight: 1,
      fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
      fontFeatureSettings: "'liga'",
      ...style,
    }}>{name}</span>
  );
}

// ── Scene 1: Incoming Call (0 - 1.8s) ─────────────────────────────────────
function S1_IncomingCall() {
  const { localTime, duration, progress } = useSprite();

  // Ring pulse — every 0.7s
  const ringT = (localTime % 0.7) / 0.7;
  const ringScale = 1 + 1.4 * ringT;
  const ringOpacity = (1 - ringT) * 0.7;

  // Card entry
  const cardT = win(localTime, 0, 0.5, ease.outBack);
  // Card exit
  const exitT = win(localTime, duration - 0.5, duration, ease.inOut);

  // Phone shake - subtle
  const shake = Math.sin(localTime * 30) * 1.5 * (localTime > 0.5 && localTime < duration - 0.6 ? 1 : 0);

  // "Answering..." morph (last 0.5s before exit)
  const morph = win(localTime, duration - 1.0, duration - 0.4, ease.out);

  return (
    <div style={{
      position: 'absolute', left: '50%', top: '50%',
      transform: `translate(-50%, -50%) scale(${lerp(0.85, 1, cardT) * lerp(1, 1.05, exitT)})`,
      opacity: cardT * (1 - exitT),
    }}>
      <div style={{
        width: 560, padding: '40px 48px',
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 32,
        boxShadow: '0 32px 80px rgba(70,72,212,0.35)',
        display: 'flex', alignItems: 'center', gap: 36,
        transform: `translateX(${shake}px)`,
      }}>
        {/* Pulse ring */}
        <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: `2px solid ${C.primarySoft}`,
            transform: `scale(${ringScale})`,
            opacity: ringOpacity,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.primary}, ${C.secondaryDeep})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(96,99,238,0.6)',
          }}>
            <Icon name={morph > 0.5 ? "headset_mic" : "call"} size={40} color="#fff" />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: FONT_BODY,
            fontSize: 13,
            fontWeight: 600,
            color: morph > 0.5 ? C.tertiary : C.primarySoft,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 8,
            transition: 'color 0.3s',
          }}>
            {morph > 0.5 ? '● AI Receptionist Online' : 'Incoming Call'}
          </div>
          <div style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 28,
            fontWeight: 600,
            color: C.text,
            letterSpacing: '-0.02em',
            marginBottom: 4,
            whiteSpace: 'nowrap',
          }}>
            {morph > 0.5 ? 'Answering…' : '+1 (510) 634-7901'}
          </div>
          <div style={{
            fontFamily: FONT_BODY,
            fontSize: 15,
            color: C.textDim,
          }}>
            {morph > 0.5 ? 'Response time: 0.3s' : 'Mike — Roofing inquiry'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Scene 2: Live Conversation (1.5 - 5s) ─────────────────────────────────
function S2_Conversation() {
  const { localTime, duration } = useSprite();

  const entryT = win(localTime, 0, 0.6, ease.outBack);
  const exitT = win(localTime, duration - 0.5, duration, ease.inOut);

  // Customer message appears first (0.4s in), then AI response (1.8s in)
  const custT = win(localTime, 0.4, 1.1, ease.out);
  const aiBubbleT = win(localTime, 1.8, 2.5, ease.outBack);
  const aiTextT = win(localTime, 2.3, duration - 1.0, Easing.linear);

  const aiText = "I've found an opening for tomorrow at 2 PM. Would you like me to reserve that for your roof inspection?";
  const charsToShow = Math.floor(aiText.length * aiTextT);
  const visibleText = aiText.slice(0, charsToShow);

  // Voice waveform during AI speech (after bubble appears)
  const speaking = localTime > 2.0 && localTime < duration - 0.7;

  return (
    <div style={{
      position: 'absolute',
      left: '50%', top: '50%',
      transform: `translate(-50%, -50%) scale(${lerp(0.95, 1, entryT)})`,
      opacity: entryT * (1 - exitT),
      width: 880,
    }}>
      {/* Window chrome */}
      <div style={{
        background: 'rgba(40,48,68,0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
          <div style={{
            marginLeft: 16,
            fontFamily: FONT_MONO, fontSize: 12,
            color: C.textMute, letterSpacing: '0.05em',
          }}>NTNS_AI_SYSTEM_V2.0 — LIVE CONVERSATION</div>
        </div>

        <div style={{ padding: 32, minHeight: 320 }}>
          {/* Section label */}
          <div style={{
            fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600,
            color: C.textMute, letterSpacing: '0.18em',
            textTransform: 'uppercase', marginBottom: 20,
          }}>Live Conversation</div>

          {/* Customer message */}
          <div style={{
            opacity: custT,
            transform: `translateY(${(1 - custT) * 8}px)`,
            display: 'flex', justifyContent: 'flex-end',
            marginBottom: 16,
          }}>
            <div style={{
              maxWidth: '70%',
              padding: '14px 20px',
              background: 'rgba(96,99,238,0.20)',
              border: '1px solid rgba(96,99,238,0.30)',
              borderRadius: '20px 20px 4px 20px',
            }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600, color: C.primarySoft, letterSpacing: '0.1em', marginBottom: 4 }}>CUSTOMER</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 16, color: C.text, lineHeight: 1.5 }}>
                "Need someone to inspect my roof — got time tomorrow?"
              </div>
            </div>
          </div>

          {/* AI bubble */}
          <div style={{
            opacity: aiBubbleT,
            transform: `translateY(${(1 - aiBubbleT) * 12}px) scale(${lerp(0.96, 1, aiBubbleT)})`,
            display: 'flex', alignItems: 'flex-start', gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, flexShrink: 0,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.primary}, ${C.secondaryDeep})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(96,99,238,0.5)',
            }}>
              <Icon name="headset_mic" size={20} color="#fff" />
            </div>

            <div style={{
              flex: 1,
              padding: '16px 22px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '4px 20px 20px 20px',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 8,
              }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600, color: C.primarySoft, letterSpacing: '0.1em' }}>AI RECEPTIONIST</div>
                {/* Voice waveform */}
                {speaking && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 16 }}>
                    {[0, 1, 2, 3, 4].map(i => {
                      const phase = localTime * 8 + i * 0.7;
                      const h = 4 + Math.abs(Math.sin(phase)) * 12;
                      return (
                        <div key={i} style={{
                          width: 3, height: h,
                          background: C.secondary,
                          borderRadius: 2,
                          transition: 'height 0.05s',
                        }} />
                      );
                    })}
                  </div>
                )}
              </div>
              <div style={{
                fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 500,
                color: C.text, lineHeight: 1.4,
                fontStyle: 'italic',
                minHeight: 90,
              }}>
                "{visibleText}<span style={{
                  opacity: aiTextT < 1 ? (Math.floor(localTime * 4) % 2) : 0,
                  color: C.secondary,
                }}>▎</span>"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Scene 3: Qualifies & Captures (4.8 - 7.3s) ────────────────────────────
function S3_Qualifies() {
  const { localTime, duration } = useSprite();

  const entryT = win(localTime, 0, 0.5, ease.outBack);
  const exitT = win(localTime, duration - 0.4, duration, ease.inOut);

  // Confidence meter fills 0 -> 99.2 over 0.5 to 2.4s
  const confT = win(localTime, 0.5, 2.4, ease.outQuart);
  const confValue = (confT * 99.2).toFixed(1);

  // Booking intent badge "Ultra-High" pops at 2.4s
  const intentT = win(localTime, 2.4, 3.0, ease.outBack);

  // Lead profile fields stagger in 2.8 - 4.0s
  const leadT = win(localTime, 2.8, 3.5, ease.out);

  const fields = [
    { label: 'Name', value: 'Mike Anderson', start: 2.8 },
    { label: 'Service', value: 'Roof Inspection', start: 3.2 },
    { label: 'Timing', value: 'Tomorrow, 2 PM', start: 3.6 },
  ];

  return (
    <div style={{
      position: 'absolute',
      left: '50%', top: '50%',
      transform: `translate(-50%, -50%) scale(${lerp(0.95, 1, entryT)})`,
      opacity: entryT * (1 - exitT),
      width: 980,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 24,
    }}>
      {/* LEFT: Confidence + Intent */}
      <div style={{
        padding: 32,
        background: 'rgba(40,48,68,0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
      }}>
        <div style={{
          fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600,
          color: C.textMute, letterSpacing: '0.18em',
          textTransform: 'uppercase', marginBottom: 28,
        }}>Qualification Signals</div>

        {/* Confidence circular gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
          <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="56" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
              <circle
                cx="65" cy="65" r="56"
                stroke="url(#confGrad)"
                strokeWidth="10" fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 56}
                strokeDashoffset={2 * Math.PI * 56 * (1 - confT * 0.992)}
                transform="rotate(-90 65 65)"
                style={{ filter: `drop-shadow(0 0 8px rgba(96,99,238,${confT * 0.8}))` }}
              />
              <defs>
                <linearGradient id="confGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={C.primarySoft} />
                  <stop offset="100%" stopColor={C.secondary} />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 700,
                color: C.text, letterSpacing: '-0.02em',
              }}>{confValue}%</div>
            </div>
          </div>
          <div>
            <div style={{
              fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600,
              color: C.textMute, letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: 4,
            }}>Confidence</div>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600,
              color: C.text, marginBottom: 6,
            }}>Verified Lead</div>
            <div style={{
              fontFamily: FONT_BODY, fontSize: 14,
              color: C.textDim,
            }}>Match against intent model</div>
          </div>
        </div>

        {/* Booking Intent badge */}
        <div style={{
          opacity: intentT,
          transform: `scale(${lerp(0.7, 1, intentT)})`,
          padding: '18px 24px',
          background: `linear-gradient(135deg, rgba(180,19,109,0.25), rgba(253,86,167,0.15))`,
          border: '1px solid rgba(253,86,167,0.4)',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, color: C.textMute, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Booking Intent</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 700, color: C.secondary, letterSpacing: '-0.02em' }}>Ultra-High</div>
          </div>
          <Icon name="trending_up" size={36} color={C.secondary} />
        </div>
      </div>

      {/* RIGHT: Lead profile capture */}
      <div style={{
        padding: 32,
        background: 'rgba(40,48,68,0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24,
        }}>
          <div style={{
            fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600,
            color: C.textMute, letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}>Lead Profile</div>
          <div style={{
            opacity: leadT,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px',
            background: 'rgba(0,180,207,0.15)',
            border: '1px solid rgba(0,180,207,0.3)',
            borderRadius: 999,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.tertiary, boxShadow: `0 0 8px ${C.tertiary}` }} />
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.tertiary, letterSpacing: '0.05em' }}>CAPTURING</div>
          </div>
        </div>

        {fields.map((f, i) => {
          const fT = win(localTime, f.start, f.start + 0.4, ease.outBack);
          return (
            <div key={f.label} style={{
              opacity: fT,
              transform: `translateX(${(1 - fT) * 20}px)`,
              padding: '14px 18px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
              marginBottom: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600, color: C.textMute, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 500, color: C.text }}>{f.value}</div>
              </div>
              <Icon name="check_circle" size={20} color={C.tertiary} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Scene 4: Pipeline Cascade (7.0 - 9.5s) ────────────────────────────────
function S4_Pipeline() {
  const { localTime, duration } = useSprite();

  const entryT = win(localTime, 0, 0.5, ease.outBack);
  const exitT = win(localTime, duration - 0.3, duration, ease.inOut);

  const steps = [
    { icon: 'call', label: 'Incoming Call Answered', sub: '0.3s response time', color: C.primarySoft, start: 0.5 },
    { icon: 'sms', label: 'Follow-up SMS Sent', sub: 'Automatic within 30s', color: C.secondary, start: 1.3 },
    { icon: 'event_available', label: 'Appointment Booked', sub: 'Synced to calendar', color: C.tertiary, start: 2.1 },
    { icon: 'person_add', label: 'Lead Added to CRM', sub: 'Full profile created', color: C.primarySoft, start: 2.9 },
  ];

  return (
    <div style={{
      position: 'absolute',
      left: '50%', top: '50%',
      transform: `translate(-50%, -50%) scale(${lerp(0.95, 1, entryT)})`,
      opacity: entryT * (1 - exitT),
      width: 720,
    }}>
      <div style={{
        fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600,
        color: C.textMute, letterSpacing: '0.18em',
        textTransform: 'uppercase', marginBottom: 20, textAlign: 'center',
      }}>System Pipeline — Auto-Executing</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {steps.map((s, i) => {
          const stepT = win(localTime, s.start, s.start + 0.35, ease.outBack);
          const checkT = win(localTime, s.start + 0.3, s.start + 0.6, ease.out);
          return (
            <div key={s.label} style={{
              opacity: stepT,
              transform: `translateY(${(1 - stepT) * 24}px)`,
              padding: '18px 24px',
              background: 'rgba(40,48,68,0.85)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${checkT > 0 ? `rgba(0,180,207,${checkT * 0.4})` : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 16,
              display: 'flex', alignItems: 'center', gap: 18,
              boxShadow: checkT > 0 ? `0 4px 24px rgba(0,180,207,${checkT * 0.2})` : 'none',
              transition: 'border 0.2s, box-shadow 0.2s',
            }}>
              <div style={{
                width: 44, height: 44, flexShrink: 0,
                borderRadius: 12,
                background: `${s.color}22`,
                border: `1px solid ${s.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={s.icon} size={22} color={s.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, color: C.text }}>{s.label}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.textDim, marginTop: 2 }}>{s.sub}</div>
              </div>
              {/* Check mark with stroke draw */}
              <div style={{
                width: 28, height: 28,
                borderRadius: '50%',
                background: checkT > 0.1 ? C.tertiary : 'rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: `scale(${lerp(0.5, 1, checkT)})`,
                boxShadow: checkT > 0.5 ? `0 0 16px ${C.tertiary}88` : 'none',
                transition: 'background 0.2s, box-shadow 0.2s',
              }}>
                {checkT > 0.2 && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8.5 L6.5 12 L13 4"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="20"
                      strokeDashoffset={(1 - clamp01((checkT - 0.2) / 0.6)) * 20}
                    />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Scene 5: Final beat (9.3 - 10s) ───────────────────────────────────────
function S5_Final() {
  const { localTime, duration } = useSprite();
  const entryT = win(localTime, 0, 0.4, ease.outBack);
  const lineT = win(localTime, 0.3, 0.9, ease.out);

  return (
    <div style={{
      position: 'absolute',
      left: '50%', top: '50%',
      transform: `translate(-50%, -50%) scale(${lerp(0.9, 1, entryT)})`,
      opacity: entryT,
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 500,
        color: C.textDim, letterSpacing: '0.4em',
        textTransform: 'uppercase', marginBottom: 24,
      }}>NTNS</div>
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: 72, fontWeight: 700,
        letterSpacing: '-0.04em', lineHeight: 1.05,
      }}>
        <span style={{
          background: `linear-gradient(90deg, ${C.primarySoft}, ${C.secondary}, ${C.primarySoft})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>Never Miss</span>
        <br/>
        <span style={{ color: C.text }}>A Lead Again.</span>
      </div>
      <div style={{
        margin: '32px auto 0',
        height: 2,
        width: lineT * 320,
        background: `linear-gradient(90deg, transparent, ${C.secondary}, transparent)`,
        opacity: lineT,
      }} />
    </div>
  );
}

// ── Stage label badge (small chrome) ─────────────────────────────────────
function StageLabel({ children, num }) {
  const { localTime } = useSprite();
  const t = win(localTime, 0, 0.4, ease.outBack);
  return (
    <div style={{
      position: 'absolute',
      left: 48, top: 48,
      opacity: t, transform: `translateY(${(1 - t) * -8}px)`,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700,
        color: C.primarySoft,
      }}>0{num}</div>
      <div style={{
        fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600,
        color: C.text, letterSpacing: '0.14em',
        textTransform: 'uppercase',
      }}>{children}</div>
    </div>
  );
}

// ── Connector line between scenes (continuity) ──────────────────────────
function ProgressBar() {
  const t = useTime();
  const total = 20;
  const stages = [
    { at: 0, label: 'Answer' },
    { at: 3.2, label: 'Converse' },
    { at: 9.6, label: 'Qualify' },
    { at: 14.2, label: 'Execute' },
    { at: 18.6, label: 'Done' },
  ];
  return (
    <div style={{
      position: 'absolute',
      bottom: 32, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '10px 18px',
      background: 'rgba(0,0,0,0.35)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 999,
      backdropFilter: 'blur(8px)',
    }}>
      {stages.slice(0, 4).map((s, i) => {
        const next = stages[i + 1];
        const active = t >= s.at && t < next.at;
        const done = t >= next.at;
        return (
          <React.Fragment key={s.label}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              opacity: active ? 1 : done ? 0.6 : 0.35,
              transition: 'opacity 0.3s',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: active ? C.secondary : done ? C.tertiary : 'rgba(255,255,255,0.3)',
                boxShadow: active ? `0 0 12px ${C.secondary}` : 'none',
              }} />
              <div style={{
                fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600,
                color: C.text, letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>{s.label}</div>
            </div>
            {i < 3 && (
              <div style={{
                width: 24, height: 1,
                background: 'rgba(255,255,255,0.15)',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Master scene ─────────────────────────────────────────────────────────
function VoiceAgentVideo() {
  return (
    <>
      <Aura />

      {/* Scene 1: Incoming Call (0-3.4) */}
      <Sprite start={0} end={3.4}>
        <StageLabel num={1}>Incoming Call</StageLabel>
        <S1_IncomingCall />
      </Sprite>

      {/* Scene 2: Conversation (3.2-9.8) */}
      <Sprite start={3.2} end={9.8}>
        <StageLabel num={2}>Live Conversation</StageLabel>
        <S2_Conversation />
      </Sprite>

      {/* Scene 3: Qualifies & Captures (9.6-14.4) */}
      <Sprite start={9.6} end={14.4}>
        <StageLabel num={3}>Qualifies & Captures</StageLabel>
        <S3_Qualifies />
      </Sprite>

      {/* Scene 4: Pipeline (14.2-18.7) */}
      <Sprite start={14.2} end={18.7}>
        <StageLabel num={4}>Books & Syncs</StageLabel>
        <S4_Pipeline />
      </Sprite>

      {/* Scene 5: Tagline (18.6-20) */}
      <Sprite start={18.6} end={20}>
        <S5_Final />
      </Sprite>

      <ProgressBar />
    </>
  );
}

window.VoiceAgentVideo = VoiceAgentVideo;
