require 'cgi'
require 'cgi/session'
require 'cgi/session/pstore'     # provides CGI::Session::PStore
require 'wikk_web_auth'
require 'wikk_configuration'

# Authorization: Basic YnxpcYRlc3RwMTulHGhlSGs=
# Authorization: AWS AKIAIOSFODNN7EXAMPLE:frJIUN8DYpKDtOLCwo//yllqDzg=
# Authorization: WIKK user:binhexed_md5_of_password+salt
class Authenticate < RPC
  def initialize(authenticated = false)
    super(authenticated)
    @cgi = CGI.new('html3') # Need a dummy cgi here, to access the pstore.
    @login_conf = WIKK::Configuration.new(WIKK_PASSWORD_CONF)
    @pstore_conf = JSON.parse(File.read(PSTORE_CONF))
  end

  rmethod :authenticated do |**_args|  # rubocop:disable Lint/UnusedBlockArgument"
    return { 'authenticated' => WIKK::Web_Auth.authenticated?(@cgi, pstore_config: @pstore_conf),
             'user' => ''
           }
  end

  rmethod :login do |user:, key:, return_url:, **_args|  # rubocop:disable Lint/UnusedBlockArgument"
    # will either generate a login page
    # Or no page, if we are already authenticated
    auth = WIKK::Web_Auth.new(@cgi, @login_conf, return_url, pstore_config: @pstore_conf)

    return { 'authenticated' => auth.authenticated?,
             'user' => ''
           }
  end

  rmethod :logout do |return_url:, **_args|  # rubocop:disable Lint/UnusedBlockArgument"
    WIKK::Web_Auth.logout(@cgi, pstore_config: @pstore_conf)

    return { 'authenticated' => false,
             'user' => ''
           }
  end
end
