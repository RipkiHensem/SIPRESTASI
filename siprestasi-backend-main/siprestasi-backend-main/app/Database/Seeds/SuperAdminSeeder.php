<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    public function run()
    {
        $superAdminEmail = trim((string) env('seed.superadminEmail', ''));
        $superAdminPassword = (string) env('seed.superadminPassword', '');
        $adminEmail = trim((string) env('seed.adminEmail', ''));
        $adminPassword = (string) env('seed.adminPassword', '');

        foreach ([
            'seed.superadminEmail' => $superAdminEmail,
            'seed.adminEmail'      => $adminEmail,
        ] as $setting => $email) {
            if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new \RuntimeException("Isi $setting dengan alamat email yang valid sebelum menjalankan seeder.");
            }
        }
        foreach ([
            'seed.superadminPassword' => $superAdminPassword,
            'seed.adminPassword'      => $adminPassword,
        ] as $setting => $password) {
            if (strlen($password) < 12) {
                throw new \RuntimeException("Isi $setting dengan kata sandi minimal 12 karakter sebelum menjalankan seeder.");
            }
        }

        $sudahAda = $this->db->table('users')
            ->where('email', $superAdminEmail)
            ->get()
            ->getRow();

        if (! $sudahAda) {
            $this->db->table('users')->insert([
                'name'              => 'Super Administrator',
                'email'             => $superAdminEmail,
                'password'          => password_hash($superAdminPassword, PASSWORD_BCRYPT),
                'role'              => 'superadmin',
                'is_active'         => true,
                'status_verifikasi' => 'terverifikasi',
                'created_at'        => date('Y-m-d H:i:s'),
                'updated_at'        => date('Y-m-d H:i:s'),
            ]);
            echo "Superadmin berhasil dibuat.\n";
        } else {
            echo "Superadmin sudah ada, skip.\n";
        }

        // Seed admin if not present
        $adminAda = $this->db->table('users')->where('email', $adminEmail)->get()->getRow();
        if (! $adminAda) {
            $this->db->table('users')->insert([
                'name'              => 'Administrator',
                'email'             => $adminEmail,
                'password'          => password_hash($adminPassword, PASSWORD_BCRYPT),
                'role'              => 'admin',
                'is_active'         => true,
                'status_verifikasi' => 'terverifikasi',
                'created_at'        => date('Y-m-d H:i:s'),
                'updated_at'        => date('Y-m-d H:i:s'),
            ]);
            echo "Admin berhasil dibuat.\n";
        } else {
            echo "Admin sudah ada, skip.\n";
        }
    }
}
