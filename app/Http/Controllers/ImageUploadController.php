<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:10240',
        ]);

        $image = $request->file('image');
        $path = $image->store('', 'minio');

        return response()->json(['url' => Storage::disk('minio')->url($path)], 201);
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