import { eq, and, desc, count, SQL } from "drizzle-orm";
import { db } from "../../../db";
import { tasks, Task } from "../../../db/schema";

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: "pending" | "in_progress" | "completed";
  priority?: "low" | "medium" | "high";
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: "pending" | "in_progress" | "completed";
  priority?: "low" | "medium" | "high";
}

export interface ListTasksFilters {
  page: number;
  limit: number;
  status?: string;
  priority?: string;
}

export const taskService = {
  async create(input: CreateTaskInput): Promise<Task> {
    const result = await db
      .insert(tasks)
      .values({
        title: input.title,
        description: input.description,
        status: input.status ?? "pending",
        priority: input.priority ?? "medium",
      })
      .returning();

    return result[0]!;
  },

  async getById(id: number): Promise<Task | null> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));

    return result[0] ?? null;
  },

  async update(id: number, input: UpdateTaskInput): Promise<Task | null> {
    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }

    const result = await db
      .update(tasks)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    return result[0]!;
  },

  async delete(id: number): Promise<boolean> {
    const existing = await this.getById(id);
    if (!existing) {
      return false;
    }

    await db.delete(tasks).where(eq(tasks.id, id));

    return true;
  },

  async list(
    filters: ListTasksFilters,
  ): Promise<{ tasks: Task[]; total: number }> {
    const conditions: SQL[] = [];

    if (filters.status) {
      conditions.push(eq(tasks.status, filters.status));
    }

    if (filters.priority) {
      conditions.push(eq(tasks.priority, filters.priority));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const offset = (filters.page - 1) * filters.limit;

    const [taskResults, countResult] = await Promise.all([
      db
        .select()
        .from(tasks)
        .where(whereClause)
        .orderBy(desc(tasks.createdAt))
        .limit(filters.limit)
        .offset(offset),
      db.select({ count: count() }).from(tasks).where(whereClause),
    ]);

    const total = countResult[0]?.count ?? 0;

    return { tasks: taskResults, total };
  },
};
