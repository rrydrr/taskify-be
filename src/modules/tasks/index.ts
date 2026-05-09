import { Elysia, t } from "elysia";
import { taskService } from "./service";
import { successResponse, errorResponse } from "../../utils/response";

const statusEnum = t.Union([
  t.Literal("pending"),
  t.Literal("in_progress"),
  t.Literal("completed"),
]);

const priorityEnum = t.Union([
  t.Literal("low"),
  t.Literal("medium"),
  t.Literal("high"),
]);

const createTaskBody = t.Object({
  title: t.String({ minLength: 1, maxLength: 255 }),
  description: t.Optional(t.String({ maxLength: 10000 })),
  status: t.Optional(statusEnum),
  priority: t.Optional(priorityEnum),
});

const updateTaskBody = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
  description: t.Optional(t.String({ maxLength: 10000 })),
  status: t.Optional(statusEnum),
  priority: t.Optional(priorityEnum),
});

const taskIdParam = t.Object({
  id: t.Numeric({ minimum: 1 }),
});

const listTasksQuery = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  status: t.Optional(statusEnum),
  priority: t.Optional(priorityEnum),
});

export const tasksModule = new Elysia({ prefix: "/tasks" })
  .post(
    "/",
    async ({ body, set }) => {
      const task = await taskService.create(body);
      set.status = 201;
      return successResponse(task);
    },
    { body: createTaskBody },
  )
  .get(
    "/:id",
    async ({ params, set }) => {
      const task = await taskService.getById(params.id);
      if (!task) {
        set.status = 404;
        return errorResponse("task not found");
      }
      return successResponse(task);
    },
    { params: taskIdParam },
  )
  .get(
    "/",
    async ({ query }) => {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;

      const { tasks, total } = await taskService.list({
        page,
        limit,
        status: query.status,
        priority: query.priority,
      });

      const totalPages = Math.ceil(total / limit);

      return successResponse({
        items: tasks,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      });
    },
    { query: listTasksQuery },
  )
  .patch(
    "/:id",
    async ({ params, body, set }) => {
      const { title, description, status, priority } = body;

      if (
        title === undefined &&
        description === undefined &&
        status === undefined &&
        priority === undefined
      ) {
        set.status = 400;
        return errorResponse("at least one updatable field must be provided");
      }

      const task = await taskService.update(params.id, body);
      if (!task) {
        set.status = 404;
        return errorResponse("task not found");
      }

      return successResponse(task);
    },
    { params: taskIdParam, body: updateTaskBody },
  )
  .delete(
    "/:id",
    async ({ params, set }) => {
      const deleted = await taskService.delete(params.id);
      if (!deleted) {
        set.status = 404;
        return errorResponse("task not found");
      }
      return successResponse({ message: "task deleted" });
    },
    { params: taskIdParam },
  );
