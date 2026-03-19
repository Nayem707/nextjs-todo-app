// ==================== ENUMS ====================
export const ProjectStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
  ON_HOLD: 'on_hold',
};

export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
};

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const MemberRole = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
};

export const ActivityType = {
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_ARCHIVED: 'project_archived',
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  TASK_ASSIGNED: 'task_assigned',
  MEMBER_ADDED: 'member_added',
  MEMBER_REMOVED: 'member_removed',
  COMMENT_ADDED: 'comment_added',
  STATUS_CHANGED: 'status_changed',
  PROGRESS_UPDATED: 'progress_updated',
};

// ==================== ERROR CLASSES ====================
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = {}) {
    super(message, 400);
    this.errors = errors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

// API Response type (for documentation)
export class ApiResponse {
  constructor(data, message = 'Success', status = 200) {
    this.data = data;
    this.message = message;
    this.status = status;
    this.success = status < 400;
  }
}
