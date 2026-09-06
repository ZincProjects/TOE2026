import { ButtonLink, Card, Section } from "@/components/ui";
import { ArrowRightIcon, PinIcon, SparkIcon } from "@/components/icons";
import { BASE_OPPORTUNITIES } from "@/lib/data";
import { HomeStatus } from "./HomeStatus";

const STEPS = [
  {
    n: "01",
    title: "Fill in your profile",
    body: "On the User tab, add your degree, courses, skills, projects, interests and the role you are aiming for. The more specific your skills, the sharper the match.",
  },
  {
    n: "02",
    title: "See your ranked matches",
    body: "The Results tab scores every opportunity on the floor against your profile and shows exactly why each one ranked where it did, including the skills you are missing.",
  },
  {
    n: "03",
    title: "Plan your route",
    body: "Each match carries a booth number. Work down your list from the top and you will have spoken to the highest-fit companies before the queues build.",
  },
  {
    n: "04",
    title: "Ask for the reasoning",
    body: "Optionally add your own DeepSeek key to have the ranking explained in plain language. The explanation is written from the retrieved evidence, and never changes the ranking.",
  },
];

const FAIR_FACTS = [
  { label: "Dates", value: "Thu 12 – Fri 13 March 2026" },
  { label: "Hours", value: "10:00 – 18:00 daily" },
  { label: "Venue", value: "Halls A–E, University Sports Hall" },
  { label: "Entry", value: "Free for all enrolled students" },
];

const FAQS = [
  {
    q: "Where does my profile go?",
    a: "Nowhere. Your profile is stored in your own browser and the matching runs on your device. Nothing is uploaded unless you choose to generate an AI explanation, which sends only the ranking evidence.",
  },
  {
    q: "How is the match percentage calculated?",
    a: "Four weighted components: required skills (35%), preferred skills (15%), fit with the O*NET occupation the role maps onto (30%), and alignment with your stated career aspiration (20%).",
  },
  {
    q: "Do I need an account?",
    a: "No. There is no sign-up and no password. Open the site, fill in the User tab, and your matches are ready.",
  },
  {
    q: "I am a company, not a student.",
    a: "Head to the Industry tab and use 'Post an opportunity'. Your role is added to the catalogue and is scored against student profiles straight away.",
  },
];

export default function HomePage() {
  const sectors = new Set(BASE_OPPORTUNITIES.map((o) => o.sector).filter(Boolean));
  const roles = BASE_OPPORTUNITIES.length;
  const openings = BASE_OPPORTUNITIES.reduce((sum, o) => sum + (o.openings ?? 0), 0);

  return (
    <>
      {/* Hero */}
      <section className="pt-10 pb-2 sm:pt-16 lg:pt-20">
        <p className="text-xs font-semibold tracking-[0.18em] text-rust uppercase">
          Career Fair 2026
        </p>
        <h1 className="mt-4 font-display text-4xl leading-[1.05] font-semibold text-ink sm:text-5xl lg:text-6xl">
          Walk in knowing
          <br />
          <span className="text-rust">who to talk to.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
          TOE — The Opportunity Engine — matches what you have actually studied and built against
          every role on the fair floor, then tells you why each one fits.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/user">
            Get started
            <ArrowRightIcon className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="/industry" variant="secondary">
            Browse companies
          </ButtonLink>
        </div>

        <dl className="mt-10 grid grid-cols-3 gap-3 sm:max-w-lg sm:gap-4">
          {[
            { label: "Roles listed", value: roles },
            { label: "Open places", value: openings },
            { label: "Sectors", value: sectors.size },
          ].map((stat) => (
            <div key={stat.label} className="card px-4 py-3.5">
              <dt className="text-[0.68rem] leading-tight text-ink-soft">{stat.label}</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-rust">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <HomeStatus />

      <Section
        title="How to use TOE"
        description="Four steps, about three minutes. You can stop after step two and still get a full ranking."
      >
        <ol className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          {STEPS.map((step) => (
            <Card as="li" key={step.n} className="flex gap-4">
              <span className="font-display text-lg font-semibold text-rust/45 tabular-nums">
                {step.n}
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            </Card>
          ))}
        </ol>
      </Section>

      <Section
        title="About the career fair"
        description="Two days, five halls, and a lot of queueing if you arrive without a plan."
      >
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <dl className="space-y-3.5">
              {FAIR_FACTS.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
                    {fact.label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="lg:col-span-2">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <PinIcon className="h-4.5 w-4.5 text-rust" />
              What to expect on the floor
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink-soft">
              <li>
                <span className="font-medium text-ink">Halls A–B</span> — engineering, manufacturing
                and robotics, including the automation and semiconductor employers.
              </li>
              <li>
                <span className="font-medium text-ink">Halls C–D</span> — software, data, security
                and financial services, where most internship conversions happen.
              </li>
              <li>
                <span className="font-medium text-ink">Hall E</span> — startups and the CV clinic.
                Quieter in the morning, worth going early.
              </li>
              <li>
                Bring a one-page CV. Most recruiters will scan it and take a photo rather than keep
                a copy, so put your strongest project at the top.
              </li>
            </ul>
          </Card>
        </div>
      </Section>

      <Section title="Questions">
        <div className="grid gap-3 lg:grid-cols-2">
          {FAQS.map((faq) => (
            <details key={faq.q} className="card group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-base font-semibold text-ink">
                {faq.q}
                <SparkIcon className="h-4 w-4 shrink-0 text-rust/50 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{faq.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}
