import Link from "next/link"

export const metadata = {
  title: "Privacy Policy | SnipStats",
  description: "Privacy Policy for SnipStats - Analytics visualization tool",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <p className="mb-4">Last Updated: April 20, 2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-3">
          Welcome to SnipStats ("we," "our," or "us"). We respect your privacy and are committed to protecting your
          personal data. This privacy policy explains how we collect, use, and safeguard your information when you use
          our service.
        </p>
        <p className="mb-3">
          SnipStats is an analytics visualization tool that connects to your Google Analytics account to help you
          visualize, analyze, and share your website traffic data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>

        <h3 className="text-lg font-medium mb-2">2.1 Account Information</h3>
        <p className="mb-3">
          When you register for an account, we collect your email address and password (stored securely and encrypted).
          You may optionally provide your full name and avatar URL.
        </p>

        <h3 className="text-lg font-medium mb-2">2.2 Google Analytics Data</h3>
        <p className="mb-3">
          With your explicit permission, we access your Google Analytics data through the Google Analytics API. This
          includes metrics such as visitor counts, page views, session duration, bounce rates, referral sources, and
          page performance data. We store this data in our database to provide you with visualization and analysis
          features.
        </p>

        <h3 className="text-lg font-medium mb-2">2.3 Usage Data</h3>
        <p className="mb-3">
          We collect information about how you use our service, including the features you access, the screenshots you
          create, and your interaction with our dashboard.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
        <p className="mb-3">We use your information for the following purposes:</p>
        <ul className="list-disc pl-6 mb-3 space-y-2">
          <li>To provide and maintain our service, including fetching and displaying your Google Analytics data</li>
          <li>To create and manage your account</li>
          <li>To send you notifications about traffic spikes or other significant events on your website</li>
          <li>To improve and personalize your experience with our service</li>
          <li>To respond to your requests or inquiries</li>
          <li>To comply with legal obligations</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. Data Storage and Security</h2>
        <p className="mb-3">
          We use a secure database service, to store your account information and analytics data. All data is encrypted
          both in transit and at rest. We implement appropriate technical and organizational measures to protect your
          personal data against unauthorized access, alteration, disclosure, or destruction.
        </p>
        <p className="mb-3">
          Your Google Analytics access tokens are stored securely and are only used to fetch data on your behalf. We do
          not share your Google Analytics credentials or data with third parties.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">5. Email Communications</h2>
        <p className="mb-3">
          With your consent, we may send you email notifications about significant events in your analytics data, such
          as traffic spikes. You can control these notifications in your profile settings. We use a secure email service
          provider, to send these communications.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">6. Your Rights</h2>
        <p className="mb-3">Depending on your location, you may have the following rights:</p>
        <ul className="list-disc pl-6 mb-3 space-y-2">
          <li>Access to your personal data</li>
          <li>Correction of inaccurate data</li>
          <li>Deletion of your data</li>
          <li>Restriction or objection to processing</li>
          <li>Data portability</li>
          <li>Withdrawal of consent</li>
        </ul>
        <p className="mb-3">To exercise these rights, please contact us at support@snipstats.com.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">7. Data Retention</h2>
        <p className="mb-3">
          We retain your personal data for as long as necessary to provide you with our service. If you delete your
          account, we will delete or anonymize your personal data within 30 days, except where we are legally required
          to retain certain information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">8. Third-Party Services</h2>
        <p className="mb-3">Our service integrates with the following third-party services:</p>
        <ul className="list-disc pl-6 mb-3 space-y-2">
          <li>Google Analytics API: To fetch your analytics data</li>
          <li>Supabase: For authentication and data storage</li>
          <li>Resend: For sending email notifications</li>
        </ul>
        <p className="mb-3">
          Each of these services has their own privacy policies, and we encourage you to review them.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">9. Children's Privacy</h2>
        <p className="mb-3">
          Our service is not intended for children under 16 years of age. We do not knowingly collect personal data from
          children under 16. If you become aware that a child has provided us with personal data, please contact us.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
        <p className="mb-3">
          We may update our privacy policy from time to time. We will notify you of any changes by posting the new
          privacy policy on this page and updating the "Last Updated" date. You are advised to review this privacy
          policy periodically for any changes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">11. Contact Us</h2>
        <p className="mb-3">
          If you have any questions about this privacy policy or our data practices, please contact us at:
        </p>
        <p className="mb-3">Email: support@snipstats.com</p>
      </section>

      <div className="mt-12 border-t pt-6">
        <p>
          <Link href="/terms" className="text-primary hover:underline">
            View our Terms of Service
          </Link>
        </p>
      </div>
    </div>
  )
}
