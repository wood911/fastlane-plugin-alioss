# -*- coding: UTF-8 -*-
require 'fastlane/action'
require_relative '../helper/alioss_helper'
require 'aliyun/oss'
require 'json'

module Fastlane
  module Actions
    class AliossAction < Action
      def self.run(params)
        UI.message("The alioss plugin is working!")

        endpoint = params[:endpoint]
        bucket_name = params[:bucket_name]
        access_key_id = params[:access_key_id]
        access_key_secret = params[:access_key_secret]
        path_for_app_name = params[:app_name]
        html_header_title = params[:html_header_title]

        build_file = [
            params[:ipa],
            params[:apk]
        ].detect { |e| !e.to_s.empty? }

        # build_file = "/Users/wood/Documents/SuperbuyApp/build/output/Beta_20191127202707/Superbuy.ipa"

        if build_file.nil?
          UI.user_error!("请提供构建文件")
        end

        UI.message "endpoint: #{endpoint}  bucket_name: #{bucket_name}"
        UI.message "构建文件: #{build_file}"

        download_domain = params[:download_domain]
        if download_domain.nil?
          download_domain = "https://#{bucket_name}.#{endpoint}/"
        end

        update_description = params[:update_description]
        if update_description.nil?
          update_description = ""
        end

        # create aliyun oss client
        client = Aliyun::OSS::Client.new(
            endpoint: endpoint,
            access_key_id: access_key_id,
            access_key_secret: access_key_secret
        )

        bucket = client.get_bucket(bucket_name)

        # list all buckets
        UI.message "========== list all buckets =========="
        bucket_objects = []
        bucket.list_objects.each do |o|
          UI.message o.key
          bucket_objects.push(o.key)
        end
        UI.message "======================================"


        # 必须包含的文件，没有就引导去下载
        # must_bucket_file = ["app/config.json", "app/index.html"]
        unless bucket.object_exists?("#{path_for_app_name}/config.json")
          UI.message "配置文件不存在，初始化#{path_for_app_name}/config.json"
          config_json_file = self.create_config_json_file(
              download_domain: download_domain,
              html_header_title: html_header_title
          )
          bucket.put_object("#{path_for_app_name}/config.json", :file => File.expand_path(config_json_file))
          # 上传完成后删除本地文件
          self.delete_file(file: config_json_file)
          UI.message "#{path_for_app_name}/config.json 配置完成"
        end

        index_html_template_path = Helper::AliossHelper.index_html_template_path
        UI.message "模板文件路径：#{index_html_template_path}"

        if !bucket.object_exists?("#{path_for_app_name}/index.html")
          UI.message "配置文件不存在，初始化#{path_for_app_name}/index.html"
          bucket.put_object("#{path_for_app_name}/index.html", :file => index_html_template_path)
          UI.message "#{path_for_app_name}/index.html 配置完成"
        else
          if Alioss::VERSION >= "0.1.6"
            temp_index_html_path = File.expand_path('temp_index.html')
            bucket.get_object("#{path_for_app_name}/index.html", :file => temp_index_html_path)
            temp_index_html = File.read(temp_index_html_path)
            last_match_obj = temp_index_html.to_s.scan(/>version:(.*)<\/div>/).last
            if last_match_obj.class == Array && !last_match_obj.empty?
              html_version = last_match_obj.first
              UI.message "index.html version: #{html_version}"
            else
              # 匹配不到版本号，是以前版本，上传新文件覆盖
              bucket.put_object("#{path_for_app_name}/index.html", :file => index_html_template_path)
              UI.message "成功更新index.html"
            end
            self.delete_file(file: temp_index_html_path)
          end
        end

        file_size = File.size(build_file)
        filename = File.basename(build_file)

        # 获取 build_number & version_number
        build_number = Actions.lane_context[SharedValues::BUILD_NUMBER]
        version_number = Actions.lane_context[SharedValues::VERSION_NUMBER]

        # 根据不同的文件类型区分平台，拼接bucket_path路径
        case File.extname(filename)
        when ".ipa"
          bucket_path = "#{path_for_app_name}/iOS"
          # 如果无法从lane_context中获取则从实际的ipa文件中读取
          if build_number.nil? || version_number.nil?
            build_number = GetIpaInfoPlistValueAction.run(ipa: build_file, key: 'CFBundleVersion')
            version_number = GetIpaInfoPlistValueAction.run(ipa: build_file, key: 'CFBundleShortVersionString')
          end
        when ".apk"
          bucket_path = "#{path_for_app_name}/Android"
          # versionName、versionCode先从output.json文件里取
          apk_output_json_path = File.join(File.dirname(build_file), "output.json")
          if File.readable?(apk_output_json_path)
            apk_output_json = JSON.parse(File.read(apk_output_json_path))
            if !apk_output_json.first.nil? && !apk_output_json.first["apkInfo"].nil?
              build_number = apk_output_json.first["apkInfo"]["versionCode"]
              version_number = apk_output_json.first["apkInfo"]["versionName"]
            end
          end
          # 如果output.json文件里取不到则从Actions.lane_context中取
          if build_number.nil? || version_number.nil?
            if Actions.lane_context[:ANDROID_VERSION_NAME].nil? || Actions.lane_context[:ANDROID_VERSION_CODE].nil?
              UI.important "Actions.lane_context 不包含[ANDROID_VERSION_NAME, ANDROID_VERSION_CODE]，请配置fastlane env（推荐在Fastlane文件中使用fastlane-plugin-versioning_android获取versionCode/versionName）。"
            else
              build_number = Actions.lane_context[SharedValues::ANDROID_VERSION_CODE]
              version_number = Actions.lane_context[SharedValues::ANDROID_VERSION_NAME]
            end
          end
        when ".app"
          bucket_path = "#{path_for_app_name}/Mac"
        else
          bucket_path = "#{path_for_app_name}/unknown"
          UI.user_error!("不支持的APP类型")
        end
        timestamp = Time.now
        bucket_path = "#{bucket_path}/#{timestamp.strftime('%Y%m%d%H%M%S')}/"

        UI.message "正在上传文件，可能需要几分钟，请稍等..."

        bucket.put_object(bucket_path + filename, :file => build_file)
        download_url = "#{download_domain}#{bucket_path}#{filename}"
        UI.message "download_url: #{download_url}"

        UI.message "上传成功，正在更新配置文件..."

        config_json_file_path = File.expand_path('config.json')
        bucket.get_object("#{path_for_app_name}/config.json", :file => config_json_file_path)
        config_json = JSON.parse(File.read(config_json_file_path))

        UI.message "build_number: #{build_number}  version_number: #{version_number}"

        # 构建文件元信息
        item_hash = {
            "domain" => download_domain,
            "path" => bucket_path,
            "name" => filename,
            "size" => file_size,
            "desc" => update_description,
            "version" => version_number,
            "build" => build_number,
            "time" => timestamp.to_i
        }

        # 根据不同的平台，将bucket_path记录到json中
        case File.extname(filename)
        when ".ipa"
          UI.message "配置 manifest.plist ..."
          app_name = GetIpaInfoPlistValueAction.run(ipa: build_file, key: 'CFBundleDisplayName')
          app_identifier = GetIpaInfoPlistValueAction.run(ipa: build_file, key: 'CFBundleIdentifier')
          download_url = download_url
          UI.message "app_name: #{app_name}"
          UI.message "app_identifier: #{app_identifier}"
          UI.message "version_number: #{version_number}"
          manifest_file = self.create_manifest_file(
              app_name: app_name,
              path_for_app_name: path_for_app_name,
              app_identifier: app_identifier,
              version_number: version_number,
              download_domain: download_domain,
              download_url: download_url
          )
          bucket_plist_path = "#{bucket_path}#{File.basename(manifest_file)}"
          UI.message "bucket_plist_path: #{bucket_plist_path}"
          bucket.put_object(bucket_plist_path, :file => File.expand_path(manifest_file))
          # 上传完成后删除本地文件
          self.delete_file(file: manifest_file)

          ipaList = config_json["ipaList"]
          if ipaList.nil?
            ipaList = []
          end
          item_hash["version"] = version_number
          item_hash["identifier"] = app_identifier
          ipaList.push(item_hash)
          config_json["ipaList"] = ipaList
        when ".apk"
          apkList = config_json["apkList"]
          if apkList.nil?
            apkList = []
          end
          apkList.push(item_hash)
          config_json["apkList"] = apkList
        when ".app"
          appList = config_json["appList"]
          if appList.nil?
            appList = []
          end
          appList.push(item_hash)
          config_json["appList"] = appList
        else
          UI.message ""
        end
        config_json["title"] = html_header_title

        UI.message "配置 config_json ..."
        # 将新的json数据写入到config_json_file中
        config_json_file = File.new(config_json_file_path, "w")
        config_json_file.puts(JSON.generate(config_json))
        config_json_file.close
        # 上传新文件覆盖oss的config.json
        bucket.put_object("#{path_for_app_name}/config.json", :file => config_json_file_path)
        # 上传完成后删除本地文件
        self.delete_file(file: config_json_file)

        UI.success "Success！✌️，请访问: #{download_domain}#{path_for_app_name}/index.html"

      end

      def self.description
        "upload ipa/apk to aliyun oos server, and scan QRcode to install app on mobile phone."
      end

      def self.authors
        ["woodwu"]
      end

      def self.return_value
        # If your method provides a return value, you can describe here what it does
      end

      def self.details
        # Optional:
        "将App发布到公司的阿里云文件服务器中，方便内部员工扫码测试"
      end

      def self.available_options
        [
            FastlaneCore::ConfigItem.new(key: :endpoint,
                                         env_name: "ALIOSS_ENDPOINT",
                                         description: "请提供 endpoint，Endpoint 表示 OSS 对外服务的访问域名。OSS 以 HTTP RESTful API 的形式对外提供服务，当访问不同的 Region 的时候，需要不同的域名。",
                                         optional: false,
                                         type: String),
            FastlaneCore::ConfigItem.new(key: :access_key_id,
                                         env_name: "ALIOSS_ACCESS_KEY_ID",
                                         description: "请提供 AccessKeyId，OSS 通过使用 AccessKeyId 和 AccessKeySecret 对称加密的方法来验证某个请求的发送者身份。AccessKeyId 用于标识用户。",
                                         optional: false,
                                         type: String),
            FastlaneCore::ConfigItem.new(key: :access_key_secret,
                                         env_name: "ALIOSS_ACCESS_KEY_SECRET",
                                         description: "请提供 AccessKeySecret，OSS 通过使用 AccessKeyId 和 AccessKeySecret 对称加密的方法来验证某个请求的发送者身份。AccessKeySecret 是用户用于加密签名字符串和 OSS 用来验证签名字符串的密钥，必须保密。",
                                         optional: false,
                                         type: String),
            FastlaneCore::ConfigItem.new(key: :bucket_name,
                                         env_name: "ALIOSS_BUCKET_NAME",
                                         description: "请提供 bucket_name，存储空间（Bucket）是您用于存储对象（Object）的容器，所有的对象都必须隶属于某个存储空间。存储空间具有各种配置属性，包括地域、访问权限、存储类型等。您可以根据实际需求，创建不同类型的存储空间来存储不同的数据。",
                                         optional: false,
                                         type: String),
            FastlaneCore::ConfigItem.new(key: :apk,
                                         env_name: "ALIOSS_APK",
                                         description: "APK文件路径",
                                         default_value: Actions.lane_context[SharedValues::GRADLE_APK_OUTPUT_PATH],
                                         optional: true,
                                         verify_block: proc do |value|
                                           UI.user_error!("请检查apk文件路径 '#{value}' )") unless File.exist?(value)
                                         end,
                                         conflicting_options: [:ipa],
                                         conflict_block: proc do |value|
                                           UI.user_error!("在运行的选项中不能使用 'apk' and '#{value.key}')")
                                         end),
            FastlaneCore::ConfigItem.new(key: :ipa,
                                         env_name: "ALIOSS_IPA",
                                         description: "IPA文件路径，可选的action有_gym_和_xcodebuild_，Mac是.app文件，安卓是.apk文件。",
                                         default_value: Actions.lane_context[SharedValues::IPA_OUTPUT_PATH],
                                         optional: true,
                                         verify_block: proc do |value|
                                           UI.user_error!("请检查apk文件路径 '#{value}' ") unless File.exist?(value)
                                         end,
                                         conflicting_options: [:apk],
                                         conflict_block: proc do |value|
                                           UI.user_error!("在运行的选项中不能使用 'ipa' 和 '#{value.key}'")
                                         end),
            FastlaneCore::ConfigItem.new(key: :app_name,
                                         env_name: "APP_NAME",
                                         description: "App的名称，你的服务器中可能有多个App，需要用App名称来区分，这个名称也是文件目录的名称，可以是App的路径。",
                                         default_value: "app",
                                         optional: true,
                                         type: String),
            FastlaneCore::ConfigItem.new(key: :download_domain,
                                         env_name: "ALIOSS_DOWNLOAD_DOMAIN",
                                         description: "下载域名，默认是https://{bucket_name}.{endpoint}/",
                                         optional: true,
                                         type: String),
            FastlaneCore::ConfigItem.new(key: :html_header_title,
                                         env_name: "ALIOSS_HTML_HEADER_TITLE",
                                         description: "html下载页面header title",
                                         default_value: "很高兴邀请您安装我们的App，测试并反馈问题，便于我们及时解决您遇到的问题，十分谢谢！Thanks♪(･ω･)ﾉ",
                                         optional: true,
                                         type: String),
            FastlaneCore::ConfigItem.new(key: :update_description,
                                         env_name: "ALIOSS_UPDATE_DESCRIPTION",
                                         description: "设置app更新日志，描述你修改了哪些内容。",
                                         optional: true,
                                         type: String)
        ]
      end

      def self.is_supported?(platform)
        # Adjust this if your plugin only works for a particular platform (iOS vs. Android, for example)
        # See: https://docs.fastlane.tools/advanced/#control-configuration-by-lane-and-by-platform
        #
        # [:ios, :mac, :android].include?(platform)
        true
      end

      def self.create_manifest_file(params)
        # create manifest.plist file
        manifest_file = File.new("manifest.plist", "w")
        manifest_file.puts("<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">
<plist version=\"1.0\">
  <dict>
    <key>items</key>
    <array>
      <dict>
        <key>assets</key>
        <array>
          <dict>
            <key>kind</key>
            <string>software-package</string>
            <key>url</key>
            <string>#{params[:download_url]}</string>
          </dict>
          <dict>
            <key>kind</key>
            <string>display-image</string>
            <key>url</key>
            <string>#{params[:download_domain]}#{params[:path_for_app_name]}/iOS/icon/icon-57.png</string>
          </dict>
          <dict>
            <key>kind</key>
            <string>full-size-image</string>
            <key>url</key>
            <string>#{params[:download_domain]}#{params[:path_for_app_name]}/iOS/icon/icon-512.png</string>
          </dict>
        </array>
        <key>metadata</key>
        <dict>
          <key>bundle-identifier</key>
          <string>#{params[:app_identifier]}</string>
          <key>bundle-version</key>
          <string>#{params[:version_number]}</string>
          <key>kind</key>
          <string>software</string>
          <key>platform-identifier</key>
          <string>com.apple.platform.iphoneos</string>
          <key>title</key>
          <string>#{params[:app_name]}</string>
        </dict>
      </dict>
    </array>
  </dict>
</plist>")
        manifest_file.close
        return manifest_file
      end

      def self.create_config_json_file(params)
        # create config.json file
        config_json_file = File.new("config.json", "w")
        config_json_file.puts("{
    \"version\": \"0.1.0\",
    \"domain\": \"#{params[:download_domain]}\",
    \"desc\": \"每个版本的配置文件，记录着所有历史版本。\",
    \"title\": \"#{params[:html_header_title]}\",
    \"ipaList\": [],
    \"apkList\": [],
    \"appList\": []
}")
        config_json_file.close
        return config_json_file
      end

      def self.create_index_html_file(params)
        # create index.html file
        filename = Helper::AliossHelper.index_html_template_path
        temp_filename = "temp_index.html"
        if File.readable?(filename)
          temp_file = File.new(temp_filename, "w")
          IO.foreach(filename) do |block|
            # temp_file.puts(block.gsub("your_config_json_url", "#{params[:download_domain]}#{params[:path_for_app_name]}/config.json"))
            temp_file.puts(block.gsub("__html_header_title__", params[:html_header_title]))
          end
          temp_file.close
          return temp_file
        else
          UI.user_error!("项目index.html不存在")
        end
      end

      def self.delete_file(params)
        file = params[:file]
        # 上传完成后删除本地文件
        if File.file?(File.expand_path(file))
          File.delete(File.expand_path(file))
        end
      end
    end
  end
end
