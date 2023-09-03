<?php
require '../func.php';
function ret(int $status,string $msg,$data=null){
	http_response_code($status);
	die(json_encode(array(
		"status" => $status,
		"msg" => $msg,
		"data" => $data,
	)));
}
$status = false;
foreach(getallheaders() as $key=>$value){
	if($key=="Content-Type"&&str_replace("application/json","",$value)!=$value){
		$status = true;
		break;
	}
}
if($status){
	$data = trim(file_get_contents("php://input"));
	$decode_data = json_decode($data,true);
	if($decode_data===null){
		ret(400,"数据解析失败");
	}
	if(!isset($decode_data['action'])){
		ret(400,"没有\"action\"数据");
	}
	switch($decode_data['action']){
	case "login":
		if(!( isset($decode_data['data'])&&isset($decode_data['data']['username'])&&isset($decode_data['data']['password']) )){
			ret(400,"参数不全");
		}
		$data = login($decode_data['data']['username'],$decode_data['data']['password']);
		if(!$data){
			ret(403,"登录失败：用户名或密码错误");
		}else{
			ret(200,"登录成功",array("token"=>$data));
		}
		break;
	case "get_user_info":
		if(!( isset($decode_data['data'])&&isset($decode_data['data']['token']) )){
			ret(400,"参数不全");
		}
		$data = get_user_from_token($decode_data['data']['token']);
		if(!$data){
			ret(404,"找不到用户");
		}
		ret(200,"成功",$data);
		break;
	case "gen_apikey":
		if(!( isset($decode_data['data'])&&isset($decode_data['data']['token']) )){
			ret(400,"参数不全");
		}
		$data = get_user_from_token($decode_data['data']['token']);
		if(!$data){
			ret(404,"找不到用户");
		}
		$result = gen_api_key($data['username']);
		ret(200,"成功生成apikey",array("apikey"=>$result));
		break;
	case "close_apikey":
		if(!( isset($decode_data['data'])&&isset($decode_data['data']['token']) )){
			ret(400,"参数不全");
		}
		$data = get_user_from_token($decode_data['data']['token']);
		if(!$data){
			ret(404,"找不到用户");
		}
		close_api_key($data['username']);
		ret(200,"成功关闭apikey");
		break;
	case "change_password":
		if(!( isset($decode_data['data'])&&isset($decode_data['data']['token'])&&isset($decode_data['data']['old_password'])&&isset($decode_data['data']['new_password']) )){
			ret(400,"参数不全");
		}
		$data = get_user_from_token($decode_data['data']['token']);
		if(!$data){
			ret(404,"找不到用户");
		}
		$result = change_password($data['username'],$decode_data['data']['old_password'],$decode_data['data']['new_password']);
		if($result==""){
			$data = get_user($data['username']);
			ret(200,"更改密码成功，需要重新登录",array("token"=>md5($data['username'].$data['password'].$data['id'])));
		}else{
			ret(400,"更改密码失败：".$result);
		}
		break;
	default:
		ret(400,"无效的\"action\"");
		break;
	}
}else{
	http_response_code(400);
	die(json_encode(array(
		"status" => 400,
		"msg" => "请求头不正确",
		"data" => null
	)));
}
