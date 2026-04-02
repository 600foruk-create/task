<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title id="companyTitle">Seastone Pipe Industry - Complete System</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://translate.googleapis.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
</head>
<body>

    <div class="container">
        <!-- Modals -->
        <?php include 'includes/modals/login.php'; ?>
        <?php include 'includes/modals/forgot_password.php'; ?>
        <?php include 'includes/modals/daily_note.php'; ?>
        <?php include 'includes/modals/company_settings.php'; ?>
        <?php include 'includes/modals/company_list.php'; ?>

        <!-- Dashboard -->
        <div id="dashboard" class="dashboard">
            <?php include 'includes/shared/header.php'; ?>
            <?php include 'includes/shared/admin_tabs.php'; ?>
            <?php include 'includes/shared/user_tabs.php'; ?>

            <?php include 'includes/admin/dashboard.php'; ?>
            <?php include 'includes/admin/daily_report.php'; ?>
            <?php include 'includes/admin/monthly_report.php'; ?>
            <?php include 'includes/admin/yearly_report.php'; ?>
            <?php include 'includes/admin/users.php'; ?>
            <?php include 'includes/admin/tasks.php'; ?>
            <?php include 'includes/admin/assign.php'; ?>
            <?php include 'includes/admin/company.php'; ?>
            <?php include 'includes/admin/backup.php'; ?>

            <?php include 'includes/user/daily_report.php'; ?>
            <?php include 'includes/user/monthly_report.php'; ?>
            <?php include 'includes/user/tasks.php'; ?>
        </div>
    </div>

    <!-- External Script -->
    <script src="assets/js/app.js?v=<?php echo time(); ?>"></script>
</body>
</html>
