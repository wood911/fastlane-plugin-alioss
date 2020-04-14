import React from 'react';
import './Help.css';
import DeviceDetector from 'device-detector-js';
import QRCode from 'qr-code-with-logo';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.getUDID = this.getUDID.bind(this);
    this.showQRCode = this.showQRCode.bind(this);
    const device = new DeviceDetector().parse(navigator.userAgent);
    this.state = {
      device: device,
    };
    this.ref = React.createRef()
  }

  componentDidMount () {
    this.showQRCode();
  }

  getUDID() {
    // 获取服务器udid.mobileconfig文件
    window.location.href = "udid.mobileconfig"
  }

  showQRCode() {
    const canvas = this.ref.current;
    if (canvas) {
      QRCode.toCanvas({
        canvas: canvas,
        content: window.location.href,
        width: 200,
      })
    }
  }

  render() {
    const { device } = this.state;
    const pc = device.device.type === 'desktop';
    return (
      <div className="Help">
        <h1>一步快速获取 iOS 设备的 UDID</h1>
        <p className="detail-text">请使用 <span style={{color:"#1abc9c"}}>iPhone</span> 或 <span style={{color:"#1abc9c"}}>iPad</span> 上的 Safari 浏览器打开本页面或者扫描下面的二维码，即可快速获取 UDID</p>
        <br/>
        <img src={require("./assets/pad-phone.png")} className={pc ? "pad-phone" : "pad-phone-app"} alt={""}/>
        <canvas className={pc ? "qr-code" : "qr-code-app"} ref={this.ref} />
        {
          !pc &&
          <button id="udid" className="udid-button" onClick={this.getUDID}>
            获取UDID
          </button>
        }
      </div>
    );
  }
}

export default App;
