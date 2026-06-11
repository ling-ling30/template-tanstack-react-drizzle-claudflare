import { env } from "process";

async function seedAdmin() {
  const email = env.ADMIN_EMAIL || "owner@example.com";
  const password = env.ADMIN_PASSWORD || "admin123456";
  const name = env.ADMIN_NAME || "Platform Admin";

  console.log(`Menyiapkan akun admin platform: ${email}...`);

  try {
    const res = await fetch("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "http://localhost:3000",
      },
      body: JSON.stringify({
        email,
        password,
        name,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Gagal membuat admin:", errorText);
      process.exit(1);
    }

    console.log("Berhasil! Akun platform admin telah dibuat.");
    console.log("Silakan login di http://localhost:3000/platform/login");
  } catch (err) {
    console.error("Error menjalankan script seed:", err);
    console.error("Pastikan dev server berjalan di http://localhost:3000 (jalankan `pnpm dev:user-application`)");
    process.exit(1);
  }
}

seedAdmin();
