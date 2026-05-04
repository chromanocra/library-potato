<?php

namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;


// Home.php MESSAGE 
class Home extends BaseController
{
    public function index(): string
    {
        return view('welcome_message');
    }
}
