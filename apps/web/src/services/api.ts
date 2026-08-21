import { User } from "@codascript/types";
import { ClientQuestion, AnswerResult } from "../store/quizStore";

export interface LeaderboardUser {
  _id: string;
  name: string;
  totalXP: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://codascript.onrender.com/api';

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data.data; // { accessToken, refreshToken }
  },

  register: async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data.data;
  },

  updateProfile: async (profileData: { name?: string; username?: string; avatar?: string }) => {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Profilni yangilashda xatolik');
    return data.data;
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    const res = await fetch(`${API_URL}/auth/password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(passwordData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Parolni yangilashda xatolik');
    return data;
  },

  getProfile: async (): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    const data = await res.json();
    return data.data;
  },

  getLeaderboard: async (): Promise<LeaderboardUser[]> => {
    const res = await fetch(`${API_URL}/auth/leaderboard`);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    const data = await res.json();
    return data.data;
  },

  // Real implementations for Quiz API
  getTopics: async (): Promise<string[]> => {
    const res = await fetch(`${API_URL}/questions/topics`);
    if (!res.ok) throw new Error('Failed to fetch topics');
    const data = await res.json();
    return data.data;
  },

  getQuestionCount: async (topic: string, difficulty: string, mode: string): Promise<number> => {
    const res = await fetch(`${API_URL}/questions/count?topic=${topic}&difficulty=${difficulty}&mode=${mode}`);
    if (!res.ok) throw new Error('Failed to fetch question count');
    const data = await res.json();
    return data.data;
  },

  startQuiz: async (topic: string, difficulty: string, mode: string, count: number | 'all') => {
    const res = await fetch(`${API_URL}/quiz/start`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ topic, difficulty, mode, count })
    });
    if (!res.ok) throw new Error('Failed to start quiz');
    const data = await res.json();
    return data.data as { quizId: string, questions: ClientQuestion[] };
  },

  submitAnswer: async (quizId: string, questionId: string, selectedOptionIndex: number, selectedOptionText: string) => {
    const res = await fetch(`${API_URL}/quiz/answer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ quizId, questionId, selectedOptionIndex, selectedOptionText })
    });
    if (!res.ok) throw new Error('Failed to submit answer');
    const data = await res.json();
    return data.data as AnswerResult;
  },

  completeQuiz: async (quizId: string) => {
    const res = await fetch(`${API_URL}/quiz/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ quizId })
    });
    if (!res.ok) throw new Error('Failed to complete quiz');
    const data = await res.json();
    return data.data;
  },

  addQuestion: async (questionData: any) => {
    const res = await fetch(`${API_URL}/questions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(questionData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add question');
    return data.data;
  },

  bulkAddQuestions: async (questionsData: any[]) => {
    const res = await fetch(`${API_URL}/questions/bulk`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(questionsData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add questions bulk');
    return data.data;
  }
};
