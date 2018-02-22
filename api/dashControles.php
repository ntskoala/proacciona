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
$idempresa = $_GET["idempresa"];
$modo = $_GET["modo"];
$fecha = $_GET["fecha"];
include("./config/conexion2.php");

if ($modo == "realizados"){
    // $sqlControles = array(
    // "SELECT count(*) as total, 'control' as tipo FROM `ResultadosControl`  WHERE (`fecha` >= ".$fecha." AND `idempresa` = ".$idempresa.")",
    // "SELECT count(*) as total, 'checklist' as tipo FROM `resultadoschecklist`  WHERE (`fecha` >= ".$fecha." AND `idempresa` = ".$idempresa.")",
    // "SELECT count(*) as total, 'limpieza' as tipo FROM `limpieza_realizada`  WHERE (`fecha` >= ".$fecha." AND `idempresa` = ".$idempresa.")",
    // "SELECT count(*) as total, 'mantenimiento' as tipo FROM `mantenimientos_realizados`  WHERE (`fecha` >= ".$fecha." AND `idempresa` = ".$idempresa.")",
    // );
    //SELECT * FROM `ResultadosControl` rc inner join controles c WHERE c.idempresa = 2 and rc.fecha >= '2018-01-01'
    $sqlControles = array(
    "SELECT count(*) as total,fecha, 'control' as tipo FROM `ResultadosControl` rc inner join controles c ON rc.idcontrol = c.id WHERE c.idempresa = ".$idempresa." and rc.fecha >= '".$fecha."' group by fecha",
    "SELECT count(*) as total,fecha, 'checklist' as tipo FROM `resultadoschecklist` rc inner join checklist c ON rc.idchecklist = c.id WHERE c.idempresa = ".$idempresa." and rc.fecha >= '".$fecha."' group by fecha",
    "SELECT count(*) as total,fecha, 'limpieza' as tipo FROM `limpieza_realizada`   WHERE idempresa = ".$idempresa." and fecha >= '".$fecha."' group by fecha",
    "SELECT count(*) as total,fecha, 'mantenimiento' as tipo FROM `mantenimientos_realizados` WHERE idempresa = ".$idempresa." and fecha >= '".$fecha."' group by fecha"
    );
}else{
$sqlControles = array(
    "SELECT ctl.nombre, ctl.fecha_ as fecha, 'control' as tipo FROM `controles` ctl WHERE (`fecha_` <= CURDATE() AND `idempresa` = ".$idempresa.")",
    "SELECT cl.nombrechecklist as nombre, cl.fecha_ as fecha, 'checklist' as tipo FROM `checklist` cl WHERE (`fecha_` <= CURDATE() AND `idempresa` =".$idempresa.")",
    "SELECT LZ.nombre as zona,LZ.id , LE.* , 'limpieza' as tipo FROM limpieza_zona LZ inner join limpieza_elemento LE on LZ.id=LE.idlimpiezazona where (LE.fecha <= CURDATE() and LZ.idempresa = ".$idempresa.")",
    "SELECT M.nombre as maquina,M.id , mm.*, 'mantenimiento' as tipo FROM maquinaria M inner join maquina_mantenimiento mm on M.id=mm.idmaquina where (mm.fecha <= CURDATE() and M.idempresa = ".$idempresa.")",
    "SELECT M.nombre as maquina,M.id , mm.*, 'calibracion' as tipo FROM maquinaria M inner join maquina_calibraciones mm on M.id=mm.idmaquina where (mm.fecha <= CURDATE() and M.idempresa = ".$idempresa.")"
);
}
$arrlength = count($sqlControles);
for($x = 0; $x < $arrlength; $x++) {
   
$controles = mysqli_query($conexion,$sqlControles[$x]) or die('{"success":"false","error":"query2->'.mysqli_error($conexion).'"}');

/////******** INICIO BUCLE CONTROLES ********//
while ($regControl=mysqli_fetch_array($controles))
{
    $rows[] = $regControl;
    //$body =  $regControl["nombre"];
}
}
if($controles){
    $result = '{"success":"true","data":' . json_encode($rows) . ',"sql":"'.$sqlControles[0].'"}';
  }
  else {
    $result = '{"success":"false"}';
  }

  print json_encode($result);
}

catch (Exception $e) {
    echo '{"success":"false","error":"',  $e->getMessage(), '"}';
}
?>
