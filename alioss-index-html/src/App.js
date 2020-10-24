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
    const appleSvg = <svg t="1594871600015" className="icon"
                        viewBox="0 0 1024 1024" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" p-id="3036"
                        width="20" height="20">
      <path
        d="M737.007 537.364c-1.092-104.007 84.833-153.888 88.595-156.316-48.181-70.512-123.305-80.221-150.126-81.435-63.958-6.432-124.761 37.622-157.165 37.622-32.404 0-82.405-36.652-135.441-35.681-69.663 1.092-133.863 40.535-169.787 102.915-72.453 125.732-18.569 311.903 52.065 413.727 34.467 49.881 75.609 105.828 129.616 103.887 51.943-2.063 71.604-33.618 134.47-33.618s80.464 33.618 135.563 32.646c55.948-1.092 91.387-50.851 125.611-100.852 39.564-57.89 55.948-113.959 56.798-116.63-1.214-0.729-109.105-41.991-110.197-166.267zM633.605 232.258c28.641-34.71 47.938-83.012 42.72-131.072-41.264 1.699-91.265 27.428-120.878 62.138-26.457 30.826-49.881 79.978-43.569 127.067 45.997 3.641 93.085-23.423 121.727-58.132z"
        fill="" p-id="3037">
      </path>
    </svg>;
    const androidSvg = <svg t="1594871933417" className="icon"
                         viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="4595"
                         width="20" height="20">
      <path
        d="M391.405714 276.004571a22.308571 22.308571 0 0 0 0-44.544c-11.995429 0-21.723429 10.276571-21.723428 22.272s9.728 22.272 21.723428 22.272z m241.152 0c11.995429 0 21.723429-10.276571 21.723429-22.272s-9.728-22.272-21.723429-22.272a22.308571 22.308571 0 0 0 0 44.544zM168.539429 381.147429a58.514286 58.514286 0 0 1 58.294857 58.294857v245.723428c0 32.585143-25.709714 58.843429-58.294857 58.843429S109.696 717.714286 109.696 685.165714v-245.723428c0-32 26.294857-58.294857 58.843429-58.294857z m605.732571 10.861714v380.562286c0 34.852571-28.013714 62.866286-62.281143 62.866285h-42.861714v129.718857c0 32.585143-26.294857 58.843429-58.843429 58.843429s-58.843429-26.294857-58.843428-58.843429v-129.718857H472.594286v129.718857c0 32.585143-26.294857 58.843429-58.843429 58.843429a58.660571 58.660571 0 0 1-58.294857-58.843429l-0.585143-129.718857H312.594286a62.683429 62.683429 0 0 1-62.866286-62.866285V392.009143h524.580571z m-132.571429-231.424c80.018286 41.142857 134.290286 119.990857 134.290286 210.870857H247.424c0-90.843429 54.272-169.728 134.838857-210.870857L341.705143 85.723429a8.338286 8.338286 0 0 1 2.852571-11.446858c3.986286-1.718857 9.142857-0.585143 11.446857 3.437715L397.147429 153.161143c34.852571-15.433143 73.728-23.990857 114.870857-23.990857s80.018286 8.557714 114.870857 23.990857l41.142857-75.446857c2.304-3.986286 7.424-5.156571 11.446857-3.437715a8.338286 8.338286 0 0 1 2.852572 11.446858zM914.267429 439.442286v245.723428c0 32.585143-26.294857 58.843429-58.843429 58.843429a58.660571 58.660571 0 0 1-58.294857-58.843429v-245.723428a58.148571 58.148571 0 0 1 58.294857-58.294857c32.585143 0 58.843429 25.709714 58.843429 58.294857z"
        fill="#000000" p-id="4596">
      </path>
    </svg>
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
                const svg = value.name.indexOf(".apk") !== -1 ? androidSvg : appleSvg;
                return (
                  <div key={index} className={className} onClick={()=>{this.selectRow(value)}}>
                    {device.device.type === 'desktop' && <i>{svg}</i>}
                    {device.device.type === 'desktop' && <i style={{ marginRight: "10%" }}> {value.name}</i>}
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
