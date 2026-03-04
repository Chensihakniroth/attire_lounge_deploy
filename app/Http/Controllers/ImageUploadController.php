<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Helpers\ImageHelper;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:10240',
            'collection_id' => 'nullable|exists:collections,id',
        ]);

        $file = $request->file('image');
        
        // Determine storage path
        $path = 'uploads/asset/'; // Default fallback
        if ($request->collection_id) {
            $collection = \App\Models\Collection::find($request->collection_id);
            if ($collection) {
                $path = ltrim($collection->getStoragePath(), '/');
            }
        }
        
        // Determine format based on original file 
        $extension = strtolower($file->getClientOriginalExtension());
        $format = ($extension === 'jpg' || $extension === 'jpeg') ? 'jpg' : 'webp';
        
        try {
            // Auto compress the image using the detected format ✨
            $compressedImage = ImageHelper::autoCompress($file, 1920, $format, 80);
            
            // Use original filename (sanitized) + format extension
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeName = Str::slug($originalName);
            $filename = $safeName . '-' . Str::random(5) . '.' . $format; 
            $fullPath = $path . $filename;

            \Illuminate\Support\Facades\Log::info("Uploading image to MinIO", [
                'collection_id' => $request->collection_id,
                'target_path' => $path,
                'filename' => $filename,
                'disk' => 'minio'
            ]);

            // Store to MinIO
            Storage::disk('minio')->put($fullPath, (string) $compressedImage);

            return response()->json([
                'url' => Storage::disk('minio')->url($fullPath),
                'filename' => pathinfo($filename, PATHINFO_FILENAME)
            ], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Image upload failed: " . $e->getMessage(), [
                'exception' => $e,
                'file' => $file->getClientOriginalName()
            ]);
            return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
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
            'image' => 'required',
        ]);

        $url = $request->input('image');
        $path = str_replace(Storage::disk('minio')->url(''), '', $url);

        Storage::disk('minio')->delete($path);

        return response()->json(['success' => true]);
    }
}
