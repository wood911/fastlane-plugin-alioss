import React from 'react';
import './App.css';
import fetch from 'node-fetch';
import DeviceDetector from 'device-detector-js';
import format from 'date-format';
import QRCode from 'qr-code-with-logo';
import LoadingOverlay from 'react-loading-overlay';
// import { Link } from 'react-router-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.installApp = this.installApp.bind(this);
    this.selectRow = this.selectRow.bind(this);
    this.showQRCode = this.showQRCode.bind(this);
    const device = new DeviceDetector().parse(navigator.userAgent);
    this.state = {
      isLoading: true,
      url: "config.json",
      device: device,
      list: [],
      current: null,
      isInstalling: false,
      headerTitle: "很高兴邀请您安装Superbuy App，测试并反馈问题，便于我们及时解决您遇到的问题，十分谢谢！Thanks♪(･ω･)ﾉ"
    };
    this.ref = React.createRef()
  }

  componentDidMount () {
    const { url, device, headerTitle } = this.state;
    fetch(url)
      .then(res => res.json())
      .then(json => {
        const title = !json["title"] ? headerTitle : json["title"]
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
        list = [...list].sort((a, b) => a.time < b.time ? 1 : -1)
        this.setState({isLoading: false, headerTitle: title, list: [...list], current: list.length ? list[0] : null})
      });
    this.showQRCode();
  }

  showQRCode() {
    const canvas = this.ref.current;
    if (canvas) {
      QRCode.toCanvas({
        canvas: canvas,
        content: window.location.href,
        width: 260,
        logo: {
          src: 'icon.png',
          radius: 8
        }
      })
    }
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
    console.log(this.refs.qrcode)
  }

  selectRow (value) {
    this.setState({current: value})
  }

  render() {
    const { isLoading, list, current, isInstalling, headerTitle, device } = this.state;
    const obj = current ? current : {version: "", build: 0, size: 0, time: 0, desc: "", name: "*.ipa"}
    const iconClassName = obj.name.indexOf(".apk") !== -1 ? "fa fa-android" : "fa fa-apple";
    return (
      <LoadingOverlay active={isLoading} spinner text='Loading...'>
        <div className="App">
          <p>{headerTitle}</p>
          <img src={"icon.png"} className="App-icon" alt={""}/>
          <p className="App-detail-text">
            版本：{obj.version}
            (build {obj.build}) &nbsp;&nbsp;
            大小：{(obj.size/1024/1024).toFixed(2)} MB &nbsp;&nbsp;
            更新时间：{format('yyyy-MM-dd hh:mm:ss', new Date(obj.time * 1000))}
          </p>
          <div className="App-update-desc">{obj.desc}</div>
          {
            !current ? <p>Sorry，未找到任何软件包！</p> :
              <button id="install-app" className="App-install-button" onClick={this.installApp}>
                <i className={iconClassName} aria-hidden="true">
                  <span className="App-install-button-text"> {isInstalling ? "正在安装..." : "安装App"}</span>
                </i>
              </button>
          }
          {
            device.os.name === 'iOS' || true ? <a href="https://www.pgyer.com/tools/udid" className="App-help">安装遇到问题？</a> : null
          }
          <canvas ref={this.ref} />
          <div className="App-line"> </div>
          <p>历史版本</p>
          <div className="App-history-version">
            {
              list.map((value, index) => {
                const className = index % 2 === 0 ? "App-box-0" : "App-box-1";
                const iconClassName = value.name.indexOf(".apk") !== -1 ? "fa fa-android" : "fa fa-apple";
                return (
                  <div key={index} className={className} onClick={()=>{this.selectRow(value)}}>
                    {
                      device.device.type === 'desktop' &&
                      <i style={{marginRight: "10%"}} className={iconClassName} aria-hidden="true"> {value.name}</i>
                    }
                    <p style={{marginRight: "10%"}}>{value.version} (build {value.build} )</p>
                    <p>{format('yyyy-MM-dd hh:mm:ss', new Date(value.time * 1000))}</p>
                  </div>
                )
              })
            }
          </div>
        </div>
      </LoadingOverlay>
    );
  }
}

export default App;
