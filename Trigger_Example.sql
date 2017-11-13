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