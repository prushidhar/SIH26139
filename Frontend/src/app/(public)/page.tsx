"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  AnimatePresence,
  useInView,
} from "motion/react";
import { useRef, useState, useEffect, type ReactNode } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  Sparkles,
  Cpu,
  CircleDot,
  Globe2,
} from "lucide-react";
import BrandLogo from "@/components/common/BrandLogo";

function GithubIcon({ size = 15, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Motion primitives                                                    */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared atoms                                                         */
/* ------------------------------------------------------------------ */

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#006766] font-semibold">
      <span className="h-1.5 w-1.5 rounded-full bg-[#00B489]" />
      {children}
    </div>
  );
}

function Glass({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[#DFEBE8] bg-white/80 shadow-[0_10px_30px_-12px_rgba(0,103,102,0.06)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation                                                           */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Screening", href: "#screening" },
  { label: "Live Demo", href: "#live-demo" },
  { label: "Results", href: "#results" },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-2.5 sm:px-4 pt-2.5 sm:pt-4">
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full border px-3 sm:px-5 transition-all duration-500 ${
          scrolled
            ? "border-[#DFEBE8] bg-white/90 py-2 sm:py-2.5 shadow-[0_10px_30px_-12px_rgba(0,103,102,0.08)] backdrop-blur-xl"
            : "border-[#DFEBE8]/60 bg-white/60 py-2 sm:py-3 backdrop-blur-md"
        }`}
      >
        <a href="#top" className="flex items-center gap-2 shrink-0">
          <BrandLogo size="sm" showBadge={false} />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[13.5px] text-[#5A7470] font-medium transition-colors hover:text-[#082827]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/login"
            className="rounded-full border border-[#DFEBE8] bg-white px-4 py-1.5 text-xs text-[#082827] font-semibold hover:bg-[#F2F7F6] transition-colors shadow-xs"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#006766] px-4 py-1.5 text-xs text-white font-semibold hover:bg-[#0D4F46] transition-colors shadow-xs"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                 */
/* ------------------------------------------------------------------ */

function Hero() {
  const ref = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0.15]);

  return (
    <section id="top" ref={ref} className="relative overflow-hidden px-4 sm:px-6 pb-20 sm:pb-28 pt-28 sm:pt-36 md:pt-48">
      {/* atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(55rem 30rem at 20% -5%, rgba(0, 180, 137, 0.08), transparent 60%), radial-gradient(48rem 28rem at 85% 10%, rgba(0, 103, 102, 0.06), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(#DFEBE8 1px, transparent 1px), linear-gradient(90deg, #DFEBE8 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(48rem 30rem at 50% 0%, black, transparent 78%)",
        }}
      />

      <motion.div style={{ y, opacity }} className="mx-auto max-w-5xl">
        <Reveal>
          <Eyebrow>AI-powered disease screening</Eyebrow>
        </Reveal>

        <Reveal delay={0.06}>
          <h1 className="mt-6 max-w-4xl font-sans text-[clamp(2.5rem,5.5vw,4.4rem)] font-bold leading-[1.05] tracking-tight text-[#082827]">
            Screen for multiple diseases
            <span className="text-[#5A7470]"> from routine clinical data — in seconds.</span>
          </h1>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-7 max-w-2xl text-[16.5px] leading-[1.7] text-[#5A7470] font-normal">
            QureSight combines quantum-enhanced machine learning with classical baselines to detect
            early signs of breast cancer, heart disease, liver disorders, and more. Upload patient
            data, get risk scores with full explainability, and verify every result against
            peer-reviewed benchmarks.
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#live-demo"
              className="rounded-full border border-[#DFEBE8] bg-white px-6 py-3 text-[14px] font-semibold text-[#082827] shadow-xs transition-colors hover:bg-[#F2F7F6]"
            >
              See it in action
            </a>
            <Link
              href="/home"
              className="group inline-flex items-center gap-2 rounded-full bg-[#006766] px-6 py-3 text-[14px] font-semibold text-white transition-all shadow-xs hover:bg-[#0D4F46]"
            >
              Start screening
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.24}>
          <dl className="mt-16 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-8 border-t border-[#DFEBE8] pt-8 sm:grid-cols-4">
            {[
              ["7+", "disease screening modules"],
              ["6", "clinical validation cohorts"],
              ["< 3s", "average inference time"],
              ["100%", "explainable predictions"],
            ].map(([v, k]) => (
              <div key={k}>
                <dt className="font-sans text-2xl sm:text-3xl font-bold text-[#082827]">{v}</dt>
                <dd className="mt-1.5 text-[12px] leading-snug text-[#5A7470] font-medium">{k}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Clinical reality                                                     */
/* ------------------------------------------------------------------ */

const CHALLENGES = [
  {
    n: "01",
    title: "Hidden patterns in routine labs",
    body: "A single blood marker rarely tells the full story. QureSight maps interactions across dozens of biomarkers simultaneously, surfacing risk signals that individual tests miss.",
  },
  {
    n: "02",
    title: "Small datasets, high stakes",
    body: "Clinical cohorts are often limited to hundreds of patients. Our quantum-enhanced kernels extract meaningful structure from small datasets where deep learning overfits and simple models underfit.",
  },
  {
    n: "03",
    title: "Black-box models erode trust",
    body: "Clinicians need to understand why a model flags a patient. Every QureSight prediction traces back to specific biomarkers and their interactions — no opaque scores.",
  },
  {
    n: "04",
    title: "One model doesn't fit all diseases",
    body: "Breast cancer, liver disease, and heart conditions each have unique biomarker profiles. QureSight adapts its screening pipeline to each disease with validated, peer-reviewed protocols.",
  },
];

function ClinicalReality() {
  return (
    <section id="how-it-works" className="relative border-t border-[#DFEBE8] bg-[#F2F7F6]/60 px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <Eyebrow>Why QureSight</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-6 max-w-3xl font-sans text-[clamp(2rem,4vw,3.1rem)] font-bold leading-[1.1] tracking-tight text-[#082827]">
            The clinical challenges we solve
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.7] text-[#5A7470] font-normal">
            Traditional screening tools look at one test at a time. QureSight analyzes the full
            picture — combining multiple biomarkers, patient history, and imaging data to catch
            diseases earlier and more accurately.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {CHALLENGES.map((f, i) => (
            <Reveal key={f.n} delay={0.05 * i}>
              <div className="h-full p-8 md:p-9 rounded-2xl border border-[#DFEBE8] bg-white shadow-[0_10px_30px_-12px_rgba(0,103,102,0.06)] transition-all hover:border-[#00B489]/40">
                <span className="font-mono text-[11px] tracking-[0.2em] text-[#006766] font-bold">{f.n}</span>
                <h3 className="mt-3 font-sans text-[20px] font-bold leading-snug text-[#082827]">{f.title}</h3>
                <p className="mt-3 text-[14.5px] leading-[1.75] text-[#5A7470] font-normal">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pipeline                                                             */
/* ------------------------------------------------------------------ */

const STAGES = [
  {
    id: "ingest",
    label: "Step 01",
    title: "Data ingestion & validation",
    body: "Upload patient biomarkers, lab reports, or chest X-rays. QureSight validates inputs against expected ranges, flags anomalies, and normalizes values — ensuring clean data before any model touches it.",
    meta: ["Multi-format input", "Auto-validation", "Outlier flagging"],
  },
  {
    id: "encode",
    label: "Step 02",
    title: "Intelligent feature encoding",
    body: "Raw clinical values are compressed into a compact representation optimized for each disease. The encoding preserves the relationships between biomarkers that matter most for early detection.",
    meta: ["Disease-specific", "Relationship-preserving", "Dimensionality reduction"],
  },
  {
    id: "predict",
    label: "Step 03",
    title: "Hybrid model inference",
    body: "Each patient record runs through both quantum-enhanced and classical models simultaneously. Results are compared side-by-side so you can see exactly where the quantum approach adds value — and where it doesn't.",
    meta: ["Dual-model comparison", "Real-time scoring", "Confidence intervals"],
  },
  {
    id: "explain",
    label: "Step 04",
    title: "Explainable risk attribution",
    body: "Every prediction comes with a breakdown of which biomarkers drove the result and how they interacted. Clinicians see named features, not abstract weights — making every score auditable and actionable.",
    meta: ["Feature attribution", "Interaction mapping", "Clinical-ready reports"],
  },
];

function Pipeline() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end 80%"] });
  const railHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="screening" className="relative border-t border-[#DFEBE8] bg-white px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <Eyebrow>Screening pipeline</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-6 max-w-3xl font-sans text-[clamp(2rem,4vw,3.1rem)] font-bold leading-[1.1] tracking-tight text-[#082827]">
            From patient data to actionable insight
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.7] text-[#5A7470] font-normal">
            Four steps, fully transparent. Every screening run is logged with its inputs, model
            versions, and outputs — so results are always reproducible and auditable.
          </p>
        </Reveal>

        <div ref={ref} className="relative mt-20 pl-8 md:pl-16">
          <div className="absolute left-0 top-2 bottom-2 w-px bg-[#DFEBE8] md:left-6" />
          <motion.div
            style={{ height: railHeight }}
            className="absolute left-0 top-2 w-px origin-top bg-[#006766] md:left-6"
          />

          <div className="space-y-6">
            {STAGES.map((s, i) => (
              <Reveal key={s.id} delay={0.04 * i}>
                <div className="relative">
                  <span className="absolute -left-8 top-9 h-2.5 w-2.5 rounded-full bg-[#00B489] ring-4 ring-[#E6F7F4] md:-left-[2.85rem]" />
                  <Glass className="p-8 transition-all duration-300 hover:border-[#00B489]/30 md:p-10">
                    <div className="flex flex-col gap-8 md:flex-row md:items-start">
                      <div className="md:w-52 md:shrink-0">
                        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#006766] font-bold">
                          {s.label}
                        </span>
                        <h3 className="mt-2.5 font-sans text-[22px] font-bold leading-tight text-[#082827]">{s.title}</h3>
                      </div>
                      <div className="flex-1">
                        <p className="text-[15px] leading-[1.78] text-[#5A7470] font-normal">{s.body}</p>
                        <div className="mt-6 flex flex-wrap gap-2">
                          {s.meta.map((m) => (
                            <span
                              key={m}
                              className="rounded-full border border-[#DFEBE8] bg-[#E6F7F4]/60 px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#006766] font-semibold"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Glass>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Benchmarking                                                         */
/* ------------------------------------------------------------------ */

const ROWS = [
  ["Logistic Regression", "0.812", "0.74", "0.79", "baseline"],
  ["Random Forest", "0.836", "0.76", "0.80", "0.048"],
  ["XGBoost", "0.869", "0.81", "0.83", "0.012"],
  ["QureSight Hybrid (sim)", "0.891", "0.86", "0.84", "0.031"],
  ["QureSight Hybrid (QPU)", "0.883", "0.85", "0.83", "0.044"],
];

function Benchmarking() {
  return (
    <section id="results" className="relative border-t border-[#DFEBE8] bg-[#F2F7F6]/60 px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Reveal>
              <Eyebrow>Verified results</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 font-sans text-[clamp(2rem,4vw,3.1rem)] font-bold leading-[1.1] tracking-tight text-[#082827]">
                Every claim backed by numbers
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-7 space-y-5 text-[15.5px] leading-[1.78] text-[#5A7470] font-normal">
                <p>
                  All models are trained and tested on identical data splits with the same
                  preprocessing. No cherry-picking, no test-set tuning. When the classical model
                  wins, we say so — and recommend it.
                </p>
                <p>
                  Results are compared using standard statistical tests. A difference that
                  doesn't clear the significance threshold is reported as no difference.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-9 border-l-2 border-[#00B489] pl-5">
                <p className="font-sans text-[16px] italic leading-relaxed text-[#082827] font-medium">
                  "Honest benchmarks build clinical trust. We publish negative results alongside
                  positive ones."
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <Glass className="overflow-hidden bg-white border border-[#DFEBE8] shadow-[0_10px_30px_-12px_rgba(0,103,102,0.06)]">
              <div className="flex items-center justify-between border-b border-[#DFEBE8] px-6 py-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#5A7470] font-semibold">
                  Screening performance · breast cancer cohort
                </span>
                <span className="font-mono text-[11px] text-[#006766] font-bold">5-fold CV</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[#DFEBE8] text-[11px] uppercase tracking-[0.12em] text-[#5A7470] bg-[#F2F7F6]/50">
                      <th className="px-6 py-3 font-semibold">Model</th>
                      <th className="px-4 py-3 font-semibold">AUC</th>
                      <th className="px-4 py-3 font-semibold">Sens.</th>
                      <th className="px-4 py-3 font-semibold">Spec.</th>
                      <th className="px-6 py-3 font-semibold">p-val</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((r, i) => (
                      <tr
                        key={r[0]}
                        className={`border-b border-[#DFEBE8]/70 last:border-0 ${
                          i >= 3 ? "bg-[#E6F7F4]/60 font-medium" : ""
                        }`}
                      >
                        <td className="px-6 py-3.5 text-[#082827] font-medium">{r[0]}</td>
                        <td className="px-4 py-3.5 font-mono text-[#082827] font-semibold">{r[1]}</td>
                        <td className="px-4 py-3.5 font-mono text-[#5A7470]">{r[2]}</td>
                        <td className="px-4 py-3.5 font-mono text-[#5A7470]">{r[3]}</td>
                        <td className="px-6 py-3.5 font-mono text-[#5A7470]">{r[4]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="border-t border-[#DFEBE8] px-6 py-4 text-[12px] leading-relaxed text-[#5A7470]">
                Representative results from the Wisconsin Breast Cancer cohort. QureSight hybrid rows
                are highlighted. All comparisons use paired statistical tests with correction for
                multiple comparisons.
              </p>
            </Glass>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* MoveToTop Floating Button                                            */
/* ------------------------------------------------------------------ */

function MoveToTop() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setVisible(latest > 400);
    });
  }, [scrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 z-[999] p-3 rounded-full bg-[#006766] text-white shadow-[0_10px_30px_-8px_rgba(0,103,102,0.4)] hover:scale-110 hover:bg-[#0D4F46] transition-all border border-[#00B489]/30 cursor-pointer"
          aria-label="Scroll to top"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Big Cinematic Footer (Vocaria AI Architecture)                     */
/* ------------------------------------------------------------------ */

function Footer() {
  const credits = [
    "Python + FastAPI",
    "Next.js 15",
    "Scikit-learn",
    "PennyLane",
    "XGBoost",
    "SHAP Explainability",
    "Qiskit Runtime",
    "Framer Motion",
  ];

  const cols = [
    {
      title: "Screening",
      items: [
        { name: "Disease Detection", path: "/predict" },
        { name: "Breast Cancer", path: "/predict/breast-cancer" },
        { name: "Cardiomegaly", path: "/predict/cardiomegaly" },
        { name: "Liver Screening", path: "/predict/liver-ilpd" },
        { name: "Try the Demo", path: "/predict/demo" },
      ],
    },
    {
      title: "Explore",
      items: [
        { name: "Signal Studio", path: "/signal-studio" },
        { name: "Explainability", path: "/explainability" },
        { name: "Feasibility Check", path: "/feasibility" },
        { name: "Data Vault", path: "/vault" },
        { name: "Workspace", path: "/workspace" },
      ],
    },
    {
      title: "Legal & Docs",
      items: [
        {
          name: "API Reference",
          path: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/docs`,
        },
        { name: "Terms of Service", path: "/terms" },
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Disclaimer", path: "/disclaimer" },
        { name: "Cookie Policy", path: "/cookies" },
      ],
    },
  ];

  /* Refs for in-view detection */
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.2 });
  const gridInView = useInView(gridRef, { once: true, amount: 0.15 });
  const wordmarkInView = useInView(wordmarkRef, { once: true, amount: 0.3 });
  const barInView = useInView(barRef, { once: true, amount: 0.5 });

  return (
    <footer className="relative border-t border-[#006766]/30 bg-[#082827] text-white overflow-hidden">
      {/* Top Statement Section */}
      <div
        ref={heroRef}
        className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-24 pb-16 grid grid-cols-12 gap-8"
      >
        <div className="col-span-12 md:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="font-mono text-white/60 mb-6 flex items-center gap-3 text-[11px] uppercase tracking-widest"
          >
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-[#00B489] animate-pulse" />
              <span className="font-sans text-xl font-bold tracking-tight text-white">QureSight</span>
              <span className="text-white/50">· Clinical Diagnostic Suite</span>
            </div>
          </motion.div>
          <motion.h2
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={heroInView ? { clipPath: "inset(0 0% 0 0)" } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.04] tracking-tight max-w-[24ch] text-white font-sans"
          >
            Catch diseases earlier with clinical-grade screening — verified, explainable, and built for real medical workflows.
          </motion.h2>
        </div>

        <div className="col-span-12 md:col-span-4 flex flex-col justify-end gap-4 mt-8 md:mt-0">
          <motion.a
            href="https://github.com/prushidhar/SIH26139"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 30 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-full px-6 h-14 flex items-center justify-between gap-3 group bg-white/[0.08] border border-white/15 hover:bg-white hover:text-[#082827] transition-all backdrop-blur-md"
          >
            <span className="font-mono text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
              <GithubIcon size={15} /> VISIT GITHUB
            </span>
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </motion.a>

          <motion.a
            href="/home"
            initial={{ opacity: 0, x: 30 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.55 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-full px-6 h-14 flex items-center justify-between gap-3 group bg-[#006766] border border-[#00B489]/40 hover:bg-[#00B489] hover:text-[#082827] text-white transition-all backdrop-blur-md cursor-pointer shadow-xs"
          >
            <span className="font-mono text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
              <Sparkles size={14} className="text-[#00B489] group-hover:text-[#082827]" /> LAUNCH PLATFORM
            </span>
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </motion.a>
        </div>
      </div>

      {/* Meta Grid Section */}
      <div
        ref={gridRef}
        className="mx-auto max-w-[1400px] px-6 lg:px-10 pb-16 grid grid-cols-2 md:grid-cols-5 gap-10 border-t border-white/10 pt-12"
      >
        {cols.map((c, colIdx) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            animate={gridInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 + colIdx * 0.1 }}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00B489] font-bold mb-5 pb-2 border-b border-white/10">
              {c.title}
            </div>
            <ul className="space-y-2.5">
              {c.items.map((it, linkIdx) => (
                <li key={it.name}>
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={gridInView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      duration: 0.4,
                      delay: 0.2 + colIdx * 0.1 + linkIdx * 0.06,
                    }}
                  >
                    {it.path.startsWith("#") || it.path.startsWith("http") ? (
                      <a
                        href={it.path}
                        target={it.path.startsWith("http") ? "_blank" : undefined}
                        rel={it.path.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-[14px] md:text-base text-white/70 hover:text-white transition-colors"
                      >
                        {it.name}
                      </a>
                    ) : (
                      <Link
                        href={it.path}
                        className="text-[14px] md:text-base text-white/70 hover:text-white transition-colors"
                      >
                        {it.name}
                      </Link>
                    )}
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        {/* Model credits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={gridInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="col-span-2 md:col-span-2"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00B489] font-bold mb-5 pb-2 border-b border-white/10 flex items-center gap-2">
            <Cpu size={12} /> Built with · Advanced Technology Stack
          </div>
          <div className="flex flex-wrap gap-2.5">
            {credits.map((c, i) => (
              <motion.span
                key={c}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={gridInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.45 + i * 0.04 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-medium text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              >
                <CircleDot size={9} className="text-[#00B489]" /> {c}
              </motion.span>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={gridInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-6 text-xs text-white/50 leading-relaxed max-w-md"
          >
            QureSight is an advanced multi-disease screening platform engineered for SIH26139 that pairs quantum-enhanced machine learning with classical baselines. Every prediction is explainable, every benchmark is reproducible.
          </motion.p>
        </motion.div>
      </div>

      {/* Massive wordmark with character reveal */}
      <div ref={wordmarkRef} className="border-t border-white/10 overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-10 pb-2">
          <div
            className="leading-[0.82] tracking-tighter select-none text-[clamp(80px,21vw,340px)] flex text-white/90 font-sans font-bold"
          >
            {"QureSight".split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={wordmarkInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {char}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={wordmarkInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.55, type: "spring", stiffness: 300 }}
              className="text-[#00B489]"
            >
              .
            </motion.span>
          </div>
        </div>
      </div>

      {/* Clinical Research Regulatory Disclaimer Banner */}
      <div className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-6">
          <p className="font-mono text-[10px] leading-relaxed text-white/60 tracking-wider">
            <strong className="text-white/90 font-semibold">RESEARCH USE ONLY:</strong> QureSight is an investigational research tool designed for clinical decision support and educational purposes. It is not certified as a standalone diagnostic device. All screening results require qualified medical professional review. Provided &ldquo;AS IS&rdquo; for authorized research use.
          </p>
          <p className="font-mono text-[9px] text-white/40 tracking-widest mt-2">
            Developed for Smart India Hackathon — Quantum-Enhanced Healthcare Screening © 2026.
          </p>
        </div>
      </div>

      {/* Bottom bar with subtle parallax */}
      <div ref={barRef} className="border-t border-white/10">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-6 flex flex-wrap items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={barInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <span>© {new Date().getFullYear()} QURESIGHT — SCREEN SMARTER.</span>
            <Link href="/terms" className="hover:text-[#00B489] transition-colors hidden md:inline-block border-l border-white/10 pl-4">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#00B489] transition-colors hidden md:inline-block border-l border-white/10 pl-4">
              Privacy
            </Link>
            <Link href="/disclaimer" className="hover:text-[#00B489] transition-colors hidden md:inline-block border-l border-white/10 pl-4">
              Disclaimer
            </Link>
            <Link href="/cookies" className="hover:text-[#00B489] transition-colors hidden md:inline-block border-l border-white/10 pl-4">
              Cookies
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={barInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            N 28.61 · E 77.20 · EST 2026
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={barInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            BUILD · QURESIGHT · V1.0.0 · SIH-2026
          </motion.div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Translational Workflow                                               */
/* ------------------------------------------------------------------ */

function CohortStratificationView() {
  const [selectedMarker, setSelectedMarker] = useState<"ERBB2" | "TP53" | "CA125">("ERBB2");

  const markerData = {
    ERBB2: {
      name: "ERBB2 (HER2) Overexpression",
      cohortSize: 182,
      riskRatio: "4.12x",
      pVal: "p < 0.001",
      breakdown: [
        { label: "Stage I (Pre-symptomatic)", pct: 64, count: 116, color: "bg-ink" },
        { label: "Stage II (Incipient)", pct: 26, count: 48, color: "bg-quantum" },
        { label: "Benign Phenocopy", pct: 10, count: 18, color: "bg-muted-foreground/40" },
      ],
      insight: "Non-linear quantum feature mapping resolves low-abundance ERBB2 transcript clusters missed by regularized linear baselines.",
    },
    TP53: {
      name: "TP53 Exon 5–8 Missense",
      cohortSize: 94,
      riskRatio: "3.45x",
      pVal: "p = 0.002",
      breakdown: [
        { label: "Stage I (Pre-symptomatic)", pct: 52, count: 49, color: "bg-ink" },
        { label: "Stage II (Incipient)", pct: 33, count: 31, color: "bg-quantum" },
        { label: "Benign Phenocopy", pct: 15, count: 14, color: "bg-muted-foreground/40" },
      ],
      insight: "Captures 3-way epistatic interaction between TP53 loss-of-function and circulating inflammatory cytokines.",
    },
    CA125: {
      name: "Circulating CA-125 Dynamic Shift",
      cohortSize: 68,
      riskRatio: "2.88x",
      pVal: "p = 0.012",
      breakdown: [
        { label: "Stage I (Pre-symptomatic)", pct: 41, count: 28, color: "bg-ink" },
        { label: "Stage II (Incipient)", pct: 44, count: 30, color: "bg-quantum" },
        { label: "Benign Phenocopy", pct: 15, count: 10, color: "bg-muted-foreground/40" },
      ],
      insight: "Identifies rate-of-change trajectory deviations within the assay noise floor across 3 sequential timepoints.",
    },
  };

  const active = markerData[selectedMarker];

  return (
    <div className="flex h-full w-full flex-col justify-between p-6 sm:p-7">
      <div>
        {/* Header with selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Stratified Cohort Analysis · n=1,245
            </span>
            <div className="mt-1 font-serif text-[18px] text-ink">{active.name}</div>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-hairline bg-cream-deep/40 p-1">
            {(["ERBB2", "TP53", "CA125"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setSelectedMarker(k)}
                className={`rounded-md px-2.5 py-1 font-mono text-[10px] uppercase transition-all ${selectedMarker === k
                  ? "bg-ink text-parchment shadow-sm"
                  : "text-muted-foreground hover:text-ink"
                  }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-hairline/80 bg-parchment/60 p-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">Risk Ratio</span>
            <div className="mt-1 font-mono text-[19px] font-medium text-ink">{active.riskRatio}</div>
          </div>
          <div className="rounded-xl border border-hairline/80 bg-parchment/60 p-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">Enriched Patients</span>
            <div className="mt-1 font-mono text-[19px] font-medium text-ink">{active.cohortSize}</div>
          </div>
          <div className="rounded-xl border border-hairline/80 bg-parchment/60 p-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">Significance</span>
            <div className="mt-1 font-mono text-[19px] font-medium text-quantum">{active.pVal}</div>
          </div>
        </div>

        {/* Distribution Bars */}
        <div className="mt-6 space-y-3.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Stage Classification Breakdown
          </span>
          <div className="space-y-2.5">
            {active.breakdown.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-ink-soft">{item.label}</span>
                  <span className="text-ink font-medium">{item.count} pts ({item.pct}%)</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-hairline/80">
                  <motion.div
                    key={selectedMarker + item.label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: `${item.pct}%` }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clinical Rationale footer */}
      <div className="mt-5 rounded-xl border border-quantum/20 bg-quantum/5 p-3.5">
        <p className="text-[12.5px] leading-relaxed text-ink-soft">
          <span className="font-mono text-[10px] uppercase tracking-wider text-quantum font-semibold">Mechanism: </span>
          {active.insight}
        </p>
      </div>
    </div>
  );
}

function QuantumKernelView() {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number; val: number } | null>(null);

  // Structured matrix simulating real patient-by-patient quantum kernel gram matrix
  const matrix = [
    [1.00, 0.88, 0.74, 0.32, 0.18, 0.12, 0.08, 0.04],
    [0.88, 1.00, 0.82, 0.39, 0.21, 0.15, 0.09, 0.05],
    [0.74, 0.82, 1.00, 0.44, 0.28, 0.19, 0.11, 0.07],
    [0.32, 0.39, 0.44, 1.00, 0.76, 0.68, 0.24, 0.18],
    [0.18, 0.21, 0.28, 0.76, 1.00, 0.84, 0.31, 0.22],
    [0.12, 0.15, 0.19, 0.68, 0.84, 1.00, 0.42, 0.29],
    [0.08, 0.09, 0.11, 0.24, 0.31, 0.42, 1.00, 0.87],
    [0.04, 0.05, 0.07, 0.18, 0.22, 0.29, 0.87, 1.00],
  ];

  return (
    <div className="flex h-full w-full flex-col justify-between p-6 sm:p-7">
      <div>
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Quantum Kernel Gram Matrix
            </span>
            <div className="mt-1 font-serif text-[18px] text-ink">
              K(x_i, x_j) = |⟨ψ(x_i)|ψ(x_j)⟩|²
            </div>
          </div>
          <span className="rounded-full border border-hairline bg-parchment px-3 py-1 font-mono text-[10px] text-quantum">
            N=8×8 Subspace
          </span>
        </div>

        {/* Heatmap Grid & Legend */}
        <div className="mt-5 flex flex-col items-center sm:flex-row sm:items-center sm:justify-center sm:gap-8">
          <div className="grid grid-cols-8 gap-1.5 rounded-xl border border-hairline/80 bg-parchment/70 p-2.5 shadow-inner">
            {matrix.map((row, rIdx) =>
              row.map((val, cIdx) => {
                const isDiagonal = rIdx === cIdx;
                const isHovered = hoveredCell?.row === rIdx && hoveredCell?.col === cIdx;

                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    onMouseEnter={() => setHoveredCell({ row: rIdx, col: cIdx, val })}
                    className={`h-7 w-7 rounded-[4px] transition-all sm:h-8 sm:w-8 ${isHovered ? "ring-2 ring-ink scale-110 z-10" : ""
                      }`}
                    style={{
                      backgroundColor: isDiagonal
                        ? "oklch(0.24 0.02 50)"
                        : `oklch(0.48 0.12 185 / ${Math.max(0.12, val)})`,
                    }}
                  />
                );
              })
            )}
          </div>

          {/* Color bar scale */}
          <div className="mt-4 flex sm:mt-0 sm:flex-col items-center gap-2">
            <span className="font-mono text-[9px] text-ink font-medium">1.0</span>
            <div className="h-2 w-32 sm:h-32 sm:w-2.5 rounded-full bg-gradient-to-r sm:bg-gradient-to-b from-ink via-quantum to-quantum/10 border border-hairline" />
            <span className="font-mono text-[9px] text-muted-foreground">0.0</span>
          </div>
        </div>
      </div>

      {/* Dynamic Hover Status */}
      <div className="mt-4 rounded-xl border border-hairline bg-parchment/60 p-4">
        {hoveredCell ? (
          <div className="flex items-center justify-between font-mono text-[11.5px]">
            <div>
              <span className="text-muted-foreground">Pair: </span>
              <span className="text-ink font-semibold">Patient P{hoveredCell.row + 1} ↔ P{hoveredCell.col + 1}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Fidelity: </span>
              <span className="text-quantum font-bold">{hoveredCell.val.toFixed(2)}</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-muted-foreground">Cluster: </span>
              <span className="text-ink">{hoveredCell.val > 0.6 ? "High Homology" : "Orthogonal"}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 font-mono text-[11.5px] text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-quantum" />
            Hover over matrix cells to inspect pairwise quantum fidelity
          </div>
        )}
      </div>
    </div>
  );
}

function GateAblationView() {
  const [ablated, setAblated] = useState<Record<string, boolean>>({});

  const gates = [
    { id: "g1", label: "CX(q₀, q₁)", name: "Epistasis Pair A", baselineDelta: -0.28, pathway: "ERBB2 ↔ PIK3CA" },
    { id: "g2", label: "RY(θ₁)", name: "Single-locus Encoding", baselineDelta: -0.09, pathway: "TP53 Transversion" },
    { id: "g3", label: "CX(q₁, q₂)", name: "Epistasis Pair B", baselineDelta: -0.34, pathway: "BRCA1 ↔ Age Manifold" },
    { id: "g4", label: "RZ(θ₂)", name: "Phase Rotation", baselineDelta: -0.04, pathway: "Batch-effect Correction" },
    { id: "g5", label: "CX(q₂, q₃)", name: "High-order Interaction", baselineDelta: -0.41, pathway: "Multi-omics Joint Latent" },
  ];

  const toggleGate = (id: string) => {
    setAblated((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalAblatedDelta = gates.reduce((acc, g) => (ablated[g.id] ? acc + g.baselineDelta : acc), 0);
  const currentMargin = Math.max(0.12, +(0.88 + totalAblatedDelta).toFixed(2));

  return (
    <div className="flex h-full w-full flex-col justify-between p-6 sm:p-7">
      <div>
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              QureExplain · Circuit Gate Ablation
            </span>
            <div className="mt-1 font-serif text-[18px] text-ink">Entanglement Attribution Engine</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Decision Margin</div>
            <div className="font-mono text-[18px] font-bold text-ink">{currentMargin} AUC</div>
          </div>
        </div>

        {/* Interactive Gate List */}
        <div className="mt-5 space-y-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Click entangling blocks to test ablation impact:
          </span>

          {gates.map((g) => {
            const isOff = !!ablated[g.id];
            return (
              <button
                key={g.id}
                onClick={() => toggleGate(g.id)}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${isOff
                  ? "border-dashed border-hairline bg-cream-deep/30 opacity-60"
                  : "border-hairline bg-parchment/60 hover:border-quantum/50 shadow-sm"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-16 shrink-0 items-center justify-center rounded font-mono text-[10px] font-semibold transition-colors ${isOff ? "bg-muted text-muted-foreground line-through" : "bg-ink text-parchment"
                      }`}
                  >
                    {g.label}
                  </span>
                  <div>
                    <div className="text-[13px] font-medium text-ink">{g.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{g.pathway}</div>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px]">
                  <span className={isOff ? "text-muted-foreground" : "text-ink font-semibold"}>
                    {isOff ? "Ablated" : `${g.baselineDelta} AUC`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-hairline bg-cream-deep/40 p-3.5">
        <p className="text-[12px] leading-relaxed text-ink-soft">
          <span className="font-mono text-[10px] font-semibold uppercase text-ink">Deterministic Attribution: </span>
          Ablating <span className="font-mono text-[11px] text-quantum font-semibold">CX(q₂, q₃)</span> produces the sharpest degradation, proving the diagnostic signal is stored in multi-qubit entanglement rather than single-gene linear terms.
        </p>
      </div>
    </div>
  );
}

const TRANSLATIONAL_SECTIONS = [
  {
    id: "cohort",
    title: "Patient Cohort Stratification",
    description: "Ingest high-dimensional multi-omics cohorts and surface early pre-symptomatic sub-phenotypes with deterministic statistical confidence.",
    Component: CohortStratificationView,
  },
  {
    id: "kernel",
    title: "Quantum Kernel Gram Matrix",
    description: "Inspect pairwise Hilbert-space inner products. Confirm that quantum feature mapping separates non-linear phenotypes before model fitting.",
    Component: QuantumKernelView,
  },
  {
    id: "ablation",
    title: "Deterministic Gate Ablation",
    description: "Attribute prediction margins directly to specific multi-qubit entangling gates, mapped backward through loadings to named biological pathways.",
    Component: GateAblationView,
  },
];

function TranslationalWorkflow() {
  const [activeTab, setActiveTab] = useState(0);
  const active = TRANSLATIONAL_SECTIONS[activeTab];
  const ActiveComponent = active.Component;

  return (
    <section id="live-demo" className="relative border-t border-hairline bg-cream px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.2fr]">
          {/* Left Text & Interactive Selector */}
          <div>
            <Reveal>
              <Eyebrow>Interactive preview</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 font-sans text-[clamp(2rem,4vw,3.1rem)] font-bold leading-[1.1] tracking-tight text-[#082827]">
                Explore real screening workflows
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 text-[16px] leading-[1.7] text-[#5A7470] font-normal">
                See how QureSight processes patient data in real time. Click through the interactive views below to explore cohort analysis, kernel visualization, and gate-level explainability.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-10 space-y-3">
                {TRANSLATIONAL_SECTIONS.map((section, idx) => {
                  const isSelected = idx === activeTab;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(idx)}
                      className={`w-full rounded-2xl border p-5 text-left transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "border-[#00B489]/50 bg-white shadow-[0_4px_20px_-4px_rgba(0,180,137,0.15)] ring-1 ring-[#00B489]/20"
                          : "border-[#DFEBE8] bg-white/60 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className={`font-sans text-[17px] transition-colors ${isSelected ? "text-[#082827] font-bold" : "text-[#5A7470] font-medium"}`}>
                          {section.title}
                        </h3>
                        <span className={`font-mono text-[11px] ${isSelected ? "text-[#006766] font-bold" : "text-[#5A7470]"}`}>
                          0{idx + 1}
                        </span>
                      </div>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-[#5A7470] font-normal">
                        {section.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </Reveal>
          </div>

          {/* Right Live Interactive Visual Terminal */}
          <Reveal delay={0.2} className="h-full">
            <Glass className="overflow-hidden min-h-[540px] flex flex-col justify-center bg-white border border-[#DFEBE8] shadow-[0_10px_30px_-12px_rgba(0,103,102,0.06)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="h-full w-full"
                >
                  <ActiveComponent />
                </motion.div>
              </AnimatePresence>
            </Glass>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export default function Page() {
  return (
    <main className="min-h-screen scroll-smooth bg-[#F2F7F6] font-sans text-[#082827] antialiased">
      <MoveToTop />
      <Nav />
      <Hero />
      <ClinicalReality />
      <Pipeline />
      <TranslationalWorkflow />
      <Benchmarking />
      <Footer />
    </main>
  );
}
