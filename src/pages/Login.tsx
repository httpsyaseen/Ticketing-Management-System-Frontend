// components/LoginForm.tsx
"use client";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import logo from "../assets/logo.png";
import { loginSchema, LoginSchemaType } from "./validationSchema";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginForm() {
  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: LoginSchemaType) {
    console.log("Login form values:", values);
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-1/2 max-w-md rounded-2xl shadow-md">
        <CardContent className="">
            <div className="relative hidden md:block">
                        <div className="flex justify-center mb-2">

        <Image
          src={logo} 
          alt="Login illustration"
        className="h-20 ite flex w-18 object-contain" 
          priority
        />
        </div>
      </div>
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-center text-[#006400]">
             Ticketing Mangement System  (PSBA)
        </h2>
            <p className="text-sm text-gray-500">Sign in to your complain account</p>
          </div>
         
          <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 cursor-pointer">Sign In</Button>
        </form>
      </Form>
        </CardContent>
      </Card>
    </div>
  );
}
