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
$idloteinterno = $_GET["idorden"];
if ($_GET["idmateriaprima"]){
	$where = "pd.idmateriaprima =". $idmateriaprima;
}else{
	$where = "pd.idloteinterno = ". $idloteinterno;
}

 

$sql = "SELECT * FROM produccion_orden po INNER JOIN produccion_detalle pd ON po.id = pd.idorden WHERE " . $where . "";
$registros=mysqli_query($conexion,$sql) or die('{"success":"false","error":"query->'.mysqli_error($conexion).'"}');


	while ($reg=mysqli_fetch_array($registros))
	{	
		$rows[] = $reg;
	}
	if($registros){
		$result = '{"success":"true","data":' . json_encode($rows) . '}';
	}
	

print json_encode($result);



}
catch (Exception $e) {
    echo '{"success":"false","error":"',  $e->getMessage(), '"}';
}

?>