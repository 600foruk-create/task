        <!-- Login Page -->
        <div id="loginPage" class="login-box">
            <h2 id="loginCompanyName">Seastone Pipe Industry</h2>
            <p>Complete Management System</p>
            <div class="input-group">
                <i class="fas fa-user"></i>
                <input type="text" id="username" placeholder="Username or Email" autocomplete="off">
            </div>
            <div class="password-field">
                <input type="password" id="password" placeholder="Password" autocomplete="off">
                <i class="fas fa-eye password-toggle" onclick="togglePassword()" id="togglePassword"></i>
            </div>
            <div class="login-options">
                <label class="remember-me"><input type="checkbox" id="rememberMe"> Remember me</label>
                <a href="#" class="forgot-password" onclick="showForgotPasswordModal(); return false;">Forgot Password?</a>
            </div>
            <button class="login-btn" onclick="login()"><i class="fas fa-sign-in-alt"></i> Login</button>
        </div>

