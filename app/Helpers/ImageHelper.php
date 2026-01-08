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
        $filename = $productSlug . '_' . time() . '.' . $file->getClientOriginalExtension();

        // Store original
        $originalPath = $file->storeAs('products/original', $filename, 'minio');

        // Get image manager
        $imageManager = self::getImageManager();

        // Create main image (800x800)
        $mainImage = $imageManager->read($file->getPathname())
            ->resize(800, 800)
            ->toJpeg(85);
        Storage::disk('minio')->put('products/main/' . $filename, $mainImage);

        // Create thumbnail (300x300)
        $thumbnail = $imageManager->read($file->getPathname())
            ->resize(300, 300)
            ->toJpeg(85);
        Storage::disk('minio')->put('products/thumbnails/' . $filename, $thumbnail);

        // Create gallery image (1200x1200)
        $gallery = $imageManager->read($file->getPathname())
            ->scale(width: 1200, height: 1200)
            ->toJpeg(90);
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
}
