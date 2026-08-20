import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn Coding | CodaScript",
  description: "Browse our comprehensive collection of coding tutorials, exercises, and interactive quizzes for HTML, CSS, JavaScript, React, and more.",
  keywords: ["learn coding", "programming tutorials", "web development", "coding quizzes"],
  alternates: {
    canonical: "/learn",
  },
};

// Next.js will fetch this on the server
async function getTopics() {
  const url = process.env.NEXT_PUBLIC_API_URL || 'https://codascript.onrender.com/api';
  try {
    const res = await fetch(`${url}/questions/topics`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data as string[];
  } catch (error) {
    console.error("Failed to fetch topics", error);
    return [];
  }
}

export default async function LearnIndexPage() {
  const topics = await getTopics();

  return (
    <div className="container py-24 px-4 max-w-4xl mx-auto min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-mono font-bold uppercase text-white mb-4">
          <span className="text-primary mr-2">&gt;</span> Learning Hub
        </h1>
        <p className="text-muted-foreground font-mono text-lg">
          Master web development technologies through interactive documentation and challenging quizzes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <Link href={`/learn/${topic.toLowerCase()}`} key={topic}>
            <div className="glass-card p-6 h-full hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <h2 className="text-2xl font-mono font-bold text-white uppercase group-hover:text-primary transition-colors mb-2">
                {topic}
              </h2>
              <p className="text-sm text-muted-foreground font-mono">
                Explore tutorials, best practices, and interactive quizzes for {topic}.
              </p>
            </div>
          </Link>
        ))}
        {topics.length === 0 && (
          <div className="col-span-full glass-card p-8 text-center border-dashed border-muted-foreground/30">
            <p className="text-muted-foreground font-mono text-lg">
              No topics available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
