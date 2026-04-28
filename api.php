<?php
// api.php - Complete Working Version with Company Settings
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection with your credentials
try {
    $db = new PDO('mysql:host=localhost;dbname=u245697138_softifyx;charset=utf8', 'u245697138_softifyx', 'Suhailahmad@123');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    die(json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]));
}

// Test connection
if (isset($_GET['test'])) {
    echo json_encode(['success' => true, 'message' => 'API is working']);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'getCategories':
        getCategories($db);
        break;
    case 'getUsers':
        getUsers($db);
        break;
    case 'getAssignments':
        getAssignments($db);
        break;
    case 'getHistory':
        getHistory($db);
        break;
    case 'getTaskDateRanges':
        getTaskDateRanges($db);
        break;
    case 'saveUser':
        saveUser($db);
        break;
    case 'deleteUser':
        deleteUser($db);
        break;
    case 'saveCategory':
        saveCategory($db);
        break;
    case 'updateCategory':
        updateCategory($db);
        break;
    case 'deleteCategory':
        deleteCategory($db);
        break;
    case 'saveSubcategory':
        saveSubcategory($db);
        break;
    case 'updateSubcategory':
        updateSubcategory($db);
        break;
    case 'deleteSubcategory':
        deleteSubcategory($db);
        break;
    case 'saveTask':
        saveTask($db);
        break;
    case 'updateTask':
        updateTask($db);
        break;
    case 'deleteTask':
        deleteTask($db);
        break;
    case 'saveAssignment':
        saveAssignment($db);
        break;
    case 'saveAllAssignments':
        saveAllAssignments($db);
        break;
    case 'saveDateRange':
        saveDateRange($db);
        break;
    case 'saveHistory':
        saveHistory($db);
        break;
    case 'login':
        login($db);
        break;
    case 'sendOTP':
        sendOTP($db);
        break;
    case 'verifyOTP':
        verifyOTP($db);
        break;
    case 'restoreCategories':
        restoreCategories($db);
        break;
    case 'restoreUsers':
        restoreUsers($db);
        break;
    case 'restoreHistory':
        restoreHistory($db);
        break;
    case 'restoreAssignments':
        restoreAssignments($db);
        break;
    case 'restoreDateRanges':
        restoreDateRanges($db);
        break;
    // ========== NEW COMPANY SETTINGS ACTIONS ==========
    case 'getCompanies':
        getCompanies($db);
        break;
    case 'saveCompany':
        saveCompany($db);
        break;
    case 'deleteCompany':
        deleteCompany($db);
        break;
    case 'getCompanySettings':
        getCompanySettings($db);
        break;
    case 'saveCompanySettings':
        saveCompanySettings($db);
        break;
    case 'saveCompanyLogo':
        saveCompanyLogo($db);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

// ========== EMAIL FUNCTION ==========
function sendEmailOTP($email, $otp)
{
    $to = $email;
    $subject = "Seastone Password Reset OTP";
    $message = "
    <html>
    <head><title>Password Reset OTP</title></head>
    <body>
        <h2>Seastone Pipe Industry</h2>
        <p>Your OTP for password reset is: <strong>$otp</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br>
        <p>Regards,<br>Seastone Team</p>
    </body>
    </html>
    ";

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8\r\n";
    $headers .= "From: noreply@seastone.com\r\n";

    return mail($to, $subject, $message, $headers);
}

// ========== SEND OTP ==========
function sendOTP($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);
    $email = $data['email'];

    try {
        // First check if password_resets table exists, if not create it
        try {
            $db->query("SELECT 1 FROM password_resets LIMIT 1");
        } catch (Exception $e) {
            // Table doesn't exist, create it
            $db->exec("CREATE TABLE IF NOT EXISTS password_resets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL,
                otp VARCHAR(6) NOT NULL,
                expires_at DATETIME NOT NULL,
                used TINYINT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        }

        $stmt = $db->prepare("SELECT id, phone FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Email not found']);
            return;
        }

        $otp = rand(100000, 999999);
        $expires = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        $stmt = $db->prepare("DELETE FROM password_resets WHERE email = ?");
        $stmt->execute([$email]);

        $stmt = $db->prepare("INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?)");
        $stmt->execute([$email, $otp, $expires]);

        $emailSent = sendEmailOTP($email, $otp);

        echo json_encode([
            'success' => true,
            'email_sent' => $emailSent,
            'message' => 'OTP sent via Email'
        ]);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== VERIFY OTP ==========
function verifyOTP($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $stmt = $db->prepare("SELECT * FROM password_resets WHERE email = ? AND otp = ? AND used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1");
        $stmt->execute([$data['email'], $data['otp']]);

        if ($stmt->rowCount() > 0) {
            $reset = $stmt->fetch(PDO::FETCH_ASSOC);
            $stmt = $db->prepare("UPDATE password_resets SET used = 1 WHERE id = ?");
            $stmt->execute([$reset['id']]);

            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid OTP']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== GET CATEGORIES ==========
function getCategories($db)
{
    try {
        $stmt = $db->query("SELECT * FROM categories ORDER BY id");
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $result = [];
        foreach ($categories as $cat) {
            $stmt = $db->prepare("SELECT * FROM subcategories WHERE category_id = ? ORDER BY id");
            $stmt->execute([$cat['id']]);
            $subcategories = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $subs = [];
            foreach ($subcategories as $sub) {
                $stmt = $db->prepare("SELECT * FROM tasks WHERE subcategory_id = ? ORDER BY code");
                $stmt->execute([$sub['id']]);
                $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $items = [];
                foreach ($tasks as $task) {
                    $items[] = [
                        'id' => $task['code'],
                        'name' => $task['name'],
                        'description' => $task['urdu'],
                        'type' => $task['type'] ?? 'daily',
                        'dueDate' => $task['due_date'],
                        'estimatedTime' => $task['estimated_time'],
                        'priority' => $task['priority'],
                        'inactive' => $task['inactive'] == 1
                    ];
                }

                $subs[] = [
                    'id' => $sub['code'],
                    'name' => $sub['name'],
                    'description' => $sub['description'] ?? '',
                    'type' => $sub['type'] ?? 'daily',
                    'items' => $items
                ];
            }

            $result[] = [
                'id' => $cat['code'],
                'name' => $cat['name'],
                'description' => $cat['description'] ?? '',
                'subcategories' => $subs
            ];
        }

        echo json_encode(['success' => true, 'categories' => $result]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== GET USERS ==========
// Helper to safely add columns
function safeAddColumn($db, $table, $column, $definition) {
    try {
        $stmt = $db->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
        if ($stmt->rowCount() == 0) {
            $db->exec("ALTER TABLE `$table` ADD `$column` $definition");
        }
    } catch (Exception $e) {}
}

function getUsers($db)
{
    try {
        // Ensure columns exist safely
        safeAddColumn($db, 'users', 'designation', "VARCHAR(100) DEFAULT ''");
        safeAddColumn($db, 'users', 'user_type', "VARCHAR(50) DEFAULT 'user'");
        
        // Drop unique constraints
        $indices = ['email', 'username', 'email_2', 'username_2'];
        foreach ($indices as $index) {
            try {
                $db->exec("ALTER TABLE users DROP INDEX " . $index);
            } catch (Exception $e) {}
        }

        $stmt = $db->query("SELECT id, username, email, password, name, designation, user_type as type FROM users ORDER BY id");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'users' => $users]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== GET ASSIGNMENTS ==========
function getAssignments($db)
{
    try {
        $stmt = $db->query("SELECT * FROM assignments");
        $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formatted = [];
        foreach ($assignments as $a) {
            if (!isset($formatted[$a['user_id']])) {
                $formatted[$a['user_id']] = [];
            }

            $stmt2 = $db->prepare("SELECT code FROM tasks WHERE id = ?");
            $stmt2->execute([$a['task_id']]);
            $task = $stmt2->fetch(PDO::FETCH_ASSOC);
            if ($task) {
                $formatted[$a['user_id']][] = $task['code'];
            }
        }

        echo json_encode(['success' => true, 'assignments' => $formatted]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== GET HISTORY ==========
function getHistory($db)
{
    try {
        $stmt = $db->query("SELECT * FROM task_history");
        $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formatted = [];
        foreach ($history as $h) {
            $key = $h['user_id'] . '_' . $h['completion_date'];
            if (!isset($formatted[$key])) {
                $formatted[$key] = [];
            }

            $stmt2 = $db->prepare("SELECT code FROM tasks WHERE id = ?");
            $stmt2->execute([$h['task_id']]);
            $task = $stmt2->fetch(PDO::FETCH_ASSOC);
            if ($task) {
                $formatted[$key][$task['code']] = [
                    'time' => $h['completion_time']
                ];
            }
        }

        $stmt = $db->query("SELECT * FROM daily_notes");
        $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($notes as $n) {
            $key = $n['user_id'] . '_' . $n['note_date'];
            if (!isset($formatted[$key])) {
                $formatted[$key] = [];
            }
            $formatted[$key]['_note'] = $n['note'];
        }

        echo json_encode(['success' => true, 'history' => $formatted]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== GET TASK DATE RANGES ==========
function getTaskDateRanges($db)
{
    try {
        // Check if task_date_ranges table exists, if not create it
        try {
            $db->query("SELECT 1 FROM task_date_ranges LIMIT 1");
        } catch (Exception $e) {
            // Table doesn't exist, create it
            $db->exec("CREATE TABLE IF NOT EXISTS task_date_ranges (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                task_id INT NOT NULL,
                start_date VARCHAR(20),
                end_date VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_range (user_id, task_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        }

        // Ensure columns are updated to accept strings/integers instead of just DATEs
        try {
            $db->exec("ALTER TABLE task_date_ranges MODIFY start_date VARCHAR(20)");
            $db->exec("ALTER TABLE task_date_ranges MODIFY end_date VARCHAR(20)");
        } catch (Exception $e) {
        }

        $stmt = $db->query("SELECT * FROM task_date_ranges");
        $ranges = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formatted = [];
        foreach ($ranges as $r) {
            $stmt2 = $db->prepare("SELECT code FROM tasks WHERE id = ?");
            $stmt2->execute([$r['task_id']]);
            $task = $stmt2->fetch(PDO::FETCH_ASSOC);
            if ($task) {
                $key = $r['user_id'] . '_' . $task['code'];
                $start = $r['start_date'];
                if(strpos((string)$start, '-') !== false) {
                    $start = date('j', strtotime($start));
                }
                
                $end = $r['end_date'];
                if(strpos((string)$end, '-') !== false) {
                    $end = date('j', strtotime($end));
                }
                
                $formatted[$key] = [
                    'start' => $start,
                    'end' => $end
                ];
            }
        }

        echo json_encode(['success' => true, 'ranges' => $formatted]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== SAVE USER ==========
function saveUser($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        if (isset($data['id']) && $data['id'] > 0) {
            $stmt = $db->prepare("UPDATE users SET name=?, username=?, email=?, password=?, designation=?, user_type=? WHERE id=?");
            $stmt->execute([$data['name'], $data['username'], $data['email'], $data['password'], $data['designation'], $data['type'], $data['id']]);
            $newId = $data['id'];
        } else {
            // Ensure columns exist before insert
            safeAddColumn($db, 'users', 'designation', "VARCHAR(100) DEFAULT ''");
            safeAddColumn($db, 'users', 'user_type', "VARCHAR(50) DEFAULT 'user'");

            // Find the smallest available ID
            $stmt = $db->query("SELECT id FROM users ORDER BY id");
            $existingIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

            $newId = 1;
            while (in_array($newId, $existingIds)) {
                $newId++;
            }

            $stmt = $db->prepare("INSERT INTO users (id, name, username, email, password, designation, user_type) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$newId, $data['name'], $data['username'], $data['email'], $data['password'], $data['designation'], $data['type']]);
        }

        $stmt = $db->prepare("SELECT id, username, email, name, designation, user_type as type, password FROM users WHERE id = ?");
        $stmt->execute([$newId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'user' => $user]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== DELETE USER ==========
function deleteUser($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $db->beginTransaction();

        // First delete all related records
        $stmt = $db->prepare("DELETE FROM assignments WHERE user_id = ?");
        $stmt->execute([$data['id']]);

        $stmt = $db->prepare("DELETE FROM task_history WHERE user_id = ?");
        $stmt->execute([$data['id']]);

        $stmt = $db->prepare("DELETE FROM task_date_ranges WHERE user_id = ?");
        $stmt->execute([$data['id']]);

        $stmt = $db->prepare("DELETE FROM daily_notes WHERE user_id = ?");
        $stmt->execute([$data['id']]);

        // Then delete the user
        $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$data['id']]);

        $db->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== SAVE CATEGORY ==========
function saveCategory($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $stmt = $db->prepare("SELECT id FROM categories WHERE code = ?");
        $stmt->execute([$data['id']]);

        if ($stmt->rowCount() > 0) {
            $stmt = $db->prepare("UPDATE categories SET name = ?, description = ? WHERE code = ?");
            $result = $stmt->execute([$data['name'], $data['description'] ?? '', $data['id']]);
        } else {
            $stmt = $db->prepare("INSERT INTO categories (code, name, description) VALUES (?, ?, ?)");
            $result = $stmt->execute([$data['id'], $data['name'], $data['description'] ?? '']);
        }

        if ($result) {
            echo json_encode(['success' => true, 'id' => $data['id']]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to save category']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== UPDATE CATEGORY ==========
function updateCategory($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $stmt = $db->prepare("UPDATE categories SET name = ?, description = ? WHERE code = ?");
        $stmt->execute([$data['name'], $data['description'] ?? '', $data['id']]);

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== DELETE CATEGORY ==========
function deleteCategory($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $stmt = $db->prepare("DELETE FROM categories WHERE code = ?");
        $stmt->execute([$data['id']]);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== SAVE SUBCATEGORY ==========
function saveSubcategory($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $stmt = $db->prepare("SELECT id FROM categories WHERE code = ?");
        $stmt->execute([$data['category_id']]);
        $cat = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cat) {
            echo json_encode(['success' => false, 'message' => 'Category not found']);
            return;
        }

        $category_id = $cat['id'];

        $baseCode = $data['category_id'];
        $stmt = $db->prepare("SELECT code FROM subcategories WHERE category_id = ? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$category_id]);
        $last = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($last) {
            $lastNum = intval(substr($last['code'], -2));
            $newNum = $lastNum + 1;
        } else {
            $newNum = 1;
        }

        $code = $baseCode . str_pad($newNum, 2, '0', STR_PAD_LEFT);

        $stmt = $db->prepare("INSERT INTO subcategories (category_id, name, description, code, type) VALUES (?, ?, ?, ?, ?)");
        $result = $stmt->execute([$category_id, $data['name'], $data['description'] ?? '', $code, $data['type'] ?? 'daily']);

        if ($result) {
            echo json_encode(['success' => true, 'code' => $code]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to insert subcategory']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== UPDATE SUBCATEGORY ==========
function updateSubcategory($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $stmt = $db->prepare("UPDATE subcategories SET name = ?, description = ? WHERE code = ?");
        $stmt->execute([$data['name'], $data['description'] ?? '', $data['id']]);

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== DELETE SUBCATEGORY ==========
function deleteSubcategory($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $stmt = $db->prepare("DELETE FROM subcategories WHERE code = ?");
        $stmt->execute([$data['id']]);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== SAVE TASK ==========
function saveTask($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $stmt = $db->prepare("SELECT id, code FROM subcategories WHERE code = ?");
        $stmt->execute([$data['subcategory_id']]);
        $sub = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$sub) {
            echo json_encode(['success' => false, 'message' => 'Subcategory not found']);
            return;
        }

        $subcategory_id = $sub['id'];
        $subCode = $sub['code'];

        $stmt = $db->prepare("SELECT MAX(CAST(SUBSTRING(code, -4) AS UNSIGNED)) as max_num FROM tasks WHERE subcategory_id = ?");
        $stmt->execute([$subcategory_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $maxNum = $result['max_num'] ?? 0;
        $nextNum = $maxNum + 1;

        $code = $subCode . str_pad($nextNum, 4, '0', STR_PAD_LEFT);

        $dueDate = isset($data['dueDate']) && !empty($data['dueDate']) ? $data['dueDate'] : null;
        $estimatedTime = $data['estimatedTime'] ?? '';
        $priority = $data['priority'] ?? 'medium';
        $inactive = isset($data['inactive']) && $data['inactive'] ? 1 : 0;
        $type = $data['type'] ?? 'daily';

        $stmt = $db->prepare("INSERT INTO tasks (subcategory_id, name, urdu, type, code, due_date, estimated_time, priority, inactive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $result = $stmt->execute([
            $subcategory_id,
            $data['name'],
            $data['description'],
            $type,
            $code,
            $dueDate,
            $estimatedTime,
            $priority,
            $inactive
        ]);

        if ($result) {
            echo json_encode(['success' => true, 'code' => $code]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to insert task']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== UPDATE TASK ==========
function updateTask($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $dueDate = isset($data['dueDate']) && !empty($data['dueDate']) ? $data['dueDate'] : null;
        $estimatedTime = $data['estimatedTime'] ?? '';
        $priority = $data['priority'] ?? 'medium';
        $inactive = isset($data['inactive']) && $data['inactive'] ? 1 : 0;
        $type = $data['type'] ?? 'daily';

        $stmt = $db->prepare("UPDATE tasks SET name = ?, urdu = ?, type = ?, due_date = ?, estimated_time = ?, priority = ?, inactive = ? WHERE code = ?");
        $stmt->execute([
            $data['name'],
            $data['description'],
            $type,
            $dueDate,
            $estimatedTime,
            $priority,
            $inactive,
            $data['id']
        ]);

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== DELETE TASK ==========
function deleteTask($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $stmt = $db->prepare("SELECT id FROM tasks WHERE code = ?");
        $stmt->execute([$data['id']]);
        $task = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($task) {
            $taskId = $task['id'];

            $stmt = $db->prepare("DELETE FROM assignments WHERE task_id = ?");
            $stmt->execute([$taskId]);

            $stmt = $db->prepare("DELETE FROM task_history WHERE task_id = ?");
            $stmt->execute([$taskId]);

            $stmt = $db->prepare("DELETE FROM task_date_ranges WHERE task_id = ?");
            $stmt->execute([$taskId]);
        }

        $stmt = $db->prepare("DELETE FROM tasks WHERE code = ?");
        $stmt->execute([$data['id']]);

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== FIXED: SAVE ASSIGNMENT with due date ==========
function saveAssignment($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $stmt = $db->prepare("SELECT id FROM tasks WHERE code = ?");
        $stmt->execute([$data['task_id']]);
        $task = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$task) {
            echo json_encode(['success' => false, 'message' => 'Task not found']);
            return;
        }

        $taskId = $task['id'];

        if ($data['checked']) {
            $assignedDate = date('Y-m-d');
            $dueDate = $data['due_date'] ?? null;

            // Check if assignment exists
            $stmt = $db->prepare("SELECT id FROM assignments WHERE user_id = ? AND task_id = ?");
            $stmt->execute([$data['user_id'], $taskId]);

            if ($stmt->rowCount() > 0) {
                // Update existing
                $stmt = $db->prepare("UPDATE assignments SET assigned_date = ?, due_date = ? WHERE user_id = ? AND task_id = ?");
                $stmt->execute([$assignedDate, $dueDate, $data['user_id'], $taskId]);
            } else {
                // Insert new
                $stmt = $db->prepare("INSERT INTO assignments (user_id, task_id, assigned_date, due_date) VALUES (?, ?, ?, ?)");
                $stmt->execute([$data['user_id'], $taskId, $assignedDate, $dueDate]);
            }

            // Also update task's due date if provided
            if ($dueDate) {
                $stmt = $db->prepare("UPDATE tasks SET due_date = ? WHERE id = ?");
                $stmt->execute([$dueDate, $taskId]);
            }
        } else {
            // Delete assignment
            $stmt = $db->prepare("DELETE FROM assignments WHERE user_id = ? AND task_id = ?");
            $stmt->execute([$data['user_id'], $taskId]);

            // Also remove due date from task
            $stmt = $db->prepare("UPDATE tasks SET due_date = NULL WHERE id = ?");
            $stmt->execute([$taskId]);
        }

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== NEW: SAVE ALL ASSIGNMENTS ==========
function saveAllAssignments($db)
{
    $assignments = json_decode($_POST['data'] ?? '{}', true);

    try {
        $db->beginTransaction();

        $assignedDate = date('Y-m-d');

        $stmtTask = $db->prepare("SELECT id FROM tasks WHERE code = ?");
        $stmtInsert = $db->prepare("INSERT INTO assignments (user_id, task_id, assigned_date) VALUES (?, ?, ?)");
        $stmtCheck = $db->prepare("SELECT id FROM assignments WHERE user_id = ? AND task_id = ?");

        foreach ($assignments as $userId => $taskCodes) {
            foreach ($taskCodes as $taskCode) {
                $stmtTask->execute([$taskCode]);
                $task = $stmtTask->fetch(PDO::FETCH_ASSOC);

                if ($task) {
                    $taskId = $task['id'];
                    $stmtCheck->execute([$userId, $taskId]);
                    if ($stmtCheck->rowCount() == 0) {
                        $stmtInsert->execute([$userId, $taskId, $assignedDate]);
                    }
                }
            }
        }

        $db->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}


// ========== FIXED: SAVE DATE RANGE with proper deletion ==========
function saveDateRange($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        // Check if task_date_ranges table exists, if not create it
        try {
            $db->query("SELECT 1 FROM task_date_ranges LIMIT 1");
        } catch (Exception $e) {
            // Table doesn't exist, create it
            $db->exec("CREATE TABLE IF NOT EXISTS task_date_ranges (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                task_id INT NOT NULL,
                start_date VARCHAR(20),
                end_date VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_range (user_id, task_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        }

        // Ensure columns are updated to accept strings/integers
        try {
            $db->exec("ALTER TABLE task_date_ranges MODIFY start_date VARCHAR(20)");
            $db->exec("ALTER TABLE task_date_ranges MODIFY end_date VARCHAR(20)");
        } catch (Exception $e) {
        }

        // First get the task ID from the task code
        $stmt = $db->prepare("SELECT id FROM tasks WHERE code = ?");
        $stmt->execute([$data['task_id']]);
        $task = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$task) {
            echo json_encode(['success' => false, 'message' => 'Task not found with code: ' . $data['task_id']]);
            return;
        }

        $taskId = $task['id'];

        // If start_date and end_date are null, delete the range
        if (!isset($data['start_date']) || !isset($data['end_date']) || $data['start_date'] === null || $data['end_date'] === null) {
            $stmt = $db->prepare("DELETE FROM task_date_ranges WHERE user_id = ? AND task_id = ?");
            $stmt->execute([$data['user_id'], $taskId]);
            echo json_encode(['success' => true]);
            return;
        }

        // Check if range exists
        $stmt = $db->prepare("SELECT id FROM task_date_ranges WHERE user_id = ? AND task_id = ?");
        $stmt->execute([$data['user_id'], $taskId]);

        if ($stmt->rowCount() > 0) {
            // Update existing range
            $stmt = $db->prepare("UPDATE task_date_ranges SET start_date = ?, end_date = ? WHERE user_id = ? AND task_id = ?");
            $result = $stmt->execute([$data['start_date'], $data['end_date'], $data['user_id'], $taskId]);
        } else {
            // Insert new range
            $stmt = $db->prepare("INSERT INTO task_date_ranges (user_id, task_id, start_date, end_date) VALUES (?, ?, ?, ?)");
            $result = $stmt->execute([$data['user_id'], $taskId, $data['start_date'], $data['end_date']]);
        }

        // Also create assignment if not exists
        $stmt = $db->prepare("SELECT id FROM assignments WHERE user_id = ? AND task_id = ?");
        $stmt->execute([$data['user_id'], $taskId]);

        if ($stmt->rowCount() == 0) {
            $stmt = $db->prepare("INSERT INTO assignments (user_id, task_id, assigned_date) VALUES (?, ?, ?)");
            $stmt->execute([$data['user_id'], $taskId, date('Y-m-d')]);
        }

        if ($result) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to save date range']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== SAVE HISTORY ==========
function saveHistory($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $userId = $data['user_id'];
        $date = $data['date'];
        $tasks = $data['tasks'];

        $stmt = $db->prepare("DELETE FROM task_history WHERE user_id = ? AND completion_date = ?");
        $stmt->execute([$userId, $date]);

        if (is_array($tasks)) {
            foreach ($tasks as $taskCode => $info) {
                if ($taskCode != '_note' && is_array($info)) {
                    $stmt2 = $db->prepare("SELECT id FROM tasks WHERE code = ?");
                    $stmt2->execute([$taskCode]);
                    $task = $stmt2->fetch(PDO::FETCH_ASSOC);
                    if ($task) {
                        $stmt3 = $db->prepare("INSERT INTO task_history (user_id, task_id, completion_date, completion_time) VALUES (?, ?, ?, ?)");
                        $stmt3->execute([$userId, $task['id'], $date, $info['time'] ?? date('H:i:s')]);
                    }
                }
            }
        }

        if (is_array($tasks) && isset($tasks['_note'])) {
            $stmt = $db->prepare("SELECT id FROM daily_notes WHERE user_id = ? AND note_date = ?");
            $stmt->execute([$userId, $date]);

            if ($stmt->rowCount() > 0) {
                $stmt = $db->prepare("UPDATE daily_notes SET note = ? WHERE user_id = ? AND note_date = ?");
                $stmt->execute([$tasks['_note'], $userId, $date]);
            } else {
                $stmt = $db->prepare("INSERT INTO daily_notes (user_id, note_date, note) VALUES (?, ?, ?)");
                $stmt->execute([$userId, $date, $tasks['_note']]);
            }
        } else {
            $stmt = $db->prepare("DELETE FROM daily_notes WHERE user_id = ? AND note_date = ?");
            $stmt->execute([$userId, $date]);
        }

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== LOGIN ==========
function login($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $stmt = $db->prepare("SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?");
        $stmt->execute([$data['username'], $data['username'], $data['password']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            unset($user['password']);
            $user['type'] = $user['user_type'];
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== RESTORE CATEGORIES ==========
function restoreCategories($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $db->beginTransaction();

        $db->exec("DELETE FROM tasks");
        $db->exec("DELETE FROM subcategories");
        $db->exec("DELETE FROM categories");

        foreach ($data['categories'] as $cat) {
            $stmt = $db->prepare("INSERT INTO categories (code, name, description) VALUES (?, ?, ?)");
            $stmt->execute([$cat['id'], $cat['name'], $cat['description'] ?? '']);
            $catId = $db->lastInsertId();

            foreach ($cat['subcategories'] as $sub) {
                $stmt = $db->prepare("INSERT INTO subcategories (category_id, name, description, code, type) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$catId, $sub['name'], $sub['description'] ?? '', $sub['id'], $sub['type'] ?? 'daily']);
                $subId = $db->lastInsertId();

                foreach ($sub['items'] as $item) {
                    $dueDate = isset($item['dueDate']) && !empty($item['dueDate']) ? $item['dueDate'] : null;
                    $estimatedTime = $item['estimatedTime'] ?? '';
                    $priority = $item['priority'] ?? 'medium';
                    $inactive = isset($item['inactive']) && $item['inactive'] ? 1 : 0;
                    $type = $item['type'] ?? 'daily';

                    $stmt = $db->prepare("INSERT INTO tasks (subcategory_id, name, urdu, type, code, due_date, estimated_time, priority, inactive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$subId, $item['name'], $item['description'] ?? '', $type, $item['id'], $dueDate, $estimatedTime, $priority, $inactive]);
                }
            }
        }

        $db->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== RESTORE USERS ==========
function restoreUsers($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $db->beginTransaction();

        // Sab users delete karo (admin bhi)
        $db->exec("DELETE FROM users");

        // Saare users restore karo
        foreach ($data['users'] as $user) {
            $stmt = $db->prepare("INSERT INTO users (id, name, username, email, password, designation, user_type) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $user['id'],
                $user['name'],
                $user['username'],
                $user['email'],
                $user['password'],
                $user['designation'],
                $user['type']
            ]);
        }

        $db->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== RESTORE HISTORY ==========
function restoreHistory($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $db->beginTransaction();
        $db->exec("DELETE FROM task_history");
        $db->exec("DELETE FROM daily_notes");

        foreach ($data['history'] as $key => $tasks) {
            list($userId, $date) = explode('_', $key);

            foreach ($tasks as $taskCode => $info) {
                if ($taskCode != '_note') {
                    $stmt = $db->prepare("SELECT id FROM tasks WHERE code = ?");
                    $stmt->execute([$taskCode]);
                    $task = $stmt->fetch(PDO::FETCH_ASSOC);

                    if ($task) {
                        $stmt = $db->prepare("INSERT INTO task_history (user_id, task_id, completion_date, completion_time) VALUES (?, ?, ?, ?)");
                        $stmt->execute([$userId, $task['id'], $date, $info['time'] ?? '00:00:00']);
                    }
                } else {
                    $stmt = $db->prepare("INSERT INTO daily_notes (user_id, note_date, note) VALUES (?, ?, ?)");
                    $stmt->execute([$userId, $date, $info]);
                }
            }
        }

        $db->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== RESTORE ASSIGNMENTS ==========
function restoreAssignments($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        $db->beginTransaction();
        $db->exec("DELETE FROM assignments");
        $db->exec("DELETE FROM task_date_ranges");

        foreach ($data['assignments'] as $userId => $tasks) {
            foreach ($tasks as $taskCode) {
                $stmt = $db->prepare("SELECT id FROM tasks WHERE code = ?");
                $stmt->execute([$taskCode]);
                $task = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($task) {
                    $stmt = $db->prepare("INSERT INTO assignments (user_id, task_id, assigned_date) VALUES (?, ?, ?)");
                    $stmt->execute([$userId, $task['id'], date('Y-m-d')]);

                    // Check if this is a monthly task and has date range
                    if (isset($data['taskDateRanges']) && isset($data['taskDateRanges'][$userId . '_' . $taskCode])) {
                        $range = $data['taskDateRanges'][$userId . '_' . $taskCode];
                        $stmt2 = $db->prepare("INSERT INTO task_date_ranges (user_id, task_id, start_date, end_date) VALUES (?, ?, ?, ?)");
                        $stmt2->execute([$userId, $task['id'], $range['start'], $range['end']]);
                    }
                }
            }
        }

        $db->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== GET COMPANIES LIST ==========
function getCompanies($db)
{
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS companies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            address TEXT,
            phone VARCHAR(50),
            email VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Sync from company_settings if companies table is empty
        $check = $db->query("SELECT COUNT(*) FROM companies")->fetchColumn();
        if ($check == 0) {
            $stmt = $db->query("SELECT setting_key, setting_value FROM company_settings WHERE setting_key IN ('name', 'address', 'phone', 'email')");
            $current = [];
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) $current[$row['setting_key']] = $row['setting_value'];
            
            if (!empty($current['name'])) {
                $stmt = $db->prepare("INSERT INTO companies (name, address, phone, email) VALUES (?, ?, ?, ?)");
                $stmt->execute([$current['name'], $current['address'] ?? '', $current['phone'] ?? '', $current['email'] ?? '']);
            }
        }

        $stmt = $db->query("SELECT * FROM companies ORDER BY id");
        $companies = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'companies' => $companies]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== SAVE COMPANY TO LIST ==========
function saveCompany($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);
    try {
        if (isset($data['id']) && $data['id'] > 0) {
            $stmt = $db->prepare("UPDATE companies SET name=?, address=?, phone=?, email=? WHERE id=?");
            $stmt->execute([$data['name'], $data['address'], $data['phone'], $data['email'], $data['id']]);
        } else {
            $stmt = $db->prepare("INSERT INTO companies (name, address, phone, email) VALUES (?, ?, ?, ?)");
            $stmt->execute([$data['name'], $data['address'], $data['phone'], $data['email']]);
        }
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== DELETE COMPANY FROM LIST ==========
function deleteCompany($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);
    try {
        $stmt = $db->prepare("DELETE FROM companies WHERE id = ?");
        $stmt->execute([$data['id']]);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== RESTORE DATE RANGES ==========
function restoreDateRanges($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        // Check if task_date_ranges table exists, if not create it
        try {
            $db->query("SELECT 1 FROM task_date_ranges LIMIT 1");
        } catch (Exception $e) {
            $db->exec("CREATE TABLE IF NOT EXISTS task_date_ranges (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                task_id INT NOT NULL,
                start_date DATE,
                end_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_range (user_id, task_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        }

        $db->beginTransaction();
        $db->exec("DELETE FROM task_date_ranges");

        foreach ($data['ranges'] as $key => $range) {
            // Parse key correctly - user_id and task_code
            $parts = explode('_', $key);
            $userId = $parts[0];

            // Get the task code (rest of the parts)
            array_shift($parts); // Remove user_id
            $taskCode = implode('_', $parts); // Join remaining parts as task code

            $stmt = $db->prepare("SELECT id FROM tasks WHERE code = ?");
            $stmt->execute([$taskCode]);
            $task = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($task) {
                $stmt = $db->prepare("INSERT INTO task_date_ranges (user_id, task_id, start_date, end_date) VALUES (?, ?, ?, ?)");
                $stmt->execute([$userId, $task['id'], $range['start'], $range['end']]);
            }
        }

        $db->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== GET COMPANY SETTINGS ==========
function getCompanySettings($db)
{
    try {
        // Create table if not exists
        $db->exec("CREATE TABLE IF NOT EXISTS company_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(100) NOT NULL UNIQUE,
            setting_value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $stmt = $db->query("SELECT setting_key, setting_value FROM company_settings");
        $settings = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        echo json_encode(['success' => true, 'settings' => $settings]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== SAVE COMPANY SETTINGS ==========
function saveCompanySettings($db)
{
    $data = json_decode($_POST['data'] ?? '{}', true);

    try {
        // Create table if not exists
        $db->exec("CREATE TABLE IF NOT EXISTS company_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(100) NOT NULL UNIQUE,
            setting_value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $db->beginTransaction();

        // Settings save karo
        $settings = ['name', 'address', 'phone', 'email', 'footer'];
        foreach ($settings as $key) {
            if (isset($data[$key]) && $data[$key] !== '') {
                $stmt = $db->prepare("INSERT INTO company_settings (setting_key, setting_value) 
                                       VALUES (?, ?) 
                                       ON DUPLICATE KEY UPDATE setting_value = ?");
                $stmt->execute([$key, $data[$key], $data[$key]]);
            }
        }

        $db->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ========== SAVE COMPANY LOGO ==========
function saveCompanyLogo($db)
{
    try {
        // Create uploads directory
        $uploadDir = 'uploads/company/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        if (!isset($_FILES['logo'])) {
            echo json_encode(['success' => false, 'message' => 'No logo uploaded']);
            return;
        }

        $fileName = 'logo_' . time() . '.png';
        $filePath = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['logo']['tmp_name'], $filePath)) {
            // Full URL banao - Corrected to include subdirectory task1
            $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https://' : 'http://';
            $dir = dirname($_SERVER['PHP_SELF']); // This will get '/task1'
            $logoUrl = $protocol . $_SERVER['HTTP_HOST'] . $dir . '/' . $filePath;

            // Create table if not exists
            $db->exec("CREATE TABLE IF NOT EXISTS company_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(100) NOT NULL UNIQUE,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            $stmt = $db->prepare("INSERT INTO company_settings (setting_key, setting_value) 
                                   VALUES ('logo', ?) 
                                   ON DUPLICATE KEY UPDATE setting_value = ?");
            $stmt->execute([$logoUrl, $logoUrl]);

            echo json_encode(['success' => true, 'logo_url' => $logoUrl]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to upload logo']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>