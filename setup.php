<?php
#此文件已被舍弃
chdir(__DIR__);
require 'func.php';
if(PHP_SAPI!="cli"){
	echo "不支持的sapi(".PHP_SAPI.")！请使用cli运行初始化程序！".PHP_EOL;
}
if(!file_exists("data")){
	echo "目录创建：data".PHP_EOL;
	mkdir("data");
}
if(!file_exists("data/config")){
	echo "目录创建：data/config".PHP_EOL;
	mkdir("data/config");
}
if(!file_exists("data/config/env.json")){
	$env = array();
	$ok = false;
}else{
	$env = json_decode(file_read("data/config/env.json"),true);
	if($env==false){
		$env = array();
		$ok = false;
	}else{
		$ok = true;
	}
}
$action="env";
if($_SERVER['argc']>1){
	$action2 = $_SERVER['argv'][1];
	switch($action2){
	case "env":
		break;
	case "user":
		$action = "user";
		break;
	case "data":
		$action = "data";
		break;
	default:
		echo "未知的选项：{$action2}".PHP_EOL;
		echo "可选选项：env (配置环境) , user (配置超管用户) , data (生成数据)".PHP_EOL;
		exit(1);
		break;
	}
}



if($action=="env"){
$config_list = array(
	array(
		"key" => "PanelUrl",//在配置文件中的键
		"prompt" => "请输入TzGamePanel的URL\n例如http://domain，尾部无需斜杠",//无需冒号
		"type" => "string",//值类型，type可以是string和choose
		"param" => array(),//当type是string时，直接array()即可
	),
	/*array(
		"key" => "DBType",
		"prompt" => "数据存储类型\n建议mysql或sqlite，无其他环境可选file",
		"type" => "choose",
		"param" => array(
			"mysql",
			"sqlite",
			"file",
		),
	),*/
);
$get_env = array();
for($i=0;$i<count($config_list);$i=$i+1){
	while(true){
	echo "Step ".$i+1 ."/".count($config_list).PHP_EOL.PHP_EOL;
	echo $config_list[$i]['prompt']." ";
	if($config_list[$i]['type']=="choose"){
		echo "[";
		for($j=0;$j<count($config_list[$i]['param']);$j=$j+1){
			echo $config_list[$i]['param'][$j];
			if(!($j+1==count($config_list[$i]['param']))){
				echo "|";
			};
		}
		echo "]";
	}
	if(isset($env[$config_list[$i]['key']])){
		echo "[当前值：".$env[$config_list[$i]['key']]."]";
	}
	$input = trim(input(" > "));
	if($input==""&&isset($env[$config_list[$i]['key']])){
		$get_env[$config_list[$i]['key']] = $env[$config_list[$i]['key']];
		echo PHP_EOL;
		break;
	}elseif($input==""&&!isset($env[$config_list[$i]['key']])){
		echo PHP_EOL;
		continue;
	}else{
		if($config_list[$i]['type']=="choose"){
			$status = false;
			for($j=0;$j<count($config_list[$i]['param']);$j=$j+1){
				if($config_list[$i]['param'][$j]==$input){
					$status = true;
					break;
				}
			}
			if($status){
				$get_env[$config_list[$i]['key']] = $input;
			}else{
				echo PHP_EOL;
				continue;
			}
		}else{
			$get_env[$config_list[$i]['key']] = $input;
		}
	}
	echo PHP_EOL;
	break;
	}
}
file_write("data/config/env.json",json_encode($get_env));
}
?>
