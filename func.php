<?php
require __DIR__.'/autoload.php';
//下方是自检语句，每引用一次本文件将会执行一次
const TGP_DIR = __DIR__;
$dirs = array(
	"data",
	"data/user",
	"data/config",
	"data/nodes",
	"data/tmp"
);
foreach($dirs as $dir){
	@mkdir(TGP_DIR."/".$dir);
}
if(!file_exists(TGP_DIR."/data/tmp/tokens.json")){
	file_write(TGP_DIR."/data/tmp/tokens.json","[]");
}
$tokens = json_decode(file_read(TGP_DIR."/data/tmp/tokens.json"),true);
for($i=0;$i<count($tokens);$i=$i+1){
	if($tokens[$i]['end_time']<time()){
		unset($tokens[$i]);
	}
}
$tokens2 = array();
foreach($tokens as $i){
	$tokens2 = array_merge($tokens2,array($i));
}
file_write(TGP_DIR."/data/tmp/tokens.json",json_encode($tokens2));
unset($tokens);
//自检语句结束
//下方是核心函数
function file_read(string $filename):string{
	if(!file_exists($filename)){
		throw new Exception("No such file or directory");
	}
	$file = fopen($filename,"r");
	$text = fread($file,filesize($filename)+1);
	fclose($file);
	return $text;
}
function file_write(string $filename,string $text):bool{
	$file = fopen($filename,"w");
	fwrite($file,$text);
	fclose($file);
	return true;
}
function input(string $prompt=""):string{
	echo $prompt;
	$file = fopen("php://stdin","r");
	$text = fread($file,999999);
	fclose($file);
	return str_replace("\n","",str_replace("\r\n","\n",$text));
}
function get_env(string $name){
	$env = json_decode(file_read(TGP_DIR."/data/config/env.json"),true);
	if(isset($env[$name])){
		return $env[$name];
	}else{
		return null;
	}
}
function sendrequest($url,$request_method="GET",$request_body="",$header=array("Content-Type: application/json;charset=utf-8")){
	$curl = curl_init();
	curl_setopt($curl,CURLOPT_URL,$url);
	curl_setopt($curl,CURLOPT_TIMEOUT,1);
	curl_setopt($curl,CURLOPT_HEADER,0);
	curl_setopt($curl,CURLOPT_RETURNTRANSFER,1);
	curl_setopt($curl,CURLOPT_POSTFIELDS,$request_body);
	curl_setopt($curl, CURLOPT_HTTPHEADER,$header);
	curl_setopt($curl,CURLOPT_CUSTOMREQUEST,$request_method);
	$data = curl_exec($curl);
	curl_close($curl);
	return $data;
}
function login(string $username,string $password):string|bool{
	if(!check_user_exist($username)){
		return false;
	}
	$data = get_user($username);
	if($data['password']==md5($password)){
		update_user($username,array("last_login_time"=>time()));
		return gen_token($username);
	}else{
		return false;
	}
}
function create_user(string $username,string $password,int $permission=0):array{
	if(check_user_exist($username)){
		return array(
			"status" => false,
			"msg" => "用户已存在",
		);
	}
	$check_password = check_password($password);
	if($check_password!=""){
		return array(
			"status" => false,
			"msg" => "密码强度不够：".$check_password,
		);
	}
	$user_id = md5($username.$password.time());
	mkdir(TGP_DIR."/data/user/".$user_id);
	file_write(TGP_DIR."/data/user/".$user_id."/data.json",json_encode(array(
		"username" => $username,
		"password" => md5($password),
		"id" => $user_id,
		"create_time" => time(),
		"last_login_time" => null,
		"permission" => 0,
		"instances" => array(),
		"apikey" => null,
	)));
	return array(
		"status" => true,
		"msg" => "成功",
	);
}
function get_user(string $username):array|bool{
	if(!check_user_exist($username)){
		return false;
	}
	foreach(get_user_list() as $i){
		if($i['username']==$username){
			return $i;
		}
	}
}
function get_user_from_token(string $token):array|bool{
	foreach(json_decode(file_read(TGP_DIR."/data/tmp/tokens.json"),true) as $i){
		if($i['token']===$token){
			$user = get_user_from_id($i['id']);
			unset($user['password']);
			return $user;
		}
	}
	return false;
}
function get_user_from_apikey(string $apikey):array|bool{
	foreach(get_user_list() as $i){
		if($i['apikey']===$apikey){
			unset($i['password']);
			return $i;
		}
	}
	return false;
}
function get_user_from_id(string $id):array|bool{
	foreach(get_user_list() as $i){
		if($i['id']===$id){
			unset($i['password']);
			return $i;
		}
	}
	return false;
}
function delete_user(string $username):array|bool{
	if(!check_user_exist($username)){
		return false;
	}
	foreach(get_user_list() as $i){
		if($i['username']==$username){
			unlink(TGP_DIR."/data/user/".$i['id']."/data.json");
			rmdir(TGP_DIR."/data/user/".$i['id']);
			return true;
		}
	}
}
function get_user_list():array{
	$files = glob(TGP_DIR."/data/user/*/data.json");
	$list = array();
	foreach($files as $i){
		$data = json_decode(file_read($i),true);
		$list = array_merge($list,array($data));
	}
	return $list;
}
function check_user_exist(string $username):bool{
	$status = false;
	foreach(get_user_list() as $i){
		if($i['username']==$username){
			$status = true;
			break;
		}
	}
	return $status;
}
function update_user(string $username,array $content){
	if(!check_user_exist($username)){
		return false;
	}
	$data = get_user($username);
	$data = array_merge($data,$content);
	file_write(TGP_DIR."/data/user/".$data['id']."/data.json",json_encode($data));
	return true;
}
function gen_api_key(string $username):string|bool{
	if(!check_user_exist($username)){
		return false;
	}
	$data = get_user($username);
	$old_apikey = "";
	if($data['apikey']!=null){
		$old_apikey = $data['apikey'];
	}
	$apikey = md5($data['username']."APIKEY".$data['id'].$data['password'].time().$old_apikey);
	$result = update_user($username,array("apikey"=>$apikey));
	return $apikey;
}
function gen_token(string $username):string|bool{
	if(!check_user_exist($username)){
		return false;
	}
	$tokens = json_decode(file_read(TGP_DIR."/data/tmp/tokens.json"),true);
	$user = get_user($username);
	$token = md5($username.$user['password'].$user['id'].$user['create_time'].time());
	$tokens = array_merge($tokens,array(array("id"=>$user['id'],"token"=>$token,"end_time"=>time()+86400)));
	file_write(TGP_DIR."/data/tmp/tokens.json",json_encode($tokens));
	return $token;
}
function close_api_key(string $username):bool{
	if(!check_user_exist($username)){
		return false;
	}
	update_user($username,array("apikey"=>null));
	return true;
}
function check_password(string $password):string{
    $pattern1='/[A-Z]/';
    $pattern2='/[a-z]/';
    $pattern3='/[0-9]/';
    $pattern4='/[_.\-#$%]/';
    $result = "";
    if(strlen($password)<8) {
        $result .= "需要至少包含8个字符 ";
    }
    if(!preg_match($pattern1,$password)) {
        $result .= "需要至少一个大写字母 ";
    }
    if(!preg_match($pattern2,$password)) {
        $result .= "需要至少一个小写字母";
    }
    if(!preg_match($pattern3,$password)) {
        $result .= "需要至少一个数字 ";
    }
    /*if(!preg_match($pattern4,$password)) {
        $result .= "密码需要至少一个特殊符号：_.-#$% ";
    }*/
    return $result;
}
function change_password(string $username,/*string $old_password,*/string $new_password):string{
	$data = get_user($username);
	/*if(md5($old_password)!=$data['password']){
		return "旧密码不正确";
	}*/
	$chkpwd = check_password($new_password);
	if($chkpwd!=""){
		return "新密码强度不够：".$chkpwd;
	}
	update_user($username,array("password"=>md5($new_password)));
	$tokens = json_decode(file_read(TGP_DIR."/data/tmp/tokens.json"),true);
	$tokens2 = array();
	foreach($tokens as $i){
		if($i['id']!=$data['id']){
			$tokens2 = array_merge($tokens2,array($i));
		}
	}
	file_write(TGP_DIR."/data/tmp/tokens.json",json_encode($tokens2));
	return "";
}

