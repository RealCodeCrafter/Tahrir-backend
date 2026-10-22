export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

export enum ContactStatus {
  NEW = 'new',
  READ = 'read',
  REPLIED = 'replied',
}

export enum BillingPeriod {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
}

export enum DocumentStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

export enum RewriteStyle {
  SIMPLER = 'simpler',
  FORMAL = 'formal',
  SHORTER = 'shorter',
  DETAILED = 'detailed',
}

export enum FaqTab {
  POPULAR = 'popular',
  GUIDES = 'guides',
  TROUBLE = 'trouble',
}

export enum IssueType {
  SPELLING = 'spelling',
  PUNCT = 'punct',
  STYLE = 'style',
}
