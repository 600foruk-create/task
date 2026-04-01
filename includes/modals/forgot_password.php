        <!-- Forgot Password Modal -->
        <div id="forgotPasswordModal" class="modal">
            <div class="modal-content">
                <h3>Forgot Password</h3>
                <div id="forgotStep1">
                    <p style="color: #666; margin-bottom: 15px;">Enter your email to receive OTP</p>
                    <input type="email" id="forgotEmail" placeholder="Enter your email">
                    <button onclick="sendOTP()" class="btn-success" style="width: 100%; margin-top: 10px; padding: 12px;"><i class="fas fa-paper-plane"></i> Send OTP</button>
                </div>
                <div id="forgotStep2" style="display: none;">
                    <p style="text-align: center; color: #666;">OTP sent to <span id="otpEmail"></span></p>
                    <div class="otp-input">
                        <input type="text" maxlength="1" onkeyup="moveToNext(this, 1)" id="otp1">
                        <input type="text" maxlength="1" onkeyup="moveToNext(this, 2)" id="otp2">
                        <input type="text" maxlength="1" onkeyup="moveToNext(this, 3)" id="otp3">
                        <input type="text" maxlength="1" onkeyup="moveToNext(this, 4)" id="otp4">
                        <input type="text" maxlength="1" onkeyup="moveToNext(this, 5)" id="otp5">
                        <input type="text" maxlength="1" onkeyup="moveToNext(this, 6)" id="otp6">
                    </div>
                    <div class="timer" id="timer">02:00</div>
                    <button onclick="verifyOTP()" class="btn-success" style="width: 100%; padding: 12px;"><i class="fas fa-check"></i> Verify OTP</button>
                    <p style="text-align: center; margin-top: 15px;"><a href="#" onclick="resendOTP()" style="color: #2E5C8A;">Resend OTP</a></p>
                </div>
                <div id="forgotStep3" style="display: none;">
                    <div class="password-field" style="margin-bottom: 10px;">
                        <input type="password" id="newPassword" placeholder="New Password">
                        <i class="fas fa-eye password-toggle" onclick="toggleFieldPassword('newPassword', this)"></i>
                    </div>
                    <div class="password-field" style="margin-bottom: 10px;">
                        <input type="password" id="confirmPassword" placeholder="Confirm Password">
                        <i class="fas fa-eye password-toggle" onclick="toggleFieldPassword('confirmPassword', this)"></i>
                    </div>
                    <button onclick="resetPassword()" class="btn-success" style="width: 100%; margin-top: 10px; padding: 12px;"><i class="fas fa-key"></i> Reset Password</button>
                </div>
                <div class="flex">
                    <button onclick="closeModal('forgotPasswordModal')" class="close-btn"><i class="fas fa-times"></i> Close</button>
                </div>
            </div>
        </div>

