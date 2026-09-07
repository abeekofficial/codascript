import { User } from '@codascript/types';
import { AnswerResult, ClientQuestion } from '../store/quizStore';

export interface LeaderboardUser {
  _id: string;
  name: string;
  totalXP: number;
  completedQuizzes: number;
}

export interface ProfileStats {
  totalQuizzes: number;
  accuracy: number;
  totalTime: string;
}

export interface GrowthDataPoint {
  month: string;
  xp: number;
  accuracy: number;
}

export interface SkillStat {
  tech: string;
  value: number;
  solved: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://codascript.onrender.com/api';

const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const getRefreshToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Markazlashgan fetch wrapper: 401 bo'lsa avtomatik refresh token bilan qayta urinadi.
 * Agar refresh ham muvaffaqiyatsiz bo'lsa, foydalanuvchini logout qiladi.
 */
async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = getHeaders();
  let res = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (res.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newTokens = refreshData.data;

          if (typeof window !== 'undefined') {
            localStorage.setItem('token', newTokens.accessToken);
            localStorage.setItem('refreshToken', newTokens.refreshToken);
          }

          // Asl so'rovni yangi token bilan qayta urinish
          const newHeaders = {
            ...options.headers,
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newTokens.accessToken}`,
          };
          res = await fetch(url, { ...options, headers: newHeaders });
        } else {
          // Refresh muvaffaqiyatsiz — logout
          performLogout();
        }
      } catch {
        performLogout();
      }
    } else {
      performLogout();
    }
  }

  return res;
}

import { useAuthStore } from '../store/authStore';

function performLogout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    useAuthStore.getState().logout();
    
    // next-auth/react dan signOut funksiyasini chaqirish
    import('next-auth/react').then(({ signOut }) => {
      signOut({ callbackUrl: '/login' });
    }).catch(() => {
      window.location.href = '/login';
    });
  }
}

export const api = {
  // ===== Admin / Users =====
  getAdminUsers: async (page = 1, limit = 20, search = '', role = '') => {
    let url = `${API_URL}/admin/users?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (role) url += `&role=${encodeURIComponent(role)}`;
    
    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error('Failed to fetch admin users');
    const data = await res.json();
    return data.data;
  },

