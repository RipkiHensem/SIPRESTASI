<?php
// Integration test for Admin and Superadmin backend controller endpoints.
define('FCPATH', dirname(__DIR__) . '/siprestasi-backend-main/siprestasi-backend-main/public/');
define('ENVIRONMENT', 'development');
require FCPATH . '../app/Config/Paths.php';
$paths = new Config\Paths();
require $paths->systemDirectory . '/Boot.php';
CodeIgniter\Boot::bootConsole($paths);

function check(bool $condition, string $message): void {
    if (!$condition) throw new RuntimeException($message);
}

function invokeMethod(string $class, string $method, array $input = [], string $httpMethod = 'GET', bool $json = true, array $get = [], array $args = []): array {
    $uri = 'http://localhost/';
    if (!empty($get)) {
        $uri .= '?' . http_build_query($get);
    }
    $request = new CodeIgniter\HTTP\IncomingRequest(config('App'), new CodeIgniter\HTTP\URI($uri), $json ? json_encode($input) : null, new CodeIgniter\HTTP\UserAgent());
    $request->setMethod($httpMethod);
    if ($json && in_array(strtoupper($httpMethod), ['POST', 'PUT', 'PATCH'])) {
        $request->setHeader('Content-Type', 'application/json');
    }
    if (!empty($get)) {
        $request->setGlobal('get', $get);
    }
    if (!empty($input) && !$json) {
        $request->setGlobal('post', $input);
    }
    $response = new CodeIgniter\HTTP\Response(config('App'));
    $controller = new $class();
    $controller->initController($request, $response, service('logger'));
    $result = $controller->$method(...$args);
    return [$result->getStatusCode(), json_decode($result->getBody(), true)];
}

$db = db_connect();
$db->transBegin();
$exit = 0;

try {
    // 1. Setup Admin and Superadmin users
    $suffix = bin2hex(random_bytes(4));
    $adminEmail = 'test-admin-' . $suffix . '@siprestasi.com';
    $superEmail = 'test-super-' . $suffix . '@siprestasi.com';

    $db->table('users')->insert([
        'name' => 'Admin Tester',
        'email' => $adminEmail,
        'password' => password_hash('admin12345', PASSWORD_DEFAULT),
        'role' => 'admin',
        'is_active' => 1,
        'status_verifikasi' => 'terverifikasi',
    ]);
    $adminId = $db->insertID();

    $db->table('users')->insert([
        'name' => 'Superadmin Tester',
        'email' => $superEmail,
        'password' => password_hash('super12345', PASSWORD_DEFAULT),
        'role' => 'superadmin',
        'is_active' => 1,
        'status_verifikasi' => 'terverifikasi',
    ]);
    $superId = $db->insertID();

    // 2. Test Admin access to PengajuanController
    session()->set(['user_id' => $adminId, 'email' => $adminEmail, 'role' => 'admin', 'isLoggedIn' => true]);

    [$status, $res] = invokeMethod(App\Controllers\PengajuanController::class, 'indexAdmin', [], 'GET');
    check($status === 200 && isset($res['data']), 'Admin must be able to list submissions.');

    [$status, $res] = invokeMethod(App\Controllers\PengajuanController::class, 'praditaValueAdmin', [], 'GET');
    check($status === 200 && isset($res['data']), 'Admin must be able to view Pradita Value finalists.');

    [$status, $res] = invokeMethod(App\Controllers\PengajuanController::class, 'listDosen', [], 'GET');
    check($status === 200 && isset($res['data']), 'Admin must be able to list dosen.');

    // 3. Test Superadmin Controller
    session()->set(['user_id' => $superId, 'email' => $superEmail, 'role' => 'superadmin', 'isLoggedIn' => true]);

    // List users
    [$status, $res] = invokeMethod(App\Controllers\SuperAdminController::class, 'users', [], 'GET', true, ['per_page' => 10]);
    check($status === 200 && isset($res['data']), 'Superadmin must be able to list users.');

    // Create user via SuperAdminController
    $newUserEmail = 'created-user-' . $suffix . '@siprestasi.com';
    [$status, $created] = invokeMethod(App\Controllers\SuperAdminController::class, 'create', [
        'name' => 'New Admin From Super',
        'email' => $newUserEmail,
        'role' => 'admin',
    ], 'POST', true);
    check($status === 201 && isset($created['data']['user_id']), 'Superadmin must be able to create user.');
    $createdId = $created['data']['user_id'];

    // Update status
    [$status, $res] = invokeMethod(App\Controllers\SuperAdminController::class, 'updateStatus', [
        'is_active' => false,
    ], 'PUT', true, [], [$createdId]);
    check($status === 200, 'Superadmin must be able to update user status.');
    $row = $db->table('users')->where('user_id', $createdId)->get()->getRowArray();
    check($row !== null && (int)$row['is_active'] === 0, 'Created user status must be updated to 0.');

    echo "PASS: Admin submissions, Pradita Value, dosen list, Superadmin users list, and user creation verified.\n";
} catch (Throwable $error) {
    fwrite(STDERR, 'FAIL: ' . $error->getMessage() . "\n" . $error->getTraceAsString() . "\n");
    $exit = 1;
} finally {
    $db->transRollback();
    if (session_status() === PHP_SESSION_ACTIVE) session()->destroy();
}
exit($exit);
