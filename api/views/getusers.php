<?php 
header('Access-Control-Allow-Origin: *');  
include("../config/conexion.php");

$idempresa = $_GET["idempresa"];

$registros=mysql_query("select * from usuarios where idempresa = '" . $idempresa . "'", $conexion) or die("{'success':false,'error':".mysql_error()."}");
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