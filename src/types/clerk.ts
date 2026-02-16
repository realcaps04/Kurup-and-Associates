export interface ClerkUser {
    id: string; // UUID from Supabase Auth
    email: string;
    password?: string; // SECURITY WARNING: Avoid handling plain text passwords in frontend state
    employee_id: string;
    full_name: string;
    phone_number?: string;
    department?: string;
    designation?: string;
    avatar_url?: string;
    status: 'active' | 'inactive' | 'suspended' | 'application_submitted' | 'approved';
    role: string;
    last_login?: string;
    created_at: string;
    updated_at: string;
}

export type ClerkStatus = ClerkUser['status'];
