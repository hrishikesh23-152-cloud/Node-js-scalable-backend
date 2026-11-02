import asyncHandler from "express-async-handler"
import Todo, { type TodoDoc } from "../models/todoModel.js"
import type { ProtectedRequest } from "../types/types.js";
import type { Response,RequestHandler } from "express";
import { BadRequestError, ForbiddenError, NotFoundError } from "../core/CustomError.js";
import todocache from "../cache/todocache.js";
import logger from "../core/logger.js";
const createTodo:RequestHandler = asyncHandler(async (req:ProtectedRequest, res:Response) => {
  const { title, description } = req.body

  if (!title || !description) {
    res.status(400)
    throw new BadRequestError("Title and Description are required")
  }

  const userId = req.user?._id || req.user;
  await todocache.invalidTodos(String(req.user?._id));
  logger.info("todos deleted from cache..")
  await Todo.create({ user: userId, title, description })
  

  res.status(201).json({ title, description })
})


const getTodos: RequestHandler = asyncHandler(
  async (req: ProtectedRequest, res: Response): Promise<void> => {

    const userId = String(req.user?._id);

    // 1. Check Redis cache
    logger.info("Trying to fetch data from cache...");

    const cachedTodos = await todocache.fetchUserTodos(userId);

    // 2. Cache hit
    if (cachedTodos && cachedTodos.length > 0) {
      logger.info("Successfully fetched todos from cache");

      res.status(200).json({
        data: cachedTodos
      });

      return;
    }

    // 3. Cache miss: Fetch from MongoDB
    logger.info("Fetching todos from database instead of cache...");

    const todos = await Todo.find({
      user: userId
    });

    // 4. Check if todos exist
    if (todos.length === 0) {
      res.status(404).json({
        message: "No todos found"
      });

      return;
    }

    // 5. Save data in Redis
    logger.info("Trying to save todos in cache...");

    await todocache.saveUserTodos(userId, todos);

    logger.info("Successfully saved todos to cache");

    // 6. Return database results
    res.status(200).json({
      data: todos
    });

    return;
  }
);


const editTodo:RequestHandler = asyncHandler(async (req:ProtectedRequest, res:Response) => {
  const { title, description, status } = req.body

  const user = req.user

  if (!title || !description || !status) {
    res.status(400)
    throw new BadRequestError("Title, Description, and Status are required")
  }

  const todo = await Todo.findById(req.params.id)

  if (!todo) {
    res.status(404)
    throw new NotFoundError("Todo not found")
  }

  const userId = user?._id ? user._id.toString() : user?.toString();
  if (todo.user.toString() !== userId) {
    throw new ForbiddenError("Not authorized to update this todo")
  }

  todo.title = title
  todo.description = description
  todo.status = status

  const updatedTodo = await todo.save()
    await todocache.invalidTodos(String(req.user?._id));
  res.json(updatedTodo)
})

const deleteTodo:RequestHandler = asyncHandler(async (req:ProtectedRequest, res:Response) => {
  const todo = await Todo.findById(req.params.id)

  if (!todo) {
    res.status(404)
    throw new NotFoundError("Todo not found")
  }

  const userId = req.user?._id ? req.user._id.toString() : req.user?.toString();
  if (todo.user.toString() !== userId) {
    throw new ForbiddenError("Not authorized to delete this todo")
  }

  await todo.deleteOne();
    await todocache.invalidTodos(String(req.user?._id));
  res.status(200)
  .json({ message: "Todo removed" })
})

export { createTodo, getTodos, editTodo, deleteTodo }
