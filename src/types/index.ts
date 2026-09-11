export interface Database {
  public: {
    Tables: {
      categories: {
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
      products: {
        Row: {
          id: string
          category_id: string
          name: string
          brand: string
          description: string
          nutritional_info: Record<string, unknown> | null
          tags: string[]
          image_url: string
          is_active: boolean
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          brand: string
          description: string
          nutritional_info?: Record<string, unknown> | null
          tags?: string[]
          image_url: string
          is_active?: boolean
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          brand?: string
          description?: string
          nutritional_info?: Record<string, unknown> | null
          tags?: string[]
          image_url?: string
          is_active?: boolean
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          flavor: string | null
          weight_size: string | null
          price: number
          stock: number
          is_available: boolean
        }
        Insert: {
          id?: string
          product_id: string
          flavor?: string | null
          weight_size?: string | null
          price: number
          stock?: number
          is_available?: boolean
        }
        Update: {
          id?: string
          product_id?: string
          flavor?: string | null
          weight_size?: string | null
          price?: number
          stock?: number
          is_available?: boolean
        }
      }
      store_settings: {
        Row: {
          id: number
          whatsapp_number: string
          welcome_message: string
          delivery_info: string
        }
        Insert: {
          id?: number
          whatsapp_number: string
          welcome_message: string
          delivery_info: string
        }
        Update: {
          id?: number
          whatsapp_number?: string
          welcome_message?: string
          delivery_info?: string
        }
      }
    }
  }
}

export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type Product = Database["public"]["Tables"]["products"]["Row"]
export type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"]
export type StoreSettings = Database["public"]["Tables"]["store_settings"]["Row"]

export type ProductWithVariants = Product & {
  product_variants: ProductVariant[]
  categories: Category[] | null
}

export type ProductDetail = Product & {
  product_variants: ProductVariant[]
  categories: Category[] | null
}

export type CartItem = {
  variantId: string
  productId: string
  productName: string
  brand: string
  flavor: string | null
  weightSize: string | null
  price: number
  quantity: number
  imageUrl: string
}
