<?php 
header('Access-Control-Allow-Origin: *');  
include("../config/conexion.php");

$idempresa = $_GET["idempresa"];
$sql = "SELECT lr.*, le.supervisor FROM limpieza_realizada lr INNER JOIN limpieza_elemento le ON lr.idelemento = le.id WHERE le.supervisor >0 AND lr.supervision = 0 AND lr.idempresa = '" . $idempresa . "'";
$registros=mysql_query($sql, $conexion) or die("{'success':false,'error':".mysql_error()."}");
//echo $sql;
while ($reg=mysql_fetch_array($registros))
{	
$rows[] = $reg;
}

if($registros){
$result = '{"success":"true","data":' . json_encode($rows) . '}';
}
else {
$result = '{"success":"false"}';
}
print json_encode($result);

?>