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
$decoded = JWT::decode($token, $key, array('HS256'));
///

$method = $_SERVER['REQUEST_METHOD'];
$idempresa = $_GET["idempresa"];
 
$idmateriaprima = $_GET["idmateriaprima"];
$cantidad = $_GET["cantidad"];


 

$sql = "UPDATE proveedores_entradas_producto set cantidad_remanente = cantidad_remanente-" .$cantidad." WHERE id = " .$idmateriaprima;
$registros=mysqli_query($conexion,$sql) or die('{"success":"false","error":"query->'.mysqli_error($conexion).$sql.'"}');


		 $result = '{"success":"true","rows":' . mysqli_affected_rows($conexion). '}';
	
	

print json_encode($result);



}
catch (Exception $e) {
    echo '{"success":"false","error":"',  $e->getMessage(), '"}';
}

?>