18:34:46.206 Running build in Washington, D.C., USA (East) – iad1
18:34:46.206 Build machine configuration: 2 cores, 8 GB
18:34:46.353 Cloning github.com/shahulramiz26/shahulramiz26-xplorixtech-new--drilling-platform (Branch: main, Commit: dbb1640)
18:34:46.913 Cloning completed: 559.000ms
18:34:47.283 Restored build cache from previous deployment (5mf96AKcuzqb3oUeXTmzgTrrWEY6)
18:34:47.475 Running "vercel build"
18:34:47.500 Vercel CLI 54.4.1
18:34:47.701 Installing dependencies...
18:34:50.047 
18:34:50.047 up to date in 2s
18:34:50.048 
18:34:50.048 25 packages are looking for funding
18:34:50.049   run `npm fund` for details
18:34:50.078 Detected Next.js version: 14.2.0
18:34:50.082 Running "npm run build"
18:34:50.181 
18:34:50.182 > drilling-platform-mvp@0.1.0 build
18:34:50.182 > next build
18:34:50.182 
18:34:50.842   ▲ Next.js 14.2.0
18:34:50.843 
18:34:50.862    Creating an optimized production build ...
18:35:01.731  ✓ Compiled successfully
18:35:01.733    Linting and checking validity of types ...
18:35:01.851  ⨯ ESLint must be installed in order to run during builds: npm install --save-dev eslint
18:35:14.590    Collecting page data ...
18:35:16.473    Generating static pages (0/47) ...
18:35:17.665    Generating static pages (11/47) 
18:35:17.789  ⨯ useSearchParams() should be wrapped in a suspense boundary at page "/admin/finance/invoicing". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
18:35:17.789     at o (/vercel/path0/.next/server/chunks/8207.js:1:10664)
18:35:17.789     at s (/vercel/path0/.next/server/chunks/8207.js:1:21598)
18:35:17.789     at S (/vercel/path0/.next/server/app/admin/finance/invoicing/page.js:60:5653)
18:35:17.790     at nj (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46251)
18:35:17.790     at nM (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47571)
18:35:17.790     at nN (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64546)
18:35:17.790     at nB (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67538)
18:35:17.791     at nD (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66680)
18:35:17.791     at nN (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64853)
18:35:17.791     at nB (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67538)
18:35:17.791 
18:35:17.791 Error occurred prerendering page "/admin/finance/invoicing". Read more: https://nextjs.org/docs/messages/prerender-error
18:35:17.792 
18:35:18.714    Generating static pages (23/47) 
18:35:19.285    Generating static pages (35/47) 
18:35:20.167  ✓ Generating static pages (47/47)
18:35:20.193 
18:35:20.194 > Export encountered errors on following paths:
18:35:20.194 	/admin/finance/invoicing/page: /admin/finance/invoicing
18:35:20.240 Error: Command "npm run build" exited with 1
