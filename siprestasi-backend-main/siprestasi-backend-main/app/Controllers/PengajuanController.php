<?php

namespace App\Controllers;

use App\Models\IpkModel;
use App\Models\MasterDataModel;
use App\Models\SkpiModel;
use App\Models\SubmissionModel;
use App\Models\UserModel;
use App\Models\PrestasiModel;
use App\Models\BahasaModel;
use App\Models\OrganisasiModel;
use App\Models\LogModel;
use App\Models\ScoreResultModel;
use App\Models\PeriodeModel;
use App\Models\PvQuestionnaireModel;
use App\Models\PvResponseModel;

class PengajuanController extends BaseController
{
    /**
     * POST /pengajuan
     * Buat submission baru (status draft) + tarik IPK & SKPI dari master_data.
     * Route dipasang dengan filter auth:mahasiswa
     */
    public function create()
    {
        $periodeModel = new PeriodeModel();
        $periodeModel->closeIfDeadlinePassed();
        $currentPeriode = $periodeModel->getCurrent();

        if (!$currentPeriode || $currentPeriode['is_closed'] || $currentPeriode['tanggal_mulai'] > date('Y-m-d')) {
            return $this->response->setStatusCode(403)->setJSON([
                'success' => false,
                'message' => 'Pendaftaran belum dibuka atau periode sudah ditutup.',
            ]);
        }

        $userId = session()->get('user_id');

        $user = (new UserModel())->find($userId);
        if (! $user) {
            return $this->response->setStatusCode(404)->setJSON([
                'success' => false,
                'message' => 'User tidak ditemukan.',
            ]);
        }

        $submissionModel = new SubmissionModel();
        if ($submissionModel->findActiveByUser($userId)) {
            return $this->response->setStatusCode(409)->setJSON([
                'success' => false,
                'message' => 'Kamu sudah memiliki pengajuan aktif.',
            ]);
        }

        $master = (new MasterDataModel())->findLatestByInduk($user['induk']);
        if (! $master) {
            return $this->response->setStatusCode(404)->setJSON([
                'success' => false,
                'message' => 'Data IPK/SKPI kamu belum tersedia. Hubungi Kaprodi.',
            ]);
        }

        $ipkModel  = new IpkModel();
        $skpiModel = new SkpiModel();

        $ipkScore  = $ipkModel->convertIpkScore((float) $master['ipk']);
        $skpiScore = $skpiModel->convertSkpiScore((int) $master['skpi']);

        $db = \Config\Database::connect();
        $db->transStart();

        $subId = $submissionModel->insert([
            'user_id' => $userId,
            'status'  => 'draft',
        ]);

        $ipkModel->insert([
            'sub_id'    => $subId,
            'ipk_nilai' => $master['ipk'],
            'ipk_score' => $ipkScore,
        ]);

        $skpiModel->insert([
            'sub_id'     => $subId,
            'skpi_nilai' => $master['skpi'],
            'skpi_score' => $skpiScore,
        ]);

        $db->transComplete();

        if (! $db->transStatus()) {
            return $this->response->setStatusCode(500)->setJSON([
                'success' => false,
                'message' => 'Gagal membuat pengajuan.',
            ]);
        }

        return $this->response->setStatusCode(201)->setJSON([
            'success' => true,
            'message' => 'Pengajuan berhasil dibuat.',
            'data'    => [
                'sub_id' => $subId,
                'status' => 'draft',
                'ipk'    => ['nilai' => $master['ipk'], 'score' => $ipkScore],
                'skpi'   => ['nilai' => $master['skpi'], 'score' => $skpiScore],
            ],
        ]);
    }
        /**
     * GET /pengajuan/me
     * Route dipasang dengan filter auth:mahasiswa
     */
    public function me()
    {
        $userId = session()->get('user_id');

        $submission = (new SubmissionModel())->findActiveByUser($userId);
        if (! $submission) {
            return $this->response->setStatusCode(404)->setJSON([
                'success' => false,
                'message' => 'Kamu belum memiliki pengajuan.',
            ]);
        }

        $subId = $submission['sub_id'];
        $db    = \Config\Database::connect();

        return $this->response->setJSON([
            'success' => true,
            'data'    => [
                'sub_id'          => $subId,
                'status'          => $submission['status'],
                'peer_reviewer_1' => $submission['peer_reviewer_1'],
                'peer_reviewer_2' => $submission['peer_reviewer_2'],
                'peer_reviewer_3' => $submission['peer_reviewer_3'],
                'ipk'             => $db->table('ipk')->where('sub_id', $subId)->get()->getRowArray(),
                'skpi'            => $db->table('skpi')->where('sub_id', $subId)->get()->getRowArray(),
                'prestasi'        => $db->table('prestasi')->where('sub_id', $subId)->get()->getRowArray(),
                'organisasi'      => $db->table('organisasi')->where('sub_id', $subId)->get()->getRowArray(),
                'bahasa'          => $db->table('bahasa')->where('sub_id', $subId)->get()->getRowArray(),
            ],
        ]);   
    }

