import os

# Create directories if they don't exist
os.makedirs("assets/css", exist_ok=True)
os.makedirs("assets/js", exist_ok=True)
os.makedirs("includes/modals", exist_ok=True)
os.makedirs("includes/admin", exist_ok=True)
os.makedirs("includes/user", exist_ok=True)
os.makedirs("includes/shared", exist_ok=True)

with open("index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

def get_lines(start, end):
    # 1-indexed to 0-indexed translation
    return "".join(lines[start-1:end])

# Write CSS
with open("assets/css/style.css", "w", encoding="utf-8") as f:
    f.write(get_lines(8, 469))

# Write JS
def find_tag(tag, start_line=1):
    for i in range(start_line-1, len(lines)):
        if tag in lines[i]:
            return i + 1
    return -1

script_start = find_tag("<script>", 900)
script_end = find_tag("</script>", script_start)

with open("assets/js/app.js", "w", encoding="utf-8") as f:
    f.write(get_lines(script_start + 1, script_end - 1))

# Write Modals
def slice_and_write(filename, start, end):
    with open(filename, "w", encoding="utf-8") as f:
        f.write(get_lines(start, end - 1))

# Line mappings from previous command:
slice_and_write("includes/modals/login.php", 479, 498) # loginPage + wrapper
slice_and_write("includes/modals/forgot_password.php", 498, 538)
slice_and_write("includes/modals/daily_note.php", 538, 552)
slice_and_write("includes/modals/company_settings.php", 552, 593)
slice_and_write("includes/modals/company_list.php", 593, 638)

# Header and Tabs
slice_and_write("includes/shared/header.php", 642, 660)
slice_and_write("includes/shared/admin_tabs.php", 661, 673)
slice_and_write("includes/shared/user_tabs.php", 674, 680)

# Admin Tabs
slice_and_write("includes/admin/dashboard.php", 681, 694)
slice_and_write("includes/admin/daily_report.php", 694, 716)
slice_and_write("includes/admin/monthly_report.php", 716, 745)
slice_and_write("includes/admin/yearly_report.php", 745, 767)
slice_and_write("includes/admin/users.php", 767, 773)
slice_and_write("includes/admin/tasks.php", 773, 787)
slice_and_write("includes/admin/assign.php", 787, 794)
slice_and_write("includes/admin/company.php", 794, 822)
slice_and_write("includes/admin/backup.php", 822, 838)

# User Tabs & Other user stuff
slice_and_write("includes/user/daily_report.php", 838, 858)
slice_and_write("includes/user/monthly_report.php", 858, 879)
slice_and_write("includes/user/tasks.php", 879, script_start - 2)

# Write out the new index.php
index_php_str = get_lines(1, 7) + """
    <link rel="stylesheet" href="assets/css/style.css">
""" + get_lines(471, 477) + """
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
    <script src="assets/js/app.js"></script>
</body>
</html>
"""

with open("index.php", "w", encoding="utf-8") as f:
    f.write(index_php_str)

print("Split operations complete.")
