const common = {
  // AUTH
  AUTH_LOGIN: 'Login',
  AUTH_SIGNUP: 'Sign Up',
  AUTH_REGISTER: 'Register',
  AUTH_LOGOUT: 'Logout',
  AUTH_EMAIL: 'Email',
  AUTH_PASSWORD: 'Password',
  AUTH_CONFIRM_PASSWORD: 'Confirm Password',
  AUTH_FORGOT_PASSWORD: 'Forgot password?',

  // BUTTONS
  BUTTONS_SUBMIT: 'Submit',
  BUTTONS_CANCEL: 'Cancel',
  BUTTONS_BOOK_NOW: 'Book Now',
  BUTTONS_SEE_MORE: 'See More',
  BUTTONS_BACK: 'Back',

  // HOME
  HOME_TITLE: 'Welcome to our cinema!',
  HOME_SUBTITLE: 'Discover the latest movies.',

  // MOVIES
  MOVIES_NOW_SHOWING: 'Now Showing',
  MOVIES_COMING_SOON: 'Coming Soon',
  MOVIES_NO_MOVIES: 'No movies found.',
  MOVIES_LOADING: 'Loading movies...',
  MOVIES_TITLE: 'Title',
  MOVIES_DESCRIPTION: 'Description',

  // CINEMA
  CINEMA_CHOOSE_CINEMA: 'Choose a cinema',
  CINEMA_NO_CINEMA: 'No cinema available.',
  CINEMA_LOCATION: 'Location',
  CINEMA_SCHEDULE: 'Showtime',

  // REVIEW
  REVIEW_TITLE: 'Reviews',
  REVIEW_YOUR_REVIEW: 'Your review',
  REVIEW_SUBMIT_REVIEW: 'Submit Review',
  REVIEW_NO_REVIEWS: 'No reviews yet.',

  // USER
  USER_PROFILE: 'Profile',
  USER_MY_HISTORIES: 'My Histories',
  USER_SETTINGS: 'Settings',
  USER_LOGOUT: 'Logout',
  USER_CHANGE_PASSWORD: 'Change Password',

  // FOOTER
  FOOTER_CUSTOMER_CARE: 'Customer Care',
  FOOTER_ADDRESS: '123 Cinema Street, Hanoi, Vietnam',
  FOOTER_HOTLINE: 'Hotline: +84 123 456 789',
  FOOTER_EMAIL: 'Email: support@cinema.com',
  FOOTER_BUY_TICKET: 'Buy Tickets',
  FOOTER_SCHEDULE: 'Schedule',
  FOOTER_CINEMA: 'Cinemas',
  FOOTER_MOVIE: 'Movies',
  FOOTER_REVIEW: 'Reviews',
  FOOTER_BLOG: 'Blog',
  FOOTER_TERMS: 'Terms of Use',
  FOOTER_PRIVACY: 'Privacy Policy',
  FOOTER_CONNECT: 'Connect with us',
  FOOTER_COPYRIGHT: 'Copyright © 2025',
  FOOTER_DMCA: 'DMCA',
  FOOTER_CONTACT: 'Contact Us',
  FOOTER_TERMS_OF_SERVICE: 'Terms of Service',

  // MESSAGES
  MESSAGES_ERROR: 'An error occurred',
  MESSAGES_MESSAGES_LOADING: 'Loading...',

  // LOGIN
  LOGIN_TITLE: 'Login to your account',
  LOGIN_GOOGLE_LOGIN: 'Login with Google',
  LOGIN_FACEBOOK_LOGIN: 'Login with Facebook',
  LOGIN_EMAIL_PLACEHOLDER: 'Enter email',
  LOGIN_PASSWORD_PLACEHOLDER: 'Enter password',
  LOGIN_FORGOT_PASSWORD: 'Forgot password?',
  LOGIN_LOGIN_BUTTON: 'Login',
  LOGIN_REGISTER_PROMPT: "Don't have an account?",
  LOGIN_REGISTER_LINK: 'Register?',
  LOGIN_OR: 'or',
  LOGIN_EMAIL_INVALID: 'Email is invalid',
  LOGIN_EMAIL_REQUIRED: 'Email is required',
  LOGIN_PASSWORD_REQUIRED: 'Password is required',
  ACCOUNT_NOT_ACTIVATED:
    'Your account is not activated. Please check your email for the activation link.',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  MESSAGES_LOGIN_SUCCESS: 'Login successful',
  MESSAGES_LOGOUT_SUCCESS: 'Logout successful',

  // SEARCH
  SEARCH_PLACEHOLDER: 'Search movies or theaters',

  // REGISTER
  REGISTER_TITLE: 'Register your account',
  REGISTER_NAME: 'Name',
  REGISTER_NAME_PLACEHOLDER: 'Enter name',
  REGISTER_NAME_REQUIRED: 'Name is required',
  REGISTER_EMAIL: 'Email',
  REGISTER_EMAIL_PLACEHOLDER: 'Enter email',
  REGISTER_EMAIL_REQUIRED: 'Email is required',
  REGISTER_EMAIL_INVALID: 'Email is invalid',
  REGISTER_PHONE: 'Phone',
  REGISTER_PHONE_PLACEHOLDER: 'Enter phone',
  REGISTER_PHONE_REQUIRED: 'Phone number is required',
  REGISTER_PHONE_INVALID: 'Phone number is invalid',
  REGISTER_PASSWORD: 'Password',
  REGISTER_PASSWORD_PLACEHOLDER: 'Enter password',
  REGISTER_PASSWORD_REQUIRED: 'Password is required',
  REGISTER_CONFIRM_PASSWORD: 'Confirm Password',
  REGISTER_CONFIRM_PASSWORD_PLACEHOLDER: 'Enter confirm password',
  REGISTER_CONFIRM_PASSWORD_REQUIRED: 'Confirm password is required',
  REGISTER_CONFIRM_PASSWORD_MATCH: 'Confirm password does not match',
  REGISTER_SUBMIT: 'Register',
  REGISTER_SUCCESS_MESSAGE:
    'Registration successful. Please check your email to verify your account.',
  REGISTER_HAVE_ACCOUNT: 'Already have an account?',
  REGISTER_LOGIN_LINK: 'Login',
  REGISTER_SHOW_PASSWORD: 'Show password',
  EMAIL_ALREADY_EXISTS: 'Email already exists. Please use a different email.',
  REGISTER_ACCOUNT_NOT_ACTIVATED:
    'Email already exists but not activated. Please check your email to activate your account.',

  // VERIFY
  VERIFY_SUCCESS_TITLE: 'Account Verified',
  VERIFY_SUCCESS_MESSAGE: 'Your account has been successfully verified.',
  VERIFY_BACK_HOME: 'Back to Home',

  // FORGOT PASSWORD
  FORGOT_PASSWORD_TITLE: 'Forgot Password',
  FORGOT_PASSWORD_PLACEHOLDER: 'Enter your email',
  FORGOT_PASSWORD_SUBMIT: 'Send Request',
  FORGOT_PASSWORD_SENDING: 'Sending...',
  FORGOT_PASSWORD_SUCCESS:
    'Please check your email for the password reset link',
  FORGOT_PASSWORD_EMAIL_REQUIRED: 'Please enter your email',
  RESET_PASSWORD_TITLE: 'Đặt lại mật khẩu',
  RESET_PASSWORD_NEW_PASSWORD_PLACEHOLDER: 'New Password',
  RESET_PASSWORD_CONFIRM_PASSWORD_PLACEHOLDER: 'Confirm Password',
  RESET_PASSWORD_SUBMIT: 'Reset Password',
  RESET_PASSWORD_STRENGTH: 'Password Strength',
  RESET_PASSWORD_TIPS: 'Min 8 chars, uppercase, number & special character',
  USER_NOT_FOUND: 'User not found',
  FORGOT_ACCOUNT_NOT_ACTIVATED: 'Account not activated',
  RESET_PASSWORDS_REQUIRED: 'Password is required',
  RESET_CONFIRM_PASSWORDS_REQUIRED: 'Confirm password is required',
  RESET_CONFIRM_PASSWORDS_NOT_MATCH: 'Confirm password does not match',
  PASSWORD_RESET_TOKEN_INVALID: 'Invalid password reset token',
  PASSWORD_RESET_TOKEN_ALREADY_CONFIRMED:
    'Password reset token already confirmed',
  PASSWORD_RESET_TOKEN_EXPIRED: 'Password reset token expired',
  INVALID_PASSWORD_FORMAT: 'Invalid password format',
  PASSWORD_REUSE: 'New password must not be the same as the old password',
  RESET_PASSWORD_SUCCESS: 'Password reset successful, please log in again',
  RESET_PASSWORD_ERROR: 'Failed to reset password',
  RESET_PASSWORD_STRENGTH_WEAK: 'Weak Password',
  RESET_PASSWORD_STRENGTH_MEDIUM: 'Medium Password',
  RESET_PASSWORD_STRENGTH_STRONG: 'Strong Password',

  // UPDATE PASSWORD
  CHANGE_PASSWORD: 'Change Password',
  CHANGE_PASSWORD_SUBTITLE: 'Please choose a strong and memorable password',
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

  //CinemaCorner
  CINEMACORNER_CORNER: 'Cinema Corner',
  CINEMACORNER_LOADING: 'Loading...',
  CINEMACORNER_TAB_BLOG: 'Blog',
  CINEMACORNER_TAB_REVIEW: 'Review',
  CINEMACORNER_TAB_CAST: 'Cast',
  CINEMACORNER_MOVIE: 'Movie',
  CINEMACORNER_SEE_MORE: 'See more',
  CINEMACORNER_ALL_REVIEWS: 'All reviews',
};

export default common;
