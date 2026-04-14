<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$users = \App\Models\User::select('id', 'name', 'email')->limit(5)->get();
foreach ($users as $u) {
  $roles = $u->getRoleNames();
  echo $u->id . ' | ' . $u->name . ' | ' . $u->email . ' | Roles: ' . implode(', ', $roles->toArray()) . "\n";
}
