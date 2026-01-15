import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

async function fetchUSDForEGP(amountEGP: number) {
  try {
    const res = await fetch(
      `https://api.exchangerate.host/convert?from=EGP&to=USD&amount=${amountEGP}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.result ?? null) as number | null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const egpPrice = 2999;
  const usd = await fetchUSDForEGP(egpPrice);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="container flex-1 py-16 space-y-20">
        <section className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="space-y-6">
            <span className="pill">Real Estate SaaS</span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">
              The unlimited Real Estate CRM for teams who scale together.
            </h1>
            <p className="muted text-lg max-w-2xl">
              Contaboo runs your listings, deals, leads, and billing with one flat monthly price.
              Unlimited users. Unlimited bandwidth. Unlimited storage. Built for modern brokerages and property ops teams.
            </p>

            <div className="flex flex-wrap gap-3">
              <a className="btn-primary" href="#contact">Book a demo</a>
              <a className="btn-ghost" href="#pricing">View pricing</a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-slate-200">
              <div className="card p-4">
                <div className="text-xs uppercase text-slate-400">Uptime</div>
                <div className="text-2xl font-semibold text-white">99.95%</div>
              </div>
              <div className="card p-4">
                <div className="text-xs uppercase text-slate-400">Teams onboarded</div>
                <div className="text-2xl font-semibold text-white">250+</div>
              </div>
              <div className="card p-4">
                <div className="text-xs uppercase text-slate-400">Listings managed</div>
                <div className="text-2xl font-semibold text-white">120k</div>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-6 shadow-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">All-inclusive plan</p>
                <p className="text-2xl font-bold text-white">Contaboo Unlimited</p>
              </div>
              <span className="pill">Flat Price</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-3 text-white">
                <span className="text-4xl font-extrabold">{egpPrice}</span>
                <span className="text-lg text-slate-300">EGP / month</span>
              </div>
              <div className="text-sm text-slate-300">
                {usd ? `≈ $${usd.toFixed(2)} (live rate)` : "USD price unavailable"}
              </div>
            </div>

            <ul className="space-y-2 text-sm text-slate-200">
              <li>Unlimited users & seats</li>
              <li>Unlimited bandwidth and storage</li>
              <li>Multi-company & brokerage friendly</li>
              <li>Priority success and onboarding</li>
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a className="btn-primary w-full sm:w-auto" href="#contact">Start now</a>
              <a className="btn-ghost w-full sm:w-auto" href="#services">See services</a>
            </div>
          </div>
        </section>

        <section id="product" className="space-y-8">
          <div>
            <p className="pill">Product</p>
            <h2 className="section-title mt-3">Everything in one operating canvas</h2>
            <p className="muted max-w-3xl mt-2">
              Listing management, lead routing, deal pipelines, contracts, invoicing, and analytics — unified so every team sees the same truth.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[{
              title: "Listings & inventory",
              desc: "Organize residential and commercial stock with smart search, tags, and media galleries.",
            },{
              title: "Lead intelligence",
              desc: "Automated lead capture, enrichment, and SLA-aware routing to the right agent or team.",
            },{
              title: "Deal desks",
              desc: "Structured pipelines with approvals, commissions, and document workflows built-in.",
            },{
              title: "Client workspace",
              desc: "Share live portals for owners and tenants with updates, statements, and tasks.",
            },{
              title: "Billing & AR",
              desc: "Company-level billing, invoicing, and reconciliation with audit-ready exports.",
            },{
              title: "Security & roles",
              desc: "Granular roles, SSO-ready, audit logs, and region-aware data residency.",
            }].map((item) => (
              <div key={item.title} className="card p-5">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="muted mt-2 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="space-y-8">
          <div>
            <p className="pill">Services</p>
            <h2 className="section-title mt-3">Onboarding and success, handled</h2>
            <p className="muted mt-2 max-w-3xl">
              Implementation specialists migrate your data, train your teams, and co-design workflows so you launch fast and stay aligned.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-5">
              <h3 className="text-lg font-semibold text-white">Migration</h3>
              <p className="muted mt-2 text-sm">Data cleanup, import from legacy CRMs, document re-linking, and permissions mapping.</p>
            </div>
            <div className="card p-5">
              <h3 className="text-lg font-semibold text-white">Playbook design</h3>
              <p className="muted mt-2 text-sm">Deal stages, SLAs, and reporting packs tailored to brokerages, property managers, and developers.</p>
            </div>
            <div className="card p-5">
              <h3 className="text-lg font-semibold text-white">Enablement</h3>
              <p className="muted mt-2 text-sm">Live training, office-hours, and success reviews so every team adopts on day one.</p>
            </div>
          </div>
        </section>

        <section id="pricing" className="space-y-6">
          <div>
            <p className="pill">Pricing</p>
            <h2 className="section-title mt-3">One plan. Zero limits.</h2>
            <p className="muted mt-2">Transparent flat pricing for growing real estate companies.</p>
          </div>

          <div className="card p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="text-sm text-slate-300">Monthly</div>
              <div className="flex items-baseline gap-3 text-white mt-1">
                <span className="text-4xl font-extrabold">{egpPrice}</span>
                <span className="text-lg text-slate-300">EGP</span>
              </div>
              <div className="text-sm text-slate-300 mt-1">
                {usd ? `≈ $${usd.toFixed(2)} (live rate)` : "USD price unavailable"}
              </div>
              <div className="mt-3 text-sm text-slate-300">Unlimited users · Unlimited bandwidth · Unlimited storage</div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a className="btn-primary" href="#contact">Talk to sales</a>
              <a className="btn-ghost" href="#contact">Start onboarding</a>
            </div>
          </div>
        </section>

        <section id="about" className="space-y-6">
          <div>
            <p className="pill">About Us</p>
            <h2 className="section-title mt-3">Built by operators for operators</h2>
            <p className="muted mt-2 max-w-3xl">
              Contaboo is a product studio focused on vertical SaaS for real estate. We obsess over reliability, speed, and workflows your teams actually use.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-5">
              <h3 className="text-lg font-semibold text-white">Reliability</h3>
              <p className="muted mt-2 text-sm">Redundant infrastructure, automated backups, and observability-first operations.</p>
            </div>
            <div className="card p-5">
              <h3 className="text-lg font-semibold text-white">Performance</h3>
              <p className="muted mt-2 text-sm">Snappy UI built on Next.js with edge caching for media-heavy listings.</p>
            </div>
            <div className="card p-5">
              <h3 className="text-lg font-semibold text-white">Security</h3>
              <p className="muted mt-2 text-sm">SSO-ready, granular roles, audit logs, and tenant isolation from day one.</p>
            </div>
          </div>
        </section>

        <section id="contact" className="space-y-4">
          <p className="pill">Contact</p>
          <div className="card p-6 md:p-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Ready to launch Contaboo?</h3>
              <p className="muted mt-2">Email us at hello@contaboo.com — we respond within one business day.</p>
            </div>
            <a className="btn-primary" href="mailto:hello@contaboo.com">Email us</a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
