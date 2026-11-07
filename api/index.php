<?php
declare(strict_types=1);

define('FURULYA_API_BOOTSTRAPPED', true);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function readInput(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > 200000) {
        respond(413, ['error' => 'A kérés túl nagy.']);
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        respond(400, ['error' => 'Érvénytelen kérés.']);
    }
    return $data;
}

function validNickname($nickname): bool
{
    return is_string($nickname)
        && preg_match('/\A[\p{L}\p{N}_ -]{3,24}\z/u', $nickname) === 1;
}

function validPassword($password): bool
{
    if (!is_string($password) || strlen($password) > 72) {
        return false;
    }
    $characterCount = preg_match_all('/./us', $password);
    return $characterCount !== false && $characterCount >= 8;
}

function validProfile($profile): bool
{
    if (!is_array($profile)) {
        return false;
    }

    foreach (['coins', 'xp', 'level', 'streak', 'totalBalloonsPopped'] as $field) {
        if (!isset($profile[$field]) || !is_int($profile[$field]) || $profile[$field] < 0) {
            return false;
        }
    }

    if (
        !isset($profile['lastActiveDate'], $profile['activeSkin'])
        || !is_string($profile['lastActiveDate'])
        || strlen($profile['lastActiveDate']) > 40
        || !is_string($profile['activeSkin'])
        || strlen($profile['activeSkin']) > 80
        || !isset($profile['unlockedSkins'], $profile['achievements'], $profile['completedSongs'])
        || !is_array($profile['unlockedSkins'])
        || count($profile['unlockedSkins']) > 100
        || !is_array($profile['achievements'])
        || count($profile['achievements']) > 100
        || !is_array($profile['completedSongs'])
        || count($profile['completedSongs']) > 500
    ) {
        return false;
    }

    foreach ([$profile['unlockedSkins'], $profile['completedSongs']] as $items) {
        foreach ($items as $item) {
            if (!is_string($item) || strlen($item) > 100) {
                return false;
            }
        }
    }

    foreach ($profile['achievements'] as $achievement) {
        if (
            !is_array($achievement)
            || !isset(
                $achievement['id'],
                $achievement['title'],
                $achievement['description'],
                $achievement['icon'],
                $achievement['rewardCoins'],
                $achievement['unlocked'],
                $achievement['progress'],
                $achievement['maxProgress']
            )
            || !is_string($achievement['id'])
            || !is_string($achievement['title'])
            || !is_string($achievement['description'])
            || !is_string($achievement['icon'])
            || !is_int($achievement['rewardCoins'])
            || !is_bool($achievement['unlocked'])
            || !is_int($achievement['progress'])
            || !is_int($achievement['maxProgress'])
        ) {
            return false;
        }
    }

    return true;
}

function encodeProfile($profile): string
{
    if (!validProfile($profile)) {
        respond(400, ['error' => 'A játékhaladás adatai érvénytelenek.']);
    }
    $encoded = json_encode($profile, JSON_UNESCAPED_UNICODE);
    if ($encoded === false || strlen($encoded) > 150000) {
        respond(400, ['error' => 'A játékhaladás túl nagy vagy érvénytelen.']);
    }
    return $encoded;
}

function requirePlayerId(): int
{
    if (!isset($_SESSION['player_id']) || !is_int($_SESSION['player_id'])) {
        respond(401, ['error' => 'A művelethez előbb be kell jelentkezni.']);
    }
    return $_SESSION['player_id'];
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $originHost = parse_url($origin, PHP_URL_HOST);
    $requestHost = parse_url('https://' . ($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST);
    if (!$originHost || !$requestHost || strcasecmp($originHost, $requestHost) !== 0) {
        respond(403, ['error' => 'A kérés eredete nem engedélyezett.']);
    }
}

session_name('furulya_session');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Strict',
]);
ini_set('session.use_strict_mode', '1');
session_start();

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($action === 'me') {
    if ($method !== 'GET') {
        respond(405, ['error' => 'Nem támogatott kérés.']);
    }
    if (!isset($_SESSION['player_id']) || !is_int($_SESSION['player_id'])) {
        respond(200, ['authenticated' => false]);
    }
} elseif ($method !== 'POST') {
    respond(405, ['error' => 'Nem támogatott kérés.']);
}

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    error_log('Furulya API: api/config.php is missing.');
    respond(503, ['error' => 'A fiókrendszer még nincs beállítva.']);
}

