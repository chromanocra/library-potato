<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class Cors implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        // Mengizinkan semua port Live Server (baik 5500 maupun 5501)
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-API-KEY, Accept, Origin, Access-Control-Request-Method");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");

        // Jika browser mengirim Preflight (OPTIONS), langsung beri status 200 OK
        $method = $_SERVER['REQUEST_METHOD'] ?? '';
        if ($method === 'OPTIONS') {
            header("HTTP/1.1 200 OK");
            exit(); 
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Tidak perlu diisi
    }
}