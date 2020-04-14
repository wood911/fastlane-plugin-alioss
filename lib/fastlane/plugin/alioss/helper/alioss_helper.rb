# -*- coding: UTF-8 -*-
require 'fastlane_core/ui/ui'

module Fastlane
  UI = FastlaneCore::UI unless Fastlane.const_defined?("UI")

  module Helper
    class AliossHelper
      # class methods that you define here become available in your action
      # as `Helper::AliossHelper.your_method`
      #
      def self.show_message
        UI.message("Hello from the alioss plugin helper!")
      end

      def self.index_html_template_path
        return "#{gem_path('fastlane-plugin-alioss')}/lib/assets/index.html"
      end

      #
      # Taken from https://github.com/fastlane/fastlane/blob/f0dd4d0f4ecc74d9f7f62e0efc33091d975f2043/fastlane_core/lib/fastlane_core/helper.rb#L248-L259
      # Unsure best other way to do this so using this logic for now since its deprecated in fastlane proper
      #
      def self.gem_path(gem_name)
        if !Helper.is_test? and Gem::Specification.find_all_by_name(gem_name).any?
          return Gem::Specification.find_by_name(gem_name).gem_dir
        else
          return './'
        end
      end

    end
  end
end
