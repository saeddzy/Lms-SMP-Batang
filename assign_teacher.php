<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Update all class_subjects to assign user 3 (Guru SMP) as teacher
$updated = \App\Models\ClassSubject::where('teacher_id', 1)->update(['teacher_id' => 3]);
echo "Updated $updated class_subjects records to assign teacher_id = 3 (Guru SMP)\n";
