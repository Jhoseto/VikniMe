/**
 * ImageUploadZone – react-dropzone based image uploader
 * - Drag & drop or click to select (jpeg/png/webp, max 5MB each)
 * - Progress simulation per file
 * - Preview thumbnails with remove button
 * - Calls onImagesChange with base64 preview URLs
 */
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, ImageIcon, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'

interface UploadedImage {
  id:       string
  preview:  string
  name:     string
  progress: number   // 0–100
  error?:   string
}

interface ImageUploadZoneProps {
  initialImages?: string[]         // existing URLs (for edit mode)
  maxFiles?: number
  onImagesChange: (urls: string[]) => void
  className?: string
}

export function ImageUploadZone({ initialImages = [], maxFiles = 5, onImagesChange, className }: ImageUploadZoneProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    initialImages.map((url, i) => ({ id: `init-${i}`, preview: url, name: `снимка-${i + 1}`, progress: 100 }))
  )

  function notify(imgs: UploadedImage[]) {
    onImagesChange(imgs.filter(i => i.progress === 100 && !i.error).map(i => i.preview))
  }

  const onDrop = useCallback((accepted: File[], rejected: unknown[]) => {
    if (rejected.length > 0) return

    const newImgs: UploadedImage[] = accepted.map(file => ({
      id:       `${Date.now()}-${file.name}`,
      preview:  URL.createObjectURL(file),
      name:     file.name,
      progress: 0,
    }))

    setImages(prev => {
      const combined = [...prev, ...newImgs].slice(0, maxFiles)
      notify(combined)
      return combined
    })

    // Simulate upload progress for each new image
    newImgs.forEach(img => {
      let prog = 0
      const interval = setInterval(() => {
        prog += Math.random() * 25 + 10
        if (prog >= 100) {
          prog = 100
          clearInterval(interval)
        }
        setImages(prev => {
          const updated = prev.map(i => i.id === img.id ? { ...i, progress: Math.round(prog) } : i)
          notify(updated)
          return updated
        })
      }, 120)
    })
  }, [maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: maxFiles - images.length,
    disabled: images.length >= maxFiles,
  })

  function remove(id: string) {
    setImages(prev => {
      const updated = prev.filter(i => i.id !== id)
      notify(updated)
      return updated
    })
  }

  return (
    <div className={className}>
      {/* Drop zone */}
      {images.length < maxFiles && (
        <div {...getRootProps()} className={clsx(
          'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all',
          isDragActive ? 'border-navy-400 bg-navy-50' : 'border-surface-300 hover:border-navy-300 hover:bg-surface-50'
        )}>
          <input {...getInputProps()} />
          <Upload size={24} className={clsx('mx-auto mb-2', isDragActive ? 'text-navy-500' : 'text-surface-400')} />
          <p className="text-sm font-medium text-surface-700">
            {isDragActive ? 'Пусни снимките тук' : 'Влачи снимки или кликни за избор'}
          </p>
          <p className="text-xs text-surface-400 mt-1">
            JPEG · PNG · WebP · макс. 5MB · до {maxFiles} снимки
          </p>
        </div>
      )}

      {/* Previews */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div layout className="mt-3 grid grid-cols-3 gap-2">
            {images.map(img => (
              <motion.div key={img.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-xl overflow-hidden bg-surface-100 group">
                <img src={img.preview} alt={img.name} className="w-full h-full object-cover" />

                {/* Progress overlay */}
                {img.progress < 100 && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <p className="text-white text-xs font-bold mt-2">{img.progress}%</p>
                  </div>
                )}

                {/* Error overlay */}
                {img.error && (
                  <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                    <AlertCircle size={20} className="text-white" />
                  </div>
                )}

                {/* Remove button */}
                {img.progress === 100 && (
                  <button onClick={() => remove(img.id)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Премахни снимка">
                    <X size={12} />
                  </button>
                )}

                {/* Primary badge */}
                {img.id === images[0].id && img.progress === 100 && (
                  <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-navy-500 text-white text-[9px] font-bold rounded-md">
                    Главна
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {images.length === 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-surface-400">
          <ImageIcon size={13} />
          <span>Добави поне 1 снимка – клиентите избират по-лесно с визуализация</span>
        </div>
      )}
    </div>
  )
}
