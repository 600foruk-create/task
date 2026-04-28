<?php
$pdo = new PDO('mysql:host=localhost;dbname=u245697138_softifyx', 'u245697138_softifyx', 'Suhailahmad@123');
echo "USERS TABLE:\n";
$stmt = $pdo->query('DESCRIBE users');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\nCOMPANY_SETTINGS TABLE:\n";
try {
    $stmt = $pdo->query('DESCRIBE company_settings');
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "company_settings table not found or error: " . $e->getMessage() . "\n";
}
?>
