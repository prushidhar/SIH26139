import { Metadata } from "next";
import { LegalPageLayout } from "@/components/common/LegalPageLayout";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Information on cookie usage, session tokens, and local storage on the QureSight platform.",
};

export default function CookiesPage() {
  return (
    <LegalPageLayout
      title="Cookie & Storage Policy"
      subtitle="Details regarding the strict essential cookies, secure session tokens, and client-side storage mechanisms employed on QureSight."
      badge="Client Storage & Session Policy"
      iconType="cookie"
    >
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#082827] border-b border-[#DFEBE8] pb-2.5">
          1. What Technologies We Use
        </h2>
        <p>
          QureSight uses strictly necessary cookies and browser local storage mechanisms to authenticate researchers, secure REST API transactions, and maintain user interface preferences (such as dark/light themes and dashboard configurations).
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#082827] border-b border-[#DFEBE8] pb-2.5">
          2. Specific Storage Keys
        </h2>
        <div className="rounded-xl border border-[#DFEBE8] overflow-hidden font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#E6F7F4]/80 text-[#082827] border-b border-[#DFEBE8]">
              <tr>
                <th className="p-3">Key / Cookie Name</th>
                <th className="p-3">Purpose</th>
                <th className="p-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFEBE8] text-[#5A7470]">
              <tr>
                <td className="p-3 text-[#006766] font-semibold">quresight_access_token</td>
                <td className="p-3">JWT Bearer authentication for encrypted API routes</td>
                <td className="p-3">15 minutes</td>
              </tr>
              <tr>
                <td className="p-3 text-[#006766] font-semibold">quresight_refresh_token</td>
                <td className="p-3">Automatic 7-day sliding session renewal</td>
                <td className="p-3">7 days</td>
              </tr>
              <tr>
                <td className="p-3 text-[#006766] font-semibold">quresight_user_data</td>
                <td className="p-3">Caches user profile role and display preferences</td>
                <td className="p-3">Session</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#082827] border-b border-[#DFEBE8] pb-2.5">
          3. Zero Third-Party Advertising Trackers
        </h2>
        <p>
          QureSight does NOT deploy invasive third-party cross-site advertising trackers, behavioral marketing beacons, or data broker cookies.
        </p>
      </section>
    </LegalPageLayout>
  );
}
