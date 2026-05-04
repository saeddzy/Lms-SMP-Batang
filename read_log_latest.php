<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

$logFile = 'storage/logs/laravel.log';
$lines = file($logFile);
$lastLines = array_slice($lines, -30);

echo "Last 30 lines of Laravel log:\n";
foreach ($lastLines as $line) {
    echo $line . "\n";
}
