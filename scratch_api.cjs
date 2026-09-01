const fs = require('fs');

const path = 'apps/web/src/services/api.ts';
let code = fs.readFileSync(path, 'utf8');

const newMethods = `
  // ===== Admin / Users =====
  getAdminUsers: async (page = 1, limit = 20, search = '', role = '') => {
    let url = \`\${API_URL}/admin/users?page=\${page}&limit=\${limit}\`;
    if (search) url += \`&search=\${encodeURIComponent(search)}\`;
    if (role) url += \`&role=\${encodeURIComponent(role)}\`;
    
    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error('Failed to fetch admin users');
    const data = await res.json();
    return data.data;
  },

  toggleUserBan: async (id: string, ban: boolean) => {
    const endpoint = ban ? 'ban' : 'unban';
    const res = await fetchWithAuth(\`\${API_URL}/admin/users/\${id}/\${endpoint}\`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to toggle user ban');
    const data = await res.json();
    return data.data;
  },

  updateUserRole: async (id: string, role: string) => {
    const res = await fetchWithAuth(\`\${API_URL}/admin/users/\${id}/role\`, {
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
`;

code = code.replace('export const api = {', 'export const api = {' + newMethods);
fs.writeFileSync(path, code);
console.log('Successfully updated api.ts');
