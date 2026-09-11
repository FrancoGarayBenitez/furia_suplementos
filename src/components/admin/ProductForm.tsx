"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { VariantManager } from "@/components/admin/VariantManager"

type Category = { id: string; name: string }
type VariantInput = {
  id?: string
  flavor: string
  weight_size: string
  price: string
  stock: string
  is_available: boolean
}

type ProductFormProps = {
  categories: Category[]
  product?: {
    id: string
    category_id: string
    name: string
    brand: string
    description: string
    tags: string[]
    image_url: string
    is_active: boolean
    product_variants?: (VariantInput & { is_available: boolean })[]
  }
  variant?: "default" | "ghost"
}

export function ProductForm({
  categories,
  product,
  variant = "default",
}: ProductFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(product?.name ?? "")
  const [brand, setBrand] = useState(product?.brand ?? "")
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "")
  const [description, setDescription] = useState(product?.description ?? "")
  const [tagsInput, setTagsInput] = useState((product?.tags ?? []).join(", "))
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "")
  const [variants, setVariants] = useState<VariantInput[]>(
    (product?.product_variants ?? []).map((v) => ({
      id: v.id,
      flavor: v.flavor ?? "",
      weight_size: v.weight_size ?? "",
      price: String(v.price),
      stock: String(v.stock),
      is_available: v.is_available,
    }))
  )

  const handleImageChange = async (file: File | null) => {
    setImageFile(file)
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setImageUrl(objectUrl)
    }
  }

  const handleSave = async () => {
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    let finalImage = imageUrl

    if (imageFile) {
      const ext = imageFile.name.split(".").pop() ?? "png"
      const path = `${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, imageFile)
      if (uploadError) {
        setError(`Error al subir imagen: ${uploadError.message}`)
        setLoading(false)
        return
      }
      const { data: publicUrl } = supabase.storage
        .from("product-images")
        .getPublicUrl(path)
      finalImage = publicUrl.publicUrl
    }

    try {
      if (product) {
        const { error: prodError } = await supabase
          .from("products")
          .update({
            category_id: categoryId,
            name,
            brand,
            description,
            tags,
            image_url: finalImage,
            is_active: product.is_active,
          })
          .eq("id", product.id)
        if (prodError) throw new Error(prodError.message)

        await saveVariants(supabase, product.id)
      } else {
        const { data: newProduct, error: prodError } = await supabase
          .from("products")
          .insert({
            category_id: categoryId,
            name,
            brand,
            description,
            tags,
            image_url: finalImage,
            is_active: true,
          })
          .select("id")
          .single()
        if (prodError) throw new Error(prodError.message)

        await saveVariants(supabase, newProduct.id)
      }

      setOpen(false)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar")
    } finally {
      setLoading(false)
    }
  }

  const saveVariants = async (
    supabase: ReturnType<typeof createClient>,
    productId: string
  ) => {
    const exitIds = new Set(
      variants.filter((v) => v.id).map((v) => v.id as string)
    )
    if (product) {
      const existing = product.product_variants ?? []
      const removalIds = existing
        .filter((v) => v.id && !exitIds.has(v.id))
        .map((v) => v.id as string)
      if (removalIds.length > 0) {
        await supabase
          .from("product_variants")
          .delete()
          .in("id", removalIds)
      }
    }

    for (const v of variants) {
      const payload = {
        product_id: productId,
        flavor: v.flavor || null,
        weight_size: v.weight_size || null,
        price: Number(v.price) || 0,
        stock: Number(v.stock) || 0,
        is_available: v.is_available,
      }
      if (v.id) {
        await supabase.from("product_variants").update(payload).eq("id", v.id)
      } else {
        await supabase.from("product_variants").insert(payload)
      }
    }
  }

  return (
    <>
      {variant === "ghost" ? (
        <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)}>
          <Pencil className="size-4" />
          <span className="sr-only">Editar</span>
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Nuevo producto
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {product ? "Editar producto" : "Nuevo producto"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Imagen</Label>
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 flex-shrink-0 overflow-hidden rounded border bg-muted">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt="Vista previa"
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Marca</Label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Categoría</Label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Descripción</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Etiquetas (separadas por coma)</Label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Sin TACC, Vegano"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <VariantManager
              variants={variants}
              onChange={setVariants}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}