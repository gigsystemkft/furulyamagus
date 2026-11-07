<?php
declare(strict_types=1);

if (!defined('FURULYA_API_BOOTSTRAPPED')) {
    http_response_code(404);
    exit;
}

return [
    'db_host' => 'localhost',
    'db_name' => 'CHANGE_ME',
    'db_user' => 'CHANGE_ME',
    'db_password' => 'CHANGE_ME',
];
