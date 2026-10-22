<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * CORS untuk frontend yang berjalan di origin terpisah.
 * Origin yang diizinkan dibaca dari .env: cors.allowedOrigins (pisahkan dengan koma).
 *
 * Karena aplikasi memakai session cookie, supportsCredentials HARUS true dan origin HARUS
 * ditulis eksplisit (tidak boleh '*': browser menolak '*' bersama kredensial).
 */
class Cors extends BaseConfig
{
    public array $default = [
        'allowedOrigins'         => [],
        'allowedOriginsPatterns' => [],
        'supportsCredentials'    => true,
        'allowedHeaders'         => ['Content-Type', 'Accept', 'X-Requested-With'],
        'exposedHeaders'         => [],
        'allowedMethods'         => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        'maxAge'                 => 7200,
    ];

    public function __construct()
    {
        parent::__construct();

        $this->default['allowedOrigins'] = array_values(array_filter(array_map(
            static fn ($o) => rtrim(trim($o), '/'),
            explode(',', (string) env('cors.allowedOrigins'))
        )));
    }
}