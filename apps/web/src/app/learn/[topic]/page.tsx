import { Metadata } from "next";
import Link from "next/link";
import { Terminal, BookOpen, Code2 } from "lucide-react";

export async function generateMetadata({ params }: { params: { topic: string } }): Promise<Metadata> {
  const topicName = params.topic.charAt(0).toUpperCase() + params.topic.slice(1);
  return {
    title: `Learn ${topicName} | CodaScript Interactive Quizzes`,
    description: `Master ${topicName} with our interactive learning environment. Explore tutorials, take quizzes, and track your progress in real-time.`,
    keywords: [`learn ${params.topic}`, `${params.topic} tutorials`, `${params.topic} quizzes`, `web development`],
    alternates: {
      canonical: `/learn/${params.topic}`,
    },
  };
}

async function getTopicStats(topic: string) {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  try {
    const res = await fetch(`${url}/questions/count?topic=${topic}&difficulty=mixed&mode=topic`, { next: { revalidate: 3600 } });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.data as number;
  } catch (_error) {
    return 0;
  }
}

export default async function TopicPage({ params }: { params: { topic: string } }) {
  const topicName = params.topic.charAt(0).toUpperCase() + params.topic.slice(1);
  const totalQuestions = await getTopicStats(params.topic);

  return (
    <div className="container py-24 px-4 max-w-4xl mx-auto min-h-screen">
      <div className="mb-8">
        <Link href="/learn" className="text-primary font-mono text-sm hover:underline uppercase flex items-center gap-2 mb-6">
          &lt; Back to Learning Hub
        </Link>
        <h1 className="text-4xl md:text-6xl font-mono font-bold uppercase text-white mb-6 flex items-center gap-4">
          <Terminal className="w-10 h-10 md:w-12 md:h-12 text-primary" />
          {topicName}
        </h1>
        <p className="text-muted-foreground font-mono text-lg md:text-xl leading-relaxed">
          Welcome to the definitive guide to {topicName}. Whether you are a beginner looking to understand the fundamentals or an experienced developer testing your advanced knowledge, our interactive quizzes are designed to push your skills to the next level.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="glass-card p-6 border-l-4 border-l-primary flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Code2 className="text-primary w-6 h-6" />
              <h3 className="font-mono font-bold text-white uppercase text-xl">Test Your Knowledge</h3>
            </div>
            <p className="text-muted-foreground font-mono text-sm mb-6">
              Challenge yourself with our curated database of {totalQuestions > 0 ? totalQuestions : 'numerous'} questions spanning various difficulty levels.
            </p>
          </div>
          <Link href={`/quiz/${params.topic.toLowerCase()}`} className="inline-block bg-primary text-primary-foreground text-center py-3 font-mono uppercase tracking-widest hover:bg-primary/90 transition-colors font-bold">
            Start {topicName} Quiz
          </Link>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between border-primary/20">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="text-primary w-6 h-6" />
              <h3 className="font-mono font-bold text-white uppercase text-xl">Curriculum</h3>
            </div>
            <ul className="text-muted-foreground font-mono text-sm space-y-3 mb-6">
              <li className="flex items-center gap-2"><span className="text-primary">&gt;</span> Fundamentals & Syntax</li>
              <li className="flex items-center gap-2"><span className="text-primary">&gt;</span> Advanced Concepts</li>
              <li className="flex items-center gap-2"><span className="text-primary">&gt;</span> Best Practices & Patterns</li>
              <li className="flex items-center gap-2"><span className="text-primary">&gt;</span> Common Pitfalls</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
