<?php
header('Access-Control-Allow-Origin: *');  
header("Access-Control-Allow-Methods: GET, POST, DELETE, PUT");
//require 'PHPMailerAutoload.php';
///CONPROBAR TOKEN
///CONPROBAR TOKEN
require_once('./jwt/jwt2.php');
use \Firebase\JWT\JWT;
$key = "tfcconsultinggroup";
$token = $_GET["token"];
try{
$decoded = JWT::decode($token, $key, array('HS256'));
///
$getBody = $_GET["body"]; 
$idempresa = $_GET["idempresa"];
//include ("./library.php"); // include the library file
include ("./inc/class.phpmailer.php"); // include the class name
include ("./inc/class.smtp.php");
include("./config/conexion2.php");
$eol = PHP_EOL;

$body = $getBody.$eol.'<h4>Empresa</h4>'.$idempresa.$eol;

$sql = "select email from usuarios where idempresa = " . $idempresa . " AND tipouser = 'Gerente'";



$email = new PHPMailer();
$email->IsSMTP(); // enable SMTP
$email->SMTPDebug = 1; // debugging: 1 = errors and messages, 2 = messages only
$email->SMTPAuth = true; // authentication enabled
//$email->SMTPSecure = 'ssl'; // secure transfer enabled REQUIRED for GMail
//$email->Host = "smtp.1and1.es";
$email->Host = "smtp.gmail.com";
//$email->Port = 465; // or 587
$email->SMTPSecure = 'tls';                            // Enable TLS encryption, `ssl` also accepted
$email->Port = 587;         
$email->IsHTML(true);
//$email->Username = "jorged@ntskoala.com";
//$email->Password = "yzf600r6&zxr750r7";
//$email->SetFrom("jorged@ntskoala.com");

//$email->Username = "info@urbanpoi.com";
//$email->Password = "informix$";
//$email->SetFrom("info@urbanpoi.com");


$email->Username = "alertes@proacciona.es";
$email->Password = "%Proacciona$76";
$email->setFrom("alertes@proacciona.es");


$registros=mysqli_query($conexion,$sql) or die('{"success":"false","error":"query->'.mysqli_error().'"}');
	while ($reg=mysqli_fetch_array($registros))
	{		
		if (strlen($reg["email"]) >3 ){
		$email->addAddress($reg["email"]);
		}
	}
$email->addReplyTo('alertes@proacciona.es', 'Proacciona');
$email->FromName  = 'Proacciona';
$email->Subject   = 'Proacciona alertas__TESTING__' ;
   $email->Body      = $body.$eol;
   $email->addAddress( 'jorged@ntskoala.com' );
   $email->addAddress( 'alertes@proacciona.es' );

 $email->Send();
$result = '{"success":"true","data":"ok"}';
print json_encode($result);
}

catch (Exception $e) {
    echo '{"success":"false","error":"',  $e->getMessage(), '"}';
}
?>

