<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get recent notifications for the POS UI.
     *
     * GET /api/v1/notifications
     */
    public function index(Request $request)
    {
        $query = Notification::orderByDesc('created_at');

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->get('type'));
        }

        // Filter by read status
        if ($request->has('unread')) {
            $query->unread();
        }

        $notifications = $query->limit(50)->get();

        return response()->json([
            'success' => true,
            'data'    => $notifications,
            'unread_count' => Notification::unread()->count(),
        ]);
    }

    /**
     * Mark a notification as read.
     *
     * PATCH /api/v1/notifications/{id}/read
     */
    public function markAsRead(Notification $notification)
    {
        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
        ]);
    }

    /**
     * Mark all notifications as read.
     *
     * POST /api/v1/notifications/read-all
     */
    public function markAllAsRead()
    {
        Notification::unread()->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read',
        ]);
    }
}
