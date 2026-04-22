<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamAttemptAnswer;
use App\Models\ExamQuestion;
use App\Helpers\ExamTimeHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ExamAttemptController extends Controller
{
    /**
     * Start an exam attempt
     */
    public function start(Request $request, Exam $exam)
    {
        
        $user = Auth::user();

        // Check if user is enrolled in the exam class
        if (!$user->enrolledClasses()->where('school_classes.id', $exam->class_id)->exists()) {
            return redirect()->back()->with('error', 'Anda tidak terdaftar di kelas ujian ini.');
        }

        // Check if exam is active
        if (!$exam->is_active || $exam->is_cancelled) {
            return redirect()->back()->with('error', 'Ujian tidak aktif atau telah dibatalkan.');
        }

        // Check if student can start the exam based on schedule
        if (!ExamTimeHelper::canStart($exam)) {
            $startTime = $exam->start_time->format('d M Y H:i');
            $endTime = $exam->end_time->format('d M Y H:i');
            return redirect()->back()->with('error', "Ujian tidak dalam waktu aktif. Waktu: $startTime - $endTime");
        }

        // Check for existing attempts
        $existingAttempt = ExamAttempt::where('exam_id', $exam->id)
            ->where('student_id', $user->id)
            ->where('attempt_status', 'in_progress')
            ->first();

        if ($existingAttempt) {
            return redirect()->route('exams.attempt.take', [$exam->id, $existingAttempt->id]);
        }

        // Check max attempts
        $totalAttempts = ExamAttempt::where('exam_id', $exam->id)
            ->where('student_id', $user->id)
            ->count();

        if ($totalAttempts >= ($exam->max_attempts ?? 1)) {
            return redirect()->back()->with('error', 'Anda telah mencapai batas maksimal percobaan.');
        }

        // Calculate attempt end time based on exam end time and duration
        $attemptEndTime = ExamTimeHelper::calculateAttemptEnd($exam, now());

        // Create new attempt
        $attempt = ExamAttempt::create([
            'exam_id' => $exam->id,
            'student_id' => $user->id,
            'started_at' => now(),
            'attempt_end_time' => $attemptEndTime,
            'attempt_status' => 'in_progress',
            'attempt_number' => $totalAttempts + 1,
            'attempt_data' => [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'start_time' => now()->toISOString(),
                'attempt_end_time' => $attemptEndTime->toISOString(),
            ],
        ]);

        return redirect()->route('exams.attempt.take', [$exam->id, $attempt->id]);
    }

    /**
     * Display exam questions
     */
    public function take(Exam $exam, ExamAttempt $attempt)
    {
        
        $user = Auth::user();

        // Validate attempt ownership
        if ($attempt->student_id !== $user->id || $attempt->exam_id !== $exam->id) {
            abort(403, 'Unauthorized');
        }

        // Check if attempt is still in progress
        if ($attempt->attempt_status !== 'in_progress') {
            return redirect()->route('exams.attempt.result', [$exam->id, $attempt->id])
                ->with('info', 'Percobaan ujian telah selesai.');
        }

        // Check if attempt is expired using ExamTimeHelper
        if (ExamTimeHelper::isExpired($attempt)) {
            ExamTimeHelper::updateExpiredAttempt($attempt);
            return redirect()->route('exams.attempt.result', [$exam->id, $attempt->id])
                ->with('info', 'Waktu ujian telah habis.');
        }

        // Get questions (randomized if needed)
        $questions = ExamQuestion::where('exam_id', $exam->id)
            ->inRandomOrder()
            ->get();

        
        
        return inertia('Exams/Attempt', [
            'exam' => $exam,
            'attempt' => $attempt,
            'questions' => $questions,
            'remainingSeconds' => ExamTimeHelper::getRemainingSeconds($attempt),
            'endTime' => $attempt->attempt_end_time ? $attempt->attempt_end_time->toISOString() : now()->addMinutes($exam->duration)->toISOString(),
        ]);
    }

    /**
     * Save answer
     */
    public function saveAnswer(Request $request, Exam $exam, ExamAttempt $attempt)
    {
        $user = Auth::user();

        // Validate attempt ownership
        if ($attempt->student_id !== $user->id || $attempt->exam_id !== $exam->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if attempt is still in progress
        if ($attempt->attempt_status !== 'in_progress') {
            return response()->json(['error' => 'Attempt finished'], 400);
        }

        $validated = $request->validate([
            'question_id' => 'required|exists:exam_questions,id',
            'answer' => 'required|string',
        ]);

        // Check if attempt is expired using ExamTimeHelper
        if (ExamTimeHelper::isExpired($attempt)) {
            ExamTimeHelper::updateExpiredAttempt($attempt);
            return response()->json(['error' => 'Time expired'], 400);
        }

        $question = ExamQuestion::where('exam_id', $exam->id)
            ->where('id', $validated['question_id'])
            ->firstOrFail();

        $normalizedAnswer = $validated['answer'];
        if ($question->question_type === 'multiple_choice') {
            $options = is_array($question->options) ? $question->options : [];
            $index = array_search($validated['answer'], $options, true);

            if ($index !== false) {
                $normalizedAnswer = (string) $index;
            }
        }

        if ($question->question_type === 'true_false') {
            $answer = strtolower(trim($validated['answer']));
            if (in_array($answer, ['benar', 'b', 'true', 't', '1'], true)) {
                $normalizedAnswer = 'true';
            } elseif (in_array($answer, ['salah', 's', 'false', 'f', '0'], true)) {
                $normalizedAnswer = 'false';
            }
        }

        $isCorrect = $question->isStudentAnswerCorrect($normalizedAnswer);

        // Save or update answer
        $answer = ExamAttemptAnswer::updateOrCreate(
            [
                'exam_attempt_id' => $attempt->id,
                'question_id' => $validated['question_id'],
            ],
            [
                'answer' => $normalizedAnswer,
                'is_correct' => $isCorrect,
            ]
        );

        return response()->json(['success' => true, 'answer_id' => $answer->id]);
    }

    /**
     * Simpan log pelanggaran anti-cheat selama ujian berlangsung.
     */
    public function violation(Request $request, Exam $exam, ExamAttempt $attempt)
    {
        $user = Auth::user();

        if ($attempt->student_id !== $user->id || $attempt->exam_id !== $exam->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($attempt->attempt_status !== 'in_progress') {
            return response()->json(['error' => 'Attempt finished'], 400);
        }

        $validated = $request->validate([
            'type' => 'required|string|max:50',
        ]);

        $attemptData = $attempt->attempt_data ?? [];
        $violations = $attemptData['violations'] ?? [];
        $violations[] = [
            'type' => $validated['type'],
            'at' => now()->toISOString(),
        ];

        $attemptData['violations'] = array_slice($violations, -30);
        $attempt->update(['attempt_data' => $attemptData]);

        Log::warning('Exam anti-cheat violation', [
            'exam_id' => $exam->id,
            'attempt_id' => $attempt->id,
            'student_id' => $user->id,
            'type' => $validated['type'],
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'violation_count' => count($attemptData['violations']),
        ]);

        return response()->json([
            'success' => true,
            'violations_count' => count($attemptData['violations']),
        ]);
    }

    /**
     * Submit exam
     */
    public function submit(Request $request, Exam $exam, ExamAttempt $attempt)
    {
        $user = Auth::user();

        // Validate attempt ownership
        if ($attempt->student_id !== $user->id || $attempt->exam_id !== $exam->id) {
            abort(403, 'Unauthorized');
        }

        // Check if attempt is still in progress
        if ($attempt->attempt_status !== 'in_progress') {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'result_url' => route('exams.attempt.result', [$exam->id, $attempt->id]),
                ]);
            }
            return redirect()->route('exams.attempt.result', [$exam->id, $attempt->id]);
        }

        DB::transaction(function () use ($attempt, $exam) {
            // Mark attempt as finished
            $attempt->update([
                'finished_at' => now(),
                'attempt_status' => 'finished',
            ]);

            // Calculate score
            $attempt->calculateScore();
        });

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'result_url' => route('exams.attempt.result', [$exam->id, $attempt->id]),
            ]);
        }

        return redirect()->route('exams.attempt.result', [$exam->id, $attempt->id])
            ->with('success', 'Ujian telah dikumpulkan!');
    }

    /**
     * Show exam result
     */
    public function result(Exam $exam, ExamAttempt $attempt)
    {
        $user = Auth::user();

        if ($attempt->exam_id !== $exam->id) {
            abort(403, 'Unauthorized');
        }

        $exam->loadMissing('classSubject');

        $isOwner = $attempt->student_id === $user->id;
        $isTeacherReviewer = $user->hasRole('guru')
            && $user->can('exams grade')
            && $exam->classSubject
            && $exam->classSubject->isTaughtBy($user);
        $isAdminViewer = $user->hasRole('admin') && $user->can('exams view');

        if (! $isOwner && ! $isTeacherReviewer && ! $isAdminViewer) {
            abort(403, 'Unauthorized');
        }

        // Load attempt with answers and questions
        $attempt->load([
            'answers.question',
            'student',
        ]);

        return inertia('Exams/Result', [
            'exam' => $exam,
            'attempt' => $attempt,
            'isStudentView' => $isOwner,
            'canManualGrade' => $isTeacherReviewer,
        ]);
    }

    /**
     * Show exam results for teachers
     */
    public function results(Exam $exam)
    {
        Gate::authorize('view', $exam);

        $attempts = ExamAttempt::where('exam_id', $exam->id)
            ->with('student')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return inertia('Exams/Results', [
            'exam' => $exam,
            'attempts' => $attempts,
        ]);
    }
}
