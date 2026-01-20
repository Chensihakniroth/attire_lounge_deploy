<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\RailwayUpload;
use Illuminate\Support\Facades\Validator;


class RailwayUploadController extends Controller
{
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:102400', // max 100MB
            'resumableTotalChunks' => 'sometimes|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $key = 'uploads/' . Str::uuid()->toString() . '/' . $originalName;

        // For now, a simple upload. Chunking can be added.
        try {
            Storage::disk('public')->put($key, file_get_contents($file));

            $newUpload = RailwayUpload::create([
                'original_name' => $originalName,
                's3_key' => $key,
                'public_url' => Storage::disk('public')->url($key),
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),

                'user_id' => 1, // Assuming a logged in user, replace with Auth::id() later
            ]);

            return response()->json($newUpload, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Upload failed: ' . $e->getMessage()], 500);
        }
    }

    public function listFiles()
    {
        $files = RailwayUpload::latest()->get();
        return response()->json($files);
    }

    public function deleteFile($id)
    {
        $upload = RailwayUpload::findOrFail($id);

        try {
            Storage::disk('public')->delete($upload->s3_key);
            $upload->delete();
            return response()->json(['message' => 'File deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete file: ' . $e->getMessage()], 500);
        }
    }

    public function generateSignedUrl(Request $request)
    {
        $request->validate(['key' => 'required|string']);
        $key = $request->input('key');

        if (!Storage::disk('public')->exists($key)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        try {
            $url = Storage::disk('public')->temporaryUrl(
                $key,
                now()->addMinutes(15) // URL valid for 15 minutes
            );
            return response()->json(['url' => $url]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Could not generate signed URL: ' . $e->getMessage()], 500);
        }
    }
}
