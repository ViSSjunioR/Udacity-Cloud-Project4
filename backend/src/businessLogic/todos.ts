import { generateUploadURLToS3 } from "../dataLayer/attachmentUtils";
import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import * as uuid from "uuid";
import {
  add,
  deleteByUserIdAndTodoId,
  findByUserId,
  updateByUserIdAndTodoId,
} from "../dataLayer/todosAcess";

export const getTodosForUser = async (userId: string) => {
  return await findByUserId(userId);
};

export const createTodo = async (
  newTodo: CreateTodoRequest,
  userId: string
): Promise<TodoItem> => {
  const todo: TodoItem = newTodo as TodoItem;
  todo.userId = userId;
  todo.todoId = uuid();
  todo.createdAt = new Date().toLocaleString();
  await add(todo);

  return todo;
};

export const updateTodo = async (
  userId: string,
  todoId: string,
  todo: UpdateTodoRequest
) => {
  await updateByUserIdAndTodoId(userId, todoId, todo);
};

export const deleteTodo = async (userId: string, todoId: string) => {
  await deleteByUserIdAndTodoId(userId, todoId);
};

export const createAttachmentPresignedUrl = async (
  userId: string,
  todoId: string
): Promise<string> => {
  return await generateUploadURLToS3(userId, todoId);
};
