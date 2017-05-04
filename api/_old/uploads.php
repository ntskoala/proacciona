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
$idEmpresa = $_GET["idEmpresa"];
$idEntidad = $_GET["idEntidad"];
$key = $idempresa;
$entidad = $_GET["entidad"];
$field = $_GET["field"];

//$input = json_decode(file_get_contents('php://input'),true);
$dir= '../docs/'.$idEmpresa.'/'.$entidad.'/';
$SSQL = true;

//  echo $dir;
if (!file_exists($dir)) {
//  echo $dir;
    mkdir($dir, 0777, true);
}
	$campo = "doc";
	$nombre =  basename($_FILES['doc']['name']);
switch ($entidad){
	case "lubricantes":
	$campo = $field;
	$nombre =  $field."_".basename($_FILES['doc']['name']);
	break;
	case "limpieza_producto":
	$campo = $field;
	$nombre =  $field."_".basename($_FILES['doc']['name']);
	break;	
	case "limpieza_elemento":
	$campo = $field;
	break;
	case "maquinaria":
	if ($field == 'fotomaquina'){
	$nombre = $idEntidad.'.jpg';
	$SSQL = false;
	}
	break;
	default:

	break;
}

$fichero_subido = $dir . $nombre;
$guarda = $dir.$idEntidad.'_'. $nombre;




 if ((move_uploaded_file($_FILES["doc"]["tmp_name"], $guarda)) && $SSQL) {

$sql ="UPDATE " . $entidad . " set ".$campo." = '" . $nombre . "' WHERE id= ".$idEntidad;
$registros=mysqli_query($conexion,$sql) or die('{"success":"false","error":"query->'.mysqli_error($conexion).'"}');


        $result = '{"success":"true"}';
    } else {
        $result = '{"success":"false"}';
        if (!$SSQL) $result = '{"success":"true","data":"sin sql"}';
    }


print json_encode($result);
}

catch (Exception $e) {
    echo '{"success":"false","error":"',  $e->getMessage(), '"}';
}


?>