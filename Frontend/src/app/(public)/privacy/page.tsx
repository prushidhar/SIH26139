import { Metadata } from "next";
import { LegalPageLayout } from "@/components/common/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy and data protection policy for QureSight biomedical data handling and cryptographic audit protocols.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy & Data Protection Policy"
      subtitle="How QureSight safeguards biomedical data, protects analytical workflows, and guarantees zero data-leakage during hybrid quantum processing."
      badge="Data Security & HIPAA Alignment"
      iconType="lock"
    >
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#082827] border-b border-[#DFEBE8] pb-2.5">
          1. Data Minimization &amp; Zero-Leakage Architecture
        </h2>
        <p>
          QureSight operates under strict data minimization principles. We do not collect, store, or sell personal identifiers or raw patient biological specimens. All computational workloads entering the preprocessing pipeline are normalized into bounded feature vectors prior to quantum angle encoding.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#082827] border-b border-[#DFEBE8] pb-2.5">
          2. Information We Process
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-[#5A7470]">
          <li>
            <strong className="text-[#082827]">Authentication Data:</strong> Email address, hashed credentials (Argon2id/bcrypt), or Google OAuth tokens necessary for managing secure user sessions.
          </li>
          <li>
            <strong className="text-[#082827]">Diagnostic Feature Tensors:</strong> De-identified numerical vectors representing continuous biometric markers (e.g., nuclear perimeter, area, concavity, or transcriptomic counts).
          </li>
          <li>
            <strong className="text-[#082827]">Execution Provenance:</strong> Algorithmic runtime telemetry, including optimization loss curves, parameter-shift gradients, and QPU shot counts.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#082827] border-b border-[#DFEBE8] pb-2.5">
          3. Quantum Cloud Transmission &amp; IBM Runtime
        </h2>
        <p>
          When real hardware execution mode is selected, parameterized quantum circuits are transpiled to native basis gates (CX, Rz, SX) and transmitted to IBM Quantum Runtime endpoints over TLS 1.3 encrypted connections. Only abstract circuit instructions and rotation angles are communicated to physical cryostats; no clinical patient context is ever exposed to external QPU schedulers.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#082827] border-b border-[#DFEBE8] pb-2.5">
          4. Cryptographic Receipt Provenance
        </h2>
        <p>
          Every inference request generates a verifiable SHA-256 cryptographic receipt. This digest encapsulates the model configuration, the exact random seed utilized in stratified k-fold splits, and the resulting feature attribution scores. These receipts allow research audits without requiring persistent retention of raw underlying feature matrices.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#082827] border-b border-[#DFEBE8] pb-2.5">
          5. User Rights &amp; Data Deletion
        </h2>
        <p>
          You hold the absolute right to purge your uploaded datasets, custom model checkpoints, and analytical logs from our encrypted databases at any time through the Settings dashboard or by dispatching a deletion request to our compliance team.
        </p>
      </section>
    </LegalPageLayout>
  );
}
