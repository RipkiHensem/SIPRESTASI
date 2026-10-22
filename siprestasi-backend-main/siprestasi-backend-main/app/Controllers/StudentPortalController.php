<?php

namespace App\Controllers;

use App\Models\{UserModel, SubmissionModel, MasterDataModel, PeriodeModel};

class StudentPortalController extends BaseController
{
    public function show()
    {
        $user = (new UserModel())->select('user_id,name,email,induk,year')->find(session('user_id'));
        if (!$user) {
            return $this->response->setStatusCode(401)->setJSON(['success' => false, 'message' => 'Akun tidak tersedia. Silakan masuk kembali.']);
        }
        $submission = (new SubmissionModel())->findActiveByUser((int) session('user_id'));
        $db = db_connect();
        $documents = [];
        foreach (['ipk', 'skpi', 'prestasi', 'organisasi', 'bahasa'] as $table) {
            $documents[$table] = $submission ? $db->table($table)->where('sub_id', $submission['sub_id'])->get()->getRowArray() : null;
        }
        $score = $submission ? $db->table('score_result')->where('sub_id', $submission['sub_id'])->get()->getRowArray() : null;
        // Reviewer tokens and individual scores must never leave this endpoint.
        $reviewers = $submission ? $db->table('pv_responses')->select('reviewer,role,status')->where('sub_id', $submission['sub_id'])->get()->getResultArray() : [];
        $lecturers = [];
        foreach ([1, 2] as $index) {
            $id = $submission['lecturer_reviewer_' . $index] ?? null;
            $lecturers[] = $id ? (new UserModel())->select('user_id,name,email')->find($id) : null;
        }
        $period = (new PeriodeModel())->getCurrent();
        $rank = null;
        if ($submission && $score && !empty($period['is_closed']) && $submission['status'] !== 'draft') {
            $rank = 1 + $db->table('score_result sr')->join('submission s', 's.sub_id = sr.sub_id')
                ->join('users u', 'u.user_id = s.user_id')->where('u.year', $user['year'])
                ->whereIn('s.status', ['submitted', 'pending_reviewed', 'top3', 'ranked'])
                ->where('sr.total_score >', $score['total_score'])->countAllResults();
        }
        return $this->response->setJSON(['success' => true, 'data' => [
            'user' => $user, 'submission' => $submission, 'documents' => $documents,
            'master' => (new MasterDataModel())->findLatestByInduk($user['induk']),
            'score' => $score, 'rank' => $rank, 'reviewers' => $reviewers,
            'lecturers' => $lecturers, 'period' => $period,
        ]]);
    }

    public function saveForm()
    {
        $model = new SubmissionModel();
        $submission = $model->findActiveByUser((int) session('user_id'));
        if (!$submission) {
            return $this->response->setStatusCode(409)->setJSON(['success' => false, 'message' => 'Form hanya dapat disimpan pada pengajuan draft.']);
        }
        $input = $this->request->getJSON(true) ?? [];
        if (!is_array($input)) {
            return $this->response->setStatusCode(422)->setJSON(['success' => false, 'message' => 'Form harus berupa objek JSON.']);
        }
        $allowed = ['hasPrestasi','namaPrestasi','tingkatPrestasi','tahunPrestasi','penyelenggara',
            'hasOrganisasi','namaOrganisasi','tingkatOrganisasi','jabatan','periode',
            'hasBahasa','bahasa','tingkatSertifikat','skor','tanggalTes','lembagaPenerbit','tanggalKedaluwarsa'];
        $form = [];
        foreach ($allowed as $key) {
            $value = $input[$key] ?? '';
            if (!is_string($value) || mb_strlen($value) > 500) {
                return $this->response->setStatusCode(422)->setJSON(['success' => false, 'message' => 'Isi form tidak valid.']);
            }
            $form[$key] = $value;
        }
        if ($submission['status'] !== 'draft') {
            $existing = json_decode($submission['form_data'] ?? '{}', true) ?: [];
            $groups = [
                'prestasi' => ['pres', ['hasPrestasi','namaPrestasi','tingkatPrestasi','tahunPrestasi','penyelenggara']],
                'organisasi' => ['org', ['hasOrganisasi','namaOrganisasi','tingkatOrganisasi','jabatan','periode']],
                'bahasa' => ['bah', ['hasBahasa','bahasa','tingkatSertifikat','skor','tanggalTes','lembagaPenerbit','tanggalKedaluwarsa']],
            ];
            foreach ($groups as $table => [$prefix, $keys]) {
                $doc = db_connect()->table($table)->where('sub_id', $submission['sub_id'])->get()->getRowArray();
                if (($doc[$prefix . '_status'] ?? '') !== 'revisi') {
                    foreach ($keys as $key) $form[$key] = $existing[$key] ?? '';
                }
            }
        }
        $model->update($submission['sub_id'], ['form_data' => json_encode($form)]);
        return $this->response->setJSON(['success' => true]);
    }

    public function publicStatus()
    {
        // No public final-results publication exists yet. Never publish sample winners.
        return $this->response->setJSON(['success' => true, 'data' => [
            'period' => (new PeriodeModel())->getCurrent(), 'rankings' => [], 'published' => false,
        ]]);
    }

    public function document(string $category)
    {
        $prefix = ['prestasi' => 'pres', 'organisasi' => 'org', 'bahasa' => 'bah'][$category] ?? null;
        $sub = (new SubmissionModel())->findActiveByUser((int) session('user_id'));
        $doc = $prefix && $sub ? db_connect()->table($category)->where('sub_id', $sub['sub_id'])->get()->getRowArray() : null;
        $name = $doc[$prefix . '_file'] ?? '';
        $path = WRITEPATH . 'uploads/' . $category . '/' . basename($name);
        if (!$name || !is_file($path)) {
            return $this->response->setStatusCode(404)->setJSON(['success' => false, 'message' => 'Dokumen tidak ditemukan.']);
        }
        return $this->response->download($path, null)->setFileName($category . '.' . pathinfo($name, PATHINFO_EXTENSION));
    }

    public function removeDocument(string $category)
    {
        $prefix = ['prestasi' => 'pres', 'organisasi' => 'org', 'bahasa' => 'bah'][$category] ?? null;
        $sub = (new SubmissionModel())->findActiveByUser((int) session('user_id'));
        if (!$prefix || !$sub || $sub['status'] !== 'draft') {
            return $this->response->setStatusCode(409)->setJSON(['success' => false, 'message' => 'Hanya dokumen draft yang dapat dihapus.']);
        }
        $db = db_connect();
        $doc = $db->table($category)->where('sub_id', $sub['sub_id'])->get()->getRowArray();
        if ($doc) {
            $db->table($category)->where('sub_id', $sub['sub_id'])->delete();
            $path = WRITEPATH . 'uploads/' . $category . '/' . basename($doc[$prefix . '_file']);
            if (is_file($path)) unlink($path);
            (new \App\Models\ScoreResultModel())->calculateAllResults((int) $sub['sub_id']);
        }
        return $this->response->setJSON(['success' => true]);
    }
}
