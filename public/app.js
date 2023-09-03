$ = mdui.$;
function request(str){
	xml=new XMLHttpRequest();
	xml.open("POST","/api.php",false);
	xml.setRequestHeader("Content-Type","application/json");
	xml.send(str);
	return xml.responseText;
}
"<a onclick=\"page('main');page('nodes');\" mdui-drawer-close><li class=\"mdui-list-item mdui-ripple\">节点管理</li></a>";
function page(str){
	let toolbar = "<div class=\"mdui-appbar\"><div class=\"mdui-toolbar\"><button class=\"mdui-btn mdui-btn-icon mdui-ripple\" id=\"toolbar-open-drawer\" mdui-drawer=\"{target:'#toolbar-drawer'}\"><i class=\"mdui-icon material-icons\">menu</i></button><a onclick=\"page('main');page('status');\"><span class=\"mdui-typo-title\">TzGamePanel</span></a><div class=\"mdui-toolbar-spacer\"></div><button class=\"mdui-btn mdui-btn-icon mdui-ripple\" mdui-menu=\"{target:'#toolbar-menu'}\"><i class=\"mdui-icon material-icons\">account_circle</i></button><ul class=\"mdui-menu\" id=\"toolbar-menu\"><li class=\"mdui-menu-item\"><a class=\"mdui-ripple\" id=\"toolbar-menu-username\" onclick=\"page('main');page('account');\"></a></li><li class=\"mdui-divider\"></li><li class=\"mdui-menu-item\"><a class=\"mdui-ripple\" id=\"toolbar-menu-logout\" onclick=\"logout();\">登出</a></li></ul><div class=\"mdui-drawer\" id=\"toolbar-drawer\"><ul class=\"mdui-list\"><a onclick=\"page('main');page('status');\" mdui-drawer-close><li class=\"mdui-list-item mdui-ripple\">首页</li></a>";
	let data = JSON.parse(request(JSON.stringify({
		"action": "get_user_info",
		"data": {
			"token": cookies.token,
		}
	})));
	if(data.status!=200){
		mdui.snackbar({
			message: "在获取用户信息时出现错误："+data.msg,
			position: "top"
		});
		toolbar += "</ul></div></div></div>";
		return;
	}else{
		if(data.data.permission==1){
			toolbar += "<a onclick=\"page('main');page('nodes');\" mdui-drawer-close><li class=\"mdui-list-item mdui-ripple\">节点管理</li></a>";
		}
		toolbar += "</ul></div></div></div>";
		user_data = data.data;
	}
	if(str=="login"){
		document.getElementById("tzgp-app").innerHTML = "<br><div id=\"box\" class=\"mdui-shadow-5 mdui-center\"><br><h2 class=\"mdui-text-center\">登录到TzGamePanel</h2><br><div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\" style=\"text-align: left\">用户名</label><input class=\"mdui-textfield-input\" type=\"text\" name=\"username\" id=\"login-username\" required><div class=\"mdui-textfield-error\">用户名不能为空</div></div><div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\" style=\"text-align: left\">密码</label><input class=\"mdui-textfield-input\" type=\"password\" name=\"password\" id=\"login-password\" required><div class=\"mdui-textfield-error\">密码不能为空</div></div><br><button class=\"mdui-btn mdui-ripple mdui-float-right mdui-color-blue\" id=\"login-button\">登录</button><br><br><br></div>";
		$("#login-button").on("click",login);
	}
	if(str=="main"){
		document.getElementById("tzgp-app").innerHTML = toolbar;
		document.getElementById("toolbar-menu-username").innerHTML = user_data.username;
	}
	if(str=="status"){
		change_cookie("page","status",5);
		document.getElementById("tzgp-app").innerHTML += "<div id=\"box\" class=\"mdui-shadow-4\"><p>用户名："+user_data.username+"</p><br><p>账户权限："+user_data.permission+"<button class=\"mdui-btn mdui-btn-icon\" mdui-tooltip=\"{content:'0：普通用户，只能管理管理员分配的实例<br>1：管理用户，可管理所有实例，并进行高级管理'}\"><i class=\"mdui-icon material-icons\">&#xe887;</i></button></p></div>";
	}
	if(str=="account"){
		change_cookie("page","account",5);
		if(isPhone){
			document.getElementById("tzgp-app").innerHTML += "<div id=\"box\" class=\"mdui-shadow-4\"><p>用户名："+user_data.username+"</p><p>唯一标识符："+user_data.id+"</p><p>账户权限："+user_data.permission+"<button class=\"mdui-btn mdui-btn-icon\" mdui-tooltip=\"{content:'0：普通用户，只能管理管理员分配的实例<br>1：管理用户，可管理所有实例，并进行高级管理'}\"><i class=\"mdui-icon material-icons\">&#xe887;</i></button></p></div><div id=\"box\" class=\"mdui-shadow-4\"><p>更改密码</p><p>更改密码后其他已登录的设备将会退出登录</p><div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\">原密码</label><input class=\"mdui-textfield-input\" type=\"password\" id=\"old_password\"></div><div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\">新密码</label><input class=\"mdui-textfield-input\" type=\"password\" id=\"new_password_1\"></div><div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\">确认新密码</label><input class=\"mdui-textfield-input\" type=\"password\" id=\"new_password_2\"></div><br><button class=\"mdui-btn mdui-ripple mdui-float-right mdui-color-blue\" onclick=\"change_password();\">更改密码</button><br><br></div><div id=\"box\" class=\"mdui-shadow-4\">API密钥管理<br><button class=\"mdui-btn mdui-ripple mdui-color-red\" onclick=\"close_apikey();\">关闭API密钥</button> <button class=\"mdui-btn mdui-ripple mdui-color-green\" onclick=\"gen_apikey();\">生成API密钥</button><br><br><div id=\"apikey-text\"></div><br>API密钥与你的账号密码同等重要，请妥善保管</div>";
		}else{
			document.getElementById("tzgp-app").innerHTML += "<table><tr><td><div id=\"box\" class=\"mdui-shadow-4\"><p>用户名："+user_data.username+"</p><p>唯一标识符："+user_data.id+"</p><p>账户权限："+user_data.permission+"<button class=\"mdui-btn mdui-btn-icon\" mdui-tooltip=\"{content:'0：普通用户，只能管理管理员分配的 实例<br>1：管理用户，可管理所有实例，并进行高级管理'}\"><i class=\"mdui-icon material-icons\">&#xe887;</i></button></p></div></td><td rowspan=\"2\"><div id=\"box\" class=\"mdui-shadow-4\"><p>更改密码</p><p>更改密码 后其他已登录的设备将会退出登录</p><div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\">原密码</label><input class=\"mdui-textfield-input\" type=\"password\" id=\"old_password\"></div><div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\">新密码</label><input class=\"mdui-textfield-input\" type=\"password\" id=\"new_password_1\"></div><div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\">确认新密码</label><input class=\"mdui-textfield-input\" type=\"password\" id=\"new_password_2\"></div><br><button class=\"mdui-btn mdui-ripple mdui-float-right mdui-color-blue\" onclick=\"change_password();\">更改密码</button><br><br></div></td></tr><tr><td><div id=\"box\" class=\"mdui-shadow-4\">API密钥管理<br><button class=\"mdui-btn mdui-ripple mdui-color-red\" onclick=\"close_apikey();\">关闭API密钥</button> <button class=\"mdui-btn mdui-ripple mdui-color-green\" onclick=\"gen_apikey();\">生成API密钥</button><br><br><div id=\"apikey-text\"></div><br>API密钥与你的账号密码同等重要，请妥善保管</div></td></tr></table>";
		}
		if(user_data.apikey==null){
			document.getElementById("apikey-text").innerHTML = "未启用";
		}else{
			document.getElementById("apikey-text").innerHTML = user_data.apikey;
		}
	}
	if(str=="nodes"){
	}
	mdui.mutation();
}
function login(){
	let username = document.getElementById("login-username").value;
	let password = document.getElementById("login-password").value;
	let response = JSON.parse(request(JSON.stringify({
		"action": "login",
		"data": {
			"username": username,
			"password": password
		}
	})));
	if(response.status==200){
		mdui.snackbar({
			message: "登录成功",
			position: "top"
		});
		var oDate = new Date();
		oDate.setDate(oDate.getDate()+2);
		document.cookie = "token="+escape(response.data.token)+"; expires="+oDate.toGMTString();
		change_cookie("page","status",5);
		let data = JSON.parse(request(JSON.stringify({
			"action": "get_user_info",
			"data": {
				"token": cookies.token
			}
		})));
		user_data = data.data;
		page("main");
		page("status");
		return true;
	}else{
		mdui.snackbar({
			message: response.msg,
			position: "top"
		});
		return false;
	}
}
function logout(){
	var oDate = new Date();
	oDate.setDate(oDate.getDate()-1);
	document.cookie = "token=0; expires="+oDate.toGMTString();
	change_cookie("page","0",-1);
	update_cookie();
	mdui.snackbar({
		message: "登出成功",
		position: "top"
	});
	page("login");
}
function change_cookie(name,value,day=2){
	var oDate = new Date();
	oDate.setDate(oDate.getDate()+day);
	document.cookie = escape(name)+"="+escape(value)+"; expires="+oDate.toGMTString();
	update_cookie();
}
function update_cookie(){
	let cookie = document.cookie.split("; ");
	for(let i in cookie){
		let tmp = cookie[i].split("=");
		cookies[tmp[0]] = unescape(tmp[1]);
	}
}
function close_apikey(){
	let result = JSON.parse(request(JSON.stringify({
		"action": "close_apikey",
		"data": {
			"token": cookies.token
		}
	})));
	if(result.status==200){
		mdui.snackbar({
			message: "关闭API密钥成功",
			position: "top"
		});
		document.getElementById("apikey-text").innerHTML = "未启用";
	}else{
		mdui.snackbar({
			message: "关闭API密钥失败："+result.msg,
			position: "top"
		});
	}
}
function gen_apikey(){
	let result = JSON.parse(request(JSON.stringify({
		"action": "gen_apikey",
		"data": {
			"token": cookies.token
		}
	})));
	if(result.status==200){
		mdui.snackbar({
			message: "生成API密钥成功",
			position: "top"
		});
		document.getElementById("apikey-text").innerHTML = result.data.apikey;
	}else{
		mdui.snackbar({
			message: "生成apikey失败："+result.msg,
			position: "top"
		});
	}
}
function change_password(){
	let old_password = document.getElementById("old_password").value;
	let new_password_1 = document.getElementById("new_password_1").value;
	let new_password_2 = document.getElementById("new_password_2").value;
	if(old_password==""){
		mdui.snackbar({
			message: "旧密码不能为空",
			position: "top"
		});
		return false;
	}
	if(!(new_password_1!=""&&new_password_2!="")){
		mdui.snackbar({
			message: "新密码或确认新密码不能为空",
			position: "top"
		});
		return false;
	}
	if(new_password_1!==new_password_2){
		mdui.snackbar({
			message: "新密码与确认新密码不相同",
			position: "top"
		});
		return false;
	}
	let result = JSON.parse(request(JSON.stringify({
		"action": "change_password",
		"data": {
			"token": cookies.token,
			"old_password": old_password,
			"new_password": new_password_1
		}
	})));
	if(result.status==200){
		mdui.snackbar({
			message: "更改密码成功",
			position: "top"
		});
		change_cookie("token",result.data.token,2);
		page('main');
		page('account');
	}else{
		mdui.snackbar({
			message: result.msg,
			position: "top"
		});
	}
}


user_data = undefined;
cookies = {};
isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
var device = navigator.userAgent.toLowerCase();
var isPhone = false;
if(/ipad|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(device)){
	isPhone = true;
}
setTimeout(function(){
	update_cookie();
	if(cookies.token==undefined){
		change_cookie("page","0",-1);
		mdui.snackbar({
			message: "未登录",
			position: "top",
		});
		page("login");
		return;
	}
	let data = JSON.parse(request(JSON.stringify({
		"action": "get_user_info",
		"data": {
			"token": cookies.token,
		}
	})));
	if(data.status==200){
		user_data = data.data;
		page("main");
		if(cookies.page==undefined){
			change_cookie("page","status",5);
		}
		page(cookies.page);
	}else{
		mdui.snackbar({
			message: "token无效",
			position: "top",
		});
		var oDate = new Date();
		oDate.setDate(oDate.getDate()-1);
		document.cookie = "token=0; expires="+oDate.toGMTString();
		change_cookie("page","0",-1);
		update_cookie();
		page("login");
		return;
	}
},1000);
