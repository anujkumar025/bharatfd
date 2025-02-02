"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import API_URL from "@/lib/utils";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";


export function LoginForm({
  className,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}admin/login`, {
        username,
        password
      });

  
      const token = response.data.token;
  
      if (token) {
        // Store token in localStorage
        localStorage.setItem('authToken', token);
          router.push('/')
      }
  
    } catch (err) {
      console.log(err);
      alert("Invalid username or password");
    } finally {
      setIsLoading(false);
    }

  }

  return (
    (<div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Admin User Name</Label>
                <Input id="email" type="text" placeholder="" required onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" required onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>)
  );
}
