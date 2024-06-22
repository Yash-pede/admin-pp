// vite.config.ts
import react from "file:///home/rich/Desktop/JOBS/admin-pp/node_modules/.pnpm/@vitejs+plugin-react@4.3.1_vite@4.5.3_@types+node@18.19.37_/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///home/rich/Desktop/JOBS/admin-pp/node_modules/.pnpm/vite@4.5.3_@types+node@18.19.37/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///home/rich/Desktop/JOBS/admin-pp/node_modules/.pnpm/vite-tsconfig-paths@4.3.2_typescript@5.5.2_vite@4.5.3_@types+node@18.19.37_/node_modules/vite-tsconfig-paths/dist/index.mjs";
var __vite_injected_original_dirname = "/home/rich/Desktop/JOBS/admin-pp";
var vite_config_default = defineConfig({
  plugins: [tsconfigPaths({ root: __vite_injected_original_dirname }), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          antd: ["antd"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9yaWNoL0Rlc2t0b3AvSk9CUy9hZG1pbi1wcFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcmljaC9EZXNrdG9wL0pPQlMvYWRtaW4tcHAvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcmljaC9EZXNrdG9wL0pPQlMvYWRtaW4tcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSBcInZpdGUtdHNjb25maWctcGF0aHNcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFt0c2NvbmZpZ1BhdGhzKHsgcm9vdDogX19kaXJuYW1lIH0pLCByZWFjdCgpXSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgYW50ZDogW1wiYW50ZFwiXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrUixPQUFPLFdBQVc7QUFDcFMsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxtQkFBbUI7QUFGMUIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLGNBQWMsRUFBRSxNQUFNLGlDQUFVLENBQUMsR0FBRyxNQUFNLENBQUM7QUFBQSxFQUNyRCxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixNQUFNLENBQUMsTUFBTTtBQUFBLFFBQ2Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
