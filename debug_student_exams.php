<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

// Get a sample student user
$student = \App\Models\User::whereHas('roles', function($q) {
    $q->where('name', 'siswa');
})->first();

if (!$student) {
    echo "No student found\n";
    exit;
}

echo "Student: " . $student->name . " (ID: " . $student->id . ")\n";

// Get student's enrolled classes
$enrolledClasses = $student->enrolledClasses()->get();
echo "Enrolled classes:\n";
foreach ($enrolledClasses as $class) {
    echo "- " . $class->name . " (ID: " . $class->id . ")\n";
}

// Get all exams
$allExams = \App\Models\Exam::with(['subject', 'schoolClass'])->get();
echo "\nAll exams:\n";
foreach ($allExams as $exam) {
    echo "- " . $exam->title . " (Class: " . $exam->schoolClass->name . ", ID: " . $exam->class_id . ")\n";
}

// Filter exams for student's classes
$enrolledClassIds = $enrolledClasses->pluck('id')->toArray();
$filteredExams = \App\Models\Exam::whereIn('class_id', $enrolledClassIds)
    ->where('is_cancelled', false)
    ->where('is_active', true)
    ->with(['subject', 'schoolClass'])
    ->orderBy('scheduled_date')
    ->get();

echo "\nFiltered exams for student:\n";
foreach ($filteredExams as $exam) {
    echo "- " . $exam->title . " (Class: " . $exam->schoolClass->name . ", Date: " . ($exam->scheduled_date ?: 'NULL') . ")\n";
}
