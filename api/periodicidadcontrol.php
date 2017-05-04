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
$idcontrol = $_GET["idcontrol"];
$fecha1 = $_GET["fecha"]/1000;// ." 23:59:59";
$fecha = date("Y-m-d H:m:s", $fecha1);
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
$table = "ResultadosControl";



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
    $sql = "select * from ResultadosControl  WHERE idcontrol = '$idcontrol' AND fecha >= '$fecha'"; break;
}
//echo $sql;
$registros=mysqli_query($conexion,$sql) or die('{"success":"false","error":"query->'.mysqli_error().'"}');

if ($method == 'GET') {
	while ($reg=mysqli_fetch_array($registros))
	{	
		$rows[] = $reg;
	}
	if($registros){
		$result = '{"success":"true","data":' . json_encode($rows) . '}';
	}
	else {
		$result = '{"success":"true","data":"0"}';
	}
}

print json_encode($result);

}
catch (Exception $e) {
    echo '{"success":"false","error":"',  $e->getMessage(), '"}';
}

?>