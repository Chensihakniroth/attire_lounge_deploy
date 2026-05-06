<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Cache;

echo "CACHE_DRIVER: " . config('cache.default') . "\n";
echo "REDIS_HOST: " . config('database.redis.default.host') . "\n";

try {
    Cache::put('_test_key', 'hello', 10);
    $val = Cache::get('_test_key');
    echo "CACHE TEST: SUCCESS (value=$val)\n";
    Cache::forget('_test_key');
} catch (\Exception $e) {
    echo "CACHE TEST: FAILED\n";
    echo "ERROR: " . get_class($e) . " - " . $e->getMessage() . "\n";
}
