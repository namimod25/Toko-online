import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'build',
    sourcemap: true
  }
})

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // export default defineConfig({
// //   plugins: [react()],
// //   server: {
// //     host: true, // Tambahkan ini
// //     port: 5173,
// //     proxy: {
// //       '/api': {
// //         target: 'http://localhost:5001',
// //         changeOrigin: true,
// //         secure: false,
// //         configure: (proxy, _options) => {
// //           proxy.on('error', (err, _req, _res) => {
// //             console.log('proxy error', err);
// //           });
// //           proxy.on('proxyReq', (proxyReq, req, _res) => {
// //             console.log('Sending Request to the Target:', req.method, req.url);
// //           });
// //           proxy.on('proxyRes', (proxyRes, req, _res) => {
// //             console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
// //           });
// //         },
// //       }
// //     }
// //   }
// // })