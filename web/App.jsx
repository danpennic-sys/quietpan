import React, { useEffect, useRef, useState } from "react";
import {
  Shield,
  Lock,
  Cpu,
  Flame,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
  Award,
  BookOpen,
  Anchor,
  Zap,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
  Sparkles
} from "lucide-react";

const MARQUEE_ITEMS = [
  "Cast Iron",
  "Long Fire",
  "Sovereign Table",
  "No Shortcuts",
  "Forged Not Printed",
  "God Bless This Republic"
];

// Embedded CSS styled for a dark, tactical, sovereign industrial design
const EMBEDDED_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=JetBrains+Mono:ital,wght@0,300;0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --qp-bg: #0b0d0e;
    --qp-surface: #121518;
    --qp-surface-hover: #1a1e23;
    --qp-border: #242930;
    --qp-border-accent: #3a424d;
    --qp-gold: #c9a96e;
    --qp-gold-glow: rgba(201, 169, 110, 0.15);
    --qp-bronze: #8c6d46;
    --qp-text-main: #e2e8f0;
    --qp-text-muted: #8a96a3;
    --qp-text-dim: #54606e;
    --qp-accent-green: #38bdf8;
    --qp-emerald: #10b981;
  }

  body {
    background-color: var(--qp-bg);
    color: var(--qp-text-main);
    font-family: 'Plus Jakarta Sans', sans-serif;
    overflow-x: hidden;
    margin: 0;
    padding: 0;
  }

  .font-serif-title {
    font-family: 'Cinzel', serif;
  }

  .font-mono-tech {
    font-family: 'JetBrains Mono', monospace;
  }

  /* Grain Overlay */
  .qp-grain {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 999;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }

  /* Reveal Animations */
  .qp-reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }

  .qp-reveal.qp-visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* Log line fade-in */
  @keyframes qp-fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .animate-fadeIn {
    animation: qp-fade-in 0.35s ease-out both;
  }

  /* Marquee Animation */
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }

  .animate-marquee {
    display: flex;
    width: max-content;
    animation: marquee 35s linear infinite;
  }

  .animate-marquee:hover {
    animation-play-state: paused;
  }

  /* Grid Background Pattern */
  .qp-tactical-grid {
    background-size: 40px 40px;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  }

  /* Focus-visible polish for interactive elements */
  button:focus-visible,
  a:focus-visible {
    outline: 2px solid var(--qp-gold);
    outline-offset: 2px;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #0b0d0e;
  }
  ::-webkit-scrollbar-thumb {
    background: #242930;
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #c9a96e;
  }
