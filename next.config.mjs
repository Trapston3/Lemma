/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── WASM Support ─────────────────────────────────────────────────
  // Required for @myriaddreamin/typst-ts-web-compiler to load its WASM binary
  webpack: (config, { isServer }) => {
    // Allow WASM files to be imported as async modules
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Don't bundle WASM on the server
    if (isServer) {
      config.externals = [...(config.externals || []), /\.wasm$/];
    }

    return config;
  },

  // ── Security Headers ──────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Required for SharedArrayBuffer (used by some WASM modules)
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
