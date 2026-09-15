<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class BackupDatabase extends Command
{
    protected $signature = 'db:backup';
    protected $description = 'Backup the MySQL database';

    public function handle()
    {
        $database = env('DB_DATABASE');
        $username = env('DB_USERNAME');
        $password = env('DB_PASSWORD');
        $host = env('DB_HOST', '127.0.0.1');

        $date = now()->format('Y-m-d_H-i-s');
        $filename = "backup-{$database}-{$date}.sql";
        $path = storage_path("app/backups");

        if (!file_exists($path)) {
            mkdir($path, 0755, true);
        }

        $dumpPath = env('MYSQLDUMP_PATH', 'mysqldump');
        
        putenv("MYSQL_PWD={$password}");
        $command = sprintf(
            '"%s" --user=%s --host=%s %s > "%s"',
            $dumpPath,
            escapeshellarg($username),
            escapeshellarg($host),
            escapeshellarg($database),
            $path . '/' . $filename
        );
        
        exec($command, $output, $returnVar);
        putenv("MYSQL_PWD"); // Unset after execution

        if ($returnVar === 0) {
            $this->info("Database backup created successfully: {$filename}");
        } else {
            $this->error("Database backup failed.");
        }
    }
}
