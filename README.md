# wikk_password

* Source https://github.com/wikarekare/wikk_web_auth_login

## DESCRIPTION:

Login cgi to be used in conjunction with other Wikarekare cgis and the wikk_web_auth gem. Also with supporting wikk_web_auth_js javascript library, which can be used to embed authentication into html pages.

## FEATURES/PROBLEMS:


## SYNOPSIS:

* login.rbx?ReturnURL=http://admin2.wikarekare.org/ provides login form, and redirect on success
* login.rbx?action=logout Terminates the current session
* login.rbx?action=test Return json { "returnCode": "true" } or { "returnCode": "false" }

## REQUIREMENTS:

###Gem required
* require 'securerandom'
* require 'wikk_aes_256'
* require 'wikk_password'
* require 'wikk_web_auth'
* require 'wikk_configuration'

## INSTALL:

* cp login.rbx /var/www/wikarekare/ruby/

## LICENSE:

(The MIT License)

Copyright (c) 2004-2016

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
