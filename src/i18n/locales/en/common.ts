const common = {
  // auth
  auth_login: 'Login',
  auth_signup: 'Sign Up',
  auth_register: 'Register',
  auth_logout: 'Logout',
  auth_email: 'Email',
  auth_password: 'Password',
  auth_confirm_password: 'Confirm Password',
  auth_forgot_password: 'Forgot password?',

  // buttons
  buttons_submit: 'Submit',
  buttons_cancel: 'Cancel',
  buttons_book_now: 'Book Now',
  buttons_see_more: 'See More',
  buttons_back: 'Back',

  // home
  home_title: 'Welcome to our cinema!',
  home_subtitle: 'Discover the latest movies.',

  // movies
  movies_now_showing: 'Now Showing',
  movies_coming_soon: 'Coming Soon',
  movies_no_movies: 'No movies found.',
  movies_loading: 'Loading movies...',
  movies_title: 'Title',
  movies_description: 'Description',

  // cinema
  cinema_choose_cinema: 'Choose a cinema',
  cinema_no_cinema: 'No cinema available.',
  cinema_location: 'Location',
  cinema_schedule: 'Showtime',

  // review
  review_title: 'Reviews',
  review_your_review: 'Your review',
  review_submit_review: 'Submit Review',
  review_no_reviews: 'No reviews yet.',

  // user
  user_profile: 'Profile',
  user_my_histories: 'My Histories',
  user_settings: 'Settings',
  user_logout: 'Logout',
  user_change_password: 'Change Password',

  // footer
  footer_customer_care: 'Customer Care',
  footer_address: '123 Cinema Street, Hanoi, Vietnam',
  footer_hotline: 'Hotline: +84 123 456 789',
  footer_email: 'Email: support@cinema.com',
  footer_buy_ticket: 'Buy Tickets',
  footer_schedule: 'Schedule',
  footer_cinema: 'Cinemas',
  footer_movie: 'Movies',
  footer_review: 'Reviews',
  footer_blog: 'Blog',
  footer_terms: 'Terms of Use',
  footer_privacy: 'Privacy Policy',
  footer_connect: 'Connect with us',
  footer_copyright: 'Copyright © 2025',
  footer_dmca: 'DMCA',
  footer_contact: 'Contact Us',
  footer_terms_of_service: 'Terms of Service',

  // messages
  messages_error: 'An error occurred',
  messages_messages_loading: 'Loading...',

  // login
  login_title: 'Login to your account',
  login_google_login: 'Login with Google',
  login_facebook_login: 'Login with Facebook',
  login_email_placeholder: 'Enter email',
  login_password_placeholder: 'Enter password',
  login_forgot_password: 'Forgot password?',
  login_login_button: 'Login',
  login_register_prompt: "Don't have an account?",
  login_register_link: 'Register?',
  login_or: 'or',
  login_email_invalid: 'Email is invalid',
  login_email_required: 'Email is required',
  login_password_required: 'Password is required',
  ACCOUNT_NOT_ACTIVATED:
    'Your account is not activated. Please check your email for the activation link.',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  messages_login_success: 'Login successful',
  messages_logout_success: 'Logout successful',

  // search
  search_placeholder: 'Search movies or theaters',

  // register
  register_title: 'Register your account',
  register_name: 'Name',
  register_name_placeholder: 'Enter name',
  register_name_required: 'Name is required',
  register_email: 'Email',
  register_email_placeholder: 'Enter email',
  register_email_required: 'Email is required',
  register_email_invalid: 'Email is invalid',
  register_phone: 'Phone',
  register_phone_placeholder: 'Enter phone',
  register_phone_required: 'Phone number is required',
  register_phone_invalid: 'Phone number is invalid',
  register_password: 'Password',
  register_password_placeholder: 'Enter password',
  register_password_required: 'Password is required',
  register_confirm_password: 'Confirm Password',
  register_confirm_password_placeholder: 'Enter confirm password',
  register_confirm_password_required: 'Confirm password is required',
  register_confirm_password_match: 'Confirm password does not match',
  register_submit: 'Register',
  register_success_message:
    'Registration successful. Please check your email to verify your account.',
  register_have_account: 'Already have an account?',
  register_login_link: 'Login',
  register_show_password: 'Show password',
  EMAIL_ALREADY_EXISTS: 'Email already exists. Please use a different email.',
  REGISTER_ACCOUNT_NOT_ACTIVATED:
    'Email already exists but not activated. Please check your email to activate your account.',

  // verify
  verify_success_title: 'Account Verified',
  verify_success_message: 'Your account has been successfully verified.',
  verify_back_home: 'Back to Home',

  // forgot password
  forgot_password_title: 'Forgot Password',
  forgot_password_placeholder: 'Enter your email',
  forgot_password_submit: 'Send Request',
  forgot_password_sending: 'Sending...',
  forgot_password_success:
    'Please check your email for the password reset link',
  forgot_password_email_required: 'Please enter your email',
  reset_password_title: 'Đặt lại mật khẩu',
  reset_password_new_password_placeholder: 'New Password',
  reset_password_confirm_password_placeholder: 'Confirm Password',
  reset_password_submit: 'Reset Password',
  reset_password_strength: 'Password Strength',
  reset_password_tips: 'Min 8 chars, uppercase, number & special character',
  USER_NOT_FOUND: 'User not found',
  FORGOT_ACCOUNT_NOT_ACTIVATED: 'Account not activated',
  PASSWORDS_REQUIRED: 'Passwords are required',
  PASSWORD_RESET_TOKEN_INVALID: 'Invalid password reset token',
  PASSWORD_RESET_TOKEN_ALREADY_CONFIRMED:
    'Password reset token already confirmed',
  PASSWORD_RESET_TOKEN_EXPIRED: 'Password reset token expired',
  INVALID_PASSWORD_FORMAT: 'Invalid password format',
  PASSWORD_REUSE: 'New password must not be the same as the old password',
  RESET_PASSWORD_SUCCESS: 'Password reset successful, please log in again',
  RESET_PASSWORD_ERROR: 'Failed to reset password',
  reset_password_strength_weak: 'Weak Password',
  reset_password_strength_medium: 'Medium Password',
  reset_password_strength_strong: 'Strong Password',

  // Update Password
  CHANGE_PASSWORD: 'Change Password',
  CHANGE_PASSWORD_SUBTITLE: 'Enter a new password',
  ENTER_NEW_PASSWORD: 'Enter new password',
  CURRENT_PASSWORD: 'Current password',
  CURRENT_PASSWORD_REQUIRED: 'Current password is required!',
  ENTER_CURRENT_PASSWORD: 'Enter current password',
  NEW_PASSWORD: 'New password',
  NEW_PASSWORD_REQUIRED: 'New password is required!',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  PASSWORD_COMPLEXITY:
    'Include at least 1 uppercase letter, 1 number and 1 symbol',
  PASSWORD_STRENGTH: 'Password strength',
  PASSWORD_TIPS:
    'Use at least 8 characters with a mix of uppercase letters, numbers, and symbols.',
  CONFIRM_NEW_PASSWORD: 'Confirm new password',
  CONFIRM_PASSWORD_REQUIRED: 'Confirm password is required!',
  CONFIRM_NEW_PASSWORD_PLACEHOLDER: 'Confirm new password',
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
  CHANGE_PASSWORD_SUCCESS: 'Password changed successfully',
  CHANGE_PASSWORD_ERROR: 'Failed to change password',
  CAPSLOCK_ON: 'Caps Lock is on',
  INVALID_OLD_PASSWORD: 'Invalid current password',
  NEW_PASSWORD_SAME_AS_OLD: 'New password must be different from old password',
};

export default common;
