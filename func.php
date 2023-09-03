<?php
/*基本函数*/
const TGP_DIR = __DIR__;
$dirs = array(
	"data",
	"data/user",
	"data/config",
	"data/nodes"
);
foreach($dirs as $dir){
	@mkdir(TGP_DIR."/".$dir);
}
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
/*核心函数*/
function get_env(string $name){
	$env = json_decode(file_read(TGP_DIR."/data/config/env.json"),true);
	if(isset($env[$name])){
		return $env[$name];
	}else{
		return null;
	}
}
function login(string $username,string $password):string|bool{
	if(!check_user_exist($username)){
		return false;
	}
	$data = get_user($username);
	if($data['password']==md5($password)){
		return md5($username.md5($password).$data['id']);
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
	foreach(get_user_list() as $i){
		if(md5($i['username'].$i['password'].$i['id'])==$token){
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
function change_password(string $username,string $old_password,string $new_password):string{
	$data = get_user($username);
	if(md5($old_password)!=$data['password']){
		return "旧密码不正确";
	}
	$chkpwd = check_password($new_password);
	if($chkpwd!=""){
		return "新密码强度不够：".$chkpwd;
	}
	update_user($username,array("password"=>md5($new_password)));
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
		"id" => md5(time().$node_name.$node_host.$node_port.$node_password);
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
		$nodes = array_merge($nodes,array($i));
	}
	return $nodes;
}
function get_node_status(string $node_id):array|bool{
}
