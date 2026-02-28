<?php

namespace App\Traits;

use App\Models\Activity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait Auditable
{
    /**
     * Boot the trait.
     *
     * @return void
     */
    protected static function bootAuditable()
    {
        static::created(function (Model $model) {
            static::logActivity('created', $model);
        });

        static::updated(function (Model $model) {
            if ($model->isDirty()) { // Only log if there were actual changes
                static::logActivity('updated', $model, $model->getDirty(), $model->getOriginal());
            }
        });

        static::deleted(function (Model $model) {
            static::logActivity('deleted', $model);
        });
    }

    /**
     * Log the activity.
     *
     * @param string $action
     * @param Model $model
     * @param array|null $changes
     * @param array|null $original
     * @return void
     */
    protected static function logActivity(string $action, Model $model, ?array $changes = null, ?array $original = null)
    {
        $userId = Auth::id();
        $ipAddress = Request::ip();
        $userAgent = Request::header('User-Agent');

        $details = null;
        if ($action === 'updated' && $changes && $original) {
            $diff = [];
            foreach ($changes as $key => $newValue) {
                if (isset($original[$key])) {
                    $oldValue = $original[$key];
                    if ($newValue != $oldValue) { // Ensure actual change
                        $diff[$key] = [
                            'old' => $oldValue,
                            'new' => $newValue,
                        ];
                    }
                } else {
                    // New attribute added
                    $diff[$key] = [
                        'old' => null,
                        'new' => $newValue,
                    ];
                }
            }
            $details = "Updated " . $model->getTable() . " (ID: {$model->id}).";
        } elseif ($action === 'created') {
            $details = "Created " . $model->getTable() . " (ID: {$model->id}).";
        } elseif ($action === 'deleted') {
            $details = "Deleted " . $model->getTable() . " (ID: {$model->id}).";
        }
        
        Activity::create([
            'user_id' => $userId,
            'action' => $action,
            'model_type' => $model->getMorphClass(),
            'model_id' => $model->getKey(),
            'changes' => $diff ?? null,
            'details' => $details,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);
    }
}
