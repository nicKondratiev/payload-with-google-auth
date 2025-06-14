import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**',
    },
    {
      protocol: 'http',
      hostname: '**',
    },
  ],
  images: {
    domains: ['orcamenus.s3.eu-north-1.amazonaws.com'],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
