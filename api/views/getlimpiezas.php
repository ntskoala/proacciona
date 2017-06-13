<?php 
header('Access-Control-Allow-Origin: *');  
include("../config/conexion2.php");
$method = $_SERVER['REQUEST_METHOD'];
$idempresa = $_GET["idempresa"];
//$sql = "SELECT * FROM permissionuserchecklist inner JOIN checklist on permissionuserchecklist.idchecklist = checklist.id inner JOIN controlchecklist ON checklist.id = controlchecklist.idchecklist WHERE checklist.idempresa = '" . $idempresa . "'";

//echo $sql;
switch ($method) {
  case 'GET':
   // $sql = "select lz.id as idlimpiezazona, lz.nombre as nombrelimpieza, le.*, pl.id as idpermiso, pl.idusuario, pl.idelementolimpieza as idlimpiezapermiso FROM limpieza_zona lz INNER JOIN limpieza_elemento le ON lz.id = le.idlimpiezazona INNER JOIN permissionlimpieza pl WHERE lz.idempresa=$idempresa"; break;
   $sql = "select lz.id as idlimpiezazona, lz.nombre as nombrelimpieza, le.*, pl.id as idpermiso, pl.idusuario, pl.idelementolimpieza as idlimpiezapermiso FROM limpieza_zona lz INNER JOIN limpieza_elemento le ON lz.id = le.idlimpiezazona INNER JOIN permissionlimpieza pl ON le.id = pl.idelementolimpieza WHERE le.app = true AND lz.idempresa=$idempresa"; break;
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