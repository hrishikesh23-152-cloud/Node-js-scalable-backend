import asyncHandler from "express-async-handler"
import Todo from "../models/todoModel.js"
import type { ProtectedRequest } from "../types/types.js";
import type { Response,RequestHandler } from "express";
import { BadRequestError, ForbiddenError, NotFoundError } from "../core/CustomError.js";
const createTodo:RequestHandler = asyncHandler(async (req:ProtectedRequest, res:Response) => {
  const { title, description } = req.body

  if (!title || !description) {
    res.status(400)
    throw new BadRequestError("Title and Description are required")
  }

  const userId = req.user?._id || req.user;
  await Todo.create({ user: userId, title, description })

  res.status(201).json({ title, description })
})

const getTodos:RequestHandler = asyncHandler(async (req:ProtectedRequest, res:Response) => {
  const userId = req.user?._id || req.user;
  const todos = await Todo.find({
    user: userId,
  })
  res.status(200).json({
    Data:todos
  })
})

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
  res.json({ message: "Todo removed" })
})

export { createTodo, getTodos, editTodo, deleteTodo }
