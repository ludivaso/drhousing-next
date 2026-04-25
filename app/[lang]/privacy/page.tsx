import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <section className="section-padding bg-background">
      <div className="container-narrow">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-8">
          Privacy Policy
        </h1>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <p>Last updated: March 2025</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as your name, email address, phone number and property preferences when you complete our contact or inquiry forms.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">2. Use of Information</h2>
          <p>We use the information collected to respond to your inquiries, send you relevant information about properties and services, and improve our services.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">3. Data Protection</h2>
          <p>Your personal information is stored securely and is not shared with third parties without your consent, except where required by law.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">4. Cookies</h2>
          <p>This site uses technical cookies necessary for its operation. We do not use advertising tracking cookies.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">5. Your Rights</h2>
          <p>You have the right to request access, correction or deletion of your personal information. Contact us at info@drhousing.net.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">6. Contact</h2>
          <p>For privacy inquiries: <a href="mailto:info@drhousing.net" className="text-primary hover:underline">info@drhousing.net</a></p>
        </div>
      </div>
    </section>
  )
}
