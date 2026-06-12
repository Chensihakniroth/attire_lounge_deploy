<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Helpers\ImageHelper;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    /**
     * Allowed storage disks — user cannot control this.
     */
    private const ALLOWED_DISKS = ['minio', 'local', 'public'];

    /**
     * Allowed MIME types mapped to extensions.
     */
    private const ALLOWED_MIMES = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/gif'  => 'gif',
        'image/svg+xml' => 'svg',
        'image/webp' => 'webp',
    ];

    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:10240',
            'collection_id' => 'nullable|exists:collections,id',
        ]);

        $file = $request->file('image');

        // Verify the actual MIME type matches allowed list
        $realMime = $file->getMimeType();
        if (!array_key_exists($realMime, self::ALLOWED_MIMES)) {
            return response()->json(['message' => 'Invalid image type.'], 422);
        }

        // Verify the file is a valid image by attempting to read its dimensions
        $dimensions = @getimagesize($file->getRealPath());
        if ($dimensions === false) {
            return response()->json(['message' => 'Invalid image file.'], 422);
        }

        // Determine storage path — prevent path traversal
        $path = 'uploads/asset/';
        if ($request->collection_id) {
            $collection = \App\Models\Collection::find($request->collection_id);
            if ($collection) {
                $collectionPath = $collection->getStoragePath();
                // Sanitize: remove any path traversal attempts
                $collectionPath = str_replace(['..', '\\', "\0"], '', $collectionPath);
                $collectionPath = ltrim($collectionPath, '/');
                // Ensure the path stays within the uploads directory
                if (str_starts_with($collectionPath, 'uploads/') && !str_contains($collectionPath, '..')) {
                    $path = rtrim($collectionPath, '/') . '/';
                }
            }
        }

        // Determine format based on original file
        $extension = strtolower($file->getClientOriginalExtension());
        $format = ($extension === 'jpg' || $extension === 'jpeg') ? 'jpg' : 'webp';

        try {
            // Auto compress the image
            $compressedImage = ImageHelper::autoCompress($file, 1920, $format, 80);

            // Generate a safe random filename — never use user input
            $filename = Str::random(20) . '.' . $format;
            $fullPath = $path . $filename;

            // Use a fixed disk — never let the user choose
            $disk = config('filesystems.default_image_disk', 'minio');
            if (!in_array($disk, self::ALLOWED_DISKS)) {
                $disk = 'minio';
            }

            Storage::disk($disk)->put($fullPath, (string) $compressedImage);

            return response()->json([
                'url' => Storage::disk($disk)->url($fullPath),
                'filename' => pathinfo($filename, PATHINFO_FILENAME)
            ], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Image upload failed: " . $e->getMessage(), [
                'exception' => get_class($e),
                'file' => $file->getClientOriginalName(),
            ]);
            // Never leak internal error details to the client
            return response()->json(['message' => 'Image upload failed. Please try again.'], 500);
        }
    }

    public function listImages()
    {
        $files = Storage::disk('minio')->files('');
        $urls = array_map(function ($file) {
            return Storage::disk('minio')->url($file);
        }, $files);

        return response()->json($urls);
    }

    public function deleteImage(Request $request)
    {
        $request->validate([
            'image' => 'required|string',
        ]);

        $url = $request->input('image');
        $path = str_replace(Storage::disk('minio')->url(''), '', $url);

        // Prevent path traversal on delete
        if (str_contains($path, '..') || str_starts_with($path, '/')) {
            return response()->json(['message' => 'Invalid image path.'], 422);
        }

        Storage::disk('minio')->delete($path);

        return response()->json(['success' => true]);
    }
}
