<?php
$mysqli = new mysqli('localhost', 'root', '', 'perpustakaan_adspl');
$res = $mysqli->query('SELECT * FROM stok');
while($row = $res->fetch_assoc()){
    print_r($row);
}
