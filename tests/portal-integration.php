<?php
// Run with XAMPP PHP. All fixtures are rolled back; no emails or AI calls are made.
define('FCPATH', dirname(__DIR__) . '/siprestasi-backend-main/siprestasi-backend-main/public/');
define('ENVIRONMENT', 'development');
require FCPATH . '../app/Config/Paths.php';
$paths = new Config\Paths();
require $paths->systemDirectory . '/Boot.php';
CodeIgniter\Boot::bootConsole($paths);

function check(bool $condition, string $message): void {
    if (!$condition) throw new RuntimeException($message);
}
function invokeController(string $class, string $method, array $input = [], bool $json = true): array {
    $request = new CodeIgniter\HTTP\IncomingRequest(config('App'), new CodeIgniter\HTTP\URI('http://localhost/'), $json ? json_encode($input) : null, new CodeIgniter\HTTP\UserAgent());
    $request->setMethod($json ? 'PUT' : 'POST');
    if ($json) $request->setHeader('Content-Type', 'application/json');
    else $request->setGlobal('post', $input);
    $response = new CodeIgniter\HTTP\Response(config('App'));
    $controller = new $class();
    $controller->initController($request, $response, service('logger'));
    $result = $controller->$method();
    return [$result->getStatusCode(), json_decode($result->getBody(), true)];
}
$db = db_connect();
foreach ($db->query('SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()')->getResultArray() as $table) {
    check(strcasecmp($table['ENGINE'] ?? '', 'InnoDB') === 0, 'Tests require transactional InnoDB tables.');
}
$db->transBegin();
$exit = 0;
try {
    $suffix = bin2hex(random_bytes(5));
    $email = 'integration-' . $suffix . '@example.invalid';
    $password = bin2hex(random_bytes(16));
    $db->table('users')->insert(['name' => 'Integration Test', 'email' => $email,
        'password' => password_hash($password, PASSWORD_DEFAULT), 'induk' => $suffix,
        'year' => '2099', 'role' => 'mahasiswa', 'is_active' => 1, 'status_verifikasi' => 'terverifikasi']);
    $userId = $db->insertID();
    session()->set(['user_id' => $userId, 'email' => $email, 'role' => 'mahasiswa', 'isLoggedIn' => true]);
    [$status, $snapshot] = invokeController(App\Controllers\StudentPortalController::class, 'show');
    check($status === 200 && $snapshot['data']['user']['name'] === 'Integration Test', 'Own profile must load.');
    check(!isset($snapshot['data']['user']['password']), 'Password must not be exposed.');
    check($snapshot['data']['submission'] === null && $snapshot['data']['rank'] === null, 'New accounts must not have fabricated results.');
    $db->table('periode_pendaftaran')->insert(['tahun_ajaran' => '2099/2100', 'tanggal_mulai' => date('Y-m-d'), 'tanggal_selesai' => date('Y-m-d', strtotime('+7 days')), 'is_closed' => 0]);
    [$status] = invokeController(App\Controllers\PengajuanController::class, 'create');
    check($status === 404, 'Missing academic data must block creation.');
    $db->table('master_data')->insert(['period' => '2099', 'induk' => $suffix, 'name' => 'Integration Test', 'ipk' => 3.5, 'skpi' => 100]);
    [$status, $created] = invokeController(App\Controllers\PengajuanController::class, 'create');
    check($status === 201, 'Draft must be created from master data.');
    $subId = $created['data']['sub_id'];
    [$status] = invokeController(App\Controllers\PengajuanController::class, 'create');
    check($status === 409, 'Duplicate active submissions must be rejected.');
    [$status] = invokeController(App\Controllers\StudentPortalController::class, 'saveForm', ['hasPrestasi' => 'tidak', 'hasOrganisasi' => 'tidak', 'hasBahasa' => 'tidak', 'namaPrestasi' => 'Saved draft']);
    check($status === 200, 'Draft metadata must save.');
    [$status, $snapshot] = invokeController(App\Controllers\StudentPortalController::class, 'show');
    check(json_decode($snapshot['data']['submission']['form_data'], true)['namaPrestasi'] === 'Saved draft', 'Draft must survive reload.');
    [$status] = invokeController(App\Controllers\PengajuanController::class, 'submit');
    check($status === 200, 'Complete submission must be accepted.');
    [$status, $snapshot] = invokeController(App\Controllers\StudentPortalController::class, 'show');
    check($snapshot['data']['submission']['status'] === 'submitted', 'Submitted status must come from database.');
    check($snapshot['data']['score'] !== null && $snapshot['data']['rank'] === null, 'Real score must exist without a fabricated rank.');
    [$status] = invokeController(App\Controllers\StudentPortalController::class, 'saveForm', ['namaPrestasi' => 'Not permitted']);
    $row = $db->table('submission')->where('sub_id', $subId)->get()->getRowArray();
    check(json_decode($row['form_data'], true)['namaPrestasi'] === 'Saved draft', 'Submitted metadata must stay locked.');
    [$status] = invokeController(App\Controllers\PengajuanController::class, 'setPeerReviewers', ['peer_reviewer_1' => 'one@example.invalid','peer_reviewer_2' => 'two@example.invalid','peer_reviewer_3' => 'three@example.invalid']);
    check($status === 403, 'Non-finalists must not select reviewers.');
    session()->set('user_id', $userId + 1000000);
    [$status] = invokeController(App\Controllers\StudentPortalController::class, 'show');
    check($status === 401, 'Missing account must not expose data.');
    echo "PASS: profile isolation, draft persistence, academic validation, submit, score, metadata lock, finalist access.\n";
} catch (Throwable $error) {
    fwrite(STDERR, 'FAIL: ' . $error->getMessage() . "\n");
    $exit = 1;
} finally {
    $db->transRollback();
    if (session_status() === PHP_SESSION_ACTIVE) session()->destroy();
}
exit($exit);
