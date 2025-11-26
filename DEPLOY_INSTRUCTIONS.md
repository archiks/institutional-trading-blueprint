# Deployment Guide

This project is currently configured for a **Live Web Preview**. To deploy it to a professional hosting provider like Vercel or Netlify (and connect your custom domain), you need to make a few small adjustments after downloading the code.

## Step 1: Download & Unzip
1. Export/Download the project files to your computer.
2. Unzip the folder.
3. Open the folder in a code editor like VS Code.

## Step 2: Clean up `index.html`
The `index.html` file contains scripts used for the preview that are not needed in production.

1. Open `index.html`.
2. **Remove** the Tailwind CDN script:
   ```html
   <script src="https://cdn.tailwindcss.com"></script>
   ```
3. **Remove** the Tailwind Config script:
   ```html
   <script>
     tailwind.config = { ... }
   </script>
   ```
4. **Remove** the Import Map script:
   ```html
   <script type="importmap">
     { ... }
   </script>
   ```

## Step 3: Update `index.css`
Now that we removed the CDN, we need to tell the build system to generate the styles.

1. Open `index.css`.
2. **Add** these 3 lines to the very top of the file:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

## Step 4: Install & Build (Optional Test)
If you have Node.js installed, you can test it locally:
1. Open your terminal in the folder.
2. Run `npm install`.
3. Run `npm run dev`.

## Step 5: Deploy
1. Push your code to a GitHub repository.
2. Go to [Vercel.com](https://vercel.com) and "Add New Project".
3. Select your repository.
4. **Settings:** Vercel should automatically detect it's a Vite project.
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy**.

## Step 6: Go Live
Once deployed on Vercel:
1. Go to Settings > Domains.
2. Add your custom domain (e.g., `www.your-trading-site.com`).
3. Update your DNS settings as Vercel instructs.

---

## 🔐 How to Access the Admin Panel

Once the site is live, the Admin Panel is hidden from regular visitors. To access it:

1.  Add `?portal=admin` to the end of your website URL.
    *   Example: `https://www.your-trading-site.com/?portal=admin`
2.  You will be prompted for an Access Key.
3.  **Default Access Key:** `admin123`

*(Note: You can change this password by editing the `handleLogin` function in `App.tsx`)*