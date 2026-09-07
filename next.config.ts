import type { NextConfig } from 'next'

const isProductionBuild = process.env.NODE_ENV === 'production'
const tauriDevHost = process.env.TAURI_DEV_HOST ?? 'localhost'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  assetPrefix: isProductionBuild ? undefined : `http://${tauriDevHost}:3000`,
}

export default nextConfig
