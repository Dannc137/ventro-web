import { Link, Navigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { useAuth } from "@/features/auth";
import {
  BrowserFrame,
  ClientViewMockup,
  ContributionsMockup,
  DashboardMockup,
  RescheduleMockup,
} from "../components/landing-mockups";

const PROBLEMS = [
  {
    title: "Decisions get buried",
    detail: "Someone agreed the caterer's new price three weeks ago. Nobody can find it now.",
  },
  {
    title: "Nobody knows who has paid",
    detail: "Six people promised to contribute. Four actually did. You're keeping score in your head.",
  },
  {
    title: "The date moves and everything breaks",
    detail: "One change, and every deadline you set is wrong.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create your event",
    detail: "Name, date, venue. That's the whole setup.",
  },
  {
    step: "02",
    title: "Invite your people",
    detail: "Give each person the access they need, and nothing more.",
  },
  {
    step: "03",
    title: "Work the plan",
    detail: "Everyone sees what's done, what's owed and what's next.",
  },
];

export function LandingPage() {
  const { status } = useAuth();

  if (status === "authenticated") {
    return <Navigate to="/events" replace />;
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 md:px-8">
  <span className="flex-1 text-lg font-semibold tracking-tight">Ventro</span>

  <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
    <a href="#features" className="transition-colors hover:text-foreground">
      Features
    </a>
    <a href="#how" className="transition-colors hover:text-foreground">
      How it works
    </a>
  </nav>

  <div className="flex flex-1 items-center justify-end gap-2">
    <Button asChild variant="ghost" size="sm">
      <Link to="/login">Sign in</Link>
    </Button>
    <Button asChild size="sm">
      <Link to="/register">Get started</Link>
    </Button>
  </div>
</div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 text-center md:px-8 md:pt-24">
          <Reveal>
            <span className="inline-flex rounded-full bg-primary-tint px-3 py-1 text-xs font-medium text-primary-strong">
              Built for teams who plan together
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl leading-[1.08] font-semibold tracking-tight md:text-6xl">
              Plan events together, without the group chat chaos
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-base text-foreground-soft md:text-lg">
              Tasks that reschedule themselves. Budgets everyone can see. And a clear
              answer to who has actually paid.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Button asChild size="lg">
                <Link to="/register">
                  Get started free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Free while in beta · No card required
              </p>
            </div>
          </Reveal>
        </section>

        {/* Product shot */}
        <section className="border-y bg-muted/60">
          <div className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
            <Reveal>
              <BrowserFrame>
                <DashboardMockup />
              </BrowserFrame>
            </Reveal>
          </div>
        </section>

        {/* Problem */}
        <section className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-center text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
              Group chats were never built for this
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {PROBLEMS.map((problem, index) => (
              <Reveal key={problem.title} delay={index * 100}>
                <div>
                  <h3 className="text-[15px] font-semibold">{problem.title}</h3>
                  <p className="mt-2 text-sm text-foreground-soft">{problem.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t bg-card">
          <div className="mx-auto max-w-6xl space-y-24 px-4 py-20 md:px-8 md:py-28">
            <FeatureRow
              eyebrow="Scheduling"
              title="Move the date, the plan follows"
              detail="Every task is scheduled relative to the event date. Change the date and every deadline adjusts automatically — except the ones you've pinned."
              visual={<RescheduleMockup />}
            />

            <FeatureRow
              eyebrow="Money"
              title="See who paid, not just who promised"
              detail="Track pledges, record payments, and know exactly who has contributed and how much is still outstanding — before it becomes awkward."
              visual={<ContributionsMockup />}
              reversed
            />

            <FeatureRow
              eyebrow="Sharing"
              title="Share progress without sharing everything"
              detail="Give clients a clean read-only view of what matters to them. No login needed, no access to your vendor rates or team notes."
              visual={<ClientViewMockup />}
            />
          </div>
        </section>

        {/* Statement band */}
        <section className="relative overflow-hidden bg-foreground py-24 md:py-32">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(79,70,229,0.5),transparent_60%),radial-gradient(ellipse_at_75%_80%,rgba(79,70,229,0.28),transparent_55%)]"
          />
          <div className="relative mx-auto max-w-3xl px-4 text-center md:px-8">
            <Reveal>
              <h2 className="text-3xl leading-tight font-semibold tracking-tight text-white md:text-4xl">
                Every event is a hundred small decisions
              </h2>
              <p className="mt-3 text-white/70">This is where they live.</p>
            </Reveal>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
          <Reveal>
            <h2 className="text-center text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
              How it works
            </h2>
          </Reveal>

          <ol className="mt-14 grid gap-12 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Reveal key={step.step} delay={index * 100}>
                <li className="text-center">
                  <p className="text-3xl font-semibold text-primary-tint tabular-nums">
                    {step.step}
                  </p>
                  <h3 className="mt-3 text-[15px] font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-foreground-soft">{step.detail}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* Close */}
        <section className="bg-foreground py-20 text-center md:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl px-4 md:px-8">
              <h2 className="text-3xl leading-tight font-semibold tracking-tight text-white md:text-4xl">
                Your next event starts here
              </h2>
              <p className="mt-3 text-white/70">
                Create an event and invite the people helping you plan it.
              </p>
              <Button asChild size="lg" className="mt-8">
                <Link to="/register">
                  Get started free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
          <div className="flex flex-wrap justify-between gap-10">
            <div className="max-w-xs">
              <p className="text-lg font-semibold tracking-tight">Ventro</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Event planning for teams who need to stay in control.
              </p>
            </div>

            <div>
              <p className="text-[13px] font-semibold">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="transition-colors hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how" className="transition-colors hover:text-foreground">
                    How it works
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[13px] font-semibold">Account</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/login" className="transition-colors hover:text-foreground">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="transition-colors hover:text-foreground">
                    Create an account
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <p className="mt-12 border-t pt-6 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ventro
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureRow({
  eyebrow,
  title,
  detail,
  visual,
  reversed,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  visual: React.ReactNode;
  reversed?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <Reveal className={reversed ? "lg:order-2" : undefined}>
        <div>
          <p className="text-xs font-semibold tracking-[0.04em] text-primary uppercase">
            {eyebrow}
          </p>
          <h3 className="mt-3 text-2xl leading-tight font-semibold tracking-tight md:text-3xl">
            {title}
          </h3>
          <p className="mt-4 max-w-md text-foreground-soft">{detail}</p>
        </div>
      </Reveal>

      <Reveal delay={120} className={reversed ? "lg:order-1" : undefined}>
        {visual}
      </Reveal>
    </div>
  );
}