        /**
     * POST /pengajuan/prestasi
     * Body (form-data): pres_cat, pres_file (file)
     * Route dipasang dengan filter auth:mahasiswa
     */
    /** POST /pengajuan/prestasi (form-data: pres_cat, pres_file) */
    public function uploadPrestasi()
    {
        return $this->saveCategoryUpload(PrestasiModel::class, 'pres', 'prestasi', 'Prestasi');
    }

    /** POST /pengajuan/organisasi (form-data: org_cat, org_file) */
    public function uploadOrganisasi()
    {
        return $this->saveCategoryUpload(OrganisasiModel::class, 'org', 'organisasi', 'Organisasi');
    }

    /** POST /pengajuan/bahasa (form-data: bah_cat, bah_file) */
    public function uploadBahasa()
    {
        return $this->saveCategoryUpload(BahasaModel::class, 'bah', 'bahasa', 'Sertifikat bahasa');
    }

    private function saveCategoryUpload(string $modelClass, string $prefix, string $folder, string $label)
    {
        $userId     = session()->get('user_id');
        $submission = (new SubmissionModel())->findActiveByUser($userId);

        if (! $submission) {
            return $this->response->setStatusCode(404)->setJSON([
                'success' => false,
                'message' => 'Kamu belum memiliki pengajuan.',
            ]);
        }

        $existingCheck = (new $modelClass())->where('sub_id', $submission['sub_id'])->first();
        $sedangRevisi  = $existingCheck && $existingCheck[$prefix . '_status'] === 'revisi';

        if ($submission['status'] !== 'draft' && ! $sedangRevisi) {
            return $this->response->setStatusCode(403)->setJSON([
                'success' => false,
                'message' => 'Pengajuan sudah dikirim dan dokumen ini tidak dalam status revisi.',
            ]);
        }

        $catField  = $prefix . '_cat';
        $fileField = $prefix . '_file';

        $rules = [
            $catField  => 'required|in_list[' . implode(',', array_keys($modelClass::SCORES)) . ']',
            $fileField => "uploaded[{$fileField}]|max_size[{$fileField},2048]|mime_in[{$fileField},image/jpeg,image/png,application/pdf]",
        ];

        if (! $this->validate($rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'success' => false,
                'errors'  => $this->validator->getErrors(),
            ]);
        }

        $model    = new $modelClass();
        $kategori = $this->request->getPost($catField);
        $score    = $modelClass::SCORES[$kategori];

        $file    = $this->request->getFile($fileField);
        $newName = $file->getRandomName();
        $file->move(WRITEPATH . 'uploads/' . $folder, $newName);

        $data = [
            'sub_id'             => $submission['sub_id'],
            $catField            => $kategori,
            $prefix . '_score'   => 0, // default 0, nanti dihitung di ScoreResultModel
            $fileField           => $newName,
            $prefix . '_status'  => 'pending',
        ];

                $existing = $model->where('sub_id', $submission['sub_id'])->first();

        if ($existing) {
            @unlink(WRITEPATH . 'uploads/' . $folder . '/' . $existing[$fileField]);
            $model->update($existing[$prefix . '_id'], $data);
        } else {
            $model->insert($data);
        }

        $user = (new UserModel())->find($userId);
        $this->validateDocumentWithAi($modelClass, $prefix, $folder, $submission['sub_id'], $kategori, $newName, $user['name'] ?? '');

        $docTerbaru = $model->where('sub_id', $submission['sub_id'])->first();

