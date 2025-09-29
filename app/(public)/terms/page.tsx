import Link from "next/link"

export const metadata = {
  title: "Terms of Service | SnipStats",
  description: "Terms of Service for SnipStats - Analytics visualization tool",
}

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

      <p className="mb-4">Last Updated: April 20, 2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-3">
          Welcome to SnipStats. These Terms of Service ("Terms") govern your access to and use of the SnipStats website
          and services (collectively, the "Service"). Please read these Terms carefully before using our Service.
        </p>
        <p className="mb-3">
          By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the
          Terms, you may not access the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Definitions</h2>
        <p className="mb-3">
          <strong>"Account"</strong> means a unique account created for you to access our Service.
        </p>
        <p className="mb-3">
          <strong>"Company"</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers
          to SnipStats.
        </p>
        <p className="mb-3">
          <strong>"Content"</strong> refers to analytics data, visualizations, screenshots, and other material that can
          be accessed or generated using our Service.
        </p>
        <p className="mb-3">
          <strong>"Service"</strong> refers to the SnipStats website and all features provided therein.
        </p>
        <p className="mb-3">
          <strong>"User"</strong> (referred to as either "User", "You" or "Your" in this Agreement) refers to the
          individual accessing or using the Service, or the company or other legal entity on behalf of which such
          individual is accessing or using the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. Account Registration</h2>
        <p className="mb-3">
          To use certain features of the Service, you must register for an account. When you register, you must provide
          accurate and complete information. You are solely responsible for the activity that occurs on your account,
          and you must keep your account password secure.
        </p>
        <p className="mb-3">
          You must notify us immediately of any breach of security or unauthorized use of your account. We will not be
          liable for any losses caused by any unauthorized use of your account.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. Google Analytics Integration</h2>
        <p className="mb-3">
          Our Service allows you to connect your Google Analytics account to visualize and analyze your website traffic
          data. By connecting your Google Analytics account, you:
        </p>
        <ul className="list-disc pl-6 mb-3 space-y-2">
          <li>Authorize us to access your Google Analytics data on your behalf</li>
          <li>Confirm that you have the right to grant us access to this data</li>
          <li>Understand that our access is subject to Google's terms of service and API limitations</li>
        </ul>
        <p className="mb-3">
          We will only access and use your Google Analytics data to provide the Service to you. We will not access or
          use your data for any other purpose without your explicit consent.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">5. User Content and Rights</h2>
        <p className="mb-3">
          Our Service allows you to create, save, and share visualizations and screenshots of your analytics data. You
          retain all rights to the content you create using our Service.
        </p>
        <p className="mb-3">
          By using our Service to create and share content, you grant us a non-exclusive, royalty-free license to use,
          store, and display your content solely for the purpose of providing and improving the Service.
        </p>
        <p className="mb-3">You represent and warrant that:</p>
        <ul className="list-disc pl-6 mb-3 space-y-2">
          <li>You own or have the necessary rights to the content you create and share using our Service</li>
          <li>
            Your content does not violate the privacy rights, publicity rights, copyright, contractual rights, or any
            other rights of any person or entity
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">6. Acceptable Use</h2>
        <p className="mb-3">You agree not to use the Service:</p>
        <ul className="list-disc pl-6 mb-3 space-y-2">
          <li>In any way that violates any applicable national or international law or regulation</li>
          <li>
            To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person
            or entity
          </li>
          <li>
            To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which
            may harm the Company or users of the Service
          </li>
          <li>
            To attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service, the
            server on which the Service is stored, or any server, computer, or database connected to the Service
          </li>
          <li>To attack the Service via a denial-of-service attack or a distributed denial-of-service attack</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">7. Intellectual Property</h2>
        <p className="mb-3">
          The Service and its original content (excluding content provided by users), features, and functionality are
          and will remain the exclusive property of SnipStats and its licensors. The Service is protected by copyright,
          trademark, and other laws of both the United States and foreign countries.
        </p>
        <p className="mb-3">
          Our trademarks and trade dress may not be used in connection with any product or service without the prior
          written consent of SnipStats.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">8. Termination</h2>
        <p className="mb-3">
          We may terminate or suspend your account and access to the Service immediately, without prior notice or
          liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>
        <p className="mb-3">
          Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account,
          you may simply discontinue using the Service or delete your account through the profile settings.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">9. Limitation of Liability</h2>
        <p className="mb-3">
          In no event shall SnipStats, nor its directors, employees, partners, agents, suppliers, or affiliates, be
          liable for any indirect, incidental, special, consequential or punitive damages, including without limitation,
          loss of profits, data, use, goodwill, or other intangible losses, resulting from:
        </p>
        <ul className="list-disc pl-6 mb-3 space-y-2">
          <li>Your access to or use of or inability to access or use the Service</li>
          <li>Any conduct or content of any third party on the Service</li>
          <li>Any content obtained from the Service</li>
          <li>Unauthorized access, use or alteration of your transmissions or content</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">10. Disclaimer</h2>
        <p className="mb-3">
          Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis.
          The Service is provided without warranties of any kind, whether express or implied, including, but not limited
          to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of
          performance.
        </p>
        <p className="mb-3">
          SnipStats does not warrant that the Service will function uninterrupted, secure or available at any particular
          time or location, or that any errors or defects will be corrected.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">11. Governing Law</h2>
        <p className="mb-3">
          These Terms shall be governed and construed in accordance with the laws of the United States, without regard
          to its conflict of law provisions.
        </p>
        <p className="mb-3">
          Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
          If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of
          these Terms will remain in effect.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">12. Changes to Terms</h2>
        <p className="mb-3">
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is
          material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a
          material change will be determined at our sole discretion.
        </p>
        <p className="mb-3">
          By continuing to access or use our Service after any revisions become effective, you agree to be bound by the
          revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">13. Contact Us</h2>
        <p className="mb-3">If you have any questions about these Terms, please contact us at:</p>
        <p className="mb-3">Email: support@snipstats.com</p>
      </section>

      <div className="mt-12 border-t pt-6">
        <p>
          <Link href="/privacy-policy" className="text-primary hover:underline">
            View our Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
