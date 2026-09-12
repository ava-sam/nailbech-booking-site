export default function ContactPage() {
  return (
    <section className="max-w-xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-cream mb-8">
        Contact & Deposit
      </h1>

      <div className="space-y-8">
        <div className="bg-surface rounded-xl p-6">
          <h2 className="text-cream font-medium mb-3">Send your deposit</h2>
          <p className="text-sage text-sm leading-relaxed mb-4">
            After booking, send your deposit via Zelle or Apple Cash to
            confirm your appointment. Your slot stays pending until it's
            received.
          </p>
          <div className="space-y-2 text-cream text-sm">
            {/* Replace with her real info */}
            <p>Zelle: [her phone number or email]</p>
            <p>Apple Cash: [her phone number]</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-6">
          <h2 className="text-cream font-medium mb-3">Reach out directly</h2>
          <div className="space-y-2 text-cream text-sm">
            {/* Replace with her real info */}
            <p>Phone: [her number]</p>
            <p>Email: [her email]</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-6">
          <h2 className="text-cream font-medium mb-3">Follow along</h2>
          <div className="flex gap-4 text-sm">
            <a
              href="https://instagram.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-jade hover:text-lotus transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://tiktok.com/@yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-jade hover:text-lotus transition-colors"
            >
              TikTok
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}