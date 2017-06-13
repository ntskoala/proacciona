<?php 
header('Access-Control-Allow-Origin: *');  
include("../config/conexion2.php");

$idempresa = $_GET["idempresa"];
$sql = "select * from empresas";
$registros=mysqli_query($conexion,$sql) or die("{'success':false,'error':".mysqli_error()."}");
while ($reg=mysqli_fetch_array($registros))
{	
$rows[] = $reg;
}

if($registros){
$result = "{'success':true, 'data':" . json_encode($rows) . "}";
}
else {
$result = "{'success':false}";
}
print json_encode($rows);

?>