import NextAuth from "next-auth"
import { ZodError } from "zod"
import Credentials from "next-auth/providers/credentials"
import { signInSchema } from "@/lib/zod"
import bcrypt from "bcryptjs"
import User from "./models/User.model"

import Google from "next-auth/providers/google"
import { toLowerCase } from "zod/v4"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({

      credentials: {
        email: {
            type: "email",
            label: "Email",
            placeholder: "john@example.com"
        },
        password: {
            type: "password",
            label: "Password",
            placeholder: "******"
        },

      },
      authorize: async (credentials) => {
        try {
          let user = null
 
          const { email, password } = await signInSchema.parseAsync(credentials)
 
          user = await User.findOne({email})
 
          if (!user) {
            throw new Error("No user found with this email")
          }

          const isValid = await bcrypt.compare(password, user.password)

          if(!isValid){
             throw new Error("Invalid Password")
          }

          return user

        } catch (error) {
          if (error instanceof ZodError) {
            return null
          }
        }
      },
    }),

    Google
  ],

  callbacks : {

    async jwt({token, user}){
      if(user) {
        token.id = user.id
      }

      return token
    }, 

    async session({token, session}){
      if(session.user) {
        
        session.user.id = token.id as string

      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60* 60
  },

  secret: process.env.AUTH_SECRET
  
})