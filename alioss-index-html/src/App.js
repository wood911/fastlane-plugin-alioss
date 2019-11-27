import React from 'react';
import './App.css';
import fetch from 'node-fetch';
import DeviceDetector from 'device-detector-js';
import format from 'date-format';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.installApp = this.installApp.bind(this);
    this.selectRow = this.selectRow.bind(this);
    const device = new DeviceDetector().parse(navigator.userAgent);
    this.state = {
      url: "https://superbuy-cn-app-test.oss-cn-shenzhen.aliyuncs.com/app/superbuy/config.json",
      device: device,
      list: [],
      current: null,
      isInstalling: false
    };
  }

  componentDidMount () {
    const { url, device } = this.state;
    fetch(url)
      .then(res => res.json())
      .then(json => {
        const ipaList = json["ipaList"] || []
        const apkList = json["apkList"] || []
        const appList = json["appList"] || []
        let list = []
        if (device.os.name === 'iOS') {
          list = [...ipaList];
        } else if (device.os.name === 'Android') {
          list = [...apkList];
        } else if (device.device.type === 'desktop') { // pc
          list = [...ipaList, ...apkList,  ...appList]
        }
        // list.pop()获取最新软件包
        this.setState({list: [...list], current: list.pop()})
      });
  }

  installApp () {
    const { current, device } = this.state;
    if (current) {
      if (device.os.name === 'iOS') {
        window.location.href = "itms-services://?action=download-manifest&url=" + current.domain + current.path + "manifest.plist";
        setTimeout(() => {
          this.setState({isInstalling: true})
        }, 1000);
      } else {
        window.location.href = current.domain + current.path + current.name;
      }
    }
  }

  selectRow (value) {
    this.setState({current: value})
  }

  render() {
    const { list, current, isInstalling } = this.state;
    if (!current || list.length === 0) {
      return (
        <div className="App">
          <p>很高兴邀请您安装Superbuy App，测试并反馈问题，便于我们及时解决您遇到的问题，十分谢谢！Thanks♪(･ω･)ﾉ</p>
          <img src={"icon.png"} className="App-icon" alt={""}/>
          <p>Sorry，未找到任何软件包！</p>
        </div>
      );
    }
    return (
      <div className="App">
        <p>很高兴邀请您安装Superbuy App，测试并反馈问题，便于我们及时解决您遇到的问题，十分谢谢！Thanks♪(･ω･)ﾉ</p>
        <img src={"icon.png"} className="App-icon" alt={""}/>
        <p className="App-detail-text">版本：{current.version} (build {current.build}) 更新时间 ：{format('yyyy-MM-dd hh:mm:ss', new Date(current.time * 1000))}</p>
        <button id="install-app" className="App-install-button" onClick={this.installApp}>{
          isInstalling ? "正在安装..." : "安装App"
        }</button>
        <div className="App-line"> </div>
        <p>历史版本</p>
        <div style={{border: "1px solid #e7ebed", width: "100%"}}>
          {
            list.map((value, index) => {
              console.log(value);
              const className = index % 2 === 0 ? "App-box-0" : "App-box-1";
              return (
                <div key={index} className={className} onClick={()=>{this.selectRow(value)}}>
                  <p style={{marginRight: "10%"}}>{value.version} (build {value.build} )</p>
                  <p>{format('yyyy-MM-dd hh:mm:ss', new Date(value.time * 1000))}</p>
                </div>
              )
            })
          }
        </div>
      </div>
    );
  }
}

export default App;
