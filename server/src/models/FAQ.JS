import { Schema, model } from "mongoose";

const FAQSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    translations: {
      hi: { question: String, answer: String },
      bn: { question: String, answer: String },
    },
  },
  { timestamps: true }
);

export default model("FAQ", FAQSchema);
