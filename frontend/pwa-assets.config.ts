import { defineConfig } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  headLinkOptions: { preset: 'default' },
  preset: {
    transparent: {
      sizes: [64, 96, 128, 192, 384, 512],
      favicons: [[64, 'favicon-64x64.png'], [32, 'favicon-32x32.png'], [16, 'favicon-16x16.png']],
    },
    maskable: { sizes: [512] },
    apple: { sizes: [120, 152, 167, 180] },
  },
  images: ['public/favicon.svg'],
})
