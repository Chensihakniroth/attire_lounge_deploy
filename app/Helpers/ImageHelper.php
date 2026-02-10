<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageHelper
{
    private static $imageManager;

    private static function getImageManager()
    {
        if (!self::$imageManager) {
            self::$imageManager = new ImageManager(new Driver());
        }
        return self::$imageManager;
    }

    public static function uploadProductImage($file, $productSlug)
    {
        $filename = $productSlug . '_' . time() . '.webp';

        // Store original (actually we'll store a high-quality webp as "original" to save space)
        $originalImage = self::autoCompress($file, 2560, 90);
        Storage::disk('minio')->put('products/original/' . $filename, $originalImage);

        // Get image manager
        $imageManager = self::getImageManager();

        // Create main image (800x800)
        $mainImage = $imageManager->read($file->getPathname())
            ->scaleDown(width: 800, height: 800)
            ->toWebp(80);
        Storage::disk('minio')->put('products/main/' . $filename, $mainImage);

        // Create thumbnail (300x300)
        $thumbnail = $imageManager->read($file->getPathname())
            ->scaleDown(width: 300, height: 300)
            ->toWebp(80);
        Storage::disk('minio')->put('products/thumbnails/' . $filename, $thumbnail);

        // Create gallery image (1200x1200)
        $gallery = $imageManager->read($file->getPathname())
            ->scaleDown(width: 1200, height: 1200)
            ->toWebp(85);
        Storage::disk('minio')->put('products/gallery/' . $filename, $gallery);

        return $filename;
    }

    public static function deleteProductImage($filename)
    {
        Storage::disk('minio')->delete([
            'products/original/' . $filename,
            'products/main/' . $filename,
            'products/thumbnails/' . $filename,
            'products/gallery/' . $filename,
        ]);
    }

    public static function optimizeImage($path, $quality = 85)
    {
        $imageManager = self::getImageManager();
        $image = $imageManager->read($path);

        // Save optimized
        $image->toJpeg($quality)->save($path);

        return $path;
    }

    /**
     * Automatically compress an image to the smallest size possible 
     * while maintaining visual quality.
     * 
     * @param \Illuminate\Http\UploadedFile $file
     * @param int $maxWidth
     * @param int $quality
     * @return \Intervention\Image\EncodedImage
     */
    public static function autoCompress($file, $maxWidth = 1920, $quality = 80)
    {
        $imageManager = self::getImageManager();
        $image = $imageManager->read($file->getPathname());

        // Resize if it's too large, maintaining aspect ratio
        if ($image->width() > $maxWidth) {
            $image->scale(width: $maxWidth);
        }

        // Convert to WebP for best compression-to-quality ratio
        // 80 quality is usually indistinguishable from original for most users
        // but significantly reduces file size.
        return $image->toWebp($quality);
    }
}
