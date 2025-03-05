Troubleshooting
================= 

Port 5000 Conflict on macOS
--------------------------

On macOS, port 5000 is used by AirPlay Receiver by default. Since the backend server also uses port 5000, you may encounter a port conflict error when trying to start the backend server.

To resolve this issue, you can either:

1. Disable AirPlay Receiver:
   
   * Go to System Preferences/Settings
   * Click on "Sharing"
   * Uncheck "AirPlay Receiver"

Note: If you're using macOS Monterey (macOS 12) or later, AirPlay Receiver is enabled by default and uses port 5000.

Authentication Issues
-------------------

1. Session Expired:
   * If you're suddenly logged out or see "Session Expired" messages
   * Simply log out and log back in
   * Make sure cookies are enabled in your browser

2. Login Problems:
   * Clear your browser cache and cookies
   * Make sure you're using the correct credentials
   * If you forgot your password, use the "Forgot Password" link
   * Check if Caps Lock is turned off

Backend Server Issues
-------------------

1. Server Won't Start:
   * Check if another process is using port 5000
   * Ensure all required dependencies are installed (`pip install -r requirements.txt`)
   * Verify that Python version is compatible (Python 3.8 or higher)
   * Check the server logs for specific error messages

2. Database Connection:
   * Ensure the database server is running
   * Verify database credentials in configuration
   * Check if database port is accessible
   * Make sure you have necessary database permissions

Frontend Issues
-------------

1. Blank Screen or Loading Forever:
   * Clear browser cache and refresh
   * Check browser console for JavaScript errors
   * Verify that the backend server is running
   * Ensure you're using a supported browser (Chrome, Firefox, Safari, Edge)

2. UI Elements Not Working:
   * Try hard refresh (Ctrl+F5 or Cmd+Shift+R)
   * Disable browser extensions that might interfere
   * Update your browser to the latest version

Network Issues
------------

1. CORS Errors:
   * Check if backend and frontend URLs match the configuration
   * Verify CORS settings in the backend configuration
   * Ensure you're using the correct protocol (http/https)

2. Connection Timeouts:
   * Check your internet connection
   * Verify the server is running and accessible
   * Check if firewall is blocking connections
   * Ensure VPN (if used) is working correctly

Performance Issues
----------------

1. Slow Loading Times:
   * Check your internet connection speed
   * Clear browser cache
   * Close unnecessary browser tabs
   * Monitor server resource usage

2. High CPU/Memory Usage:
   * Check for memory leaks in browser dev tools
   * Restart the application
   * Monitor system resources
   * Close other resource-intensive applications

Common Error Messages
------------------

1. "Internal Server Error (500)":
   * Check server logs for detailed error messages
   * Verify database connections
   * Ensure all required services are running
   * Check file permissions

2. "Not Found (404)":
   * Verify the URL is correct
   * Check if the resource exists
   * Ensure proper routing configuration

3. "Unauthorized (401)":
   * Check if you're logged in
   * Verify your session hasn't expired
   * Ensure you have proper permissions



