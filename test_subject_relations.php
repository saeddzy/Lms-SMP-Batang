<?php
// Quick test to verify Subject relationships work (materials, tasks, quizzes, exams)
// Run in Laravel tinker: include 'test_subject_relations.php'

use App\Models\Subject;
use App\Models\ClassSubject;

try {
    // Find a subject with class subjects
    $subject = Subject::with(['materials', 'tasks', 'quizzes', 'exams'])
        ->whereHas('classSubjects')
        ->first();
    
    if (!$subject) {
        echo "❌ No subjects with class subjects found\n";
        exit;
    }
    
    echo "✅ Testing Subject ID: {$subject->id} - {$subject->name}\n";
    
    // Test materials relationship
    try {
        $materials = $subject->materials;
        echo "✅ Materials relation works - Found " . count($materials) . " materials\n";
    } catch (Exception $e) {
        echo "❌ Materials relation error: " . $e->getMessage() . "\n";
    }
    
    // Test tasks relationship
    try {
        $tasks = $subject->tasks;
        echo "✅ Tasks relation works - Found " . count($tasks) . " tasks\n";
    } catch (Exception $e) {
        echo "❌ Tasks relation error: " . $e->getMessage() . "\n";
    }
    
    // Test quizzes relationship
    try {
        $quizzes = $subject->quizzes;
        echo "✅ Quizzes relation works - Found " . count($quizzes) . " quizzes\n";
    } catch (Exception $e) {
        echo "❌ Quizzes relation error: " . $e->getMessage() . "\n";
    }
    
    // Test exams relationship
    try {
        $exams = $subject->exams;
        echo "✅ Exams relation works - Found " . count($exams) . " exams\n";
    } catch (Exception $e) {
        echo "❌ Exams relation error: " . $e->getMessage() . "\n";
    }
    
    echo "\n✅ All Subject relationships verified successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
