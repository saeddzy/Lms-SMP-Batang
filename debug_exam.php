<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Check exam table structure
echo "Exam table structure:\n";
$columns = \Schema::getColumnListing('exams');
print_r($columns);

// Get latest exam data
echo "\nLatest exam data:\n";
$exam = \App\Models\Exam::latest()->first();
if ($exam) {
    $examData = $exam->toArray();
    print_r($examData);
    
    echo "\nScheduled date: " . ($exam->scheduled_date ?? 'NULL') . "\n";
    echo "Start time: " . ($exam->start_time ?? 'NULL') . "\n";
    echo "End time: " . ($exam->end_time ?? 'NULL') . "\n";
    echo "Duration: " . ($exam->duration ?? 'NULL') . "\n";
    echo "Duration minutes: " . ($exam->duration_minutes ?? 'NULL') . "\n";
} else {
    echo "No exam found\n";
}
