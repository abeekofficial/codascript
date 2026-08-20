import { Metadata } from "next";
import Link from "next/link";
import { Terminal, Code2 } from "lucide-react";

export async function generateMetadata({ params }: { params: { topic: string, subtopic: string } }): Promise<Metadata> {
  const topicName = params.topic.charAt(0).toUpperCase() + params.topic.slice(1);
  const subtopicName = params.subtopic.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  return {
    title: `${subtopicName} in ${topicName} | CodaScript Interactive Quizzes`,
    description: `Master ${subtopicName} in ${topicName}. Explore targeted tutorials, take interactive quizzes, and improve your developer skills.`,
    keywords: [`learn ${subtopicName}`, `${topicName} ${subtopicName}`, `programming quizzes`, `web development`],
    alternates: {
      canonical: `/learn/${params.topic}/${params.subtopic}`,
    },
  };
}

export default async function SubtopicPage({ params }: { params: { topic: string, subtopic: string } }) {
  const topicName = params.topic.charAt(0).toUpperCase() + params.topic.slice(1);
  const subtopicName = params.subtopic.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="container py-24 px-4 max-w-4xl mx-auto min-h-screen">
      <div className="mb-8">
        <Link href={`/learn/${params.topic.toLowerCase()}`} className="text-primary font-mono text-sm hover:underline uppercase flex items-center gap-2 mb-6">
          &lt; Back to {topicName} Hub
        </Link>
        <h1 className="text-3xl md:text-5xl font-mono font-bold uppercase text-white mb-6 flex items-center gap-4">
          <Terminal className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          {topicName} {subtopicName}
        </h1>
        <p className="text-muted-foreground font-mono text-lg md:text-xl leading-relaxed">
          Dive deep into {subtopicName}. This focused module helps you understand the specific nuances, syntax, and best practices required to master this area of {topicName}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-12">
        <div className="glass-card p-6 border-l-4 border-l-primary flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Code2 className="text-primary w-6 h-6" />
              <h3 className="font-mono font-bold text-white uppercase text-xl">Start Practice Session</h3>
            </div>
            <p className="text-muted-foreground font-mono text-sm mb-6">
              Launch a targeted quiz session specifically configured for {subtopicName} questions.
            </p>
          </div>
          <Link href={`/quiz/${params.topic.toLowerCase()}`} className="inline-block bg-primary text-primary-foreground text-center py-3 font-mono uppercase tracking-widest hover:bg-primary/90 transition-colors font-bold w-full md:w-1/2">
            Configure {subtopicName} Quiz
          </Link>
        </div>
      </div>
    </div>
  );
}
