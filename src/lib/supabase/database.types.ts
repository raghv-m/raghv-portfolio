/**
 * Table types for supabase/migrations/20261007000000_init.sql.
 *
 * Hand-written to match the migration until the project is linked; then replace this file with
 * `npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts`.
 */

type Timestamp = string;

/** Row = what a select returns; Insert = required columns only (defaults optional); Update = all optional. */
type Table<Row, Required extends keyof Row> = {
  Row: Row;
  Insert: Pick<Row, Required> & Partial<Omit<Row, Required>>;
  Update: Partial<Row>;
  Relationships: [];
};

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "client";
  tenant_id: string;
  avatar_url: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type ProjectRow = {
  id: string;
  tenant_id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: "planning" | "in_progress" | "review" | "completed" | "on_hold" | "cancelled";
  progress: number;
  start_date: Timestamp | null;
  end_date: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type MilestoneRow = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: Timestamp | null;
  sort_order: number;
  created_at: Timestamp;
};

export type ProjectFileRow = {
  id: string;
  project_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: Timestamp;
};

export type MessageRow = {
  id: string;
  project_id: string;
  sender_id: string;
  body: string;
  created_at: Timestamp;
};

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type InvoiceRow = {
  id: string;
  tenant_id: string;
  client_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  amount_due: number;
  amount_paid: number;
  currency: string;
  due_date: Timestamp;
  sent_date: Timestamp | null;
  paid_date: Timestamp | null;
  pdf_path: string | null;
  notes: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type InvoiceLineItemRow = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_amount: number;
  /** Generated column (quantity * unit_amount): never insert or update it. */
  amount: number;
  sort_order: number;
};

export type BlogPostRow = {
  id: string;
  legacy_id: string | null;
  author_id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  cover_url: string | null;
  status: "draft" | "published";
  featured: boolean;
  read_time: number | null;
  views: number;
  notify_subscribers: boolean;
  published_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type SubscriberRow = {
  id: string;
  email: string;
  name: string | null;
  confirmed: boolean;
  confirmation_token: string | null;
  active: boolean;
  unsubscribe_token: string;
  subscribed_at: Timestamp;
  confirmed_at: Timestamp | null;
};

export type EmailSendRow = {
  id: string;
  post_id: string | null;
  invoice_id: string | null;
  recipient_email: string;
  type: "newsletter" | "newsletter_confirm" | "contact_reply" | "invoice_sent" | "admin_alert";
  status: "sent" | "failed";
  error_message: string | null;
  sent_at: Timestamp;
};

export type ContactSubmissionRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip_hash: string | null;
  read: boolean;
  created_at: Timestamp;
};

export type JobApplicationRow = {
  id: string;
  company: string;
  role: string;
  applied_at: Timestamp;
  status: string;
  notes: string | null;
  posting_url: string | null;
  updated_at: Timestamp;
};

export type AnnotationRow = {
  id: string;
  page_slug: string;
  content: string;
  color: string;
  position: string;
  created_at: Timestamp;
};

export type AuditLogRow = {
  id: string;
  actor_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  changes: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
  created_at: Timestamp;
};

export type MfaSecretRow = {
  id: string;
  user_id: string;
  secret_encrypted: string;
  backup_code_hashes: string[];
  enabled: boolean;
  last_used_step: number | null;
  failed_attempts: number;
  locked_until: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type TenantRow = { id: string; name: string; created_at: Timestamp };

export type Database = {
  public: {
    Tables: {
      tenants: Table<TenantRow, "name">;
      profiles: Table<ProfileRow, "id" | "email" | "tenant_id">;
      projects: Table<ProjectRow, "tenant_id" | "client_id" | "title">;
      milestones: Table<MilestoneRow, "project_id" | "title">;
      project_files: Table<ProjectFileRow, "project_id" | "uploaded_by" | "file_name" | "file_path">;
      messages: Table<MessageRow, "project_id" | "sender_id" | "body">;
      invoices: Table<InvoiceRow, "tenant_id" | "client_id" | "due_date">;
      invoice_line_items: {
        Row: InvoiceLineItemRow;
        Insert: Pick<InvoiceLineItemRow, "invoice_id" | "description" | "unit_amount"> &
          Partial<Pick<InvoiceLineItemRow, "id" | "quantity" | "sort_order">>;
        Update: Partial<Omit<InvoiceLineItemRow, "amount">>;
        Relationships: [];
      };
      blog_posts: Table<BlogPostRow, "title" | "slug" | "content">;
      subscribers: Table<SubscriberRow, "email">;
      email_sends: Table<EmailSendRow, "recipient_email" | "type">;
      contact_submissions: Table<ContactSubmissionRow, "name" | "email" | "subject" | "message">;
      job_applications: Table<JobApplicationRow, "company" | "role" | "applied_at">;
      annotations: Table<AnnotationRow, "page_slug" | "content">;
      audit_logs: Table<AuditLogRow, "action" | "resource_type">;
      mfa_secrets: Table<MfaSecretRow, "user_id" | "secret_encrypted">;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      current_tenant_id: { Args: Record<string, never>; Returns: string };
      can_access_project: { Args: { target_project: string }; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
