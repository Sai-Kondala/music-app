# Deployment Guide

## Backend (Already Deployed on Render)
Your backend is already deployed on Render. Make sure to note your backend URL.

## Frontend Deployment Options

### Option 1: Deploy to Render (Recommended)

1. **Get your backend URL from Render**
   - Go to your Render dashboard
   - Find your backend service
   - Copy the URL (e.g., `https://your-app-name.onrender.com`)

2. **Update the API URL in frontend/app.js**
   - Replace `https://your-backend-app-name.onrender.com/api` with your actual backend URL
   - The URL should look like: `https://your-actual-app-name.onrender.com/api`

3. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Set the following:
     - **Name**: `music-app-frontend` (or any name you prefer)
     - **Build Command**: `npm install`
     - **Publish Directory**: `frontend`
   - Click "Create Static Site"

4. **Environment Variables** (if needed)
   - You can add environment variables in Render dashboard if needed

### Option 2: Deploy to Netlify

1. **Update API URL** (same as above)

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your `frontend` folder
   - Or connect your GitHub repository
   - Set build settings:
     - **Build command**: (leave empty for static site)
     - **Publish directory**: `frontend`

### Option 3: Deploy to Vercel

1. **Update API URL** (same as above)

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set the root directory to `frontend`
   - Deploy

### Option 4: Deploy to GitHub Pages

1. **Update API URL** (same as above)

2. **Deploy to GitHub Pages**
   - Go to your repository settings
   - Scroll to "Pages" section
   - Set source to "Deploy from a branch"
   - Select `main` branch and `/frontend` folder
   - Save

## Important Notes

1. **CORS Configuration**: Your backend already has CORS enabled, so it should work with any frontend deployment.

2. **Environment Detection**: The frontend automatically detects if it's running locally or in production and uses the appropriate API URL.

3. **File Uploads**: Make sure your backend's upload directory is properly configured and accessible.

4. **MongoDB**: Ensure your MongoDB connection string in the backend is using the production database.

## Testing Your Deployment

1. After deployment, test the following:
   - User registration and login
   - Song upload and playback
   - Playlist creation and management
   - Search functionality

2. Check browser console for any errors

3. Verify that the API calls are going to your Render backend URL

## Troubleshooting

- **CORS Errors**: Make sure your backend CORS configuration includes your frontend domain
- **API Connection**: Verify the API URL is correct in `frontend/app.js`
- **File Uploads**: Check that the upload directory exists and has proper permissions
- **MongoDB**: Ensure your database is accessible from Render 