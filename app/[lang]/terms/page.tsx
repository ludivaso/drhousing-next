import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
}

export default function TermsPage() {
  return (
    <section className="section-padding bg-background">
      <div className="container-narrow">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-8">
          Terms of Service
        </h1>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <p>Last updated: March 2025</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>By accessing and using the DR Housing website, you accept these terms of service. If you disagree, please do not use this site.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">2. Services</h2>
          <p>DR Housing provides real estate advisory, brokerage, property management and related services in Costa Rica. Information on this site is informational and does not constitute legal or financial advice.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">3. Intellectual Property</h2>
          <p>All content on this site, including text, images and design, is the property of DR Housing and is protected by intellectual property laws.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">4. Accuracy of Information</h2>
          <p>We strive to maintain accurate and up-to-date information, but we do not guarantee the complete accuracy of prices, availability and characteristics of listed properties.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">5. Limitation of Liability</h2>
          <p>DR Housing is not liable for damages arising from the use of this site or the information contained therein.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">6. Governing Law</h2>
          <p>These terms are governed by the laws of the Republic of Costa Rica.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">7. Contact</h2>
          <p>For inquiries: <a href="mailto:info@drhousing.net" className="text-primary hover:underline">info@drhousing.net</a></p>
        </div>
      </div>
    </section>
  )
}
