<?php
//error_reporting(0);
require '../func.php';
function ret(int $status,int $http_code,string $msg,$data=null){
	//http_code是状态码，各状态码响应结果如下：
	//200: 代表请求参数没有错误，具体结果还需要看status
	//400: 参数有问题或发送的json有问题
	//403: 鉴权失败，一般是token错误或apikey错误
	//404: 找不到该方法，一般是json中的action参数错误
	//500: 服务器内部错误，出现此情况请报告给开发者
	
	//status是结果状态码，一般是请求该方法时的返回结果
	//所有方法中，0代表正常，其他值需要参阅该方法的具体返回结果，如果http_code不正确时，该值会是-1
	http_response_code($http_code);
	die(json_encode(array(
		"http_code" => $http_code,
		"status" => $status,
		"msg" => $msg,
		"data" => $data
	)));
}
function check_params(array $rules,array $data):array{
	/*$rules变量的格式: array(
		"param1" => array(
			"type" => "string"
		),
		"param2" => array(
			"type" => "int",
			"range" => array(1,65535)//这里包括最小数字和最大数字，非必须
		),
		"param3" => array(
			"type" => "bool"
		),
		"param4" => array(
			"type" => "array"
		),
		"param5" => array(
			"type" => "any"
		),
	)
	 */
	foreach($rules as $key => $value){
		if(isset($data[$key])){
			switch($rules[$key]['type']){
			case "string":
				if(!is_string($data[$key])){
					return array(
						"status" => false,
						"msg" => "参数\"".$key."\"错误：需要字符串类型"
					);
				}
				break;
			case "int":
				if(!is_int($data[$key])){
					return array(
						"status" => false,
						"msg" => "参数\"".$key."\"错误：需要整数类型"
					);
				}
				if(isset($rules[$key]['range'])){
					if($rules[$key]['range'][0]>$rules[$key]['range'][1]){
						return array(
							"status" => false,
							"msg" => "内部错误：规则错误-2（寻找开发者）"
						);
					}
					if(!($data[$key]>=$rules[$key]['range'][0]&&$data[$key]<=$rules[$key]['range'][1])){
						return array(
							"status" => false,
							"msg" => "参数\"".$key."\"错误：范围不对，需要>=".$rules[$key]['range'][0]."和<=".$rules[$key]['range'][1]
						);
					}
				}
				break;
			case "bool":
				if(!is_bool($data[$key])){
					return array(
						"status" => false,
						"msg" => "参数\"".$key."\"错误：需要布尔类型"
					);
				}
				break;
			case "array":
				if(!is_array($data[$key])){
					return array(
						"status" => false,
						"msg" => "参数\"".$key."\"错误：需要数组类型"
					);
				}
				break;
			case "any":
				break;
			default:
				return array(
					"status" => false,
					"msg" => "内部错误：规则错误（寻找开发者）"
				);
				break;
			}
		}else{
			return array(
				"status" => false,
				"msg" => "参数不全"
			);
		}
	}
	return array(
		"status" => true,
		"msg" => "OK"
	);
}
function check_params2(array $r,array $d){
	$cp = check_params($r,$d);
	if(!$cp['status']){
		ret(-1,400,$cp['msg']);
	}
}
function instance_check(){
check_params2(array(
			"node_id" => array(
				"type" => "string"
			),
			"instance_id" => array(
				"type" => "string"
			)
		),$GLOBALS['decode_data']['data']);
	if($GLOBALS['user']['permission']!=1){
		$status = false;
		foreach($GLOBALS['user']['instances'] as $i){
			if($i['node_id']==$GLOBALS['decode_data']['data']['node_id']&&$i['instance_id']==$GLOBALS['decode_data']['data']['instance_id']){
				$status = true;
				break;
			}
		}
		if(!$status){
			ret(1,200,"无法获取实例");
		}
	}
	return array(
		"node_id" => $GLOBALS['decode_data']['data']['node_id'],
		"instance_id" => $GLOBALS['decode_data']['data']['instance_id']
	);
}
try{
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
		ret(-1,400,"json数据解析失败");
	}
	if(!isset($decode_data['data'])){
		$decode_data['data'] = array();
	}
	if(!isset($decode_data['action'])){
		ret(-1,400,"json中没有\"action\"参数");
	}
	$user = null;
	if(isset($decode_data['data']['token'])){
		$user = get_user_from_token($decode_data['data']['token']);
	}elseif(isset($decode_data['token'])){
		$user = get_user_from_token($decode_data['token']);
	}elseif(isset($decode_data['data']['apikey'])){
		$user = get_user_from_apikey($decode_data['data']['apikey']);
	}elseif(isset($decode_data['apikey'])){
		$user = get_user_from_apikey($decode_data['apikey']);
	}
	if($user===false){
		ret(-1,403,"鉴权失败：因为token或apikey不正确导致的找不到用户，token或apikey可能已失效");
	}
	if($decode_data['action']!=="login"){
		if($user===null){
			ret(-1,403,"鉴权失败：因为找不到token或apikey参数进行验证");
		}elseif($user['permission']==-1){
			ret(-1,403,"该账户已被封禁");
		}
	}
	switch($decode_data['action']){
	case "login":
		check_params2(array(
			"username" => array(
				"type" => "string"
			),
			"password" => array(
				"type" => "string"
			)
		),$decode_data['data']);
		$data = login($decode_data['data']['username'],$decode_data['data']['password']);
		if(!$data){
			ret(-1,403,"登录失败：用户名或密码错误");
		}else{
			ret(0,200,"登录成功",array("token"=>$data));
		}
		break;
	case "get_user_info":
		ret(0,200,"成功",$user);
		break;
	case "gen_apikey":
		$result = gen_api_key($user['username']);
		ret(0,200,"成功生成apikey",array("apikey"=>$result));
		break;
	case "close_apikey":
		close_api_key($user['username']);
		ret(0,200,"成功关闭apikey");
		break;
	case "change_password":
		check_params2(array("new_password"=>array("type"=>"string")),$decode_data['data']);
		$result = change_password($user['username'],/*$decode_data['data']['old_password'],*/$decode_data['data']['new_password']);
		if($result==""){
			ret(0,200,"更改密码成功",array("token"=>gen_token($user['username'])));
		}else{
			ret(1,200,"更改密码失败：".$result);
		}
		break;
	case "get_nodes_list":
		if($user['permission']!=1){
			ret(-1,403,"没有权限");
		}
		$result = get_node_list();
		for($i=0;$i<count($result);$i=$i+1){
			unset($result[$i]['password']);
		}
		ret(0,200,"成功",$result);
		break;
	case "get_node_info":
		check_params2(array("node_id"=>array("type"=>"string")),$decode_data['data']);
		if($user['permission']!=1){
			ret(-1,403,"没有权限");
		}
		$result = get_node_info($decode_data['data']['node_id']);
		if(!$result['status']){
			//$result['code']: -1_无此节点；0_成功；1_节点离线；2_解析数据失败；3_节点返回的status非200
			switch($result['code']){
			case -1:
				ret(1,200,"找不到该节点");
				break;
			case 1:
				ret(2,200,"节点离线");
				break;
			case 2:
				ret(3,200,"解析数据失败，此节点可能不是由TzGamePanel Daemon驱动的");
				break;
			case 3:
				ret(4,200,"节点返回了一个非200的返回值",array("code"=>$result['http_code'],"msg"=>$result['msg']));
			}
		}
		ret(0,200,"成功",$result['data']);
		break;
	case "create_node":
		check_params2(array(
			"name"=>array("type"=>"string"),
			"host"=>array("type"=>"string"),
			"port"=>array("type"=>"int","range"=>array(1,65535)),
			"password"=>array("type"=>"string")
		),$decode_data['data']);
		if($user['permission']!=1){
			ret(-1,403,"没有权限");
		}
		$result = create_node($decode_data['data']['name'],$decode_data['data']['host'],$decode_data['data']['port'],$decode_data['data']['password']);
		if(!$result['status']){
			ret(1,200,"节点已存在");
		}
		ret(0,200,"节点创建成功");
		break;
	case "change_node":
		check_params2(array(
			"node_id"=>array("type"=>"string"),
			"name"=>array("type"=>"string"),
			"host"=>array("type"=>"string"),
			"port"=>array("type"=>"int","range"=>array(1,65535)),
			"password"=>array("type"=>"string")
		),$decode_data['data']);
		if($user['permission']!=1){
			ret(-1,403,"没有权限");
		}
		if(!check_node_exist($decode_data['data']['node_id'])){
			ret(1,200,"找不到节点");
		}
		if($decode_data['data']['password']==""){
			$decode_data['data']['password'] = get_node($decode_data['data']['node_id'])['password'];
		}
		$result = update_node($decode_data['data']['node_id'],$decode_data['data']['name'],$decode_data['data']['host'],$decode_data['data']['port'],$decode_data['data']['password']);
		ret(0,200,"更改节点成功");
		break;
	case "delete_node":
		check_params2(array("node_id"=>array("type"=>"string")),$decode_data['data']);
		if($user['permission']!=1){
			ret(-1,403,"没有权限");
		}
		$result = delete_node($decode_data['data']['node_id']);
		if(!$result){
			ret(1,200,"找不到节点");
		}
		ret(0,200,"删除节点成功");
		break;
	case "get_instances":
		check_params2(array("node_id"=>array("type"=>"string")),$decode_data['data']);
		if($user['permission']!=1){
			ret(-1,403,"没有权限");
		}
		$result = get_instances($decode_data['data']['node_id']);
		if(!$result['status']){
			ret(1,200,$result['msg']);
		}
		ret(0,200,"成功",$result['data']);
		break;
	case "get_instance":
		check_params2(array(
			"node_id" => array(
				"type" => "string"
			),
			"instance_id" => array(
				"type" => "string"
			)
		),$decode_data['data']);
		if($user['permission']!=1){
			$status = false;
			foreach($user['instances'] as $i){
				if($i['node_id']==$decode_data['data']['node_id']&&$i['instance_id']==$decode_data['data']['instance_id']){
					$status = true;
					break;
				}
			}
			if(!$status){
				ret(1,200,"无法获取实例");
			}
		}
		$instances = get_instances($decode_data['data']['node_id']);
		if(!$instances['status']){
			ret(2,200,$instances['msg']);
		}
		foreach($instances['data'] as $i){
			if($i['id']==$decode_data['data']['instance_id']){
				unset($i["configs"]);
				$node_data = get_node($decode_data['data']['node_id']);
				$i['node_host'] = $node_data['host'].':'.$node_data['port'];
				ret(0,200,"成功",$i);
			}
		}
		ret(1,200,"无法获取实例");
		break;
	case "get_tmp_terminal_connect_token":
		check_params2(array(
			"node_id" => array(
				"type" => "string"
			),
			"instance_id" => array(
				"type" => "string"
			)
		),$decode_data['data']);
		if($user['permission']!=1){
			$status = false;
			foreach($user['instances'] as $i){
				if($i['node_id']==$decode_data['data']['node_id']&&$i['instance_id']==$decode_data['data']['instance_id']){
					$status = true;
					break;
				}
			}
			if(!$status){
				ret(1,200,"无法获取实例");
			}
		}
		$data = get_tmp_terminal_connect_token($decode_data['data']['node_id'],$decode_data['data']['instance_id']);
		if($data['status']){
			ret(0,200,"成功",$data['data']);
		}else{
			ret(2,200,$data['msg']);
		}
		break;
	case "exec_cmd":
		check_params2(array(
			"node_id" => array(
				"type" => "string"
			),
			"instance_id" => array(
				"type" => "string"
			),
			"cmd" => array(
				"type" => "string"
			)
		),$decode_data['data']);
		if($user['permission']!=1){
			$status = false;
			foreach($user['instances'] as $i){
				if($i['node_id']==$decode_data['data']['node_id']&&$i['instance_id']==$decode_data['data']['instance_id']){
					$status = true;
					break;
				}
			}
			if(!$status){
				ret(1,200,"无法获取实例");
			}
		}
		$result = exec_cmd($decode_data['data']['node_id'],$decode_data['data']['instance_id'],$decode_data['data']['cmd']);
		if($result['status']){
			ret(0,200,"成功");
		}else{
			ret(2,200,$result['msg']);
		}
		break;
	case "start_instance":
		check_params2(array(
			"node_id" => array(
				"type" => "string"
			),
			"instance_id" => array(
				"type" => "string"
			)
		),$decode_data['data']);
		if($user['permission']!=1){                                                                             $status = false;
			foreach($user['instances'] as $i){
				if($i['node_id']==$decode_data['data']['node_id']&&$i['instance_id']==$decode_data['data']['instance_id']){
					$status = true;
					break;
				}
			}
			if(!$status){
				ret(1,200,"无法获取实例");
			}
		}
		$result = start_instance($decode_data['data']['node_id'],$decode_data['data']['instance_id']);
		if($result['status']){
			ret(0,200,"成功");
		}else{
			ret(2,200,$result['msg']);
		}
		break;
	case "stop_instance":
		check_params2(array(
			"node_id" => array(
				"type" => "string"
			),
			"instance_id" => array(
				"type" => "string"
			)
		),$decode_data['data']);
		if($user['permission']!=1){                                                                             $status = false;
			foreach($user['instances'] as $i){
				if($i['node_id']==$decode_data['data']['node_id']&&$i['instance_id']==$decode_data['data']['instance_id']){
					$status = true;
					break;
				}
			}
			if(!$status){
				ret(1,200,"无法获取实例");
			}
		}
		$result = stop_instance($decode_data['data']['node_id'],$decode_data['data']['instance_id']);
		if($result['status']){
			ret(0,200,"成功");
		}else{
			ret(2,200,$result['msg']);
		}
		break;
	case "kill_instance":
		check_params2(array(
			"node_id" => array(
				"type" => "string"
			),
			"instance_id" => array(
				"type" => "string"
			)
		),$decode_data['data']);
		if($user['permission']!=1){
			$status = false;
			foreach($user['instances'] as $i){
				if($i['node_id']==$decode_data['data']['node_id']&&$i['instance_id']==$decode_data['data']['instance_id']){
					$status = true;
					break;
				}
			}
			if(!$status){
				ret(1,200,"无法获取实例");
			}
		}
		$result = kill_instance($decode_data['data']['node_id'],$decode_data['data']['instance_id']);
		if($result['status']){
			ret(0,200,"成功");
		}else{
			ret(2,200,$result['msg']);
		}
		break;
	case "get_file_list":
		$data = instance_check();
		if(isset($decode_data['data']['directory'])){
			$directory = $decode_data['data']['directory'];
		}else{
			$directory = "/";
		}
		$result = get_file_list($data['node_id'],$data['instance_id'],$directory);
		if($result['status']){
			ret(0,200,"成功",$result['data']);
		}else{
			ret(2,200,$result['msg']);
		}
		break;
	case "get_last_log":
		$data = instance_check();
		if(isset($decode_data['data']['line'])){
			$line = (int)$decode_data['data']['line'];
		}else{
			$line = 50;
		}
		$result = get_last_log($data['node_id'],$data['instance_id'],$line);
		if($result['status']){
			ret(0,200,"成功",$result['data']);
		}else{
			ret(2,200,$result['msg']);
		}
		break;
	default:
		ret(-1,404,"无效的\"action\"：找不到该方法");
		break;
	}
}else{
	ret(-1,400,"请求头不正确");
}
}catch(Throwable $e){
	ret(-1,500,"发生了错误：".$e->getMessage());
}
