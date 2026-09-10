import { useState, type ReactNode } from 'react'

interface ProductImageProps {
  image: string | null
  name: string
  children?: ReactNode
}

export function ProductImage({ image, name, children }: ProductImageProps) {
  const normalizedImage = image?.trim() || null
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const shouldDisplayImage =
    normalizedImage !== null && normalizedImage !== failedImage

  return (
    <div className="relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden bg-slate-100">
      {shouldDisplayImage ? (
        <img
          src={normalizedImage}
          alt={name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailedImage(normalizedImage)}
          className="h-full w-full object-contain p-4"
        />
      ) : (
        <span
          className="text-5xl font-bold text-teal-700"
          aria-label={`Aucune image disponible pour ${name}`}
        >
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}
      {children}
    </div>
  )
}
