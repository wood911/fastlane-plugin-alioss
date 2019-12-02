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


支持Mac和Windows <br>

---
MacOS平台：<br>
Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew cask install fastlane`

Windows平台：<br>
1、Install ruby on your windows machine. ([不知道如何安装ruby？](https://www.runoob.com/ruby/ruby-installation-windows.html)) <br>
2、Go to your command line and type `gem install fastlane -NV`. <br>
3、You have fastlane on your windows machine ready. <br>
参考：https://stackoverflow.com/questions/43797206/fastlane-windows-cannot-installing <br>


MacOS & Windows环境配置好后，需要安装fastlane插件以支持iOS、Android个性化定制功能 <br>
* `gem 'fastlane-plugin-versioning'`
* `gem 'fastlane-plugin-appicon'`
* `gem 'fastlane-plugin-changelog'`
* `gem 'fastlane-plugin-pgyer'`
* `gem 'fastlane-plugin-alioss'`
* `gem 'fastlane-plugin-versioning_android'`  
<br>
不安装这些，首次使用命令时会自动安装 <br>

---

`Gemfile`文件需要添加阿里云ruby SDK `gem 'aliyun-sdk', '~> 0.3.0'` <br>

关于阿里云OSS文件服务器最终目录结构介绍：<br>
![阿里云OSS目录结构图01](doc/001.png)<br>
![阿里云OSS目录结构图01](doc/002.png)<br>
![阿里云OSS目录结构图01](doc/003.png)<br>
![阿里云OSS目录结构图01](doc/004.png)<br>
![阿里云OSS目录结构图01](doc/005.png)<br>

参考文档：[react-native fastlane自动化构建分发应用管理工具for iOS and Android（去掉RN即可移植到自己的项目）](https://www.cnblogs.com/wood-life/p/10649619.html) <br>

[完整的fastlane配置for iOS/Android](doc/fastlane配置.zip) <br>


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
