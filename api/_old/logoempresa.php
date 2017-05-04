<?php 
header('Access-Control-Allow-Origin: *');  
header("Access-Control-Allow-Methods: GET, POST, DELETE, PUT");
include("./config/conexion2.php");
///CONPROBAR TOKEN
///CONPROBAR TOKEN
require_once('./jwt/jwt2.php');
use \Firebase\JWT\JWT;
$key = "tfcconsultinggroup";
$token = $_GET["token"];
try{
//$decoded = JWT::decode($token, $key, array('HS256'));
///


$method = $_SERVER['REQUEST_METHOD'];
$idempresa = $_GET["idempresa"];
$key = $idempresa;

//$input = json_decode(file_get_contents('php://input'),true);
$dir= '../logos/'.$idempresa.'/';
$fichero_subido = $dir . basename($_FILES['logo']['name']);
$guarda = $dir."logo.jpg";
//  echo $dir;
if (!file_exists($dir)) {
//  echo $dir;
    mkdir($dir, 0777, true);
}


 if (move_uploaded_file($_FILES["logo"]["tmp_name"], $guarda)) {
$sql ="UPDATE empresas set logo = true WHERE id= ".$idempresa;
$registros=mysqli_query($conexion,$sql) or die('{"success":"false","error":"query->'.mysqli_error().'"}');


        $result = '{"success":"true"}';
    } else {
        $result = '{"success":"false"}';
    }


print json_encode($result);
}

catch (Exception $e) {
    echo '{"success":"false","error":"',  $e->getMessage(), '"}';
}


?>