import mongoose, { Schema,Document, Model } from "mongoose"

export interface TodoDoc extends Document {
  user:mongoose.Schema.Types.ObjectId,
  title:string,
  description:string,
  status:string
}
export enum Status{
  NOT_STARTED="not-started",
  IN_PROGRESS="in-progress",
  DONE="done"
}

const todoModel = new Schema<TodoDoc>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: Status.NOT_STARTED,
      enum: Object.values(Status),
    },
  },
  {
    timestamps: true,
  }
)

const Todo:Model<TodoDoc> = mongoose.model<TodoDoc>("Todo", todoModel)

export default Todo
