<?php

namespace App\Helpers;

use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;

class ImageHelper
{
    public static function uploadProductImage($file, $productSlug)
    {
        $filename = $productSlug . '_' . time() . '.' . $file->getClientOriginalExtension();

        // Store original
        $originalPath = $file->storeAs('products/original', $filename, 'public');

        // Create main image (800x800)
        $mainImage = Image::make($file)
            ->fit(800, 800)
            ->encode('jpg', 85);
        Storage::disk('public')->put('products/main/' . $filename, $mainImage);

        // Create thumbnail (300x300)
        $thumbnail = Image::make($file)
            ->fit(300, 300)
            ->encode('jpg', 85);
        Storage::disk('public')->put('products/thumbnails/' . $filename, $thumbnail);

        // Create gallery image (1200x1200)
        $gallery = Image::make($file)
            ->resize(1200, 1200, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            })
            ->encode('jpg', 90);
        Storage::disk('public')->put('products/gallery/' . $filename, $gallery);

        return $filename;
    }

    public static function deleteProductImage($filename)
    {
        Storage::disk('public')->delete([
            'products/original/' . $filename,
            'products/main/' . $filename,
            'products/thumbnails/' . $filename,
            'products/gallery/' . $filename,
        ]);
    }

    public static function optimizeImage($path, $quality = 85)
    {
        $image = Image::make($path);

        // Convert to progressive JPEG if it's a JPEG
        if ($image->mime() === 'image/jpeg') {
            $image->interlace(true);
        }

        // Save optimized
        $image->save($path, $quality);

        return $path;
    }
}
