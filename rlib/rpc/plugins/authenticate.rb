require 'cgi'
require 'cgi/session'
require 'cgi/session/pstore'     # provides CGI::Session::PStore
require 'wikk_web_auth'
require 'wikk_configuration'

# Authorization: Basic YnxpcYRlc3RwMTulHGhlSGs=
# Authorization: AWS AKIAIOSFODNN7EXAMPLE:frJIUN8DYpKDtOLCwo//yllqDzg=
# Authorization: WIKK user:binhexed_md5_of_password+salt
class Authenticate < RPC
  # Init class
  # @param authenticated [Boolean] passed in, if we know our authentication status.
  def initialize(cgi:, authenticated: false)
    super(cgi: cgi, authenticated: authenticated)
    @login_conf = WIKK::Configuration.new(WIKK_PASSWORD_CONF) # Where is our password file
    @pstore_conf = JSON.parse(File.read(PSTORE_CONF)) # Where is our pstore
  end

  # We are authenticated, if there is a current session in the pstore, for this session cookie
  # Note that we are ignoring the authenticated status passed to us in initialize, and validating again.
  rmethod :authenticated do |select_on: nil, set: nil, result: nil, **_args|  # rubocop:disable Lint/UnusedBlockArgument
    return { 'authenticated' => WIKK::Web_Auth.authenticated?(@cgi, pstore_config: @pstore_conf) }
  end

  # Step 1 of a login is to get the challenge packet
  # We might already be authenticated, but this call will delete that session (based on the cookie in @cgi)
  # challenge is a random string, used in the next step of the authentication
  # Nb. The @cgi.@output_cookies Array and the @cgi.output_hidden Hash will have a cookie set by this step
  rmethod :challenge do |select_on: nil, set: nil, result: nil, **_args|  # rubocop:disable Lint/UnusedBlockArgument
    username = select_on['username']
    return_url = select_on['return_url']
    raise 'require user name' if username.nil? || username.empty?

    auth = WIKK::Web_Auth.new(@cgi, @login_conf, return_url, user: username, pstore_config: @pstore_conf, run_auth: false)
    return { 'authenticated' => false,
             'challenge' => auth.gen_challenge
           }
  end

  # Step 2 of a login is to respond to the challenge packet
  # The response uses the challenge to create a unique hash with the password
  # Nb. The @cgi.@output_cookies Array and the @cgi.output_hidden Hash will have a cookie reset by this step
  rmethod :response do |select_on: nil, set: nil, result: nil, **_args|  # rubocop:disable Lint/UnusedBlockArgument
    # will either generate a login page
    # Or no page, if we are already authenticated
    username = select_on['username']
    response = select_on['response']
    return_url = select_on['return_url']
    raise 'require user name' if username.nil? || username.empty?

    auth = WIKK::Web_Auth.new(@cgi, @login_conf, return_url, user: username, response: response, pstore_config: @pstore_conf, run_auth: false)
    return { 'authenticated' => auth.valid_response? }
  end

  rmethod :logout do |select_on: nil, set: nil, result: nil, **_args|  # rubocop:disable Lint/UnusedBlockArgument
    WIKK::Web_Auth.logout(@cgi, pstore_config: @pstore_conf)

    return { 'authenticated' => false }
  end
end
