// /**
//  * Central API Service Layer for Banking Transaction System
//  * Connects frontend directly to the Express backend.
//  */

// const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// /**
//  * Common request handler with JSON parsing, credentials, and error wrapping
//  */
// async function request(endpoint, options = {}) {
//   const url = `${API_BASE_URL}${endpoint}`;
//   const token = localStorage.getItem('lp_token');

//   const headers = {
//     'Content-Type': 'application/json',
//     ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
//     ...(options.headers || {})
//   };

//   const config = {
//     ...options,
//     headers,
//     credentials: 'include' // Send httpOnly session cookie
//   };

//   try {
//     const response = await fetch(url, config);
//     const data = await response.json().catch(() => ({}));

//     if (!response.ok) {
//       const errorMsg = data.message || `Request failed with status ${response.status}`;
//       const error = new Error(errorMsg);
//       error.status = response.status;
//       error.data = data;
//       throw error;
//     }

//     return data;
//   } catch (error) {
//     if (!error.status && error.name === 'TypeError') {
//       error.message = 'Unable to connect to banking server. Please check your network or server status.';
//     }
//     throw error;
//   }
// }

// // ---------------------------------------------
// // Authentication Endpoints
// // ---------------------------------------------

// export const authApi = {
//   register: (payload) => request('/api/auth/register', {
//     method: 'POST',
//     body: JSON.stringify(payload)
//   }),

//   login: (payload) => request('/api/auth/login', {
//     method: 'POST',
//     body: JSON.stringify(payload)
//   }),

//   logout: () => request('/api/auth/logout', {
//     method: 'POST'
//   }),

//   getProfile: () => request('/api/auth/me')
// };

// // ---------------------------------------------
// // Accounts Endpoints
// // ---------------------------------------------

// export const accountsApi = {
//   getAccounts: () => request('/api/accounts'),

//   createAccount: (currency = 'INR') => request('/api/accounts', {
//     method: 'POST',
//     body: JSON.stringify({ currency })
//   }),

//   getAccountBalance: (accountId) => request(`/api/accounts/${accountId}/balance`),

//   getDirectory: () => request('/api/accounts/directory')
// };

// // ---------------------------------------------
// // Transactions & Ledger Endpoints
// // ---------------------------------------------

// export const transactionsApi = {
//   getTransactions: () => request('/api/transactions'),

//   createTransfer: ({ fromAccount, toAccount, amount, idempotencyKey }) => request('/api/transactions', {
//     method: 'POST',
//     body: JSON.stringify({
//       fromAccount,
//       toAccount,
//       amount: Number(amount),
//       idempotencyKey
//     })
//   }),

//   fundFromTreasury: ({ toAccount, amount, idempotencyKey }) => request('/api/transactions/system/initial-funds', {
//     method: 'POST',
//     body: JSON.stringify({
//       toAccount,
//       amount: Number(amount),
//       idempotencyKey
//     })
//   }),

//   getLedgerAudit: () => request('/api/transactions/ledger'),

//   getSimulatedEmails: () => request('/api/transactions/simulated-emails')
// };

// // ---------------------------------------------
// // System Diagnostics
// // ---------------------------------------------

// export const systemApi = {
//   checkHealth: () => request('/api/health')
// };


/**
 * Central API Service Layer for Banking Transaction System
 * Connects frontend directly to the Express backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Common request handler with JSON parsing, credentials, and error wrapping
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('lp_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers,
    credentials: 'include' // Send httpOnly session cookie
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (!error.status && error.name === 'TypeError') {
      error.message = 'Unable to connect to banking server. Please check your network or server status.';
    }
    throw error;
  }
}

// ---------------------------------------------
// Authentication Endpoints
// ---------------------------------------------

export const authApi = {
  register: (payload) => request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  login: (payload) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  logout: () => request('/api/auth/logout', {
    method: 'POST'
  }),

  getProfile: () => request('/api/auth/me')
};

// ---------------------------------------------
// Accounts Endpoints
// ---------------------------------------------

export const accountsApi = {
  getAccounts: () => request('/api/accounts'),

  createAccount: (currency = 'INR') => request('/api/accounts', {
    method: 'POST',
    body: JSON.stringify({ currency })
  }),

  getAccountBalance: (accountId) => request(`/api/accounts/${accountId}/balance`),

  getDirectory: () => request('/api/accounts/directory')
};

// ---------------------------------------------
// Transactions & Ledger Endpoints
// ---------------------------------------------

export const transactionsApi = {
  getTransactions: () => request('/api/transactions'),

  createTransfer: ({ fromAccount, toAccount, amount, idempotencyKey }) => request('/api/transactions', {
    method: 'POST',
    body: JSON.stringify({
      fromAccount,
      toAccount,
      amount: Number(amount),
      idempotencyKey
    })
  }),

  fundFromTreasury: ({ toAccount, amount, idempotencyKey }) => request('/api/transactions/system/initial-funds', {
    method: 'POST',
    body: JSON.stringify({
      toAccount,
      amount: Number(amount),
      idempotencyKey
    })
  }),

  creditTreasury: ({ amount = 1000000, idempotencyKey }) => request('/api/transactions/system/credit-treasury', {
    method: 'POST',
    body: JSON.stringify({
      amount: Number(amount),
      idempotencyKey
    })
  }),

  getTreasuryStatus: () => request('/api/transactions/system/treasury-status'),

  getLedgerAudit: () => request('/api/transactions/ledger'),

  getSimulatedEmails: () => request('/api/transactions/simulated-emails')
};

// ---------------------------------------------
// System Diagnostics
// ---------------------------------------------

export const systemApi = {
  checkHealth: () => request('/api/health')
};
