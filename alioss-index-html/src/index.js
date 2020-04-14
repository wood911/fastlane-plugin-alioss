import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import Router from './Router';
import App from './App';
// import * as serviceWorker from './serviceWorker';

/**
 * 方案A：上传阿里云后有下载app的页面，未注册的iOS设备可以在下载页面跳转pgyer.com获取UDID
 * 方案B：如果你有自己的服务器，可以制作UDID描述文件
 * 可以用<Router />，里面有Help已经写好的前端页面获取UDID
 * ReactDOM.render(<Router />, document.getElementById('root'));
 * 
 * Over-the-Air Profile Delivery and Configuration
 * https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/iPhoneOTAConfiguration/ConfigurationProfileExamples/ConfigurationProfileExamples.html#//apple_ref/doc/uid/TP40009505-CH4-SW1
 *
 * 获取UDID苹果返回的XML数据格式
 *
 *     <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
 *     <plist version="1.0">
 *       <dict>
 *         <key>IMEI</key>
 *         <string>12 123456 123456 7</string>
 *         <key>PRODUCT</key>
 *         <string>iPhone8,1</string>
 *         <key>UDID</key>
 *         <string>b59769e6c28b73b1195009d4b21cXXXXXXXXXXXX</string>
 *         <key>VERSION</key>
 *         <string>15B206</string>
 *       </dict>
 *     </plist>
 *
 *
 * java端核心代码参考
 * @RestController
 * @RequestMapping("/app")
 * @CrossOrigin
 * public class AppController {
 *
 *        @GetMapping("")
 *    public String app() {
 * 		return "Welcome to Superbuy App.";
 *    }
 *
 *    @RequestMapping(value = "/udid", method = RequestMethod.POST)
 * 	public String getUDID(HttpServletRequest request, HttpServletResponse response) {
 *
 * 		try {
 * 			response.setContentType("text/html;charset=UTF-8");
 * 			request.setCharacterEncoding(CharEncoding.UTF_8);
 * 			// 解析plist
 * 			NSObject object = XMLPropertyListParser.parse(request.getInputStream());
 * 			HashMap<String, String> hashMap = (HashMap) object.toJavaObject();
 * 			// 将设备信息拼接成queryString
 * 			StrBuilder queryString = new StrBuilder();
 * 			hashMap.forEach((key, value) -> {
 * 				try {
 * 					queryString.append(key + "=" + URLEncoder.encode(value, CharEncoding.UTF_8));
 * 					queryString.append("&");
 *                } catch (UnsupportedEncodingException e) {
 * 					e.printStackTrace();
 *                }
 *            });
 * 			if (queryString.endsWith("&")) {
 * 				queryString.deleteCharAt(queryString.lastIndexOf("&"));
 *            }
 * 			response.setStatus(301); // 301之后iOS设备会自动打开safari浏览器
 * 			response.setHeader("Location", "https://dl.yourdomain.com/app/myappname/index.html?" + queryString.toString());
 *
 * 			return "success";
 *        } catch (Exception e) {
 * 			e.printStackTrace();
 *        }
 *
 * 		return "failure";
 *    }
 *
 * }
 */

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
