"use strict";
var $ = mdui.$;
function request(str){
	let xml=new XMLHttpRequest();
	xml.open("POST","/api.php",false);
	xml.setRequestHeader("Content-Type","application/json");
	xml.send(str);
	return xml.responseText;
}
function request_async(str,is_200_func,isnot_200_func){
	let xml = new XMLHttpRequest();
	xml.onreadystatechange = function(){
		if(xml.readyState==4){
			if(xml.status==200){
				is_200_func(xml);
			}else{
				isnot_200_func(xml);
			}
		}
	}
	xml.open("POST","/api.php",true);
	xml.setRequestHeader("Content-Type","application/json");
	xml.send(str);
}
window.onerror = function(message, source, lineno, colno, error){
	mdui.dialog({
		title: '发生了错误',
		content: '发生了错误：'+message+"<br> at line "+lineno+", column "+colno,
		buttons: [
			{
				text: "确认"
			}
		]
	});
	mdui.snackbar({
		message: "发生了错误："+message,
		position: "top"
	});
}
function page(str,param=[]){
	let toolbar = "<div class=\"mdui-appbar\"><div class=\"mdui-toolbar\"><button class=\"mdui-btn mdui-btn-icon mdui-ripple\" id=\"toolbar-open-drawer\" mdui-drawer=\"{target:'#toolbar-drawer'}\"><i class=\"mdui-icon material-icons\">menu</i></button><a href=\"#status\"><span class=\"mdui-typo-title\">TzGamePanel</span></a><div class=\"mdui-toolbar-spacer\"></div><button class=\"mdui-btn mdui-btn-icon mdui-ripple\" mdui-menu=\"{target:'#toolbar-menu'}\"><i class=\"mdui-icon material-icons\">account_circle</i></button><ul class=\"mdui-menu\" id=\"toolbar-menu\"><li class=\"mdui-menu-item\"><a class=\"mdui-ripple\" id=\"toolbar-menu-username\" href=\"#account\"></a></li><li class=\"mdui-divider\"></li><li class=\"mdui-menu-item\"><a class=\"mdui-ripple\" id=\"toolbar-menu-logout\" onclick=\"logout();\">登出</a></li></ul><div class=\"mdui-drawer\" id=\"toolbar-drawer\"><ul class=\"mdui-list\"><a href=\"#status\" mdui-drawer-close><li class=\"mdui-list-item mdui-ripple\">首页</li></a><a href=\"#my_instances\" mdui-drawer-close><li class=\"mdui-list-item mdui-ripple\">我的实例</li></a>";
	if(cookies.token!=undefined&&str=="main"){
	/*let data = JSON.parse(request(JSON.stringify({
		"action": "get_user_info",
		"data": {
			"token": cookies.token,
		}
	})));
	if(data.http_code!=200){
		mdui.snackbar({
			message: "在获取用户信息时出现错误："+data.msg,
			position: "top"
		});
		toolbar += "</ul></div></div></div>";
		return;
	}else{*/
		if(user_data.permission==1){
			toolbar += "<a href=\"#instances\" mdui-drawer-close><li class=\"mdui-list-item mdui-ripple\">所有实例管理</li></a><a href=\"#nodes\" mdui-drawer-close><li class=\"mdui-list-item mdui-ripple\">节点管理</li></a>";
		}
		toolbar += "</ul></div></div></div>";
		//user_data = data.data;
	//}
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
		document.getElementById("tzgp-app").innerHTML += "<div id=\"box\" class=\"mdui-shadow-4\"><p>用户名："+user_data.username+"</p><br><p>账户权限："+user_data.permission+"<button class=\"mdui-btn mdui-btn-icon\" mdui-tooltip=\"{content:'0：普通用户，只能管理管理员分配的实例<br>1：管理用户，可管理所有实例，并进行高级管理'}\"><i class=\"mdui-icon material-icons\">&#xe887;</i></button></p></div>";
	}
	if(str=="account"){
		if(isPhone){
			document.getElementById("tzgp-app").innerHTML += "<div class=\"mdui-row\"><div id=\"box\" class=\"mdui-shadow-4\"><p>用户名："+user_data.username+"</p><p>唯一标识符："+user_data.id+"</p><p>账户权限："+user_data.permission+"<button class=\"mdui-btn mdui-btn-icon\" mdui-tooltip=\"{content:'0：普通用户，只能管理管理员分配的实例<br>1：管理用户，可管理所有实例，并进行高级管理'}\"><i class=\"mdui-icon material-icons\">&#xe887;</i></button></p></div><div id=\"box\" class=\"mdui-shadow-4\"><p>更改密码</p><p>更改密码后其他已登录的设备将会退出登录</p>"/*+"<div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\">原密码</label><input class=\"mdui-textfield-input\" type=\"password\" id=\"old_password\"></div>"*/+"<div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\">新密码</label><input class=\"mdui-textfield-input\" type=\"password\" id=\"new_password_1\"></div><div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\">确认新密码</label><input class=\"mdui-textfield-input\" type=\"password\" id=\"new_password_2\"></div><br><button class=\"mdui-btn mdui-ripple mdui-float-right mdui-color-blue\" onclick=\"change_password();\">更改密码</button><br><br></div><div id=\"box\" class=\"mdui-shadow-4\">API密钥管理<br><button class=\"mdui-btn mdui-ripple mdui-color-red\" onclick=\"close_apikey();\">关闭API密钥</button> <button class=\"mdui-btn mdui-ripple mdui-color-green\" onclick=\"gen_apikey();\">生成API密钥</button><br><br><div id=\"apikey-text\"></div><br>API密钥与你的账号密码同等重要，请妥善保管</div></div>";
		}else{
			document.getElementById("tzgp-app").innerHTML += "<table><tr><td><div id=\"box\" class=\"mdui-shadow-4\"><p>用户名："+user_data.username+"</p><p>唯一标识符："+user_data.id+"</p><p>账户权限："+user_data.permission+"<button class=\"mdui-btn mdui-btn-icon\" mdui-tooltip=\"{content:'0：普通用户，只能管理管理员分配的实例<br>1：管理用户，可管理所有实例，并进行高级管理'}\"><i class=\"mdui-icon material-icons\">&#xe887;</i></button></p></div></td><td rowspan=\"2\"><div id=\"box\" class=\"mdui-shadow-4\"><p>更改密码</p><p>更改密码后其他已登录的设备将会退出登录</p>"/*+"<div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\">原密码</label><input class=\"mdui-textfield-input\" type=\"password\" id=\"old_password\"></div>"*/+"<div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\">新密码</label><input class=\"mdui-textfield-input\" type=\"password\" id=\"new_password_1\"></div><div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\">确认新密码</label><input class=\"mdui-textfield-input\" type=\"password\" id=\"new_password_2\"></div><br><button class=\"mdui-btn mdui-ripple mdui-float-right mdui-color-blue\" onclick=\"change_password();\">更改密码</button><br><br></div></td></tr><tr><td><div id=\"box\" class=\"mdui-shadow-4\">API密钥管理<br><button class=\"mdui-btn mdui-ripple mdui-color-red\" onclick=\"close_apikey();\">关闭API密钥</button> <button class=\"mdui-btn mdui-ripple mdui-color-green\" onclick=\"gen_apikey();\">生成API密钥</button><br><br><div id=\"apikey-text\"></div><br>API密钥与你的账号密码同等重要，请妥善保管</div></td></tr></table>";
		}
		if(user_data.apikey==null){
			document.getElementById("apikey-text").innerHTML = "未启用";
		}else{
			document.getElementById("apikey-text").innerHTML = user_data.apikey;
		}
	}
	if(str=="nodes"){
		document.getElementById("tzgp-app").innerHTML += "<div id=\"box\" class=\"mdui-shadow-4\"><h2 class=\"mdui-text-center\">节点管理</h2><br>以下是已存在的节点：<div class=\"mdui-table-fluid\"><table class=\"mdui-table\"><thead><tr><th>节点名&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th><th>节点地址&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th><th>节点端口</th><th>节点密钥（不更改请留空）</th><th>状态&nbsp;</th><th>系统&nbsp;</th><th>内存&nbsp;</th><th>守护进程版本</th><th>操作</th></tr></thead><tbody id=\"list-nodes\"></tbody></table></div></div><div id=\"box\" class=\"mdui-shadow-4\"><h2 class=\"mdui-text-center\">添加节点</h2><div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\">节点名（可重复）</label><input class=\"mdui-textfield-input\" type=\"text\" id=\"node-name\"></div><div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\">地址</label><input class=\"mdui-textfield-input\" type=\"text\" id=\"node-host\"></div><div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\">端口</label><input class=\"mdui-textfield-input\" type=\"number\" id=\"node-port\"></div><div class=\"mdui-textfield mdui-textfield-floating-label\"><label class=\"mdui-textfield-label\">密钥</label><input class=\"mdui-textfield-input\" type=\"text\" id=\"node-password\"></div><button class=\"mdui-btn mdui-float-right mdui-ripple mdui-color-blue\" onclick=\"add_node();\">添加</button><br><br></div>";
		let nodes = get_nodes_list();
		if(nodes!==false){
			nodes_data = nodes;
			for(let i in nodes){
				let node_data = get_node_info(nodes[i].id);
				let sys_type = "未知";
				let memory = "未知";
				let version = "未知";
				let node_status = "离线";
				if(node_data[0]==true){
					sys_type = node_data[1].system.system;
					memory = (node_data[1].system.used_memory/1024/1024/1024).toFixed(2)+"G/"+(node_data[1].system.total_memory/1024/1024/1024).toFixed(2)+"G";
					version = node_data[1].version;
					node_status = "在线";
				}else if(node_data[1]!=null){
					switch(node_data[1].code){
						case 403:
							node_status = "节点密钥错误";
							break;
						default:
							node_status = "未知错误<button class=\"mdui-btn mdui-btn-icon\" mdui-tooltip=\"{content:'status: "+node_data[1].code+", msg: "+node_data[1].msg+"'}\"><i class=\"mdui-icon material-icons\">&#xe887;</i></button>";
							break;
					}
				}
				let tmp = parseInt(i)+1;
				document.getElementById("list-nodes").innerHTML += "<tr><td><div type=\"mdui-textfield\"><input class=\"mdui-textfield-input node_name\" type=\"text\" placeholder=\"节点名\"></div></td><td><div type=\"mdui-textfield\"><input class=\"mdui-textfield-input node_host\" type=\"text\" placeholder=\"地址\"></div></td><td><div type=\"mdui-textfield\"><input class=\"mdui-textfield-input node_port\" type=\"number\" placeholder=\"端口\"></div></td><td><div type=\"mdui-textfield\"><input class=\"mdui-textfield-input node_password\" type=\"text\" placeholder=\"不更改请留空\"></div></td><td>"+node_status+"</td><td>"+sys_type+"</td><td>"+memory+"</td><td>"+version+"</td><td><button class=\"mdui-btn mdui-ripple mdui-color-blue mdui-shadow-4\" onclick=\"change_node('"+tmp+"','"+nodes[i].id+"');\">更改</button><br><button class=\"mdui-btn mdui-ripple mdui-color-red mdui-shadow-4\" onclick=\"delete_node_dialog('"+nodes[i].id+"');\">删除</button></td></tr>";
				/*let j = document.getElementsByClassName("");
				let k = j.getElementsByTagName("input");
				k[0].value = nodes[i].name;
				k[1].value = nodes[i].host;
				k[2].value = nodes[i].port;*/
			}
			let node_name = document.getElementsByClassName("node_name");
			let node_host = document.getElementsByClassName("node_host");
			let node_port = document.getElementsByClassName("node_port");
			let node_password = document.getElementsByClassName("node_password");
			for(let i in nodes){
				node_name[i].value = nodes[i].name;
				node_host[i].value = nodes[i].host;
				node_port[i].value = nodes[i].port;
			}
		}else{
			mdui.snackbar({
				message: "错误：获取节点列表失败",
				position: "top"
			});
		}
	}
	if(str=="instances"){
		document.getElementById("tzgp-app").innerHTML += "<div id=\"box\" class=\"mdui-shadow-4\"><br><h3>选择节点：</h3><br><select class=\"mdui-select\" mdui-select id=\"nodes-list\" onchange=\"get_node_id_on_instances_page();\"></select></div><div id=\"box\" class=\"mdui-shadow-4\"><div class=\"mdui-table-fluid\"><table class=\"mdui-table\" id=\"instances-list\"></table></div></div><div id=\"box\" class=\"mdui-shadow-4\"><br>创建实例<br></div>";
		let nodes = get_nodes_list();
		if(nodes!==false){
			let first_id = nodes[0].id;
			for(let i in nodes){
				document.getElementById("nodes-list").innerHTML += "<option value=\""+nodes[i].id+"\">"+nodes[i].name+"（"+nodes[i].host+":"+nodes[i].port+"）</option>";
			}
			get_instances_on_instances_page(first_id);
		}else{
			mdui.snackbar({
				message: "错误：获取节点列表失败",
				position: "top"
			});
		}
	}
	if(str=="instance"){
		if(param.length<2){
			mdui.snackbar({
				message: "参数不完整",
				position: "top"
			});
			mdui.mutation();
			return;
		}
		/*let nodes = get_nodes_list();
		if(nodes===false){
			mdui.snackbar({
				message: "错误：获取节点列表失败",
				position: "top"
			});
			mdui.mutation();
			return;
		}
		let stat = false;
		for(let i in nodes){
			if(nodes[i].id==param[0]){
				stat = true;
				break;
			}
		}
		if(!stat){
			mdui.snackbar({
				message: "找不到此节点",
				position: "top"
			});
			mdui.mutation();
			return;
		}*/
		/*let instances = get_instances(param[0]);
		if(instances===false){
			mdui.snackbar({
				message: "获取实例列表失败（节点离线）",
				position: "top"
			});
			mdui.mutation();
			return;
		}
		stat = false;
		let inst = null;
		for(let i in instances){
			if(instances[i].id==param[1]){
				stat = true;
				inst = instances[i];
				break;
			}
		}
		if(!stat){
			mdui.snackbar({
				message: "找不到此实例",
				position: "top"
			});
			mdui.mutation();
			return;
		}*/
		let inst = get_instance(param[0],param[1]);
		if(inst===false){
			mdui.snackbar({
				message: "获取实例失败",
				position: "top"
			});
			mdui.mutation();
			return;
		}
		current_node_and_instance_id = [param[0],param[1]];
		let inst_status = "未知";
		switch(inst.status){
			case 0:
				inst_status = "<span class=\"mdui-text-color-red\">已关闭</span>";
				break;
			case 1:
				inst_status = "<span class=\"mdui-text-color-green\">运行中</span>";
				break;
			case 2:
				inst_status = "<span class=\"mdui-text-color-yellow\">关闭中</span>";
				break;
		}
		document.getElementById("tzgp-app").innerHTML += "<div id=\"box\" class=\"mdui-shadow-4\"><h3>实例名："+inst.name+"</h3><p id=\"inst-status\">实例当前状态："+inst_status+"</p></div><div id=\"box\" class=\"mdui-shadow-4\"><div class=\"mdui-typo-subheading\"><p><strong>实例操作：</strong></p></div><div class=\"mdui-text-center\"><button class=\"mdui-btn mdui-ripple mdui-color-green-50\" onclick=\"start_instance();\" style=\"width: 100%;border: 1px solid #A5D6A7;\">启动</button><br><br><button class=\"mdui-btn mdui-ripple\" onclick=\"stop_instance();\" style=\"width: 100%;border: 1px solid #BDBDBD;\">关闭</button><br><br><button class=\"mdui-btn mdui-ripple mdui-color-red-50\" onclick=\"kill_instance();\" style=\"width: 100%;border: 1px solid #FFCDD2;\">强制停止</button></div></div><div id=\"box\" class=\"mdui-shadow-4\"><div class=\"mdui-tab mdui-tab-scrollable\" mdui-tab><a class=\"mdui-ripple\" onclick=\"location.assign('#instance?"+param[0]+"&"+param[1]+"&console');\" id=\"inst-tab-console\">终端</a><a class=\"mdui-ripple\" onclick=\"location.assign('#instance?"+param[0]+"&"+param[1]+"&filemanager');\" id=\"inst-tab-filemanager\">文件管理</a><a class=\"mdui-ripple\" onclick=\"location.assign('#instance?"+param[0]+"&"+param[1]+"&settings');\" id=\"inst-tab-settings\">实例设置</a></div><div id=\"inst-content\"></div><div id=\"inst-tab-content\"></div></div>";
		switch(param[2]){
			case "filemanager":
				document.getElementById("inst-tab-filemanager").classList.add("mdui-tab-active");
				document.getElementById("inst-tab-filemanager").onclick = null;
				document.getElementById("inst-tab-content").innerHTML = "<div class=\"mdui-typo\" id=\"inst-filemanager-dir\"><code>/</code></div><br><span id=\"inst-filemanager-toparentdir\"><button class=\"mdui-btn mdui-color-grey mdui-text-color-white mdui-ripple\">返回至上一层目录</button></span>&nbsp;<input type=\"file\" id=\"inst-filemanager-upload\" style=\"display: none\" onchange=\"upload_file();\"><button class=\"mdui-btn mdui-color-yellow mdui-ripple\" onclick=\"upload_file_dialog();\">上传</button><br><div class=\"mdui-table-fluid\"><table class=\"mdui-table\"><thead><tr><th></th><th>文件名</th><th>文件类型</th><th>文件大小</th><th>操&nbsp;&nbsp;&nbsp;&nbsp;作&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th></tr></thead><tbody id=\"inst-filemanager-tbody\"></tbody></table></div>";
				let directory = "";
				if(param[3]!=undefined){
					directory = param[3];
					tmp_dir = directory;
					document.getElementById("inst-filemanager-dir").innerHTML = "<code>"+directory+"</code>";
					let parent_dir = "";
					let parent_dir2 = directory.split("/");
					for(let i in parent_dir2){
						if(parent_dir2[i]==""){
							continue;
						}
						if(parent_dir2.length-1!=i){
							parent_dir += "/"+parent_dir2[i];
						}
					}
					if(directory!="/"){
						if(parent_dir==""){
							parent_dir = "/";
						}
						document.getElementById("inst-filemanager-toparentdir").innerHTML = "<a href=\"#instance?"+current_node_and_instance_id[0]+"&"+current_node_and_instance_id[1]+"&filemanager&"+parent_dir+"\"><button class=\"mdui-btn mdui-color-grey mdui-text-color-white mdui-ripple\">返回至上一层目录</button></a>";
					}
				}
				let files_list = get_file_list(directory);
				if(files_list===false){
					mdui.snackbar({
						message: "获取文件列表失败",
						position: "top"
					});
					return;
				}
				files_list = rank_files(files_list);
				for(let i in files_list){
					if(files_list[i].type=="f"){
						document.getElementById("inst-filemanager-tbody").innerHTML += "<tr><td><i class=\"mdui-icon material-icons\">&#xe24d;</i></td><td>"+files_list[i].name+"</td><td>文件</td><td>"+size_decode(files_list[i].size)+"</td><td><button class=\"mdui-btn mdui-ripple mdui-color-green\">编辑</button>&nbsp;<button class=\"mdui-btn mdui-ripple mdui-color-green\" mdui-menu=\"{target:'#inst-filemanager-more-f_"+i+"'}\">更多</button><ul class=\"mdui-menu\" id=\"inst-filemanager-more-f_"+i+"\"><li class=\"mdui-menu-item\"><a href=\"javascript:download_file('"+directory+"/"+files_list[i].name+"');\" class=\"mdui-ripple\">下载</a></li></ul></td></tr>";
					}
					if(files_list[i].type=="d"){
						document.getElementById("inst-filemanager-tbody").innerHTML += "<tr><td><i class=\"mdui-icon material-icons\">&#xe2c7;</i></td><td><a href=\"#instance?"+current_node_and_instance_id[0]+"&"+current_node_and_instance_id[1]+"&filemanager&"+parse_dir(directory+"/"+files_list[i].name)+"\" class=\"mdui-text-color-black\">"+files_list[i].name+"</a></td><td>文件夹</td><td></td><td><button class=\"mdui-btn mdui-ripple mdui-color-green\" disabled>编辑</button>&nbsp;<button class=\"mdui-btn mdui-ripple mdui-color-green\">更多</button></td></tr>";
					}
				}
				break;
			case "settings":
				document.getElementById("inst-tab-settings").classList.add("mdui-tab-active");
				document.getElementById("inst-tab-settings").onclick = null;
				document.getElementById("inst-tab-content").innerHTML = "实例设置（没写）";
				break;
			default:
				document.getElementById("inst-tab-console").classList.add("mdui-tab-active");
				document.getElementById("inst-tab-console").onclick = null;
				document.getElementById("inst-tab-content").innerHTML = "<div id=\"inst-terminal\"></div><div class=\"mdui-row\"><div class=\"mdui-textfield mdui-col-xs-9\"><input id=\"inst-terminal-input\" class=\"mdui-textfield-input\" type=\"text\" placeholder=\"在此输入命令\"></div><br><button class=\"mdui-btn mdui-ripple mdui-color-blue mdui-col-xs-3\" onclick=\"exec_cmd();\">执行命令</button></div>";
				term.resize(Math.floor($(document.getElementById("inst-terminal")).width()/9),30);
				term.open(document.getElementById("inst-terminal"));
				let terminal_token = get_tmp_terminal_connect_token(param[0],param[1]);
				if(terminal_token==false){
					mdui.snackbar({
						message: "获取终端连接密钥失败",
						position: "top"
					});
					break;
				}
				if(ws==null){
					let last_log = get_last_log(50);
					if(last_log!==false){
						last_log = last_log.replace(/\n/g,"\r\n");
						term.write(last_log);
					}else{
						mdui.snackbar({
							message: "获取终端日志失败",
							position: "top"
						});
					}
					ws = io("ws://"+inst.node_host+"/ws",{reconnection:false});
					ws.on("terminal",function(msg){
						term.write(decoder.decode(msg));
						console.log(decoder.decode(msg));
					});
					ws.on("result",function(msg){
						console.log(msg);
					});
					ws.on("instance-status",function(msg){
						console.log(msg);
						switch(msg){
						case 0:
							document.getElementById("inst-status").innerHTML = "实例当前状态：<span class=\"mdui-text-color-red\">已关闭</span>";
							break;
						case 1:
							document.getElementById("inst-status").innerHTML = "实例当前状态：<span class=\"mdui-text-color-green\">运行中</span>";
							break;
						case 2:
							document.getElementById("inst-status").innerHTML = "实例当前状态：<span class=\"mdui-text-color-yellow\">关闭中</span>";
							break;
						}
					});
					//current_node_and_instance_id = [param[0],param[1]];
					ws.emit("terminal",{token:terminal_token});
				}
				break;
		}
	}
	mdui.mutation();
}
var decoder = new TextDecoder('utf-8');
var term = new Terminal();
var ws = null;
var current_node_and_instance_id = [];
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
	if(response.http_code==200){
		mdui.snackbar({
			message: "登录成功",
			position: "top"
		});
		var oDate = new Date();
		oDate.setDate(oDate.getDate()+2);
		document.cookie = "token="+escape(response.data.token)+"; expires="+oDate.toGMTString();
		update_cookie();
		let data = JSON.parse(request(JSON.stringify({
			"action": "get_user_info",
			"data": {
				"token": cookies.token
			}
		})));
		user_data = data.data;
		location.assign("#status")
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
	update_cookie();
	mdui.snackbar({
		message: "登出成功",
		position: "top"
	});
	setTimeout(function(){location.assign("");},1000);
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
	if(result.http_code==200){
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
	if(result.http_code==200){
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
	//let old_password = document.getElementById("old_password").value;
	let new_password_1 = document.getElementById("new_password_1").value;
	let new_password_2 = document.getElementById("new_password_2").value;
	/*if(old_password==""){
		mdui.snackbar({
			message: "旧密码不能为空",
			position: "top"
		});
		return false;
	}*/
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
			//"old_password": old_password,
			"new_password": new_password_1
		}
	})));
	if(result.status===0){
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
function get_nodes_list(){
	let result = JSON.parse(request(JSON.stringify({
		"action": "get_nodes_list",
		"data": {
			"token": cookies.token
		}
	})));
	if(result.http_code==200&&result.status===0){
		return result.data;
	}else{
		return false;
	}
}
function get_node_info(node_id){
	let result = JSON.parse(request(JSON.stringify({
		"action": "get_node_info",
		"data": {
			"token": cookies.token,
			"node_id": node_id
		}
	})));
	if(result.status===0){
		return [true,result.data];
	}else{
		return [false,result.data];
	}
}
function add_node(){
	let node_name = document.getElementById("node-name").value;
	let node_host = document.getElementById("node-host").value;
	let node_port = parseInt(document.getElementById("node-port").value);
	let node_password = document.getElementById("node-password").value;
	if(node_name==""){
		mdui.snackbar({
			message:"节点名不能为空",
			position:"top"
		});
		return;
	}
	if(node_host==""){
		mdui.snackbar({
			message:"地址不能为空",
			position:"top"
		});
		return;
	}
	if(node_port==""){
		mdui.snackbar({
			message:"端口不能为空",
			position:"top"
		});
		return;
	}
	if(node_password==""){
		mdui.snackbar({
			message:"密钥不能为空",
			position:"top"
		});
		return;
	}
	let result = JSON.parse(request(JSON.stringify({
		"action": "create_node",
		"data": {
			"token": cookies.token,
			"name": node_name,
			"host": node_host,
			"port": node_port,
			"password": node_password
		}
	})));
	if(result.status===0){
		mdui.snackbar({
			message: "添加成功",
			position: "top"
		});
		page("main");
		page("nodes");
	}else{
		mdui.snackbar({
			message: "添加失败："+result.msg,
			position: "top"
		});
	}
}
var dntmp = undefined;
function delete_node_dialog(id){
	let s = false;
	let d = {};
	for(let i in nodes_data){
		if(nodes_data[i].id==id){
			s = true;
			d = nodes_data[i];
			break;
		}
	}
	if(s){
		dntmp = d;
		mdui.dialog({
			title: "删除节点",
			content: "你确定要删除节点"+d.name+"吗？<br>该节点上的实例都不会删除，但是所有已分配给用户的实例都会取消分配",
			buttons: [
				{
					text: "取消"
				},
				{
					text: "确定",
					onClick: function(inst){
						delete_node(dntmp.id);
						dntmp = undefined;
					}
				}
			]
		});
	}else{
		mdui.snackbar({
			message: "找不到节点",
			position: "top"
		});
	}
}
function delete_node(id){
	let s = false;
	let d = {};
	for(let i in nodes_data){
		if(nodes_data[i].id==id){
			s = true;
			d = nodes_data[i];
			break;
		}
	}
	if(s){
		let result = JSON.parse(request(JSON.stringify({
			action: "delete_node",
			data: {
				token: cookies.token,
				node_id: id
			}
		})));
		if(result.status===0){
			mdui.snackbar({
				message: "删除成功",
				position: "top"
			});
			page("main");
			page("nodes");
		}else{
			mdui.snackbar({
				message: "删除失败："+result.msg,
				position: "top"
			});
		}
	}else{
		mdui.snackbar({
			message: "找不到节点",
			position: "top"
		});
	}
}
function get_node_id_on_instances_page(){
	let id = document.getElementById("nodes-list").options[document.getElementById("nodes-list").selectedIndex].value;
	get_instances_on_instances_page(id);
}
function get_instances_on_instances_page(id){
	document.getElementById("instances-list").innerHTML="<tr><th>实例名</th><th>实例id</th><th>状态&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th><th>操作</th></tr>";
	let result = JSON.parse(request(JSON.stringify({
		action: "get_instances",
		data: {
			token: cookies.token,
			node_id: id
		}
	})));
	if(result.status===0){
		for(let i in result.data){
			let stat = "未知";
			if(result.data[i].status == 0){
				stat = "已关闭";
			}else if(result.data[i].status==1){
				stat = "运行中";
			}else if(result.data[i].status==2){
				stat = "关闭中";
			}
			document.getElementById("instances-list").innerHTML+="<tr><td>"+result.data[i].name+"</td><td>"+result.data[i].id+"</td><td>"+stat+"</td><td><a href=\"#instance?"+id+"&"+result.data[i].id+"\"><button class=\"mdui-btn mdui-ripple mdui-color-blue\">管理</button></a></td></tr>";
		}
	}else{
		mdui.snackbar({
			message: "获取该节点的实例列表失败（节点离线）",
			position: "top"
		});
		//document.getElementById("instances-list").innerHTML+="<div class=\"mdui-text-center\">没有数据</div>";
	}
}
function change_node(num,node_id){
	let name = document.getElementsByClassName("node_name")[parseInt(num)-1].value;
	let host = document.getElementsByClassName("node_host")[parseInt(num)-1].value;
	let port = parseInt(document.getElementsByClassName("node_port")[parseInt(num)-1].value);
	let password = document.getElementsByClassName("node_password")[parseInt(num)-1].value;
	let result = JSON.parse(request(JSON.stringify({
		action: "change_node",
		data: {
			token: cookies.token,
			node_id: node_id,
			name: name,
			host: host,
			port: port,
			password: password
		}
	})));
	if(result.status===0){
		mdui.snackbar({
			message: "更改节点成功",
			position: "top"
		});
		page("main");
		page("nodes");
	}else{
		mdui.snackbar({
			message: "更改节点失败："+result.msg,
			position: "top"
		});
	}
}
function get_instances(node_id){
	let result = JSON.parse(request(JSON.stringify({
		action: "get_instances",
		data: {
			token: cookies.token,
			node_id: node_id
		}
	})));
	if(result.status==0){
		return result.data;
	}else{
		return false;
	}
}
function get_instance(node_id,instance_id){
	let result = JSON.parse(request(JSON.stringify({
		action: "get_instance",
		data: {
			token: cookies.token,
			node_id: node_id,
			instance_id: instance_id
		}
	})));
	if(result.status==0){
		return result.data;
	}else{
		return false;
	}
}
function get_tmp_terminal_connect_token(node_id,instance_id){
	let result = JSON.parse(request(JSON.stringify({
		action: "get_tmp_terminal_connect_token",
		data: {
			token: cookies.token,
			node_id: node_id,
			instance_id: instance_id
		}
	})));
	if(result.status===0){
		return result.data;
	}else{
		return false;
	}
}
function exec_cmd(){
	let cmd = document.getElementById("inst-terminal-input").value;
	let result = JSON.parse(request(JSON.stringify({
		action: "exec_cmd",
		data: {
			token: cookies.token,
			node_id: current_node_and_instance_id[0],
			instance_id: current_node_and_instance_id[1],
			cmd: cmd
		}
	})));
	if(result.status===0){
		document.getElementById("inst-terminal-input").value = "";
		return true;
	}else{
		mdui.snackbar({
			message: result.msg,
			position: "top"
		});
		return false;
	}
}
function start_instance(){
	let result = JSON.parse(request(JSON.stringify({
		action: "start_instance",
		data: {
			token: cookies.token,
			node_id: current_node_and_instance_id[0],
			instance_id: current_node_and_instance_id[1]
		}
	})));
	if(result.status===0){
		mdui.snackbar({
			message: "启动实例成功",
			position: "top"
		});
	}else{
		mdui.snackbar({
			message: result.msg,
			position: "top"
		});
	}
}
function stop_instance(){
	let result = JSON.parse(request(JSON.stringify({
		action: "stop_instance",
		data: {
			token: cookies.token,
			node_id: current_node_and_instance_id[0],
			instance_id: current_node_and_instance_id[1]
		}
	})));
	if(result.status!==0){
		mdui.snackbar({
			message: result.msg,
			position: "top"
		});
	}
}
function kill_instance(){
	mdui.dialog({
		title: "警告",
		content: "你确定要这么做吗？这可能会导致某些数据丢失",
		buttons: [
			{
				text: "不"
			},
			{
				text: "强制停止",
				onClick: kill_instance_2
			}
		]
	});
}
function kill_instance_2(){
	let result = JSON.parse(request(JSON.stringify({
		action: "kill_instance",
		data: {
			token: cookies.token,
			node_id: current_node_and_instance_id[0],
			instance_id: current_node_and_instance_id[1]
		}
	})));
	if(result.status===0){
		mdui.snackbar({
			message: "强制停止实例成功",
			position: "top"
		});
	}else{
		mdui.snackbar({
			message: result.msg,
			position: "top"
		});
	}
}
function get_file_list(dir){
	let result = JSON.parse(request(JSON.stringify({
		action: "get_file_list",
		data: {
			token: cookies.token,
			node_id: current_node_and_instance_id[0],
			instance_id: current_node_and_instance_id[1],
			directory: dir
		}
	})));
	if(result.status===0){
		return result.data;
	}else{
		return false;
	}
}
function size_decode(size){
	if(size>=1024){
		size = (size/1024).toFixed(2);
		if(size>=1024){
			size = (size/1024).toFixed(2);
			if(size>=1024){
				size = (size/1024).toFixed(2);
				return ""+size+"GiB";
			}
			return ""+size+"MiB";
		}
		return ""+size+"KiB";
	}
	return ""+size+"B";
}
function rank_files(files_list){
	let name_list = [];
	let files_list2 = [];
	for(let i in files_list){
		name_list[i] = files_list[i].name;
	}
	name_list.sort();
	for(let i in name_list){
		for(let j in files_list){
			if(name_list[i]==files_list[j].name){
				files_list2[i] = files_list[j];
				continue;
			}
		}
	}
	let files_list3 = [];
	for(let i in files_list2){
		if(files_list2[i].type=="d"){
			files_list3.push(files_list2[i]);
		}
	}
	for(let i in files_list2){
		if(files_list2[i].type=="f"){
			files_list3.push(files_list2[i]);
		}
	}
	return files_list3;
}
function parse_dir(dir){
	let dir2 = dir.split("/");
	let dir3 = "";
	for(let i in dir2){
		if(dir2[i]==""){
			continue;
		}
		dir3 += "/"+dir2[i];
	}
	if(dir3==""){
		dir3 = "/";
	}
	return dir3;
}
function get_last_log(line){
	let result = JSON.parse(request(JSON.stringify({
		action: "get_last_log",
		data: {
			token: cookies.token,
			node_id: current_node_and_instance_id[0],
			instance_id: current_node_and_instance_id[1],
			line: line
		}
	})));
	if(result.status===0){
		return result.data;
	}else{
		return false;
	}
}
function download_file(filepath){
	let terminal_token = get_tmp_terminal_connect_token(current_node_and_instance_id[0],current_node_and_instance_id[1]);
	let inst = get_instance(current_node_and_instance_id[0],current_node_and_instance_id[1])
	location.href = "http://"+inst.node_host+"/download_file?terminal_token="+terminal_token+"&file="+filepath;
}
function upload_file_dialog(){
	let upload_btn = document.getElementById("inst-filemanager-upload");
	upload_btn.click();
}
var tmp_dir = undefined;
function upload(){
	6;
}
setInterval(function(){
	if(ws===null){
		return;
	}
	if(!ws.connected){
		mdui.snackbar({
			message: "连接守护进程失败，重连中",
			position: "top",
			timeout: 1500
		});
		let terminal_token = get_tmp_terminal_connect_token(current_node_and_instance_id[0],current_node_and_instance_id[1]);
		if(terminal_token==false){
			mdui.snackbar({
				message: "重连失败",
				position: "top",
				timeout: 1500
			});
			return;
		}
		ws.connect();
		term.reset();
		let last_log = get_last_log(50);
		if(last_log!==false){
			last_log = last_log.replace(/\n/g,"\r\n");
			term.write(last_log);
		}else{
			mdui.snackbar({
				message: "获取终端日志失败",
				position: "top"
			});
		}
		ws.emit("terminal",{token:terminal_token});
	}
},5000);
var user_data = undefined;
var nodes_data = undefined;
var cookies = {};
var isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
var device = navigator.userAgent.toLowerCase();
var isPhone = false;
if(/ipad|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(device)){
	isPhone = true;
}
var old_url = "";
var old_param = [];
setInterval(function(){
    update_cookie();
	let url = location.href;
	let url2 = url.slice(url.lastIndexOf("#")+1);
	if(url == url2){//地址栏没有#
		location.assign("#login");//#login为默认位置
		return;
	}
	let param = url2.slice(url2.lastIndexOf("?")+1);
	if(param==url2){
		param = [];
	}else{
		param = param.split("&");
		let param2 = [];
		for(let i in param){
			if(param[i]!="mdui-dialog"){
				param2[param2.length] = decodeURI(param[i]);
			}
		}
		param = param2;
	}
	let url3 = url2.split("?")[0];
	if(url3!=old_url){
		old_url = url3;
		old_param = param;
	}else{
		if(old_param.length!=param.length){
			old_param = param;
		}else{
			let stat = true;
			for(let i in param){
				if(param[i]!=old_param[i]){
					stat = false;
				}
			}
			if(stat){
				return;
			}else{
				old_param = param;
			}
		}
	}
	console.log(url2+" "+param);
	if(cookies.token!=undefined){
		let data = JSON.parse(request(JSON.stringify({
			"action": "get_user_info",
			"data": {
				"token": cookies.token,
			}
		})));
		if(data.http_code==200){
			user_data = data.data;
		}else{
			mdui.snackbar({
				message: "token无效",
				position: "top"
			});
			var oDate = new Date();
			oDate.setDate(oDate.getDate()-1);
			document.cookie = "token=0; expires="+oDate.toGMTString();
			update_cookie();
			location.assign("")//刷新
			return;
		}
	}else{
	    if(url3!="login"){
		    location.assign("#login");
		    return;
		}
	}
	if(ws!=null&&url3!="instance"){
		ws.disconnect();
		ws = null;
		term.reset();
		current_node_and_instance_id = [];
	}
	switch(url3){
		case "":
			location.assign("#login");
			break;
		case "login":
		    if(cookies.token!=undefined){
		        location.assign("#status");
		        return;
		    }
            page("login");
			break;
		default:
			page("main");
			page(url3,param);
			break;
	}
},100);
/*setTimeout(function(){
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
	if(data.http_code==200){
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
},1000);*/
