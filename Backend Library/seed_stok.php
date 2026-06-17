<?php
$mysqli = new mysqli('localhost', 'root', '', 'perpustakaan_adspl');

// Get all buku
$res = $mysqli->query('SELECT bukuID FROM buku');
$bukuIDs = [];
while($row = $res->fetch_assoc()){
    $bukuIDs[] = $row['bukuID'];
}

// For each buku, insert stock if not exists
foreach ($bukuIDs as $id) {
    $check = $mysqli->query("SELECT stokID FROM stok WHERE bukuID = " . (int)$id);
    if ($check->num_rows == 0) {
        $now = date('Y-m-d H:i:s');
        $mysqli->query("INSERT INTO stok (bukuID, total_copy, avail_copy, borrowed_copy, damaged_copy, lost_copy, created_at, updated_at) VALUES ($id, 10, 10, 0, 0, 0, '$now', '$now')");
        echo "Inserted stock for bukuID $id\n";
    }
}
echo "Done\n";
