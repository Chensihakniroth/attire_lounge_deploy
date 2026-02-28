<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    /**
     * Display a listing of the audit logs.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Activity::with('user')->latest();

        // Optional filtering by action
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        // Optional filtering by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Optional filtering by model type
        if ($request->has('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        $activities = $query->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $activities,
        ]);
    }

    /**
     * Display the specified audit log.
     *
     * @param Activity $activity
     * @return JsonResponse
     */
    public function show(Activity $activity): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $activity->load('user'),
        ]);
    }
}
