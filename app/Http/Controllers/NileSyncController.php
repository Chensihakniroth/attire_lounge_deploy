<?php

namespace App\Http\Controllers;

use App\Models\NileSyncRun;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

/**
 * Backs the admin "Sync POS" screen: what the two Nile sync jobs are, when
 * they last ran, what they changed, and an on-demand trigger.
 */
class NileSyncController extends Controller
{
    /** Static description of each job, so the UI does not hardcode semantics. */
    private const JOBS = [
        'prices' => [
            'label'    => 'Price Sync',
            'command'  => 'nile:sync-prices',
            'direction'=> 'wp_to_pos',
            'source'   => 'Nile website (WooCommerce)',
            'target'   => 'POS',
            'summary'  => 'Copies the live storefront price into the POS, including an active sale price. The undiscounted value is kept in regular_price so an ending promotion restores itself.',
        ],
        'stock' => [
            'label'    => 'Stock Sync',
            'command'  => 'nile:sync-stock',
            'direction'=> 'pos_to_wp',
            'source'   => 'POS',
            'target'   => 'Nile website (WooCommerce)',
            'summary'  => 'Pushes the physical stock count from the POS up to the website, so a shop-floor sale stops the storefront advertising stock that is already sold.',
        ],
    ];

    /**
     * GET /api/v1/admin/nile-sync
     */
    public function index(Request $request): JsonResponse
    {
        $limit = min((int) $request->get('limit', 25), 200);
        $job   = $request->get('job');

        $query = NileSyncRun::query()->orderByDesc('id');

        if ($job !== null && isset(self::JOBS[$job])) {
            $query->where('job', $job);
        }

        $runs = $query->limit($limit)->get();

        $jobs = [];
        foreach (self::JOBS as $key => $meta) {
            $latest = NileSyncRun::where('job', $key)->orderByDesc('id')->first();

            $jobs[] = [
                ...$meta,
                'key'          => $key,
                'last_run'     => $latest,
                'last_success' => NileSyncRun::where('job', $key)
                                    ->where('status', 'success')
                                    ->orderByDesc('id')
                                    ->first(),
                'total_runs'   => NileSyncRun::where('job', $key)->count(),
                'total_errors' => NileSyncRun::where('job', $key)->where('status', 'error')->count(),
            ];
        }

        return response()->json([
            'success' => true,
            'jobs'    => $jobs,
            'runs'    => $runs,
        ]);
    }

    /**
     * POST /api/v1/admin/nile-sync/run
     * Trigger a job immediately instead of waiting for the next hourly tick.
     */
    public function run(Request $request): JsonResponse
    {
        $job = $request->get('job');
        if (! isset(self::JOBS[$job])) {
            return response()->json([
                'success' => false,
                'message' => "Unknown job. Expected one of: " . implode(', ', array_keys(self::JOBS)),
            ], 422);
        }

        $command = self::JOBS[$job]['command'];
        $exit = Artisan::call($command, ['--outlet' => $request->get('outlet', 'nile')]);
        $output = Artisan::output();

        $latest = NileSyncRun::where('job', $job)->orderByDesc('id')->first();

        return response()->json([
            'success' => $exit === 0,
            'job'     => $job,
            'exit'    => $exit,
            'output'  => $output,
            'run'     => $latest,
        ], $exit === 0 ? 200 : 500);
    }
}
