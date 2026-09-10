import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Website Time Tracker",
};

export default function PrivacyPolicy() {
  const lastUpdated = "March 22, 2026";

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <article className="rounded-lg border border-line bg-white/60 p-8 shadow-sm">
        <h1 className="mb-2 font-serif text-3xl font-semibold text-ink">Privacy Policy</h1>
        <p className="mb-8 text-sm text-ink/50">Website Time Tracker · Last updated: {lastUpdated}</p>

        <section className="mb-6">
          <h2 className="mb-2 font-serif text-xl font-semibold text-ink">Overview</h2>
          <p className="text-ink/80 leading-relaxed">
            Website Time Tracker is a Chrome extension that tracks the time you spend on websites.
            This privacy policy explains how the extension handles your data.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 font-serif text-xl font-semibold text-ink">Data Collection</h2>
          <p className="text-ink/80 leading-relaxed">
            Website Time Tracker does <strong>not</strong> collect, transmit, or share any personal data.
            All data — including browsing time, website history, and usage statistics — is stored
            exclusively on your local device using Chrome&apos;s built-in storage APIs.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 font-serif text-xl font-semibold text-ink">Data Storage</h2>
          <p className="text-ink/80 leading-relaxed">
            All tracking data is stored locally on your device and is never sent to any external
            server. No third parties have access to your data. You can clear all stored data at
            any time by uninstalling the extension or clearing the extension&apos;s storage from
            Chrome&apos;s settings.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 font-serif text-xl font-semibold text-ink">Permissions</h2>
          <p className="mb-2 text-ink/80 leading-relaxed">
            The extension requests the following Chrome permissions:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-ink/80">
            <li><strong>tabs</strong> — to detect which website is currently active</li>
            <li><strong>storage</strong> — to save tracking data locally on your device</li>
            <li><strong>alarms</strong> — to periodically update time tracking in the background</li>
          </ul>
          <p className="mt-2 text-ink/80 leading-relaxed">
            These permissions are used solely to provide the core functionality of the extension
            and are not used to collect or transmit any data.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 font-serif text-xl font-semibold text-ink">Third-Party Services</h2>
          <p className="text-ink/80 leading-relaxed">
            Website Time Tracker does not use any third-party analytics, advertising, or tracking services.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 font-serif text-xl font-semibold text-ink">Changes to This Policy</h2>
          <p className="text-ink/80 leading-relaxed">
            If this privacy policy is updated, the new version will be posted at this URL with
            an updated date.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-xl font-semibold text-ink">Contact</h2>
          <p className="text-ink/80 leading-relaxed">
            If you have any questions about this privacy policy, please contact:{" "}
            <a href="mailto:neng.li@uwaterloo.ca" className="text-accent-600 hover:text-accent-700 hover:underline">
              neng.li@uwaterloo.ca
            </a>
          </p>
        </section>
      </article>
    </main>
  );
}
