<?php 
header('Access-Control-Allow-Origin: *');  
include("../config/conexion2.php");
$method = $_SERVER['REQUEST_METHOD'];
$idempresa = $_GET["idempresa"];
//$sql = "SELECT * FROM permissionuserchecklist inner JOIN checklist on permissionuserchecklist.idchecklist = checklist.id inner JOIN controlchecklist ON checklist.id = controlchecklist.idchecklist WHERE checklist.idempresa = '" . $idempresa . "'";

$WHERE ='';
if($_GET["WHERE_USER"]){
  $WHERE = " AND pl.idusuario = '" .  mysqli_real_escape_string($conexion,$_GET["WHERE_USER"]) . "'";
}
//echo $sql;
switch ($method) {
  case 'GET':
   // $sql = "select lz.id as idlimpiezazona, lz.nombre as nombrelimpieza, le.*, pl.id as idpermiso, pl.idusuario, pl.idelementolimpieza as idlimpiezapermiso FROM limpieza_zona lz INNER JOIN limpieza_elemento le ON lz.id = le.idlimpiezazona INNER JOIN permissionlimpieza pl WHERE lz.idempresa=$idempresa"; break;
   $sql = "select M.id as idMaquina, M.nombre as nombreMaquina, mc.* FROM maquinaria M INNER JOIN maquina_calibraciones mc ON M.id = mc.idmaquina WHERE M.idempresa=$idempresa" .$WHERE . " ORDER BY M.nombre, mc.orden"; break;
}
$registros=mysqli_query($conexion,$sql) or die('{"success":"false","error":"query->"'.mysqli_error($conexion).'" ,"sql":"'.$sql.'"}');

if ($method == 'GET') {
  while ($reg=mysqli_fetch_array($registros))
  { 
    $rows[] = $reg;
  }
  if($registros){
    $result = '{"success":"true","data":' . json_encode($rows) . '}';
  }
  else {
    $result = '{"success":"false"}';
  }
}
print json_encode($result);

?>