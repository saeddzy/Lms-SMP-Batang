<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

$exam = \App\Models\Exam::latest()->first();

echo "Latest exam data:\n";
echo "scheduled_date: " . $exam->scheduled_date . "\n";
echo "start_time: " . $exam->start_time . "\n";
echo "end_time: " . $exam->end_time . "\n";
echo "duration: " . $exam->duration . "\n";
echo "duration_minutes: " . $exam->duration_minutes . "\n";