`;

export default function App() {
  const revealRefs = useRef([]);
  const [activeSection, setActiveSection] = useState("doctrine");

  // Verification Workbench State
  const [verifying, setVerifying] = useState(false);
  const [verifyLogs, setVerifyLogs] = useState([]);
  const [selectedProof, setSelectedProof] = useState("ml-kem-768");

  // Live date for the telemetry header (avoids hard-coded 2026-11-06)
  const [sysTime] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("qp-visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Returns only ref + optional style. Caller must include "qp-reveal" in className.
  const reveal = (delay = 0) => ({
    ref: (el) => {
      if (el && !revealRefs.current.includes(el)) {
        revealRefs.current.push(el);
      }
    },
    style: delay ? { transitionDelay: `${delay}s` } : undefined
  });

  // Verification simulation handler
  const runVerification = (proofType) => {
    setSelectedProof(proofType);
    setVerifying(true);
    setVerifyLogs([`[INIT] Fetching telemetry manifest for ${proofType.toUpperCase()}...`]);

    setTimeout(() => {
      setVerifyLogs((prev) => [...prev, "[ASSURE] Running FIPS 203 ML-KEM key encapsulation verification..."]);
    }, 600);

    setTimeout(() => {
      setVerifyLogs((prev) => [...prev, "[MATH] Validating lattice vector bounds & noise distribution..."]);
    }, 1200);

    setTimeout(() => {
      setVerifyLogs((prev) => [
        ...prev,
        "[SUCCESS] Non-repudiation proof sealed. Zero-lapse assurance confirmed."
      ]);
      setVerifying(false);
    }, 1800);
  };

  const clearLogs = () => {
    if (!verifying) setVerifyLogs([]);
  };

  return (
    <div className="min-h-screen bg-[#0b0d0e] text-[#e2e8f0] relative selection:bg-[#c9a96e]/30 selection:text-[#c9a96e]">
      <style>{EMBEDDED_CSS}</style>

      {/* Subtle Film Grain */}
      <div className="qp-grain" aria-hidden="true" />

      {/* TACTICAL HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0b0d0e]/85 border-b border-[#242930]/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Mark */}
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#1a1e23] to-[#0b0d0e] border border-[#c9a96e]/40 flex items-center justify-center group-hover:border-[#c9a96e] transition-all shadow-[0_0_15px_rgba(201,169,110,0.1)]">
              <Shield className="w-5 h-5 text-[#c9a96e] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="font-serif-title font-bold text-xl tracking-wider text-[#e2e8f0] block leading-none">
                QUIET PAN
              </span>
              <span className="font-mono-tech text-[10px] tracking-widest text-[#8a96a3] uppercase mt-1 block">
                SOVEREIGN ASSURANCE
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
            {[
              { id: "doctrine", label: "Doctrine" },
              { id: "pillars", label: "Pillars" },
              { id: "heritage", label: "Heritage" },
              { id: "covenant", label: "Covenant" },
              { id: "workbench", label: "Assurance Lab" }
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`font-mono-tech text-xs tracking-widest uppercase transition-colors relative py-1 ${
                  activeSection === item.id
                    ? "text-[#c9a96e]"
                    : "text-[#8a96a3] hover:text-[#e2e8f0]"
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c9a96e] rounded-full shadow-[0_0_8px_#c9a96e]" />
                )}
              </a>
            ))}
          </nav>

          {/* Action Badge */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono-tech bg-[#121518] border border-[#242930] text-[#8a96a3]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" aria-hidden="true" />
              STATUS: SEALED
            </span>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-20 overflow-hidden qp-tactical-grid">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c9a96e]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div
              className="qp-reveal inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#121518] border border-[#c9a96e]/30 text-[#c9a96e] text-xs font-mono-tech mb-8"
              {...reveal(0.1)}
            >
              <Flame className="w-4 h-4 text-[#c9a96e]" />
              HIGH-ASSURANCE OPERATIONAL DISCIPLINE
            </div>

            <h1
              className="qp-reveal font-serif-title text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#e2e8f0] leading-[1.15] mb-6"
              {...reveal(0.2)}
            >
              Proof Over Volume. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a96e] via-[#e2e8f0] to-[#8c6d46]">
                Quiet Cadence.
              </span>
            </h1>

            <p
              className="qp-reveal text-lg sm:text-xl text-[#8a96a3] font-light leading-relaxed mb-10"
              {...reveal(0.3)}
            >
              Built for high-stakes environments where integrity is silent, absolute, and immutable.
              We forge verifiable runtime architectures that stand unflinching against thermal shock and cryptographic drift.
            </p>

            <div className="qp-reveal flex flex-wrap items-center gap-4" {...reveal(0.4)}>
              <a
                href="#workbench"
                className="px-6 py-3.5 rounded-sm bg-[#c9a96e] hover:bg-[#b8985d] text-[#0b0d0e] font-semibold text-sm font-mono-tech tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(201,169,110,0.25)] flex items-center gap-2"
              >
                Inspect Telemetry <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#doctrine"
                className="px-6 py-3.5 rounded-sm bg-[#121518] hover:bg-[#1a1e23] border border-[#242930] hover:border-[#3a424d] text-[#e2e8f0] font-mono-tech text-sm tracking-wider uppercase transition-colors"
              >
                Read Doctrine
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE BANNER */}
      <div className="border-y border-[#242930] bg-[#121518]/60 py-4 overflow-hidden relative">
        <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <div key={idx} className="flex items-center gap-12">
              <span className="font-serif-title text-sm tracking-widest text-[#c9a96e] uppercase flex items-center gap-3">
                <Sparkles className="w-3.5 h-3.5 opacity-60 text-[#8c6d46]" />
                {item}
              </span>
              <span className="text-[#242930] text-xs">◆</span>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-32">

        {/* SECTION 1: DOCTRINE */}
        <section id="doctrine" className="scroll-mt-28">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="qp-reveal lg:col-span-5" {...reveal(0.1)}>
              <div className="font-mono-tech text-xs text-[#c9a96e] tracking-widest uppercase mb-2">
                01 // PHILOSOPHY
              </div>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-bold mb-6">
                The Quiet Pan Doctrine
              </h2>
              <p className="text-[#8a96a3] leading-relaxed mb-6">
                Cheap metal warps under sudden fire. Thin systems rattle, buckle, and demand constant attention.
                Our doctrine mandates heavyweight density—architectures built from multi-ply structural verification that dissipate heat without cracking.
              </p>
              <div className="p-4 rounded-sm bg-[#121518] border-l-2 border-[#c9a96e] text-sm text-[#8a96a3] italic font-serif-title">
                "Noise is the signature of energy wasted through vibration. True assurance moves silently."
              </div>
            </div>

            <div className="qp-reveal lg:col-span-7 grid sm:grid-cols-2 gap-6" {...reveal(0.2)}>
              {[
                {
                  icon: ShieldCheck,
                  title: "Proof Over Volume",
                  desc: "We prioritize mathematical certainty over marketing claims. Verification is continuous, quiet, and autonomous."
                },
                {
                  icon: Flame,
                  title: "Thermal Resistance",
                  desc: "Designed to withstand rapid state changes without distortion or loss of structural integrity under extreme load."
                },
                {
                  icon: Anchor,
                  title: "Sovereign Stance",
                  desc: "Zero external dependencies for core validation routines. Self-contained evidence production at all times."
                },
                {
                  icon: Activity,
                  title: "Zero-Lapse Execution",
                  desc: "Deterministic runtimes ensuring zero non-deterministic side effects or unexpected state transitions."
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-[#121518] border border-[#242930] rounded-sm hover:border-[#c9a96e]/40 transition-colors group"
                >
                  <item.icon className="w-8 h-8 text-[#c9a96e] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-serif-title text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-[#8a96a3] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: PILLARS */}
        <section id="pillars" className="scroll-mt-28">
          <div className="qp-reveal text-center max-w-2xl mx-auto mb-16" {...reveal(0.1)}>
            <div className="font-mono-tech text-xs text-[#c9a96e] tracking-widest uppercase mb-2">
              02 // CORE ARCHITECTURE
            </div>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold">
              The Four Structural Pillars
            </h2>
            <p className="text-[#8a96a3] mt-3">
              Engineered with zero compromises for high-consequence environments.
            </p>
          </div>

          <div className="qp-reveal grid md:grid-cols-2 lg:grid-cols-4 gap-6" {...reveal(0.2)}>
            {[
              {
                step: "01",
                title: "Formal Architecture",
                tag: "SPECIFICATION",
                icon: Layers,
                details: ["Formally verified state trees", "Strict memory safety boundaries", "Zero dynamic heap allocation"]
              },
              {
                step: "02",
                title: "Post-Quantum Assurance",
                tag: "CRYPTOGRAPHY",
                icon: Lock,
                details: ["FIPS 203 ML-KEM integration", "Post-quantum lattice signatures", "Sealed evidence logs"]
              },
              {
                step: "03",
                title: "Evidence Production",
                tag: "TELEMETRY",
                icon: Terminal,
                details: ["Tamper-evident hash chains", "Non-repudiable audit logs", "Real-time integrity checks"]
              },
              {
                step: "04",
                title: "Deterministic Runtime",
                tag: "EXECUTION",
                icon: Cpu,
                details: ["Predictable latency bounds", "Sub-millisecond verification", "Isolated fault domains"]
              }
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 bg-[#121518] border border-[#242930] rounded-sm relative overflow-hidden flex flex-col justify-between hover:border-[#c9a96e]/50 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#c9a96e]/5 rounded-bl-full pointer-events-none" />
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono-tech text-2xl font-bold text-[#c9a96e]/40">{pillar.step}</span>
                    <span className="font-mono-tech text-[10px] px-2 py-0.5 rounded bg-[#0b0d0e] border border-[#242930] text-[#8a96a3]">
                      {pillar.tag}
                    </span>
                  </div>
                  <pillar.icon className="w-6 h-6 text-[#c9a96e] mb-3" />
                  <h3 className="font-serif-title text-lg font-bold mb-4">{pillar.title}</h3>
                  <ul className="space-y-2 mb-6">
                    {pillar.details.map((d, i) => (
                      <li key={i} className="text-xs text-[#8a96a3] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-[#242930] flex items-center justify-between font-mono-tech text-[11px] text-[#8a96a3]">
                  <span>VERIFIED</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* INTERACTIVE WORKBENCH SECTION */}
        <section id="workbench" className="qp-reveal scroll-mt-28" {...reveal(0.1)}>
          <div className="p-8 sm:p-10 rounded-sm bg-[#121518] border border-[#242930] relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-[#242930] pb-6">
              <div>
                <div className="inline-flex items-center gap-2 font-mono-tech text-xs text-[#c9a96e] uppercase tracking-widest mb-1">
                  <Terminal className="w-4 h-4" /> INTERACTIVE VERIFICATION WORKBENCH
                </div>
                <h3 className="font-serif-title text-2xl font-bold">Simulate High-Assurance Telemetry</h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {["ml-kem-768", "dilithium-5", "sphincs-plus"].map((type) => (
                  <button
                    key={type}
                    onClick={() => runVerification(type)}
                    disabled={verifying}
                    className={`font-mono-tech text-xs px-3 py-2 rounded-sm border uppercase transition-colors ${
                      selectedProof === type
                        ? "bg-[#c9a96e] text-[#0b0d0e] border-[#c9a96e] font-semibold"
                        : "bg-[#0b0d0e] text-[#8a96a3] border-[#242930] hover:border-[#3a424d]"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-sm bg-[#0b0d0e] border border-[#242930]">
                  <div className="text-xs font-mono-tech text-[#8a96a3] mb-1">CRYPTO PRIMITIVE</div>
                  <div className="font-mono-tech text-sm text-[#e2e8f0] flex items-center justify-between">
                    <span>FIPS 203 ML-KEM Standard</span>
                    <span className="text-[#10b981]">ACTIVE</span>
                  </div>
                </div>
                <div className="p-4 rounded-sm bg-[#0b0d0e] border border-[#242930]">
                  <div className="text-xs font-mono-tech text-[#8a96a3] mb-1">NON-REPUDIATION BOUND</div>
                  <div className="font-mono-tech text-sm text-[#e2e8f0] flex items-center justify-between">
                    <span>2^256 Security Margin</span>
                    <span className="text-[#c9a96e]">HARDENED</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => runVerification(selectedProof)}
                    disabled={verifying}
                    className="flex-1 py-3.5 bg-[#1a1e23] hover:bg-[#242930] border border-[#c9a96e]/30 text-[#c9a96e] font-mono-tech text-xs tracking-wider uppercase rounded-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  >
                    {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {verifying ? "Executing Proof Verification..." : "Run Evidence Check"}
                  </button>
                  <button
                    onClick={clearLogs}
                    disabled={verifying || verifyLogs.length === 0}
                    className="px-4 py-3.5 bg-[#0b0d0e] border border-[#242930] text-[#8a96a3] font-mono-tech text-xs tracking-wider uppercase rounded-sm hover:border-[#3a424d] transition-colors disabled:opacity-40"
                    title="Clear log"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div
                  className="bg-[#0b0d0e] rounded-sm border border-[#242930] p-4 font-mono-tech text-xs h-64 overflow-y-auto flex flex-col justify-between"
                  role="log"
                  aria-live="polite"
                  aria-relevant="additions"
                >
                  <div className="space-y-2">
                    <div className="text-[#8a96a3] border-b border-[#242930] pb-2 flex justify-between">
                      <span>TELEMETRY STREAM // VERIFICATION LOG</span>
                      <span>SYS_TIME: {sysTime}</span>
                    </div>
                    {verifyLogs.length === 0 ? (
                      <div className="text-[#54606e] italic pt-4">
                        Click "Run Evidence Check" or select an algorithm above to trigger real-time verification sequence.
                      </div>
                    ) : (
                      verifyLogs.map((log, index) => (
                        <div key={index} className="text-[#e2e8f0] animate-fadeIn">
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="pt-2 border-t border-[#242930] text-[10px] text-[#54606e] flex justify-between">
                    <span>HASH: 0x9f8a...3b21</span>
                    <span>RESULT: ZERO ERROR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: HERITAGE */}
        <section id="heritage" className="qp-reveal scroll-mt-28" {...reveal(0.1)}>
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="p-8 bg-[#121518] border border-[#242930] rounded-sm space-y-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-[#c9a96e]" />
                  <h3 className="font-serif-title text-xl font-bold">Forged in the Midwest</h3>
                </div>
                <p className="text-sm text-[#8a96a3] leading-relaxed">
                  Headquartered in Missouri, our operator-led foundation builds with industrial rigor.
                  We don't manufacture hype; we forge high-assurance software designed for federal, defense, and high-consequence enterprise environments.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#242930] font-mono-tech text-xs">
                  <div>
                    <span className="block text-[#54606e] text-[10px] uppercase">ORIGIN</span>
                    <span className="text-[#e2e8f0]">MISSOURI, USA</span>
                  </div>
                  <div>
                    <span className="block text-[#54606e] text-[10px] uppercase">OPERATIONAL MODE</span>
                    <span className="text-[#c9a96e]">FOUNDER-OPERATED</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="font-mono-tech text-xs text-[#c9a96e] tracking-widest uppercase mb-2">
                03 // ROOT ORIGINS
              </div>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-bold mb-6">
                Uncompromising Heritage & Craftsmanship
              </h2>
              <p className="text-[#8a96a3] leading-relaxed mb-6">
                Like traditional heavy cast iron cookware that outlasts generations, true high-assurance digital systems require patience, precision, and hand-forged engineering discipline.
              </p>
              <div className="space-y-3 font-mono-tech text-xs text-[#8a96a3]">
                <div className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-[#c9a96e]" />
                  <span>No non-essential dependencies or bloatware.</span>
                </div>
                <div className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-[#c9a96e]" />
                  <span>Self-contained no_std Rust & verified execution cores.</span>
                </div>
                <div className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-[#c9a96e]" />
                  <span>Built to withstand thermal shock and state degradation.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: COVENANT */}
        <section id="covenant" className="qp-reveal scroll-mt-28" {...reveal(0.1)}>
          <div className="bg-gradient-to-br from-[#121518] to-[#0b0d0e] border border-[#242930] p-8 sm:p-12 rounded-sm relative overflow-hidden text-center max-w-4xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/30 flex items-center justify-center">
              <Award className="w-8 h-8 text-[#c9a96e]" />
            </div>

            <div className="font-mono-tech text-xs text-[#c9a96e] tracking-widest uppercase mb-2">
              04 // OUR GUARANTEE
            </div>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold mb-6">
              The Sovereign Covenant
            </h2>
            <p className="text-[#8a96a3] leading-relaxed max-w-2xl mx-auto mb-8">
              We pledge non-repudiable integrity. Every release, primitive, and contract shipped under the Quiet Pan seal carries an immutable proof of assurance.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
              <div className="p-4 bg-[#0b0d0e] border border-[#242930] rounded-sm">
                <div className="font-mono-tech text-xs text-[#c9a96e] mb-1">01. ZERO DRAFTING</div>
                <div className="text-xs text-[#8a96a3]">Code is shipped verified, tested, and sealed against drift.</div>
              </div>
              <div className="p-4 bg-[#0b0d0e] border border-[#242930] rounded-sm">
                <div className="font-mono-tech text-xs text-[#c9a96e] mb-1">02. IMMUTABLE PROOF</div>
                <div className="text-xs text-[#8a96a3]">Cryptographic evidence trails accompany all operational logs.</div>
              </div>
              <div className="p-4 bg-[#0b0d0e] border border-[#242930] rounded-sm">
                <div className="font-mono-tech text-xs text-[#c9a96e] mb-1">03. AUTONOMOUS RUN</div>
                <div className="text-xs text-[#8a96a3]">Runs without external callbacks or unexpected telemetry leaks.</div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#242930] bg-[#0b0d0e] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#c9a96e]" />
            <span className="font-serif-title font-bold text-sm tracking-wider text-[#e2e8f0]">
              QUIET PAN
            </span>
            <span className="text-xs text-[#54606e] font-mono-tech">| SOVEREIGN ASSURANCE</span>
          </div>

          <div className="font-mono-tech text-xs text-[#54606e]">
            © {new Date().getFullYear()} QUIET PAN. ALL RIGHTS RESERVED. FORGED WITH PURPOSE.
          </div>
        </div>
      </footer>
    </div>
  );
}
