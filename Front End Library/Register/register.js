// ================================================================
// KONFIGURASI ENDPOINT API
// ================================================================
const URL_API_REGISTER = "http://localhost:8080/api/register";

// ================================================================
// HANDLER FORM REGISTER
// ================================================================
document.addEventListener("DOMContentLoaded", function () {
  const formRegister = document.getElementById("form-register");
  const btnRegister = document.getElementById("btn-register");

  formRegister.addEventListener("submit", async function (e) {
    e.preventDefault();

    // ----------------------------------------------------------------
    // Ambil nilai dari form — semua id sudah sinkron dengan kolom DB
    // ----------------------------------------------------------------
    const nomorIdentitas = document.getElementById("nisn").value.trim(); // → kolom: nomor_identitas
    const username = document.getElementById("username").value.trim(); // → kolom: username
    const password = document.getElementById("password").value.trim(); // → kolom: password
    const phone = document.getElementById("phone").value.trim(); // → kolom: phone
    const gender = document.getElementById("gender").value; // → kolom: gender
    const email = document.getElementById("email").value.trim(); // → kolom: email

    // ----------------------------------------------------------------
    // Validasi client-side (sebelum fetch ke backend)
    // ----------------------------------------------------------------
    if (
      !nomorIdentitas ||
      !username ||
      !password ||
      !phone ||
      !gender ||
      !email
    ) {
      alert("Semua field wajib diisi!");
      return;
    }

    if (password.length < 6) {
      alert("Password minimal 6 karakter!");
      return;
    }

    // Validasi format nomor telepon (hanya angka, minimal 9 digit)
    const phoneRegex = /^[0-9]{9,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\+]/g, ""))) {
      alert("Nomor telepon tidak valid! Gunakan angka, minimal 9 digit.");
      return;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Format email tidak valid!");
      return;
    }

    // ---- Aktifkan Loading State ----
    btnRegister.disabled = true;
    btnRegister.innerText = "MEMPROSES...";

    // ----------------------------------------------------------------
    // Payload — field name HARUS sama persis dengan kolom di tabel DB
    // ----------------------------------------------------------------
    const payload = {
      nomor_identitas: nomorIdentitas, // dari id="nisn"
      username: username, // dari id="username"
      password: password, // dari id="password" — akan di-hash di backend
      phone: phone, // dari id="phone"
      gender: gender, // dari id="gender" (Laki-laki / Perempuan)
      email: email, // dari id="email"
      // role & status → diset otomatis oleh backend, tidak dikirim dari sini
    };

    try {
      const response = await fetch(URL_API_REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("[Register] Response dari API:", result);

      if (response.ok && result.status === 201) {
        alert("✅ Registrasi berhasil!\nSilakan login dengan akun Anda.");
        window.location.href = "../Login/login.html";
      } else {
        // Tampilkan pesan + detail error validasi dari backend
        const pesanError =
          result.pesan || result.message || "Registrasi gagal.";
        const detailErrors = result.errors
          ? "\n\nDetail:\n" + Object.values(result.errors).join("\n")
          : "";
        alert("Registrasi gagal: " + pesanError + detailErrors);
      }
    } catch (error) {
      console.error("[Register] Error koneksi:", error);
      alert(
        "❌ Tidak dapat terhubung ke server.\nPastikan backend berjalan di http://localhost:8080 (php spark serve).",
      );
    } finally {
      btnRegister.disabled = false;
      btnRegister.innerText = "SIGN UP";
    }
  });
});