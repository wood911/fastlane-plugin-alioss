import React from 'react';
import './App.css';
import fetch from 'node-fetch';
import DeviceDetector from 'device-detector-js';
import format from 'date-format';
import QRCode from 'qr-code-with-logo';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.installApp = this.installApp.bind(this);
    this.selectRow = this.selectRow.bind(this);
    const device = new DeviceDetector().parse(navigator.userAgent);
    this.state = {
      url: "config.json",
      device: device,
      list: [],
      current: null,
      isInstalling: false,
      headerTitle: "__html_header_title__"
    };
    this.ref = React.createRef()
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
        list = [...list].sort((a, b) => a.time < b.time ? 1 : -1)
        this.setState({list: [...list], current: list.length ? list[0] : null})
      });
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
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
    const { list, current, isInstalling, headerTitle, device } = this.state;
    if (!current || list.length === 0) {
      return (
        <div className="App">
          <p>{headerTitle}</p>
          <img src={"icon.png"} className="App-icon" alt={""}/>
          <p>Sorry，未找到任何软件包！</p>
        </div>
      );
    }
    return (
      <div className="App">
        <p>{headerTitle}</p>
        <img src={"icon.png"} className="App-icon" alt={""}/>
        <p className="App-detail-text">版本：{current.version} (build {current.build})  大小：{(current.size/1024/1024).toFixed(2)} MB  更新时间 ：{format('yyyy-MM-dd hh:mm:ss', new Date(current.time * 1000))}</p>
        <div className="App-update-desc">{current.desc}</div>
        <button id="install-app" className="App-install-button" onClick={this.installApp}>{
          isInstalling ? "正在安装..." : "安装App"
        }</button>
        <canvas ref={this.ref} />
        <div className="App-line"> </div>
        <p>历史版本</p>
        <div className="App-history-version">
          {
            list.map((value, index) => {
              const className = index % 2 === 0 ? "App-box-0" : "App-box-1";
              return (
                <div key={index} className={className} onClick={()=>{this.selectRow(value)}}>
                  {
                    device.device.type === 'desktop' &&
                    <p style={{marginRight: "10%"}}>{value.name}</p>
                  }
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
