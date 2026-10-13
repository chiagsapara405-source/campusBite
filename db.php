<?php
/**
 * Shared MySQL connection for CampusBite.
 * XAMPP defaults: root user, empty password, database `campusbite`.
 * All callers must use prepared statements — never interpolate user input.
 */
declare(strict_types=1);

function db(): mysqli
{
    static $conn = null;
    if ($conn instanceof mysqli) {
        return $conn;
    }

    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    try {
        $conn = new mysqli('127.0.0.1', 'root', '', 'campusbite');
        $conn->set_charset('utf8mb4');
    } catch (mysqli_sql_exception $e) {
        http_response_code(500);
        error_log('CampusBite database connection failed: ' . $e->getMessage());
        exit('Database connection failed. Please try again later.');
    }

    return $conn;
}