try {
    $config = require $configPath;
    foreach (['db_host', 'db_name', 'db_user', 'db_password'] as $key) {
        if (!is_array($config) || !isset($config[$key]) || !is_string($config[$key])) {
            error_log('Furulya API: database configuration is incomplete.');
            respond(503, ['error' => 'Az adatbázis beállítása hiányos.']);
        }
    }
    $pdo = new PDO(
        'mysql:host=' . $config['db_host'] . ';dbname=' . $config['db_name'] . ';charset=utf8mb4',
        $config['db_user'],
        $config['db_password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );

    if ($action === 'me') {
        $query = $pdo->prepare('SELECT nickname, profile_json FROM players WHERE id = ?');
        $query->execute([requirePlayerId()]);
        $player = $query->fetch();
        if (!$player) {
            session_destroy();
            respond(200, ['authenticated' => false]);
        }
        $profile = json_decode($player['profile_json'], true);
        if (!validProfile($profile)) {
            error_log('Furulya API: stored profile is invalid.');
            respond(500, ['error' => 'A mentett játékhaladás nem olvasható.']);
        }
        respond(200, [
            'authenticated' => true,
            'user' => ['nickname' => $player['nickname']],
            'profile' => $profile,
        ]);
    }

    $input = readInput();

    if ($action === 'register') {
        $nicknameInput = $input['nickname'] ?? null;
        $nickname = is_string($nicknameInput) ? trim($nicknameInput) : '';
        $password = $input['password'] ?? null;
        if (!validNickname($nickname)) {
            respond(400, ['error' => 'A becenév 3–24 karakter legyen (betű, szám, szóköz, kötőjel vagy aláhúzás).']);
        }
        if (!validPassword($password)) {
            respond(400, ['error' => 'A jelszó legalább 8 karakter, legfeljebb 72 bájt hosszú legyen.']);
        }
        $profileJson = encodeProfile($input['profile'] ?? null);
        $insert = $pdo->prepare(
            'INSERT INTO players (nickname, password_hash, profile_json) VALUES (?, ?, ?)'
        );
        try {
            $insert->execute([$nickname, password_hash($password, PASSWORD_DEFAULT), $profileJson]);
        } catch (PDOException $error) {
            if ($error->getCode() === '23000') {
                respond(409, ['error' => 'Ez a becenév már foglalt. Válassz másikat!']);
            }
            throw $error;
        }
        session_regenerate_id(true);
        $_SESSION['player_id'] = (int)$pdo->lastInsertId();
        respond(201, [
            'authenticated' => true,
            'user' => ['nickname' => $nickname],
            'profile' => $input['profile'],
        ]);
    }

    if ($action === 'login') {
        $nicknameInput = $input['nickname'] ?? null;
        $nickname = is_string($nicknameInput) ? trim($nicknameInput) : '';
        $password = $input['password'] ?? null;
        if (!validNickname($nickname) || !is_string($password)) {
            respond(400, ['error' => 'Add meg a becenevedet és a jelszavadat.']);
        }
        $query = $pdo->prepare('SELECT id, nickname, password_hash, profile_json FROM players WHERE nickname = ?');
        $query->execute([$nickname]);
        $player = $query->fetch();
        if (!$player || !password_verify($password, $player['password_hash'])) {
            respond(401, ['error' => 'Hibás becenév vagy jelszó.']);
        }
        session_regenerate_id(true);
        $_SESSION['player_id'] = (int)$player['id'];
        $profile = json_decode($player['profile_json'], true);
        if (!validProfile($profile)) {
            error_log('Furulya API: stored profile is invalid.');
            respond(500, ['error' => 'A mentett játékhaladás nem olvasható.']);
        }
        respond(200, [
            'authenticated' => true,
            'user' => ['nickname' => $player['nickname']],
            'profile' => $profile,
        ]);
    }

    if ($action === 'save-profile') {
        $profileJson = encodeProfile($input['profile'] ?? null);
        $update = $pdo->prepare('UPDATE players SET profile_json = ? WHERE id = ?');
        $update->execute([$profileJson, requirePlayerId()]);
        if ($update->rowCount() === 0) {
            $exists = $pdo->prepare('SELECT 1 FROM players WHERE id = ?');
            $exists->execute([$_SESSION['player_id']]);
            if (!$exists->fetchColumn()) {
                respond(401, ['error' => 'A fiók nem található. Lépj be újra.']);
            }
        }
        respond(200, ['saved' => true]);
    }

    if ($action === 'logout') {
        requirePlayerId();
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires' => time() - 42000,
                'path' => $params['path'],
                'secure' => true,
                'httponly' => true,
                'samesite' => 'Strict',
            ]);
        }
        session_destroy();
        respond(200, ['loggedOut' => true]);
    }

    respond(404, ['error' => 'Ismeretlen művelet.']);
} catch (PDOException $error) {
    error_log('Furulya API database error: ' . $error->getMessage());
    respond(503, ['error' => 'Az adatbázis most nem érhető el. Ellenőrizd a beállításokat.']);
}
