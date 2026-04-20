<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamAnswer;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
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

        // Check exam window
        $now = now();
        $startTime = $exam->scheduled_date 
            ? Carbon::parse($exam->scheduled_date . ' ' . ($exam->start_time ?? '00:00'))
            : $now->copy()->subMinutes(1); // If no schedule, allow immediately

        $endTime = $startTime->copy()->addMinutes($exam->duration_minutes ?? $exam->duration ?? 60);

        if ($now < $startTime) {
            return redirect()->back()->with('error', 'Ujian belum dimulai. Dimulai pada: ' . $startTime->format('d M Y H:i'));
        }

        if ($now > $endTime) {
            return redirect()->back()->with('error', 'Ujian telah berakhir pada: ' . $endTime->format('d M Y H:i'));
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

        // Create new attempt
        $attempt = ExamAttempt::create([
            'exam_id' => $exam->id,
            'student_id' => $user->id,
            'started_at' => now(),
            'attempt_status' => 'in_progress',
            'attempt_number' => $totalAttempts + 1,
            'attempt_data' => [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'start_time' => now()->toISOString(),
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

        // Check exam time limits
        $now = now();
        $startTime = $exam->scheduled_date 
            ? Carbon::parse($exam->scheduled_date . ' ' . ($exam->start_time ?? '00:00'))
            : $attempt->started_at;
        $endTime = $startTime->copy()->addMinutes($exam->duration_minutes ?? $exam->duration ?? 60);

        if ($now > $endTime) {
            $attempt->update([
                'finished_at' => $endTime,
                'attempt_status' => 'timeout',
            ]);
            return redirect()->route('exams.attempt.result', [$exam->id, $attempt->id])
                ->with('info', 'Waktu ujian telah habis.');
        }

        // Get questions (randomized if needed)
        $questions = Question::where('exam_id', $exam->id)
            ->with(['options'])
            ->inRandomOrder()
            ->take($exam->total_questions ?? 10)
            ->get();

        return inertia('Exams/Attempt', [
            'exam' => $exam,
            'attempt' => $attempt,
            'questions' => $questions,
            'remainingMinutes' => max(0, $endTime->diffInMinutes($now)),
            'endTime' => $endTime->toISOString(),
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
            'question_id' => 'required|exists:questions,id',
            'answer' => 'required|string',
            'selected_options' => 'nullable|array',
            'time_spent_seconds' => 'nullable|integer|min:0',
        ]);

        // Check time limits
        $startTime = $exam->scheduled_date 
            ? Carbon::parse($exam->scheduled_date . ' ' . ($exam->start_time ?? '00:00'))
            : $attempt->started_at;
        $endTime = $startTime->copy()->addMinutes($exam->duration_minutes ?? $exam->duration ?? 60);

        if (now() > $endTime) {
            return response()->json(['error' => 'Time expired'], 400);
        }

        // Save or update answer
        $answer = ExamAnswer::updateOrCreate(
            [
                'exam_attempt_id' => $attempt->id,
                'question_id' => $validated['question_id'],
            ],
            [
                'answer' => $validated['answer'],
                'selected_options' => $validated['selected_options'] ?? null,
                'time_spent_seconds' => $validated['time_spent_seconds'] ?? 0,
            ]
        );

        return response()->json(['success' => true, 'answer_id' => $answer->id]);
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

        return redirect()->route('exams.attempt.result', [$exam->id, $attempt->id])
            ->with('success', 'Ujian telah dikumpulkan!');
    }

    /**
     * Show exam result
     */
    public function result(Exam $exam, ExamAttempt $attempt)
    {
        $user = Auth::user();

        // Validate attempt ownership
        if ($attempt->student_id !== $user->id || $attempt->exam_id !== $exam->id) {
            abort(403, 'Unauthorized');
        }

        // Load attempt with answers and questions
        $attempt->load([
            'answers.question',
            'answers.question.options',
        ]);

        return inertia('Exams/Result', [
            'exam' => $exam,
            'attempt' => $attempt,
        ]);
    }

    /**
     * Show exam results for teachers
     */
    public function results(Exam $exam)
    {
        $this->authorize('view', $exam);

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
