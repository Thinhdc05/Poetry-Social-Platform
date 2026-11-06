export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          role: string
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
        }
      }
      poems: {
        Row: {
          id: string
          title: string
          content: string
          author: string | null
          author_type: string | null
          author_id: string
          image_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          author?: string | null
          author_type?: string | null
          author_id: string
          image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author?: string | null
          author_type?: string | null
          author_id?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
      }
      poem_tags: {
        Row: {
          poem_id: string
          tag_id: string
        }
        Insert: {
          poem_id: string
          tag_id: string
        }
        Update: {
          poem_id?: string
          tag_id?: string
        }
      }
      comments: {
        Row: {
          id: string
          poem_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          poem_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          poem_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      lounge_messages: {
        Row: {
          id: string
          user_id: string | null
          sender_name: string
          sender_seal: string
          content: string
          msg_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          sender_name: string
          sender_seal?: string
          content: string
          msg_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          sender_name?: string
          sender_seal?: string
          content?: string
          msg_type?: string
          created_at?: string
        }
      }
      poem_likes: {
        Row: {
          user_id: string
          poem_id: string
          reaction_type: string
          created_at: string
        }
        Insert: {
          user_id: string
          poem_id: string
          reaction_type?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          poem_id?: string
          reaction_type?: string
          created_at?: string
        }
      }
    }
  }
}