  toggleUserBan: async (id: string, ban: boolean) => {
    const endpoint = ban ? 'ban' : 'unban';
    const res = await fetchWithAuth(`${API_URL}/admin/users/${id}/${endpoint}`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to toggle user ban');
    const data = await res.json();
    return data.data;
  },

  updateUserRole: async (id: string, role: string) => {
    const res = await fetchWithAuth(`${API_URL}/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.message || 'Failed to update user role');
    }
    const data = await res.json();
    return data.data;
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data.data; // { accessToken, refreshToken }
  },

  register: async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data.data;
  },

  updateProfile: async (profileData: {
    name?: string;
    username?: string;
    avatar?: string;
    bio?: string;
  }) => {
    const res = await fetchWithAuth(`${API_URL}/auth/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || 'Profilni yangilashda xatolik');
    return data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await fetchWithAuth(`${API_URL}/auth/password`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to change password');
    return data;
  },

  deleteAccount: async () => {
    const res = await fetchWithAuth(`${API_URL}/auth/account`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete account');
    return data;
  },

  forgotPassword: async (email: string) => {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error sending email');
    return data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error resetting password');
    return data;
  },

  getProfile: async (): Promise<User> => {
    const res = await fetchWithAuth(`${API_URL}/auth/me`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    const data = await res.json();
    return data.data;
  },

  getPublicProfile: async (username: string): Promise<User> => {
    const res = await fetch(`${API_URL}/users/${username}`);
    if (!res.ok) throw new Error('Foydalanuvchi topilmadi');
    const data = await res.json();
    return data.data;
  },

  getLeaderboard: async (): Promise<LeaderboardUser[]> => {
    const res = await fetch(`${API_URL}/auth/leaderboard`);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    const data = await res.json();
    return data.data;
  },

  // ===== Profil statistikasi uchun yangi endpointlar =====

  getProfileStats: async (): Promise<ProfileStats> => {
    const res = await fetchWithAuth(`${API_URL}/quiz/profile-stats`);
    if (!res.ok) throw new Error('Failed to fetch profile stats');
    const data = await res.json();
    return data.data;
  },

  getGrowthData: async (): Promise<GrowthDataPoint[]> => {
    const res = await fetchWithAuth(`${API_URL}/quiz/growth-data`);
    if (!res.ok) throw new Error('Failed to fetch growth data');
    const data = await res.json();
    return data.data;
  },

  getSkillStats: async (): Promise<SkillStat[]> => {
    const res = await fetchWithAuth(`${API_URL}/quiz/skill-stats`);
    if (!res.ok) throw new Error('Failed to fetch skill stats');
    const data = await res.json();
    return data.data;
  },

  // ===== Notifications =====
  getNotifications: async (page = 1) => {
    const res = await fetchWithAuth(`${API_URL}/notifications?page=${page}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    const data = await res.json();
    return data.data;
  },

  getUnreadNotificationsCount: async () => {
    const res = await fetchWithAuth(`${API_URL}/notifications/unread-count`);
    if (!res.ok) throw new Error('Failed to count notifications');
    const data = await res.json();
    return data.data;
  },

  markNotificationAsRead: async (id: string) => {
    const res = await fetchWithAuth(`${API_URL}/notifications/${id}/read`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to mark read');
    return await res.json();
  },

  markAllNotificationsAsRead: async () => {
    const res = await fetchWithAuth(`${API_URL}/notifications/read-all`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to mark all read');
    return await res.json();
  },

  // ===== Saved Items =====
  checkSaved: async (itemType: string, itemId: string) => {
    const res = await fetchWithAuth(`${API_URL}/saved/check?itemType=${itemType}&itemId=${itemId}`);
    if (!res.ok) throw new Error('Failed to check saved status');
    const data = await res.json();
    return data.data.isSaved as boolean;
  },

  saveItem: async (itemType: string, itemId: string) => {
    const res = await fetchWithAuth(`${API_URL}/saved`, {
      method: 'POST',
      body: JSON.stringify({ itemType, itemId })
    });
    if (!res.ok) throw new Error('Failed to save item');
    return await res.json();
  },

  unsaveItem: async (itemType: string, itemId: string) => {
    const res = await fetchWithAuth(`${API_URL}/saved/${itemType}/${itemId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to unsave item');
    return await res.json();
  },

  getSavedItems: async (type?: string) => {
    let url = `${API_URL}/saved`;
    if (type) url += `?type=${type}`;
    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error('Failed to get saved items');
    const data = await res.json();
    return data.data;
  },

  // ===== Quiz tarix endpointi =====

  getHistory: async (page = 1, limit = 20) => {
    const res = await fetchWithAuth(
      `${API_URL}/quiz/history?page=${page}&limit=${limit}`
    );
    if (!res.ok) throw new Error('Failed to fetch quiz history');
    const data = await res.json();
    return data.data;
  },

  // ===== Quiz API =====

  getTopics: async (): Promise<string[]> => {
    const res = await fetch(`${API_URL}/questions/topics`);
    if (!res.ok) throw new Error('Failed to fetch topics');
    const data = await res.json();
    return data.data;
  },

  getQuestionCount: async (
    topic: string,
    difficulty: string,
    mode: string,
    subtopic?: string
  ): Promise<number> => {
    let url = `${API_URL}/questions/count?topic=${topic}&difficulty=${difficulty}&mode=${mode}`;
    if (subtopic && subtopic !== 'Barchasi')
      url += `&subtopic=${encodeURIComponent(subtopic)}`;
    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error('Failed to get question count');
    const data = await res.json();
    return data.data;
  },

  startQuiz: async (
    topic: string,
    difficulty: string,
    mode: string,
    count: number | 'all',
    subtopic?: string
  ) => {
    const res = await fetchWithAuth(`${API_URL}/quiz/start`, {
      method: 'POST',
      body: JSON.stringify({ topic, difficulty, mode, count, subtopic }),
    });
    if (!res.ok) throw new Error('Failed to start quiz');
    const data = await res.json();
    return data.data as { quizId: string; questions: ClientQuestion[] };
  },

  submitAnswer: async (
    quizId: string,
    questionId: string,
    selectedOptionIndex: number,
    selectedOptionText: string
  ) => {
    const res = await fetchWithAuth(`${API_URL}/quiz/answer`, {
      method: 'POST',
      body: JSON.stringify({
        quizId,
        questionId,
        selectedOptionIndex,
        selectedOptionText,
      }),
    });
    if (!res.ok) throw new Error('Failed to submit answer');
    const data = await res.json();
    return {
      ...data.data,
      selectedOptionIndex,
    } as AnswerResult;
  },

  getTestCases: async (quizId: string, questionId: string) => {
    const res = await fetchWithAuth(
      `${API_URL}/quiz/${quizId}/questions/${questionId}/test-cases`
    );
    if (!res.ok) throw new Error('Failed to fetch test cases');
    const data = await res.json();
    return data.data as {
      input: string;
      expectedOutput: string;
      isHidden?: boolean;
    }[];
  },

  completeQuiz: async (quizId: string) => {
    const res = await fetchWithAuth(`${API_URL}/quiz/complete`, {
      method: 'POST',
      body: JSON.stringify({ quizId }),
    });
    if (!res.ok) throw new Error('Failed to complete quiz');
    const data = await res.json();
    return data.data;
  },

  addQuestion: async (questionData: any) => {
    const res = await fetchWithAuth(`${API_URL}/questions`, {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add question');
    return data.data;
  },

  updateQuestion: async (id: string, questionData: any) => {
    const res = await fetchWithAuth(`${API_URL}/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update question');
    return data.data;
  },

  bulkAddQuestions: async (questionsData: any[]) => {
    const res = await fetchWithAuth(`${API_URL}/questions/bulk`, {
      method: 'POST',
      body: JSON.stringify(questionsData),
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || 'Failed to add questions bulk');
    return data.data;
  },

  getQuestions: async () => {
    const res = await fetchWithAuth(`${API_URL}/questions`);
    if (!res.ok) throw new Error('Failed to fetch questions');
    const data = await res.json();
    return data.data;
  },

  getSubtopics: async (topic: string) => {
    const res = await fetchWithAuth(
      `${API_URL}/questions/subtopics?topic=${encodeURIComponent(topic)}`
    );
    if (!res.ok) throw new Error('Failed to fetch subtopics');
    const data = await res.json();
    return data.data as string[];
  },

  getQuestionStats: async () => {
    const res = await fetchWithAuth(`${API_URL}/questions/stats`);
    if (!res.ok) throw new Error('Failed to fetch question stats');
    const data = await res.json();
    return data.data;
  },

  // ===== Amaliy Masalalar (Problems) =====

  getProblemsAdmin: async () => {
    // Usually admin needs all problems, client route returns them too but we can just use the public endpoint for now
    const res = await fetchWithAuth(`${API_URL}/problems`);
    if (!res.ok) throw new Error('Failed to fetch problems');
    const data = await res.json();
    return data.data;
  },

  getProblem: async (slugOrId: string) => {
    const res = await fetchWithAuth(`${API_URL}/problems/${slugOrId}`);
    if (!res.ok) throw new Error('Failed to fetch problem');
    const data = await res.json();
    return data.data;
  },

  runProblem: async (id: string, code: string, language: string) => {
    const res = await fetchWithAuth(`${API_URL}/problems/${id}/run`, {
      method: 'POST',
      body: JSON.stringify({ code, language }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to run problem');
    return data;
  },

  submitProblem: async (id: string, code: string, language: string) => {
    const res = await fetchWithAuth(`${API_URL}/problems/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ code, language }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit problem');
    return data;
  },

  addProblem: async (problemData: any) => {
    const res = await fetchWithAuth(`${API_URL}/problems`, {
      method: 'POST',
      body: JSON.stringify(problemData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add problem');
    return data.data;
  },

  addProblemsBulk: async (problemsData: any[]) => {
    const res = await fetchWithAuth(`${API_URL}/problems/bulk`, {
      method: 'POST',
      body: JSON.stringify(problemsData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add problems');
    return data.data;
  },

  deleteProblem: async (id: string) => {
    const res = await fetchWithAuth(`${API_URL}/problems/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete problem');
    return data.data;
  },

  updateProblem: async (id: string, problemData: any) => {
    const res = await fetchWithAuth(`${API_URL}/problems/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(problemData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update problem');
    return data.data;
  },

  // ===== Community & Social =====

  getRecommendedUsers: async () => {
    const res = await fetchWithAuth(`${API_URL}/users/recommendations`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    const data = await res.json();
    return data.data;
  },

  followUser: async (id: string) => {
    const res = await fetchWithAuth(`${API_URL}/users/${id}/follow`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to follow user');
    const data = await res.json();
    return data.data;
  },

  unfollowUser: async (id: string) => {
    const res = await fetchWithAuth(`${API_URL}/users/${id}/unfollow`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to unfollow user');
    const data = await res.json();
    return data.data;
  },

  getFollowers: async (username: string) => {
    const res = await fetchWithAuth(`${API_URL}/users/${username}/followers`);
    if (!res.ok) throw new Error('Failed to fetch followers');
    const data = await res.json();
    return data.data;
  },

  getFollowing: async (username: string) => {
    const res = await fetchWithAuth(`${API_URL}/users/${username}/following`);
    if (!res.ok) throw new Error('Failed to fetch following');
    const data = await res.json();
    return data.data;
  },

  voteProblem: async (id: string, vote: 'up' | 'down') => {
    const res = await fetchWithAuth(
      `${API_URL}/community/problems/${id}/vote`,
      {
        method: 'POST',
        body: JSON.stringify({ vote }),
      }
    );
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to vote: ${errText}`);
    }
    const data = await res.json();
    return data.data;
  },

  getPendingProblems: async () => {
    const res = await fetchWithAuth(`${API_URL}/community/problems/pending`);
    if (!res.ok) throw new Error('Failed to fetch pending problems');
    const data = await res.json();
    return data.data;
  },

  submitCommunityProblem: async (problemData: any) => {
    const res = await fetchWithAuth(`${API_URL}/community/problems/submit`, {
      method: 'POST',
      body: JSON.stringify(problemData),
    });
    if (!res.ok) throw new Error('Failed to submit community problem');
    const data = await res.json();
    return data.data;
  },

  voteQuestion: async (id: string, vote: 'up' | 'down') => {
    const res = await fetchWithAuth(
      `${API_URL}/community/questions/${id}/vote`,
      {
        method: 'POST',
        body: JSON.stringify({ vote }),
      }
    );
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to vote on question: ${errText}`);
    }
    const data = await res.json();
    return data.data;
  },

  getPendingQuestions: async () => {
    const res = await fetchWithAuth(`${API_URL}/community/questions/pending`);
    if (!res.ok) throw new Error('Failed to fetch pending questions');
    const data = await res.json();
    return data.data;
  },

  submitCommunityQuestion: async (questionData: any) => {
    const res = await fetchWithAuth(`${API_URL}/community/questions/submit`, {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit community question');
    return data.data;
  },

  getPendingCommunity: async () => {
    const res = await fetchWithAuth(`${API_URL}/admin/community/pending`);
    if (!res.ok) throw new Error('Failed to fetch pending community items');
    return await res.json();
  },

  forceApproveCommunity: async (type: string, id: string) => {
    const res = await fetchWithAuth(`${API_URL}/admin/community/${type}/${id}/force-approve`, {
      method: 'PATCH'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to approve');
    return data.data;
  },

  forceRejectCommunity: async (type: string, id: string, reason: string) => {
    const res = await fetchWithAuth(`${API_URL}/admin/community/${type}/${id}/force-reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to reject');
    return data.data;
  },

  getUserSubmissionsStats: async (userId: string) => {
    const res = await fetchWithAuth(`${API_URL}/admin/users/${userId}/submissions`);
    if (!res.ok) throw new Error('Failed to fetch user submissions');
    return await res.json();
  }
};
