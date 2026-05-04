/**
 * AvatarCropDialog – react-image-crop based circular avatar cropper.
 * Triggers via file input, shows crop UI in a portal modal,
 * outputs a cropped base64 data URL.
 */
import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'

function centerAspectCrop(mediaWidth: number, mediaHeight: number): Crop {
  return centerCrop(makeAspectCrop({ unit: '%', width: 80 }, 1, mediaWidth, mediaHeight), mediaWidth, mediaHeight)
}

async function getCroppedBlob(image: HTMLImageElement, crop: PixelCrop): Promise<string> {
  const canvas = document.createElement('canvas')
  const size = Math.min(crop.width, crop.height, 400)
  canvas.width  = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height

  // Circular clip
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx.clip()

  ctx.drawImage(image,
    crop.x * scaleX, crop.y * scaleY,
    crop.width * scaleX, crop.height * scaleY,
    0, 0, size, size
  )
  return canvas.toDataURL('image/jpeg', 0.92)
}

interface AvatarCropDialogProps {
  currentAvatar?: string | null
  name?: string | null
  onSave: (dataUrl: string) => void
}

export function AvatarCropDialog({ currentAvatar, name, onSave }: AvatarCropDialogProps) {
  const [src, setSrc]           = useState<string | null>(null)
  const [crop, setCrop]         = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [open, setOpen]         = useState(false)
  const [saving, setSaving]     = useState(false)
  const imgRef                  = useRef<HTMLImageElement>(null)
  const inputRef                = useRef<HTMLInputElement>(null)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setSrc(reader.result as string); setOpen(true) }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height))
  }, [])

  async function handleSave() {
    if (!imgRef.current || !completedCrop) return
    setSaving(true)
    try {
      const dataUrl = await getCroppedBlob(imgRef.current, completedCrop)
      onSave(dataUrl)
      setOpen(false)
      setSrc(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Trigger area */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
          <Avatar src={currentAvatar} name={name} size="xl" />
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload size={20} className="text-white" />
          </div>
        </div>
        <button onClick={() => inputRef.current?.click()}
          className="text-sm font-medium text-navy-500 hover:text-navy-700 transition-colors">
          Промени снимка
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileChange} />
      </div>

      {/* Crop dialog */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl overflow-hidden max-w-sm w-full">
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
                  <h3 className="font-display font-bold text-navy-500">Изрежи снимката</h3>
                  <button onClick={() => { setOpen(false); setSrc(null) }}
                    className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center hover:bg-surface-200 transition-colors"
                    aria-label="Затвори">
                    <X size={16} />
                  </button>
                </div>

                {src && (
                  <div className="p-4">
                    <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}
                      aspect={1} circularCrop keepSelection>
                      <img ref={imgRef} src={src} alt="Crop preview" onLoad={onImageLoad}
                        className="max-w-full max-h-64 object-contain mx-auto" />
                    </ReactCrop>
                  </div>
                )}

                <div className="px-5 py-4 border-t border-surface-100 flex gap-2">
                  <Button variant="outline" onClick={() => { setOpen(false); setSrc(null) }} className="flex-1">
                    Откажи
                  </Button>
                  <Button onClick={handleSave} loading={saving} className="flex-1">
                    <Check size={16} className="mr-1.5" /> Запази
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
