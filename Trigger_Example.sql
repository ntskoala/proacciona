DROP TRIGGER IF EXISTS `delete_proveedor`;
DELIMITER //
CREATE TRIGGER `delete_proveedor` AFTER DELETE ON `proveedores`
 FOR EACH ROW BEGIN
delete from proveedores_productos where idproveedor=old.id;
END
//
DELIMITER ;

DROP TRIGGER IF EXISTS `delete_orden_produccion`;
DELIMITER //
CREATE TRIGGER `delete_orden_produccion` AFTER DELETE ON `produccion_orden`
 FOR EACH ROW BEGIN
delete from produccion_detalle where idorden=old.id;
END
//
DELIMITER ;

DROP TRIGGER IF EXISTS `delete_incidencia_limpieza`;
DELIMITER //
CREATE TRIGGER `delete_incidencia_limpieza` AFTER DELETE ON `limpieza_realizada`
 FOR EACH ROW BEGIN
delete from incidencias where idOrigen=old.id and idempresa=old.idempresa  and origenasociado="limpieza_realizada";
END
//
DELIMITER ;
DROP TRIGGER IF EXISTS `delete_incidencia_mantenimiento`;
DELIMITER //
CREATE TRIGGER `delete_incidencia_mantenimiento` AFTER DELETE ON `mantenimientos_realizados`
 FOR EACH ROW BEGIN
delete from incidencias where idOrigen=old.id and idempresa=old.idempresa  and origenasociado="mantenimientos_realizados";
END
//
DELIMITER ;
DROP TRIGGER IF EXISTS `delete_incidencia_planificacion`;
DELIMITER //
CREATE TRIGGER `delete_incidencia_planificacion` AFTER DELETE ON `planificaciones_realizadas`
 FOR EACH ROW BEGIN
delete from incidencias where idOrigen=old.id and idempresa=old.idempresa  and origenasociado="planificaciones_realizadas";
END
//
DELIMITER ;