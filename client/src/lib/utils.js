import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = process.env.API_URL || "http://localhost:5000/api/";
export default API_URL;
