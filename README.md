# alioss plugin

[![fastlane Plugin Badge](https://rawcdn.githack.com/fastlane/fastlane/master/fastlane/assets/plugin-badge.svg)](https://rubygems.org/gems/fastlane-plugin-alioss)

## Getting Started

This project is a [_fastlane_](https://github.com/fastlane/fastlane) plugin. To get started with `fastlane-plugin-alioss`, add it to your project by running:

```bash
fastlane add_plugin alioss
```

## About alioss

upload ipa/apk to aliyun oos server, and scan QRcode to install app on mobile phone.

**Note to author:** Add a more detailed description about this plugin here. If your plugin contains multiple actions, make sure to mention them here.

## Example

Check out the [example `Fastfile`](fastlane/Fastfile) to see how to use this plugin. Try it by cloning the repo, running `fastlane install_plugins` and `bundle exec fastlane test`.

or <br>

Add <br>
`gem 'fastlane-plugin-alioss', git: 'https://github.com/woodtengfei/fastlane-plugin-alioss'`  or <br> 
`gem 'fastlane-plugin-alioss'`  <br>
to Gemfile. running `bundle install`.


Just specify the `endpoint` , `access_key_id` , `bucket_name` associated with your pgyer account.

```
lane :beta do
  gym
  alioss(endpoint: "oss-cn-shenzhen.aliyuncs.com", access_key_id: "xxx", access_key_secret: "xxx", bucket_name: "app-test")
end
```

Set a version update description for App:

```
lane :beta do
  gym
  alioss(endpoint: "oss-cn-shenzhen.aliyuncs.com", access_key_id: "xxx", access_key_secret: "xxx", bucket_name: "app-test", update_description: "update by fastlane")
end
```

**Note to author:** Please set up a sample project to make it easy for users to explore what your plugin does. Provide everything that is necessary to try out the plugin in this project (including a sample Xcode/Android project if necessary)

## Run tests for this plugin

To run both the tests, and code style validation, run

```
rake
```

To automatically fix many of the styling issues, use
```
rubocop -a
```

## Issues and Feedback

For any other issues and feedback about this plugin, please submit it to this repository.

## Troubleshooting

If you have trouble using plugins, check out the [Plugins Troubleshooting](https://docs.fastlane.tools/plugins/plugins-troubleshooting/) guide.

## Using _fastlane_ Plugins

For more information about how the `fastlane` plugin system works, check out the [Plugins documentation](https://docs.fastlane.tools/plugins/create-plugin/).

## About _fastlane_

_fastlane_ is the easiest way to automate beta deployments and releases for your iOS and Android apps. To learn more, check out [fastlane.tools](https://fastlane.tools).
