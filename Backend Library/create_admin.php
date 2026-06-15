<?php
$mysqli = new mysqli('localhost', 'root', '', 'perpustakaan_adspl');

$username = 'gay';
$password = password_hash('gay', PASSWORD_DEFAULT);
$email = 'gay@admin.com';
$nomor_identitas = 'ADM' . rand(1000, 9999);
$role = 'admin';
$gender = 'Laki-laki';
$phone = '08123456789';
$status = 'active';
$now = date('Y-m-d H:i:s');

$stmt = $mysqli->prepare("INSERT INTO pengguna (nomor_identitas, username, email, password, role, gender, phone, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssssss", $nomor_identitas, $username, $email, $password, $role, $gender, $phone, $status, $now, $now);

if ($stmt->execute()) {
    echo "Admin created successfully!\n";
} else {
    echo "Failed to create admin: " . $stmt->error . "\n";
}
$stmt->close();
$mysqli->close();
