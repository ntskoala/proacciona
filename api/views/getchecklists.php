
<?php 
header('Access-Control-Allow-Origin: *');  
include("../config/conexion.php");

$idempresa = $_GET["idempresa"];
$sql = "SELECT * FROM permissionuserchecklist inner JOIN checklist on permissionuserchecklist.idchecklist = checklist.id inner JOIN controlchecklist ON checklist.id = controlchecklist.idchecklist WHERE controlchecklist.migrado =0 AND checklist.idempresa = '" . $idempresa . "'";
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