import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code2, Terminal, ChevronRight } from "lucide-react";

const TOPICS = [
  { name: "HTML", desc: "Web sahifalarning skeletini yarating" },
  { name: "CSS", desc: "Sahifalarga chiroy bering" },
  { name: "JavaScript", desc: "Interaktivlik va mantiq qo'shing" },
  { name: "TypeScript", desc: "Xavfsiz va tushunarli JS kodi yozing" },
  { name: "React", desc: "Zamonaviy UI kutubxonasi bilan ishlang" },
];

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center min-h-screen pt-20 px-4 md:px-8">
      {/* Hero Section */}
      <section className="w-full max-w-5xl flex flex-col items-center text-center space-y-6 mb-16">
        <div className="inline-flex items-center space-x-2 text-primary mb-4 px-3 py-1 border border-primary/30 bg-primary/5">
          <Terminal size={16} />
          <span className="text-sm font-mono tracking-widest uppercase">
            system.ready()
          </span>
        </div>
        <h1 className="text-5xl font-mono tracking-tight sm:text-6xl md:text-7xl uppercase">
          Master the Code
        </h1>
        <p className="mx-auto max-w-[600px] text-muted-foreground font-mono text-lg md:text-xl">
          &gt; CodaScript: Level up your development skills through interactive
          challenges.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mt-8">
          <Link href="/login?tab=register">
            <Button
              size="lg"
              className="h-14 px-10 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-lg uppercase tracking-wider"
            >
              Initialize
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-10 rounded-none border-primary/50 text-primary hover:bg-primary/10 font-mono text-lg uppercase tracking-wider"
            >
              Explore()
            </Button>
          </Link>
        </div>
      </section>

      {/* Topics Section */}
      <section className="w-full max-w-7xl pb-24">
        <div className="flex items-center space-x-4 mb-8">
          <Code2 className="text-primary w-8 h-8" />
          <h2 className="text-3xl font-mono uppercase tracking-widest">
            Modules
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOPICS.map((topic) => (
            <Link key={topic.name} href={`/quiz/${topic.name.toLowerCase()}`}>
              <div className="glass-card p-6 flex flex-col h-full hover:border-primary/60 transition-colors group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-mono font-bold text-white group-hover:text-primary transition-colors">
                    {topic.name}
                  </h3>
                  <ChevronRight className="text-primary/50 group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                </div>
                <p className="text-muted-foreground font-mono text-sm mb-6 flex-1">
                  {topic.desc}
                </p>

                <div className="flex space-x-2 border-t border-primary/20 pt-4 mt-auto">
                  {["EASY", "MEDIUM", "HARD"].map((level) => (
                    <span
                      key={level}
                      className={`text-xs font-mono px-2 py-1 bg-background/50 border ${
                        level === "EASY"
                          ? "border-green-500/30 text-green-400"
                          : level === "MEDIUM"
                            ? "border-yellow-500/30 text-yellow-400"
                            : "border-red-500/30 text-red-400"
                      }`}
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
