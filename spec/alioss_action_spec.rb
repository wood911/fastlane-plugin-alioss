describe Fastlane::Actions::AliossAction do
  describe '#run' do
    it 'prints a message' do
      expect(Fastlane::UI).to receive(:message).with("The alioss plugin is working!")

      Fastlane::Actions::AliossAction.run(nil)
    end
  end
end
