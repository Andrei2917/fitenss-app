// --- CREDENTIALS (What we send to the backend) ---
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface CoachRegisterCredentials {
  name: string;
  email: string;
  password: string;
  specialty: string;
  bio?: string; // Optional
}

// --- MODELS (What the backend saves in the database) ---
export interface User {
  id: string;
  name: string;
  email: string;
  profilePictureUrl?: string; // <-- NEW: So the profile picture persists after login
}

export interface Coach {
  id: string;
  name: string;
  email: string;
  specialty: string;
  bio?: string;
  avatar?: string;
  profilePictureUrl?: string; // <-- NEW: So the profile picture persists after login
}

// --- RESPONSES (What the backend sends back to the phone) ---
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface CoachAuthResponse {
  message: string;
  token: string;
  coach: Coach;
}