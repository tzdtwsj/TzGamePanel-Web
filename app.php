<?php
class TzGP{
	const HEAD = "<!DOCTYPE html><html><head><link rel=\"stylesheet\" href=\"/mdui/css/mdui.min.css\"><link rel=\"stylesheet\" href=\"/index.css\"><title>TzGamePanel</title><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body class=\"mdui-drawer-body-left\">";
	const FOOT = "</body><br><br><center>Powered by TzGamePanel</center></html>";
	public function __construct(){
	}
	public function Run(){
		echo self::HEAD;
		echo "<div id=\"tzgp-app\"></div>";
		echo "<script src=\"/mdui/js/mdui.min.js\"></script>";
		echo "<script src=\"/app.js\"></script>";
		echo self::FOOT;
	}
};
?>
