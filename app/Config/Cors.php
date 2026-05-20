<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * Cross-Origin Resource Sharing (CORS) Configuration
 *
 * Dikonfigurasi untuk menerima request dari VS Code Live Server
 * (biasanya http://127.0.0.1:5500 atau http://localhost:5500)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
 */
class Cors extends BaseConfig
{
    /**
     * The default CORS configuration.
     *
     * @var array{
     *      allowedOrigins: list<string>,
     *      allowedOriginsPatterns: list<string>,
     *      supportsCredentials: bool,
     *      allowedHeaders: list<string>,
     *      exposedHeaders: list<string>,
     *      allowedMethods: list<string>,
     *      maxAge: int,
     *  }
     */
    public array $default = [
        /**
         * Origins tetap yang diizinkan.
         * Dikosongkan — kita pakai allowedOriginsPatterns agar fleksibel
         * untuk semua port localhost (Live Server bisa pakai port berbeda-beda).
         */
        "allowedOrigins" => [],

        /**
         * Regex pattern untuk origin yang diizinkan.
         * Pattern di-wrap otomatis oleh CI4 menjadi: #\A<pattern>\z#
         *
         * Cocok dengan:
         *  - http://127.0.0.1:5500  (Live Server default)
         *  - http://localhost:5500
         *  - http://127.0.0.1 / http://localhost (tanpa port)
         */
        "allowedOriginsPatterns" => [
            "http://127\.0\.0\.1:\d+", // http://127.0.0.1:<port apapun>
            "http://localhost:\d+", // http://localhost:<port apapun>
            "http://localhost", // http://localhost tanpa port
            "http://127\.0\.0\.1", // http://127.0.0.1 tanpa port
        ],

        /**
         * Tidak pakai credentials berbasis cookie/session.
         * Autentikasi memakai localStorage, sehingga false cukup.
         */
        "supportsCredentials" => false,

        /**
         * Header yang boleh dikirim frontend ke backend.
         * 'Content-Type' wajib ada agar fetch() dengan JSON bisa preflight.
         */
        "allowedHeaders" => [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Accept",
        ],

        /**
         * Header response yang boleh dibaca oleh script frontend.
         * Kosong = hanya header CORS-safelisted yang bisa dibaca.
         */
        "exposedHeaders" => [],

        /**
         * HTTP method yang diizinkan.
         * OPTIONS wajib ada agar preflight request browser berhasil.
         */
        "allowedMethods" => ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

        /**
         * Berapa detik browser boleh cache hasil preflight request.
         * 7200 = 2 jam.
         */
        "maxAge" => 7200,
    ];
}