        return $this->response->setStatusCode($existing ? 200 : 201)->setJSON([
            'success' => true,
            'message' => $label . ' berhasil disimpan dan divalidasi.',
            'data'    => [
                $catField           => $docTerbaru[$catField],
                $prefix . '_score'  => $docTerbaru[$prefix . '_score'],
                $prefix . '_status' => $docTerbaru[$prefix . '_status'],
            ],
        ]);
    }

        /**
     * PUT /pengajuan/peer-reviewers
     * Body (JSON): { "peer_reviewer_1": "...", "peer_reviewer_2": "..." }
     */
        /**
     * PUT /pengajuan/peer-reviewers
     * Body (JSON): { "peer_reviewer_1": "...", "peer_reviewer_2": "...", "peer_reviewer_3": "..." }
     */
    public function setPeerReviewers()
    {
        $userId     = session()->get('user_id');
        $submission = (new SubmissionModel())->findActiveByUser($userId);

        if (! $submission) {
            return $this->response->setStatusCode(404)->setJSON([
                'success' => false,
                'message' => 'Kamu belum memiliki pengajuan.',
            ]);
        }

        if ($submission['status'] !== 'top3') {
            return $this->response->setStatusCode(403)->setJSON([
                'success' => false,
                'message' => 'Pengajuan belum masuk Top 3.',
            ]);
        }

        $input = $this->request->getJSON(true) ?? [];

        $rules = [
            'peer_reviewer_1' => 'required|valid_email',
            'peer_reviewer_2' => 'required|valid_email|differs[peer_reviewer_1]',
            'peer_reviewer_3' => 'required|valid_email|differs[peer_reviewer_1]|differs[peer_reviewer_2]',
        ];

        if (! $this->validateData($input, $rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'success' => false,
                'errors'  => $this->validator->getErrors(),
            ]);
        }

        $ownEmail = strtolower((string) session()->get('email'));
        foreach (['peer_reviewer_1', 'peer_reviewer_2', 'peer_reviewer_3'] as $field) {
            if (strtolower($input[$field]) === $ownEmail) {
                return $this->response->setStatusCode(422)->setJSON([
                    'success' => false,
                    'errors'  => [$field => 'Tidak boleh memakai email sendiri.'],
                ]);
            }
        }

        (new SubmissionModel())->update($submission['sub_id'], [
            'peer_reviewer_1' => $input['peer_reviewer_1'],
            'peer_reviewer_2' => $input['peer_reviewer_2'],
            'peer_reviewer_3' => $input['peer_reviewer_3'],
        ]);
        
        $this->dispatchQuestionnairesIfReady($submission['sub_id']);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Tiga rekan sejawat berhasil disimpan.',
        ]);
    }

    private function getValidationIndicator(int $subId): string
    {
        $db = \Config\Database::connect();

        $statuses = [];
        foreach (['prestasi' => 'pres_status', 'organisasi' => 'org_status', 'bahasa' => 'bah_status'] as $table => $col) {
            $row = $db->table($table)->select($col)->where('sub_id', $subId)->get()->getRowArray();
            if ($row) {
                $statuses[] = $row[$col];
            }
        }

        if (in_array('ditolak', $statuses, true)) {
            return 'red';
        }
        if (in_array('pending', $statuses, true) || in_array('revisi', $statuses, true)) {
            return 'yellow';
        }
        return 'green';
    }

        /**
     * PUT /pengajuan/{subId}/lecturer-reviewers
     * Body (JSON): { "lecturer_reviewer_1": 5, "lecturer_reviewer_2": 8 }
     * Route dipasang dengan filter auth:admin,superadmin
     * Dipanggil setelah mahasiswa ini ditetapkan Top 3.
     */
    public function setLecturerReviewers($subId)
    {
        $submissionModel = new SubmissionModel();
        $submission      = $submissionModel->find($subId);

        if (! $submission) {
            return $this->response->setStatusCode(404)->setJSON([
                'success' => false,
                'message' => 'Pengajuan tidak ditemukan.',
            ]);
        }

        if ($submission['status'] !== 'top3') {
            return $this->response->setStatusCode(409)->setJSON([
                'success' => false,
                'message' => 'Pengajuan belum masuk Top 3.',
            ]);
        }

        $input = $this->request->getJSON(true) ?? [];

        $rules = [
            'lecturer_reviewer_1' => 'required|is_natural_no_zero',
            'lecturer_reviewer_2' => 'required|is_natural_no_zero|differs[lecturer_reviewer_1]',
        ];

        if (! $this->validateData($input, $rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'success' => false,
                'errors'  => $this->validator->getErrors(),
            ]);
        }

        $userModel = new UserModel();
        $kaprodi   = $userModel->find($input['lecturer_reviewer_1']);
        $dosen2    = $userModel->find($input['lecturer_reviewer_2']);

        if (! $kaprodi || $kaprodi['role'] !== 'dosen' || ! $kaprodi['is_kaprodi']) {
            return $this->response->setStatusCode(422)->setJSON([
                'success' => false,
                'errors'  => ['lecturer_reviewer_1' => 'User ini bukan Kaprodi.'],
            ]);
        }

        if (! $dosen2 || $dosen2['role'] !== 'dosen') {
            return $this->response->setStatusCode(422)->setJSON([
                'success' => false,
                'errors'  => ['lecturer_reviewer_2' => 'User ini bukan dosen.'],
            ]);
        }

        $submissionModel->update($subId, [
            'lecturer_reviewer_1' => $input['lecturer_reviewer_1'],
            'lecturer_reviewer_2' => $input['lecturer_reviewer_2'],
        ]);

        $this->dispatchQuestionnairesIfReady($subId);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Dosen penilai berhasil ditetapkan.',
        ]);
    }
    /**
     * POST /pengajuan/submit
     */
    public function submit()
    {
        $userId          = session()->get('user_id');
        $submissionModel = new SubmissionModel();
        $submission      = $submissionModel->findActiveByUser($userId);

        if (! $submission) {
            return $this->response->setStatusCode(404)->setJSON([
                'success' => false,
                'message' => 'Kamu belum memiliki pengajuan.',
            ]);
        }

        if ($submission['status'] !== 'draft') {
            return $this->response->setStatusCode(409)->setJSON([
                'success' => false,
                'message' => 'Pengajuan sudah pernah dikirim.',
            ]);
        }

        $errors = [];
        if (! (new IpkModel())->where('sub_id', $submission['sub_id'])->first()
            || ! (new SkpiModel())->where('sub_id', $submission['sub_id'])->first()) {
            $errors[] = 'Data IPK/SKPI belum lengkap.';
        }

        if ($errors) {
            return $this->response->setStatusCode(422)->setJSON([
                'success' => false,
                'message' => 'Pengajuan belum lengkap.',
                'errors'  => $errors,
            ]);
        }

        $db = \Config\Database::connect();
        $db->transStart();

        $submissionModel->update($submission['sub_id'], [
            'status'       => 'submitted',
            'submitted_at' => date('Y-m-d H:i:s'),
        ]);
        (new LogModel())->recordLog($submission['sub_id'], $userId, 'submitted');
        
        (new ScoreResultModel())->calculateAllResults($submission['sub_id']);

        $db->transComplete();

        if (! $db->transStatus()) {
            return $this->response->setStatusCode(500)->setJSON([
                'success' => false,
                'message' => 'Gagal mengirim pengajuan.',
            ]);
        }

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Pengajuan berhasil dikirim.',
            'data'    => ['sub_id' => $submission['sub_id'], 'status' => 'submitted'],
        ]);
    }

     /**
     * GET /pengajuan/ranking?angkatan=2024
     * Route dipasang dengan filter auth:admin,superadmin
     */
    public function ranking()
    {
        (new PeriodeModel())->closeIfDeadlinePassed();
        
        $angkatan = $this->request->getGet('angkatan');

        if (! $angkatan) {
            return $this->response->setStatusCode(422)->setJSON([
                'success' => false,
                'message' => 'Parameter angkatan wajib diisi.',
            ]);
        }

        $db = \Config\Database::connect();

                $rows = $db->table('score_result sr')
            ->select('sr.sub_id, sr.total_score, sr.status, u.name, u.induk, u.year')
            ->join('submission s', 's.sub_id = sr.sub_id')
            ->join('users u', 'u.user_id = s.user_id')
            ->where('u.year', $angkatan)
            ->orderBy('sr.total_score', 'DESC')
            ->get()
            ->getResultArray();

        foreach ($rows as &$row) {
            $row['indicator'] = $this->getValidationIndicator((int) $row['sub_id']);
        }
        unset($row); // biar aman, hapus referensi setelah loop

        return $this->response->setJSON([
            'success' => true,
            'data'    => $rows,
        ]);
    }

    private function dispatchQuestionnairesIfReady(int $subId): void
    {
        $submissionModel = new SubmissionModel();
        $submission      = $submissionModel->find($subId);

        $reviewersLengkap = ! empty($submission['peer_reviewer_1'])
            && ! empty($submission['peer_reviewer_2'])
            && ! empty($submission['peer_reviewer_3'])
            && ! empty($submission['lecturer_reviewer_1'])
            && ! empty($submission['lecturer_reviewer_2']);

        if (! $reviewersLengkap || $submission['status'] !== 'top3') {
            return; // masih nunggu salah satu pihak (mahasiswa/admin) lengkapi datanya
        }

        $questionnaire = (new PvQuestionnaireModel())->getActive();
        if (! $questionnaire) {
            return; // TODO: idealnya kasih notifikasi ke admin, kuesioner belum disiapkan
        }

        $userModel      = new UserModel();
        $responseModel  = new PvResponseModel();
        $kaprodi        = $userModel->find($submission['lecturer_reviewer_1']);
        $dosenLain      = $userModel->find($submission['lecturer_reviewer_2']);

        $evaluators = [
            ['reviewer' => $submission['peer_reviewer_1'], 'role' => 'sejawat'],
            ['reviewer' => $submission['peer_reviewer_2'], 'role' => 'sejawat'],
            ['reviewer' => $submission['peer_reviewer_3'], 'role' => 'sejawat'],
            ['reviewer' => $kaprodi['email'] ?? '', 'role' => 'dosen'],
            ['reviewer' => $dosenLain['email'] ?? '', 'role' => 'dosen'],
        ];

        foreach ($evaluators as $e) {
            $responseModel->insert([
                'sub_id'      => $subId,
                'quiz_id'     => $questionnaire['quiz_id'],
                'reviewer'    => $e['reviewer'],
                'role'        => $e['role'],
                'status'      => 'pending',
                'token'       => bin2hex(random_bytes(32)),
            ]);
        }

        $submissionModel->update($subId, ['status' => 'pending_reviewed']);
    }

    private function validateDocumentWithAi(string $modelClass, string $prefix, string $folder, int $subId, string $kategori, string $fileName, string $namaMahasiswa): void
    {
        $filePath = WRITEPATH . 'uploads/' . $folder . '/' . $fileName;
        if (! is_file($filePath)) {
            return;
        }

        $verdict = 'ragu';
        try {
            $url = env('aiService.baseUrl') . '/verify-certificate';
            
            // Siapkan data multipart menggunakan CURLFile asli PHP
            $postData = [
                'file'     => new \CURLFile($filePath, mime_content_type($filePath) ?: 'application/octet-stream', $fileName),
                'nama'     => $namaMahasiswa,
                'kategori' => $kategori,
                'tipe'     => $folder,
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 60);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'x-internal-key: ' . env('aiService.internalKey')
            ]);

            $responseBody = curl_exec($ch);
            $httpCode     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError    = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                log_message('error', 'Gagal menghubungi AI service (cURL error): ' . $curlError);
            } elseif ($httpCode !== 200) {
                log_message('error', 'AI Service Error Response (HTTP ' . $httpCode . '): ' . $responseBody);
            } else {
                $hasil   = json_decode($responseBody, true);
                $verdict = $hasil['verdict'] ?? 'ragu';
            }
        } catch (\Exception $e) {
            log_message('error', 'Gagal menghubungi AI service (Exception): ' . $e->getMessage());
        }

        $model = new $modelClass();
        $doc   = $model->where('sub_id', $subId)->first();
        if (! $doc) {
            return;
        }

        if ($verdict === 'sesuai') {
            $model->update(
                $doc[$prefix . '_id'], 
                [
                    $prefix . '_status' => 'verified',
                    $prefix . '_score'  => $modelClass::SCORES[$kategori] ?? 0,
                ]
            );
        } elseif ($verdict === 'tidak_sesuai') {
            $model->update($doc[$prefix . '_id'], [
                $prefix . '_status' => 'revisi',
                $prefix . '_score'  => 0,
            ]);
        }
        // 'ragu' -> tetap pending, skor tetap 0, nunggu admin

        (new ScoreResultModel())->calculateAllResults($subId);
    }

    /**
     * GET /admin/pengajuan
     * Filter: auth:admin,superadmin
     */
    public function indexAdmin()
    {
        $db = \Config\Database::connect();
        $year = $this->request->getGet('year');
        $status = $this->request->getGet('status');
        $q = trim((string) $this->request->getGet('q'));

        $builder = $db->table('submission s')
            ->select('s.sub_id, s.user_id, s.status, s.form_data, s.created_at, s.submitted_at, u.name, u.induk, u.year, u.email, sr.total_score, sr.status as score_status')
            ->join('users u', 'u.user_id = s.user_id')
            ->join('score_result sr', 'sr.sub_id = s.sub_id', 'left')
            ->where('s.status !=', 'draft')
            ->where('u.deleted_at', null);

        if ($year && $year !== 'Semua') {
            $builder->where('u.year', $year);
        }
        if ($q !== '') {
            $builder->groupStart()
                ->like('u.name', $q, 'both', null, true)
                ->orLike('u.induk', $q, 'both', null, true)
                ->groupEnd();
        }

        $allRows = $builder->orderBy('s.submitted_at', 'DESC')->get()->getResultArray();

        $prestasiDocs = $db->table('prestasi')->get()->getResultArray();
        $organisasiDocs = $db->table('organisasi')->get()->getResultArray();
        $bahasaDocs = $db->table('bahasa')->get()->getResultArray();
        $ipkDocs = $db->table('ipk')->get()->getResultArray();
        $skpiDocs = $db->table('skpi')->get()->getResultArray();

        $presBySub = []; foreach ($prestasiDocs as $p) $presBySub[$p['sub_id']] = $p;
        $orgBySub = []; foreach ($organisasiDocs as $o) $orgBySub[$o['sub_id']] = $o;
        $bahBySub = []; foreach ($bahasaDocs as $b) $bahBySub[$b['sub_id']] = $b;
        $ipkBySub = []; foreach ($ipkDocs as $i) $ipkBySub[$i['sub_id']] = $i;
        $skpiBySub = []; foreach ($skpiDocs as $s) $skpiBySub[$s['sub_id']] = $s;

        $stats = [
            'total' => count($allRows),
            'perlu_ditinjau' => 0,
            'perlu_revisi' => 0,
            'disetujui' => 0,
        ];

        $mapped = [];
        foreach ($allRows as $row) {
            $subId = (int) $row['sub_id'];
            $pres = $presBySub[$subId] ?? null;
            $org = $orgBySub[$subId] ?? null;
            $bah = $bahBySub[$subId] ?? null;
            $ipk = $ipkBySub[$subId] ?? null;
            $skpi = $skpiBySub[$subId] ?? null;

            $uploadedCount = ($ipk ? 1 : 0) + ($skpi ? 1 : 0) + ($pres ? 1 : 0) + ($org ? 1 : 0) + ($bah ? 1 : 0);
            $completeness = "{$uploadedCount}/5 Lengkap";

            $hasRevisi = ($pres && $pres['pres_status'] === 'revisi')
                || ($org && $org['org_status'] === 'revisi')
                || ($bah && $bah['bah_status'] === 'revisi');

            $allVerified = ($pres && $pres['pres_status'] === 'verified')
                && ($org && $org['org_status'] === 'verified')
                && ($bah && $bah['bah_status'] === 'verified');

            if ($row['status'] === 'top3' || $row['status'] === 'ranked' || $allVerified) {
                $statusLabel = 'Disetujui';
                $statusType = 'approved';
                $action = 'Lihat Detail';
                $actionType = 'detail';
                $stats['disetujui']++;
            } elseif ($hasRevisi) {
                $statusLabel = 'Perlu Revisi';
                $statusType = 'revision';
                $action = 'Tinjau Revisi';
                $actionType = 'revisi';
                $stats['perlu_revisi']++;
            } elseif ($row['status'] === 'ditolak') {
                $statusLabel = 'Ditolak';
                $statusType = 'rejected';
                $action = 'Lihat Detail';
                $actionType = 'detail';
            } else {
                $statusLabel = 'Perlu Ditinjau';
                $statusType = 'review';
                $action = 'Verifikasi Pengajuan';
                $actionType = 'verify';
                $stats['perlu_ditinjau']++;
            }

            if ($status && $status !== 'Semua Status' && $status !== 'all') {
                if (strtolower($status) !== strtolower($statusLabel)) {
                    continue;
                }
            }

            $dateStr = $row['submitted_at'] ?: $row['created_at'];
            $timestamp = strtotime((string) $dateStr);
            $formattedDate = $timestamp ? date('d M Y, H:i', $timestamp) : '-';

            $parts = explode(' ', trim($row['name']));
            $initials = strtoupper(substr($parts[0] ?? 'M', 0, 1) . substr($parts[1] ?? '', 0, 1));

            $mapped[] = [
                'sub_id'           => $subId,
                'nim'              => $row['induk'],
                'name'             => $row['name'],
                'email'            => $row['email'],
                'initials'         => $initials,
                'prodi'            => 'S1 Informatika',
                'angkatan'         => $row['year'],
                'kelengkapan'      => $completeness,
                'completenessType' => $uploadedCount === 5 ? 'complete' : 'incomplete',
                'status'           => $statusLabel,
                'statusType'       => $statusType,
                'tanggal'          => $formattedDate,
                'action'           => $action,
                'actionType'       => $actionType,
                'total_score'      => $row['total_score'],
            ];
        }

        return $this->response->setJSON([
            'success' => true,
            'data'    => $mapped,
            'stats'   => $stats,
        ]);
    }

    /**
     * GET /admin/pengajuan/{subIdOrNim}
     * Filter: auth:admin,superadmin
     */
    public function detailAdmin($idOrNim)
    {
        $db = \Config\Database::connect();
        $builder = $db->table('submission s')
            ->select('s.*, u.name, u.induk, u.year, u.email, u.contact, u.picture, sr.ipk_result, sr.skpi_result, sr.pres_result, sr.org_result, sr.bah_result, sr.pv_result, sr.total_score')
            ->join('users u', 'u.user_id = s.user_id')
            ->join('score_result sr', 'sr.sub_id = s.sub_id', 'left');

        if (is_numeric($idOrNim) && strlen((string) $idOrNim) < 6) {
            $builder->where('s.sub_id', (int) $idOrNim);
        } else {
            $builder->where('u.induk', (string) $idOrNim);
        }

        $row = $builder->get()->getRowArray();
        if (! $row) {
            return $this->response->setStatusCode(404)->setJSON([
                'success' => false,
                'message' => 'Pengajuan tidak ditemukan.',
            ]);
        }

        $subId = (int) $row['sub_id'];
        $docs = [
            'ipk'        => $db->table('ipk')->where('sub_id', $subId)->get()->getRowArray(),
            'skpi'       => $db->table('skpi')->where('sub_id', $subId)->get()->getRowArray(),
            'prestasi'   => $db->table('prestasi')->where('sub_id', $subId)->get()->getRowArray(),
            'organisasi' => $db->table('organisasi')->where('sub_id', $subId)->get()->getRowArray(),
            'bahasa'     => $db->table('bahasa')->where('sub_id', $subId)->get()->getRowArray(),
        ];

        foreach (['prestasi', 'organisasi', 'bahasa'] as $cat) {
            $prefix = ['prestasi' => 'pres', 'organisasi' => 'org', 'bahasa' => 'bah'][$cat];
            if ($docs[$cat] && ! empty($docs[$cat][$prefix . '_file'])) {
                $docs[$cat]['file_url'] = base_url("admin/document/{$subId}/{$cat}");
            }
        }

        $formData = $row['form_data'] ? json_decode($row['form_data'], true) : [];

        $pvResponses = $db->table('pv_responses')->where('sub_id', $subId)->get()->getResultArray();
        $lecturers = [];
        if ($row['lecturer_reviewer_1']) {
            $u = (new UserModel())->select('user_id, name, email, is_kaprodi')->find($row['lecturer_reviewer_1']);
            if ($u) $lecturers[] = $u;
        }
        if ($row['lecturer_reviewer_2']) {
            $u = (new UserModel())->select('user_id, name, email, is_kaprodi')->find($row['lecturer_reviewer_2']);
            if ($u) $lecturers[] = $u;
        }

        $parts = explode(' ', trim($row['name']));
        $initials = strtoupper(substr($parts[0] ?? 'M', 0, 1) . substr($parts[1] ?? '', 0, 1));

        return $this->response->setJSON([
            'success' => true,
            'data'    => [
                'sub_id'       => $subId,
                'user_id'      => (int) $row['user_id'],
                'name'         => $row['name'],
                'nim'          => $row['induk'],
                'email'        => $row['email'],
                'contact'      => $row['contact'],
                'initials'     => $initials,
                'prodi'        => 'S1 Informatika',
                'angkatan'     => $row['year'],
                'status'       => $row['status'],
                'submitted_at' => $row['submitted_at'],
                'form_data'    => $formData,
                'documents'    => $docs,
                'score'        => [
                    'ipk'         => $row['ipk_result'],
                    'skpi'        => $row['skpi_result'],
                    'prestasi'    => $row['pres_result'],
                    'organisasi'  => $row['org_result'],
                    'bahasa'      => $row['bah_result'],
                    'pv'          => $row['pv_result'],
                    'total_score' => $row['total_score'],
                ],
                'reviewers'    => [
                    'peer_1'      => $row['peer_reviewer_1'],
                    'peer_2'      => $row['peer_reviewer_2'],
                    'peer_3'      => $row['peer_reviewer_3'],
                    'lecturers'   => $lecturers,
                    'responses'   => $pvResponses,
                ],
            ],
        ]);
    }

    /**
     * GET /admin/document/{subId}/{category}
     * Filter: auth:admin,superadmin
     */
    public function downloadDocumentAdmin(int $subId, string $category)
    {
        $prefix = ['prestasi' => 'pres', 'organisasi' => 'org', 'bahasa' => 'bah'][$category] ?? null;
        if (! $prefix) {
            return $this->response->setStatusCode(404)->setJSON(['success' => false, 'message' => 'Kategori tidak valid.']);
        }

        $doc = db_connect()->table($category)->where('sub_id', $subId)->get()->getRowArray();
        $name = $doc[$prefix . '_file'] ?? '';
        $path = WRITEPATH . 'uploads/' . $category . '/' . basename($name);

        if (! $name || ! is_file($path)) {
            return $this->response->setStatusCode(404)->setJSON(['success' => false, 'message' => 'Dokumen tidak ditemukan di server.']);
        }

        return $this->response->download($path, null)->setFileName($category . '_' . $subId . '.' . pathinfo($name, PATHINFO_EXTENSION));
    }

    /**
     * PUT /admin/pengajuan/{subId}/status
     * Body: { "status": "pending_reviewed|top3|ditolak|revisi", "notes": "..." }
     * Filter: auth:admin,superadmin
     */
    public function updateStatusAdmin(int $subId)
    {
        $submissionModel = new SubmissionModel();
        $submission = $submissionModel->find($subId);
        if (! $submission) {
            return $this->response->setStatusCode(404)->setJSON(['success' => false, 'message' => 'Pengajuan tidak ditemukan.']);
        }

        $input = $this->request->getJSON(true) ?? [];
        $status = $input['status'] ?? null;
        $allowed = ['draft', 'submitted', 'pending_reviewed', 'top3', 'ranked', 'ditolak'];
        if (! in_array($status, $allowed, true)) {
            return $this->response->setStatusCode(422)->setJSON(['success' => false, 'message' => 'Status tidak valid.']);
        }

        $updateData = ['status' => $status];
        if (isset($input['notes'])) {
            $updateData['rejection_notes'] = $input['notes'];
        }
        $updateData['reviewed_by'] = session()->get('user_id');

        $submissionModel->update($subId, $updateData);

        (new LogModel())->recordSystemLog((int) session()->get('user_id'), "Ubah status pengajuan #{$subId} menjadi {$status}");

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Status pengajuan berhasil diperbarui.',
            'data'    => ['sub_id' => $subId, 'status' => $status],
        ]);
    }

    /**
     * GET /admin/pradita-value
     * Filter: auth:admin,superadmin
     */
    public function praditaValueAdmin()
    {
        $db = \Config\Database::connect();
        $rows = $db->table('submission s')
            ->select('s.*, u.name, u.induk, u.year, u.email, sr.total_score, sr.pv_result')
            ->join('users u', 'u.user_id = s.user_id')
            ->join('score_result sr', 'sr.sub_id = s.sub_id', 'left')
            ->whereIn('s.status', ['top3', 'ranked', 'pending_reviewed', 'submitted'])
            ->where('u.deleted_at', null)
            ->orderBy('u.year', 'ASC')
            ->orderBy('sr.total_score', 'DESC')
            ->get()
            ->getResultArray();

        $allResponses = $db->table('pv_responses')->get()->getResultArray();
        $respBySub = [];
        foreach ($allResponses as $r) {
            $respBySub[$r['sub_id']][] = $r;
        }

        $users = (new UserModel())->findAll();
        $userMap = [];
        foreach ($users as $u) {
            $userMap[$u['user_id']] = $u;
        }

        $finalists = [];
        $rankByYear = [];

        foreach ($rows as $row) {
            $subId = (int) $row['sub_id'];
            $yr = $row['year'];
            $rankByYear[$yr] = ($rankByYear[$yr] ?? 0) + 1;
            $rank = $rankByYear[$yr];

            $parts = explode(' ', trim($row['name']));
            $initials = strtoupper(substr($parts[0] ?? 'M', 0, 1) . substr($parts[1] ?? '', 0, 1));

            $responses = $respBySub[$subId] ?? [];
            $sentCount = count($responses);
            $submittedCount = count(array_filter($responses, fn($r) => $r['status'] === 'submitted'));

            $peersCount = ($row['peer_reviewer_1'] ? 1 : 0) + ($row['peer_reviewer_2'] ? 1 : 0) + ($row['peer_reviewer_3'] ? 1 : 0);
            $lecturerCount = ($row['lecturer_reviewer_1'] ? 1 : 0) + ($row['lecturer_reviewer_2'] ? 1 : 0);

            if ($submittedCount >= 5 && $sentCount >= 5) {
                $status = 'Selesai';
                $statusType = 'completed';
            } elseif ($sentCount > 0) {
                $status = 'Penilaian Berlangsung';
                $statusType = 'progress';
            } elseif ($peersCount === 3 && $lecturerCount === 2) {
                $status = 'Siap Dikirim';
                $statusType = 'ready';
            } else {
                $status = 'Menunggu Data Rekan Sejawat';
                $statusType = 'waiting';
            }

            $kaprodi = $userMap[$row['lecturer_reviewer_1']] ?? null;
            $dosen2 = $userMap[$row['lecturer_reviewer_2']] ?? null;

            $finalists[] = [
                'sub_id'         => $subId,
                'id'             => $subId,
                'rank'           => $rank,
                'initials'       => $initials,
                'name'           => $row['name'],
                'nim'            => $row['induk'],
                'prodi'          => 'S1 Informatika',
                'angkatan'       => $row['year'],
                'tahap1'         => (float) ($row['total_score'] ?? 0),
                'peers'          => $peersCount,
                'lecturers'      => $lecturerCount,
                'formsSent'      => $sentCount,
                'responses'      => $submittedCount,
                'status'         => $status,
                'statusType'     => $statusType,
                'kaprodi'        => $kaprodi ? ['id' => $kaprodi['user_id'], 'name' => $kaprodi['name'], 'email' => $kaprodi['email']] : null,
                'dosen2'         => $dosen2 ? ['id' => $dosen2['user_id'], 'name' => $dosen2['name'], 'email' => $dosen2['email']] : null,
                'peer1'          => $row['peer_reviewer_1'],
                'peer2'          => $row['peer_reviewer_2'],
                'peer3'          => $row['peer_reviewer_3'],
                'evaluators'     => $responses,
            ];
        }

        return $this->response->setJSON([
            'success' => true,
            'data'    => $finalists,
        ]);
    }

    /**
     * POST /admin/pengajuan/{subId}/pv-send
     * Filter: auth:admin,superadmin
     */
    public function sendPvAdmin(int $subId)
    {
        $this->dispatchQuestionnairesIfReady($subId);

        $db = \Config\Database::connect();
        $responses = $db->table('pv_responses')->where('sub_id', $subId)->get()->getResultArray();
        $submission = (new SubmissionModel())->find($subId);
        $student = (new UserModel())->find($submission['user_id'] ?? 0);
        $mailer = new \App\Libraries\PvMailer();

        $sent = 0;
        foreach ($responses as $resp) {
            if ($resp['status'] === 'pending') {
                $ok = $mailer->sendEvaluatorLink($resp['reviewer'], $resp['role'], $student['name'] ?? 'Mahasiswa', $resp['token']);
                if ($ok) $sent++;
            }
        }

        return $this->response->setJSON([
            'success' => true,
            'message' => "Link penilaian berhasil diproses ({$sent} email terkirim).",
            'sent_count' => $sent,
        ]);
    }

    /**
     * GET /admin/dosen
     * Filter: auth:admin,superadmin
     */
    public function listDosen()
    {
        $dosen = (new UserModel())
            ->select('user_id, name, email, is_kaprodi')
            ->where('role', 'dosen')
            ->where('is_active', true)
            ->where('deleted_at', null)
            ->findAll();

        return $this->response->setJSON([
            'success' => true,
            'data'    => $dosen,
        ]);
    }
}

