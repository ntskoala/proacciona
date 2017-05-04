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
$idchecklist = $_GET["idchecklist"];
$fechainicio = $_GET["fechainicio"];
$fechafin = $_GET["fechafin"] ." 23:59:59";
$key = $_GET["id"];
// get the HTTP method, path and body of the request
//$method = $_SERVER['REQUEST_METHOD'];
//$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
$input = json_decode(file_get_contents('php://input'),true);
//echo "input:" .$input;
//echo "get: " . $_GET["valores"];
//echo "post: " . $_POST["valores"];
    //$input = json_decode($_POST["valores"],true);
//var_dump(array_values($input));
// retrieve the table and key from the path
//$table = preg_replace('/[^a-z0-9_]+/i','',array_shift($request));
//$key = array_shift($request)+0;
$table = "resultadoschecklist";



// escape the columns and values from the input object
$columns = preg_replace('/[^a-z0-9_]+/i','',array_keys($input));
$values = array_map(function ($value) use ($conexion) {
  if ($value===null) return null;
  return mysqli_real_escape_string($conexion,(string)$value);
},array_values($input));
// echo "valores:"; var_dump($values);
// build the SET part of the SQL command
$set = '';
for ($i=0;$i<count($columns);$i++) {
  $set.=($i>0?',':'').'`'.$columns[$i].'`=';
  $set.=($values[$i]===null?'NULL':'"'.$values[$i].'"');
}
 
// create SQL based on HTTP method
switch ($method) {
  case 'GET':
    $sql = "select *, resultadoschecklist.id as idr from resultadoschecklist INNER JOIN checklist ON checklist.id = resultadoschecklist.idchecklist INNER JOIN resultadoschecklistcontrol ON resultadoschecklistcontrol.idresultadochecklist = resultadoschecklist.id LEFT OUTER JOIN usuarios on resultadoschecklist.idusuario = usuarios.id WHERE checklist.id=$idchecklist AND resultadoschecklist.fecha >= '$fechainicio' AND resultadoschecklist.fecha <= '$fechafin' ORDER BY idr,resultadoschecklistcontrol.idcontrolchecklist ASC "; break;
}
//echo $sql;
$registros=mysqli_query($conexion,$sql) or die('{"success":"false","error":"query->'.mysqli_error().'"}');

if ($method == 'GET') {
	while ($reg=mysqli_fetch_array($registros))
	{	
		$rows[] = $reg;
	}
	if($registros){
		//$result = '{"success":"true","data":' . json_encode($rows) . ',"sql":"' . $sql . '"}';
		$result = '{"success":"true","data":' . json_encode($rows) .  '}';
	}
	else {
		$result = '{"success":"false"}';
	}
}

print json_encode($result);

}
catch (Exception $e) {
    echo '{"success":"false","error":"',  $e->getMessage(), '"}';
}

?>