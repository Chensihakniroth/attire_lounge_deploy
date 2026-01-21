<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FixUploadUrls extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'uploads:fix-urls';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix the public URLs of existing uploads.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $uploads = \App\Models\RailwayUpload::all();
        $count = 0;

        foreach ($uploads as $upload) {
            $newUrl = \Illuminate\Support\Facades\Storage::disk('uploads')->url($upload->s3_key);
            if ($upload->public_url !== $newUrl) {
                $upload->public_url = $newUrl;
                $upload->save();
                $count++;
            }
        }

        $this->info("Fixed {$count} URLs.");
    }
}
