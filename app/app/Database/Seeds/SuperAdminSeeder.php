<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    public function run()
    {
        $email = trim((string) env('seed.superadminEmail', ''));
        $password = (string) env('seed.superadminPassword', '');
        if (! filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12) {
            throw new \RuntimeException('Isi seed.superadminEmail dan seed.superadminPassword (minimal 12 karakter) sebelum menjalankan seeder.');
        }

        $sudahAda = $this->db->table('users')
            ->where('email', $email)
            ->get()
            ->getRow();

        if ($sudahAda) {
            echo "Superadmin sudah ada, skip.\n";
            return;
        }

        $this->db->table('users')->insert([
            'nama'              => 'Super Admin',
            'email'             => $email,
            'password'          => password_hash($password, PASSWORD_BCRYPT),
            'role'              => 'superadmin',
            'status'            => 'aktif',
            'status_verifikasi' => 'terverifikasi',
            'created_at'        => date('Y-m-d H:i:s'),
            'updated_at'        => date('Y-m-d H:i:s'),
        ]);

        echo "Superadmin berhasil dibuat.\n";
    }
}
