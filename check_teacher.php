<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$count = \App\Models\ClassSubject::where('teacher_id', 3)->count();
echo "ClassSubjects with teacher_id = 3 (Guru SMP): $count\n";

$withAdmin = \App\Models\ClassSubject::where('teacher_id', 1)->count();
echo "ClassSubjects with teacher_id = 1 (Admin): $withAdmin\n";
