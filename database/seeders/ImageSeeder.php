<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\File;

class ImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $images = [
            'public/uploads/collections/Model/1.jpg',
            'public/uploads/collections/Model/2.jpg',
            'public/uploads/collections/Model/3.jpg',
            'public/uploads/collections/Model/4.jpg',
            'public/uploads/collections/Model/5.jpg',
            'public/uploads/collections/Model/6.jpg',
        ];

        foreach ($images as $imagePath) {
            $path = Storage::disk('minio')->putFile('product-assets/uploads/collections/default', new File(base_path($imagePath)));
            $this->command->info("Uploaded {$imagePath} to {$path}");
        }
    }
}
