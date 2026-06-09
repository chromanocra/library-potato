const URL_API_LOGIN = 'http://localhost:8080/api/login';

document.addEventListener('DOMContentLoaded', function () {

    // =========================
    // CEK SESSION LOGIN (Auto-Forward)
    // =========================
    const sessionUser = localStorage.getItem('user_logged_in');

    if (sessionUser) {
        try {
            const user = JSON.parse(sessionUser);
            console.log('Session User Terdeteksi:', user);

            // Redirect kalau sudah login sebelumnya
            if (user.role === 'admin') {
                window.location.href = '../Dashboard/Admin/dashboard_admin.html';
                return;
            }
            if (user.role === 'user') {
                window.location.href = '../Dashboard/User/dashboard.html';
                return;
            }
        } catch (error) {
            console.error('Session rusak, dibersihkan:', error);
            localStorage.removeItem('user_logged_in');
        }
    }

    // =========================
    // ELEMENT
    // =========================
    const formLogin = document.getElementById('form-login');
    const btnSubmit = document.getElementById('btn-submit');
    const spinner = document.getElementById('login-spinner');

    // =========================
    // SUBMIT LOGIN
    // =========================
    formLogin.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        // Validasi kosong
        if (!username || !password) {
            alert('Username dan password wajib diisi!');
            return;
        }

        // Loading ON
        btnSubmit.disabled = true;
        spinner.style.display = 'inline-block';

        try {
            const response = await fetch(URL_API_LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const hasil = await response.json();
            console.log('Response Login dari API:', hasil);

            // =========================
            // LOGIN BERHASIL (Response OK 200-299)
            // =========================
            if (response.ok) {
                
                // Ambil data user secara aman (antisipasi jika dibungkus hasil.data atau tidak)
                const dataUser = hasil.data || hasil;
                
                // Ambil role secara fleksibel (cek di root hasil, kalau tidak ada cek di dalam data)
                const userRole = hasil.role || (dataUser ? dataUser.role : null);

                // Validasi jika role benar-benar tidak dikirim oleh backend
                if (!userRole) {
                    alert('Role user tidak ditemukan dalam response API! Periksa struktur JSON backend.');
                    return;
                }

                // Simpan session login ke LocalStorage
                localStorage.setItem(
                    'user_logged_in',
                    JSON.stringify({
                        username: dataUser.username || username,
                        nomor_identitas: dataUser.nomor_identitas || '',
                        role: userRole.toLowerCase() // disamakan jadi huruf kecil biar aman
                    })
                );

                console.log('Session berhasil disimpan!');

                // Redirect sesuai dengan role (user atau admin)
                if (userRole.toLowerCase() === 'admin') {
                    alert('Login Admin berhasil!');
                    window.location.href = '../Dashboard/Admin/dashboard_admin.html';
                } else {
                    alert('Login Berhasil!');
                    window.location.href = '../Dashboard/User/dashboard.html';
                }

            } else {
                // Gagal login dari server (misal password salah atau user tidak terdaftar)
                alert(hasil.pesan || 'Username atau password salah!');
            }

        } catch (error) {
            console.error('FULL ERROR LOGIN:', error);
            alert('Gagal terhubung ke server backend: ' + error.message);
        } finally {
            // Loading OFF
            btnSubmit.disabled = false;
            spinner.style.display = 'none';
        }
    });
});