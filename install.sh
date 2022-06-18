#!/bin/bash
VERSION="2.0.0"
git tag -a ${VERSION} -m "Release ${VERSION}"
sudo install -o www -g ldap -D /var/www/wikarekare/ruby/ login.rbx

