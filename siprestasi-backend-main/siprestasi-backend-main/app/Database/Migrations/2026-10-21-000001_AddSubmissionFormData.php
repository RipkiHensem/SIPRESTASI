<?php
namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddSubmissionFormData extends Migration
{
    public function up()
    {
        $this->forge->addColumn('submission', ['form_data' => ['type' => 'TEXT', 'null' => true]]);
    }

    public function down()
    {
        $this->forge->dropColumn('submission', 'form_data');
    }
}
