<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AlignUsersTableWithErd extends Migration
{
    public function up()
    {
        // Rename kolom-kolom supaya sesuai ERD
    // MariaDB bundled with XAMPP does not support the PostgreSQL-style
    // `RENAME COLUMN ... TO ...` syntax used by the original migration.
    $this->db->query('ALTER TABLE users CHANGE COLUMN id user_id BIGINT NOT NULL AUTO_INCREMENT');
    $this->db->query('ALTER TABLE users CHANGE COLUMN nama name VARCHAR(150) NOT NULL');
    $this->db->query('ALTER TABLE users CHANGE COLUMN nim induk VARCHAR(20) NULL');
    $this->db->query('ALTER TABLE users CHANGE COLUMN no_telp contact VARCHAR(20) NULL');

    // Tambah kolom baru dari ERD yang belum ada
    $this->forge->addColumn('users', [
        'picture' => [
            'type'       => 'VARCHAR',
            'constraint' => 255,
            'null'       => true,
            'after'      => 'contact',
        ],
        'year' => [
            // angkatan mahasiswa, contoh: "2024"
            'type'       => 'VARCHAR',
            'constraint' => 4,
            'null'       => true,
            'after'      => 'picture',
        ],
    ]);

    // Ganti status (VARCHAR aktif/nonaktif) jadi is_active (BOOLEAN), sesuai ERD
    $this->db->query('ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true');
    $this->db->query("UPDATE users SET is_active = (status = 'aktif')");
    $this->db->query('ALTER TABLE users DROP COLUMN status');
    }

    public function down()
    {
         $this->db->query('ALTER TABLE users CHANGE COLUMN user_id id BIGINT NOT NULL AUTO_INCREMENT');
    $this->db->query('ALTER TABLE users CHANGE COLUMN name nama VARCHAR(150) NOT NULL');
    $this->db->query('ALTER TABLE users CHANGE COLUMN induk nim VARCHAR(20) NULL');
    $this->db->query('ALTER TABLE users CHANGE COLUMN contact no_telp VARCHAR(20) NULL');

    $this->forge->dropColumn('users', ['picture', 'year']);

    $this->db->query("ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'aktif'");
    $this->db->query("UPDATE users SET status = CASE WHEN is_active THEN 'aktif' ELSE 'nonaktif' END");
    $this->db->query('ALTER TABLE users DROP COLUMN is_active');
    }
}
