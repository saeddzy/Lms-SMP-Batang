import React, { useEffect, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { IconClock, IconCheck, IconX, IconAlertTriangle } from "@tabler/icons-react";

export default function ExamAttempt() {
    const { exam, attempt, questions, remainingMinutes, endTime } = usePage().props;
    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(remainingMinutes);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const end = new Date(endTime);
            const diff = Math.max(0, Math.floor((end - now) / 1000 / 60));
            
            setTimeLeft(diff);
            
            if (diff === 0) {
                handleSubmit(); // Auto submit when time is up
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    const handleAnswerChange = (questionId, answer, selectedOptions = null) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: {
                answer,
                selected_options: selectedOptions,
                time_spent_seconds: (prev[questionId]?.time_spent_seconds || 0) + 1
            }
        }));
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        
        try {
            // Save all answers first
            for (const [questionId, answerData] of Object.entries(answers)) {
                await router.post(route('exams.attempt.save-answer', [exam.id, attempt.id]), {
                    question_id: questionId,
                    ...answerData
                });
            }

            // Then submit exam
            await router.post(route('exams.attempt.submit', [exam.id, attempt.id]));
            
            router.visit(route('exams.attempt.result', [exam.id, attempt.id]));
        } catch (error) {
            console.error('Submit error:', error);
            setIsSubmitting(false);
        }
    };

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const getStatusColor = () => {
        if (timeLeft <= 5) return 'text-red-600 bg-red-50';
        if (timeLeft <= 10) return 'text-yellow-600 bg-yellow-50';
        return 'text-green-600 bg-green-50';
    };

    return (
        <DashboardLayout title={`Mengerjakan: ${exam.title}`}>
            <Head title={`Mengerjakan: ${exam.title}`} />

            <div className="max-w-4xl mx-auto py-6">
                {/* Header */}
                <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{exam.title}</h1>
                            <p className="text-sm text-slate-600">
                                Soal {currentQuestion + 1} dari {questions.length}
                            </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                            <IconClock className="inline w-4 h-4 mr-1" />
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Question */}
                {questions[currentQuestion] && (
                    <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
                        <div className="mb-4">
                            <div className="flex items-start gap-2 mb-2">
                                <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                                    {currentQuestion + 1}
                                </span>
                                <h2 className="text-lg font-medium text-slate-900 flex-1">
                                    {questions[currentQuestion].question_text}
                                </h2>
                            </div>
                            
                            {questions[currentQuestion].question_image && (
                                <img 
                                    src={`/storage/${questions[currentQuestion].question_image}`}
                                    alt="Question image"
                                    className="mt-3 max-w-full h-auto rounded-lg border border-slate-200"
                                />
                            )}
                        </div>

                        {/* Options */}
                        {questions[currentQuestion].options && questions[currentQuestion].options.length > 0 ? (
                            <div className="space-y-3">
                                {questions[currentQuestion].options.map((option, index) => (
                                    <label 
                                        key={option.id}
                                        className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                                    >
                                        <input
                                            type="radio"
                                            name={`question_${questions[currentQuestion].id}`}
                                            value={option.id}
                                            checked={answers[questions[currentQuestion].id]?.selected_options?.includes(option.id)}
                                            onChange={(e) => {
                                                const currentAnswers = answers[questions[currentQuestion].id]?.selected_options || [];
                                                if (e.target.checked) {
                                                    handleAnswerChange(
                                                        questions[currentQuestion].id, 
                                                        option.option_text, 
                                                        [...currentAnswers, option.id]
                                                    );
                                                } else {
                                                    handleAnswerChange(
                                                        questions[currentQuestion].id, 
                                                        option.option_text, 
                                                        currentAnswers.filter(id => id !== option.id)
                                                    );
                                                }
                                            }}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <span className="font-medium text-slate-900">
                                                {String.fromCharCode(65 + index)}. {option.option_text}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            /* Essay question */
                            <textarea
                                rows={4}
                                placeholder="Tulis jawaban Anda di sini..."
                                value={answers[questions[currentQuestion].id]?.answer || ''}
                                onChange={(e) => handleAnswerChange(questions[currentQuestion].id, e.target.value)}
                                className="w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        )}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                        disabled={currentQuestion === 0}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Sebelumnya
                    </button>

                    <div className="flex gap-2">
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestion(index)}
                                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                                    index === currentQuestion 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                        disabled={currentQuestion === questions.length - 1}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Selanjutnya
                    </button>
                </div>

                {/* Submit Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || timeLeft === 0}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Kumpulkan Jawaban'}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
