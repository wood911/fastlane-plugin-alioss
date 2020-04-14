# coding: utf-8

lib = File.expand_path("../lib", __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'fastlane/plugin/alioss/version'

Gem::Specification.new do |spec|
  spec.name          = 'fastlane-plugin-alioss'
  spec.version       = Fastlane::Alioss::VERSION
  spec.author        = 'woodwu'
  spec.email         = 'woodwu@dotdotbuy.com'

  spec.summary       = 'upload ipa/apk to aliyun oos server, and scan QRcode to install app on mobile phone.'
  spec.homepage      = "https://github.com/woodtengfei/fastlane-plugin-alioss"
  spec.license       = "MIT"

  spec.files         = Dir["lib/**/*"] + %w(README.md LICENSE)
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ['lib']

  # Don't add a dependency to fastlane or fastlane_re
  # since this would cause a circular dependency

  # spec.add_dependency 'your-dependency', '~> 1.0.0'

  spec.add_development_dependency('pry')
  spec.add_development_dependency('bundler')
  spec.add_development_dependency('rspec')
  spec.add_development_dependency('rspec_junit_formatter')
  spec.add_development_dependency('rake')
  spec.add_development_dependency('rubocop', '0.49.1')
  spec.add_development_dependency('rubocop-require_tools')
  spec.add_development_dependency('simplecov')
  spec.add_development_dependency('fastlane', '>= 2.136.0')
  spec.add_development_dependency('aliyun-sdk', '>= 0.7.0')
end
