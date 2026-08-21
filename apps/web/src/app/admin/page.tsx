'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'json'>('manual');
  
  // Manual form state
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOptionId, setCorrectOptionId] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [code, setCode] = useState('');
  
  // JSON form state
  const [jsonInput, setJsonInput] = useState('');
  
  const [message, setMessage] = useState('');

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const q = {
        topic,
        subtopic,
        difficulty,
        question,
        options: options.filter(o => o.trim() !== ''),
        correctOptionId,
        explanation,
        code
      };
      await api.addQuestion(q);
      setMessage('Question added successfully!');
      // Reset basic fields
      setQuestion('');
      setOptions(['', '', '', '']);
      setCode('');
      setExplanation('');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleJsonSubmit = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      let arr = Array.isArray(parsed) ? parsed : [parsed];
      
      // Auto-map aliases to correct schema fields
      arr = arr.map(q => ({
        ...q,
        correctOptionId: q.correctOptionId !== undefined ? q.correctOptionId : q.correctOptionIndex
      }));

      await api.bulkAddQuestions(arr);
      setMessage(`Successfully added ${arr.length} questions!`);
      setJsonInput('');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <Button 
          variant={activeTab === 'manual' ? 'default' : 'outline'}
          onClick={() => setActiveTab('manual')}
        >
          Add Single Question
        </Button>
        <Button 
          variant={activeTab === 'json' ? 'default' : 'outline'}
          onClick={() => setActiveTab('json')}
        >
          Add via JSON
        </Button>
      </div>

      {message && (
        <div className="p-4 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {message}
        </div>
      )}

      {activeTab === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Question</CardTitle>
            <CardDescription>Fill out the fields to add a new test question.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Topic</label>
                  <Input required value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. JavaScript" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subtopic</label>
                  <Input value={subtopic} onChange={e => setSubtopic(e.target.value)} placeholder="e.g. Closures" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select 
                  className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={difficulty} 
                  onChange={e => setDifficulty(e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Question Text</label>
                <Textarea required value={question} onChange={e => setQuestion(e.target.value)} placeholder="What is a closure?" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Code Snippet (Optional)</label>
                <Textarea value={code} onChange={e => setCode(e.target.value)} placeholder="function example() { ... }" className="font-mono text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Options</label>
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center">
                    <input 
                      type="radio" 
                      name="correctOption" 
                      checked={correctOptionId === i}
                      onChange={() => setCorrectOptionId(i)}
                      className="w-4 h-4"
                    />
                    <Input 
                      required
                      value={opt} 
                      onChange={e => {
                        const newOpts = [...options];
                        newOpts[i] = e.target.value;
                        setOptions(newOpts);
                      }} 
                      placeholder={`Option ${i + 1}`} 
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Explanation (Optional)</label>
                <Textarea value={explanation} onChange={e => setExplanation(e.target.value)} placeholder="Explain why the answer is correct..." />
              </div>

              <Button type="submit">Save Question</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'json' && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Add via JSON</CardTitle>
            <CardDescription>Paste an array of question objects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              className="h-[400px] font-mono text-sm"
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              placeholder={`[
  {
    "topic": "JavaScript",
    "difficulty": "Beginner",
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctOptionId": 0
  }
]`}
            />
            <Button onClick={handleJsonSubmit}>Upload JSON</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
