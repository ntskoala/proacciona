<?php 
header('Access-Control-Allow-Origin: *');  
include("./inc/conexion.php");
require_once('./inc/jwt.php');
use \Firebase\JWT\JWT;
$key = "tfcconsultinggroup";
$user = $_GET["user"];
$password = $_GET["password"];
//$token = strrev( str_replace(".","",$_SERVER['SERVER_ADDR']) );
$sql = "select * from users where user = '" . $user . "' and password = '" . $password . "'";
$registros=mysqli_query($conexion,$sql) or die('{"success":"false","error":"query->'.mysqli_error($conexion).$sql.'"}');
//echo $sql;
$numero_filas = 0;
while ($reg=mysqli_fetch_array($registros))
{	
$numero_filas ++;
$rows[] = $reg;
$role = $reg["id"];
$user = $reg["tipouser"];
}

if($numero_filas){
$issuedat= time();
$expire = $issuedat + 36000;
$token = array(
    "iss" => "http://mjn.cat", //IDENTIFICADOR DE DOMINIO
    "aud" => "http://mjn.cat", //
    "iat" => $issuedat,//1356999524, // Issued at: time when the token was generated
  //  "nbf" => $notbefore,
    "exp" => $expire,
    "rol"=> $role, // Not before
    "jti"=> $user
);
$jwt = JWT::encode($token, $key);

$result = '{"success":"true","token":"' .$jwt . '" ,"data":' .json_encode($rows) .'}';
}
else {
$result = '{"success":"false","error":"Usuario o password no válidos"}';
}
print json_encode($result);

?>