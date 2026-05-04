<?php

namespace App\Helpers;

use Carbon\Carbon;

class ExamTimeHelper
{
    /**
     * Check if student can start the exam based on schedule
     */
    public static function canStart($exam)
    {
        return now()->between($exam->start_time, $exam->end_time);
    }

    /**
     * Calculate attempt end time based on exam end time and duration
     */
    public static function calculateAttemptEnd($exam, $startTime)
    {
        $durationMinutes = $exam->duration ?? $exam->duration_minutes ?? 0;

        // Use the earlier of: exam end time OR start time + duration
        $endTimeByDuration = $startTime->copy()->addMinutes((int) $durationMinutes);
        
        return $exam->end_time->lt($endTimeByDuration) 
            ? $exam->end_time 
            : $endTimeByDuration;
    }

    /**
     * Check if attempt is expired
     */
    public static function isExpired($attempt)
    {
        if (!$attempt->attempt_end_time) {
            // Fallback for old attempts without attempt_end_time
            return now()->gt($attempt->exam->end_time);
        }
        
        return now()->gt($attempt->attempt_end_time);
    }

    /**
     * Get remaining seconds for attempt
     */
    public static function getRemainingSeconds($attempt)
    {
        if (!$attempt->attempt_end_time) {
            return now()->diffInSeconds($attempt->exam->end_time, false);
        }
        
        return now()->diffInSeconds($attempt->attempt_end_time, false);
    }

    /**
     * Update attempt status if expired
     */
    public static function updateExpiredAttempt($attempt)
    {
        if (self::isExpired($attempt) && $attempt->attempt_status === 'in_progress') {
            $attempt->update([
                'finished_at' => now(),
                'attempt_status' => 'timeout',
            ]);
            
            return true;
        }
        
        return false;
    }
}
