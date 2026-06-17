<?php
$mysqli = new mysqli('localhost', 'root', '', 'perpustakaan_adspl');
$res = $mysqli->query('SELECT * FROM peminjaman ORDER BY pinjamID DESC LIMIT 5');
while($row = $res->fetch_assoc()){
    print_r($row);
}