function create_node(string $node_name,string $node_host,int $node_port,string $node_password):array{
	$nodes = get_node_list();
	foreach($nodes as $i){
		if($i['host']==$node_host&&$i['port']==$node_port){
			return array(
				"status" => false,
				"msg" => "该节点已被添加",
			);
		}
	}
	$node_data = array(
		"name" => $node_name,
		"host" => $node_host,
		"port" => $node_port,
		"password" => $node_password,
		"id" => md5(time().$node_name.$node_host.$node_port.$node_password)
	);
	mkdir(TGP_DIR."/data/nodes/".$node_data['id']);
	file_write(TGP_DIR."/data/nodes/".$node_data['id']."/data.json",json_encode($node_data));
	return array(
		"status" => true,
		"msg" => "成功创建节点"
	);
}
function get_node_list():array{
	$files = glob(TGP_DIR."/data/nodes/*/data.json");
	$nodes = array();
	foreach($files as $i){
		$text = json_decode(file_read($i),true);
		$nodes = array_merge($nodes,array($text));
	}
	return $nodes;
}
function check_node_exist($id):bool{
	foreach(get_node_list() as $i){
		if($i['id']==$id){
			return true;
		}
	}
	return false;
}
function delete_node($id):bool{
	if(!check_node_exist($id)){
		return false;
	}
	$data = get_node($id);
	foreach(glob(TGP_DIR."/data/nodes/".$data['id']."/*") as $i){
		@unlink($i);
	}
	@rmdir(TGP_DIR."/data/nodes/".$data['id']);
	return true;
}
function get_node($id):array|bool{
	if(!check_node_exist($id)){
		return false;
	}
	foreach(get_node_list() as $i){
		if($i['id']==$id){
			return $i;
		}
	}
	return false;
}
function get_node_info(string $node_id):array{
	$node_data = array();
	$status = false;
	foreach(get_node_list() as $i){
		if($i['id']==$node_id){
			$node_data = $i;
			$status = true;
			break;
		}
	}
	if(!$status){
		return array(
			"status" => false,
			"code" => -1,
			"msg" => "找不到节点"
		);
	}
	$req = sendrequest("http://".$node_data['host'].":".$node_data['port']."/get_info?token=".$node_data['password']);
	if($req==false){
		return array(
			"status" => false,
			"code" => 1,
			"msg" => "节点离线"
		);
	}
	$data = json_decode($req,true);
	if($data==false){
		return array(
			"status" => false,
			"code" => 2,
			"msg" => "解析节点回复的json数据失败"
		);
	}
	if($data['status']!=200){
		return array(
			"status" => false,
			"code" => 3,
			"http_code" => $data['status'],
			"msg" => $data['msg']
		);
	}
	return array(
		"status" => true,
		"code" => 0,
		"data" => $data['data']
	);
}
function update_node(string $node_id,string $node_name,string $node_host,int $node_port,string $node_password):array{
	$status = false;
	$node_data = array();
	foreach(get_node_list() as $i){
		if($i['id']==$node_id){
			$status = true;
			$node_data = $i;
			break;
		}
	}
	if($status){
		if(!($node_port>0&&$node_port<65536)){
			return array(
				"status" => false,
				"msg" => "端口范围不对"
			);
		}
		$node_data['name'] = $node_name;
		$node_data['host'] = $node_host;
		$node_data['port'] = $node_port;
		$node_data['password'] = $node_password;
		file_write(TGP_DIR."/data/nodes/".$node_id."/data.json",json_encode($node_data));
		return array(
			"status" => true,
			"msg" => "成功"
		);
	}else{
		return array(
			"status" => false,
			"msg" => "找不到节点"
		);
	}
}
function get_instances(string $node_id):array{
	$node_data = array();
	$status = false;
	foreach(get_node_list() as $i){
		if($i['id']==$node_id){
			$node_data = $i;
			$status = true;
		}
	}
	if(!$status){
		return array(
			"status" => false,
			"msg" => "找不到节点"
		);
	}
	$data = json_decode(sendrequest("http://".$node_data['host'].":".$node_data['port']."/get_instances?token=".$node_data['password']),true);
	if($data==false){
		return array(
			"status" => false,
			"msg" => "获取数据失败"
		);
	}
	return array(
		"status" => true,
		"data" => $data['data']
	);
}
