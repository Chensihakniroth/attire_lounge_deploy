# MinIO Asset Integration Summary

This document summarizes the changes made to integrate MinIO for media assets (images and videos) while keeping core application assets (CSS and JavaScript) served locally.

## Implemented Changes:

1.  **`config/filesystems.php` Adjustments**:
    *   The `public` disk configuration was reverted to its original state, ensuring that `app.css` and `app.js` are served from the local filesystem (`public/css` and `public/js`).
    *   The `minio` disk configuration was properly set up to point to your MinIO bucket.

2.  **`app/Helpers/ImageHelper.php` Modification**:
    *   Updated to explicitly use `Storage::disk('minio')` for all image upload, storage, and deletion operations. This ensures that new images are managed directly within your MinIO bucket.

3.  **`resources/js/config.js` Update**:
    *   The `minioBaseUrl` constant was set to `https://bucket-production-df32.up.railway.app/product-assets`. This acts as the base URL for all media assets fetched from MinIO in your frontend.

4.  **Frontend Component Path Corrections**:
    *   `resources/js/components/pages/HomePage.jsx` was updated to correctly construct the logo path: `${minioBaseUrl}/uploads/asset/AL_logo.png`.
    *   `resources/js/components/sections/Hero.jsx` was updated to correctly construct the video path: `${minioBaseUrl}/videos/hero-background.mp4`.
    *   These path structures now correctly match the user-provided example and the expected organization within the MinIO bucket.

## Required User Actions:

To ensure full functionality, please perform the following steps:

1.  **Update `.env` File**:
    Ensure your `.env` file contains the following MinIO credentials, replacing placeholders with your actual keys:
    ```dotenv
    MINIO_ACCESS_KEY_ID=your_minio_access_key_id
    MINIO_SECRET_ACCESS_KEY=your_minio_secret_access_key
    MINIO_DEFAULT_REGION=us-east-1 # Or your MinIO server's region
    MINIO_BUCKET=product-assets
    MINIO_ENDPOINT=https://bucket-production-df32.up.railway.app
    MINIO_URL=https://bucket-production-df32.up.railway.app/product-assets
    ```

2.  **Manual Media Migration**:
    You need to manually upload your existing media files from your local project to your MinIO `product-assets` bucket, preserving their relative paths **from the `public` directory**.

    *   **For `public/uploads` contents**: Upload these to the `uploads/` path within your `product-assets` MinIO bucket.
        *   Example: Your local file `public/uploads/asset/AL_logo.png` should be uploaded to the bucket as `product-assets/uploads/asset/AL_logo.png`.
        *   Example: Any `public/uploads/collections/Model/1.jpg` should be uploaded to `product-assets/uploads/collections/Model/1.jpg` in the bucket.

    *   **For `public/videos` contents**: Upload these to the `videos/` path within your `product-assets` MinIO bucket.
        *   Example: Your local file `public/videos/hero-background.mp4` should be uploaded to the bucket as `product-assets/videos/hero-background.mp4`.

Once these steps are completed, your application will be fully configured to fetch media assets from your MinIO bucket according to the specified paths.