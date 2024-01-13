var wikk_rpc_web_auth = (function () {
  //authentication
  var VERSION = "1.0.0";
  var auth_cgi = "/rpc"; // Should also work with the older ruby/rpc.rbx prefix
  var login_url = "/admin/authenticate.html"
  var use_lock_only = false; //Use only the lock/unlock images, and no text in the div.
  var return_url = null; //Where we jump to if we are authenticated.
  var authentication_state = false; //We have authenticated this session.
  var login_span = null; //id of the div or span element we inject the login button into.
  var recheck_interval = set_recheck_interval(null); //Recheck we are logged in every interval, and change div/span appropriately.
  var user = "";
  var password = "";
  var challenge = "";
  var callers_login_callback = null;
  var callers_logout_callback = null;
  var callers_authenticate_callback = null;

  var lock_image = new Image(); //cache the lock image here
  lock_image.src = "/images/locked.gif";
  var unlock_image = new Image(); //cache the unlock image here
  unlock_image.src = "/images/unlocked.gif";

  function version() { return VERSION; }

  // The login span has a locked icon, for unauthenticated
  // And an unlocked icon for authenticated
  function set_lock_icon() {
    if( login_span != null ){
      if(is_authenticated) {
        image_url = '<img src="/images/unlocked.gif"></a>';
        text = 'logout';
      } else {
        image_url = '<img src="/images/locked.gif"></a>';
        text = 'login';
      }
      if(use_lock_only){
        link = image_url
      } else {
        link = text + image_url
      }
      if(return_url == null) {
        // Return to this page
        return_url = window.location.url
      }
      login_span.innerHTML = '<a href="' + login_url + '?action=' + text + '&ReturnURL=' + return_url + '">' + link + ' </a>'
    }
  }

  //// Check to see if we are authenticated ////
  function authenticated_callback(data) {   //Called when we get a response.
    if(data != null && data.result != null) {
      is_authenticated = data.result.authenticated;
    } else { // Assume unauthenticated, if we get no valid response
      is_authenticated = false;
    }
    set_lock_icon()
    authenticated(recheck_interval)
  }

  function authenticated_error(jqXHR, textStatus, errorMessage) {   //Called on failure
    alert( "Check Authenticated Error: " + errorMessage );
  }

  function authenticated_completion(data) {   //Called when everything completed, including callback.
    if(callers_authenticate_callback != null){
      callers_authenticate_callback(is_authenticated);
    }
  }

  function authenticated(delay) {
    //alert(site_input.name + " " + site_input.value);
    var args = {
      "method": "Authenticate.authenticated",
      "params": { },
      "id": Date.getTime(),
      "jsonrpc": 2.0
    }
    url = auth_cgi
    wikk_ajax.delayed_ajax_post_call(url, args, authenticated_callback, authenticated_error, authenticated_completion, 'json', true, delay)
  }

  //// Step 1: Fetch the challenge hash ////
  function challenge_callback(data) {   //Called when we get a response.
    if(data != null && data.result != null) {
      is_authenticated = data.result.authenticated;
      challenge = data.result.challenge;
    }
    reponse()
  }

  function challenge_error(jqXHR, textStatus, errorMessage) {   //Called on failure
    alert( "Login Challenge Error: " + errorMessage );
  }

  function challenge_completion(data) {   //Called when everything completed, including callback.
  }

  function challenge() {
    var args = {
      "method": "Authenticate.challenge",
      "params": {
         "username": user
      },
      "id": Date.getTime(),
      "jsonrpc": 2.0
    }
    url = RPC
    wikk_ajax.ajax_post_call(url, args, authenticated_callback, authenticated_error, authenticated_completion, 'json', true )
  }

  //// Step 2: Response ////
  function response_callback(data) {   //Called when we get a response.
    if(data != null && data.result != null) {
      is_authenticated = data.result.authenticated;
    } else { // Assume unauthenticated, if we get no valid response
      is_authenticated = false;
    }
    set_lock_icon();
    the_password = "";
  }

  function response_error(jqXHR, textStatus, errorMessage) {   //Called on failure
    alert( "Login Response Error: " + errorMessage );
  }

  function response_completion(data) {   //Called when everything completed, including callback.
    if( callers_login_callback != null ){
      callers_login_callback(is_authenticated)
    }
  }

  function response() {
    response = hex_sha256(password+challenge);
    var args = {
      "method": "Authenticate.login",
      "params": {
         "username": user,
         "response": response
      },
      "id": Date.getTime(),
      "jsonrpc": 2.0
    }
    url = RPC
    wikk_ajax.ajax_post_call(url, args, response_callback, response_error, response_completion, 'json', true );
  }

  //// Logout Request ////
  function logout_callback(data) {   //Called when we get a response.
    if(data != null && data.result != null) {
      is_authenticated = data.result.authenticated;
      set_lock_icon();
    }
  }

  function logout_error(jqXHR, textStatus, errorMessage) {   //Called on failure
    alert( "Logout Error: " + errorMessage );
  }

  function logout_completion(data) {   //Called when everything completed, including callback.
    if( callers_logout_callback != null ){
      callers_logout_callback(is_authenticated)
    }
  }

  function send_logout() {
    var args = {
      "method": "Authenticate.logout",
      "params": {
      },
      "id": Date.getTime(),
      "jsonrpc": 2.0
    }
    url = RPC
    wikk_ajax.ajax_post_call(url, args, logout_callback, logout_error, logout_completion, 'json', true );
  }


  //// Login here //////
  function login(the_user, the_password, callback=null) {
    user = the_user;
    password = the_password;
    callers_login_callback = callback;
    challenge(); // Which calls response when it completes
  }

  function logout(callback=null) {
    callers_logout_callback = callback;
    send_logout();
  }

  function get_user() {
    return user;
  }

  //Change the current recheck interval. A change in login state will toggle the lock/unlock image in the span.
  //  @param milliseconds [Integer] Delay between Ajax calls to check the current login state.
  function set_recheck_interval(milliseconds) {
    recheck_interval = (milliseconds == null) ? 180000 : milliseconds; //Default value is 3 minutes.
  }

  // Set up the login span. It has either [login|logout|''] and a lock or unlocked icon.
  function init(span, the_return_url, lock_only = true, authenticate_callback=null ) {
    if( span != null ) {
      login_span = document.getElementById(span);
    }
    return_url = the_return_url;
    use_lock_only = lock_only;
    callers_authenticate_callback = authenticate_callback;
    // Start a never ending check for being authenticated
    authenticated(0);
  }

  //return a hash of key: function pairs, with the key being the same name as the function.
  //Hence call with wikk_auth_module.function_name()
  return {
    init: init,
    login: login,
    logout: logout,
    authenticated: authenticated,
    user: get_user,
    set_recheck_interval: set_recheck_interval,
    version: version
  }
})();
